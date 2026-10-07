from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ai_interaction import AIInteraction
from app.models.ai_recommendation import AIRecommendation
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.ai import (
    AIInteractionOut, AIInteractionCreate,
    AIRecommendationOut, AIRecommendationCreate, AIRecommendationReviewUpdate
)
from app.dependencies.auth_deps import get_current_user
from app.services.ai_service import ai_service
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/ai", tags=["AI Care Coordination"])

@router.post("/interactions", response_model=AIInteractionOut)
def create_ai_interaction(
    req: AIInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient_id = req.PatientID
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        patient_id = current_user.patient_profile.PatientID

    patient = db.query(Patient).filter(Patient.PatientID == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Generate response via AI Service abstraction
    ai_response = ai_service.generate_response(req.UserQuery, req.InteractionType or "CHAT")

    interaction = AIInteraction(
        PatientID=patient_id,
        InteractionType=req.InteractionType or "CHAT",
        UserQuery=req.UserQuery,
        AIResponse=ai_response
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    audit_service.log_access(db, current_user.UserID, "AIInteraction", patient_id, interaction.InteractionID, "ADD")
    return interaction

@router.get("/interactions", response_model=List[AIInteractionOut])
def get_ai_interactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(AIInteraction).filter(AIInteraction.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        records = db.query(MedicalRecord).filter(MedicalRecord.DoctorID == current_user.doctor_profile.DoctorID).all()
        pat_ids = list(set([r.PatientID for r in records]))
        return db.query(AIInteraction).filter(AIInteraction.PatientID.in_(pat_ids)).all() if pat_ids else []
    return db.query(AIInteraction).all()

@router.get("/interactions/{interaction_id}", response_model=AIInteractionOut)
def get_ai_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interaction = db.query(AIInteraction).filter(AIInteraction.InteractionID == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="AI interaction not found")
    return interaction

@router.get("/recommendations", response_model=List[AIRecommendationOut])
def get_ai_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(AIRecommendation).filter(AIRecommendation.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        records = db.query(MedicalRecord).filter(MedicalRecord.DoctorID == current_user.doctor_profile.DoctorID).all()
        rec_ids = [r.RecordID for r in records]
        return db.query(AIRecommendation).filter(
            (AIRecommendation.RecordID.in_(rec_ids)) | (AIRecommendation.ReviewedByDoctor == current_user.doctor_profile.DoctorID)
        ).all() if rec_ids else db.query(AIRecommendation).filter(AIRecommendation.ReviewedByDoctor == current_user.doctor_profile.DoctorID).all()
    return db.query(AIRecommendation).all()

@router.get("/recommendations/{recommendation_id}", response_model=AIRecommendationOut)
def get_ai_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(AIRecommendation).filter(AIRecommendation.RecommendationID == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="AI recommendation not found")
    return rec

@router.post("/recommendations", response_model=AIRecommendationOut)
def create_ai_recommendation(
    req: AIRecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = AIRecommendation(
        PatientID=req.PatientID,
        RecordID=req.RecordID,
        RecommendationType=req.RecommendationType,
        RecommendationText=req.RecommendationText,
        Status="PENDING"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.patch("/recommendations/{recommendation_id}/review", response_model=AIRecommendationOut)
def review_ai_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only clinicians can review AI recommendations")

    rec = db.query(AIRecommendation).filter(AIRecommendation.RecommendationID == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="AI recommendation not found")

    doctor_id = current_user.doctor_profile.DoctorID if current_user.doctor_profile else None
    rec.Status = "REVIEWED"
    rec.ReviewedByDoctor = doctor_id
    rec.ReviewedAt = datetime.now(timezone.utc)

    db.commit()
    db.refresh(rec)

    if rec.patient and rec.patient.user:
        notification_service.create_notification(
            db, rec.patient.user.UserID, "AI Recommendation Reviewed",
            f"Your care plan recommendation has been reviewed and validated by Dr. {current_user.FullName}."
        )

    audit_service.log_access(db, current_user.UserID, "AIRecommendation", rec.PatientID, recommendation_id, "EDIT")
    return rec

@router.patch("/recommendations/{recommendation_id}/reject", response_model=AIRecommendationOut)
def reject_ai_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only clinicians can reject AI recommendations")

    rec = db.query(AIRecommendation).filter(AIRecommendation.RecommendationID == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="AI recommendation not found")

    doctor_id = current_user.doctor_profile.DoctorID if current_user.doctor_profile else None
    rec.Status = "REJECTED"
    rec.ReviewedByDoctor = doctor_id
    rec.ReviewedAt = datetime.now(timezone.utc)

    db.commit()
    db.refresh(rec)
    return rec
