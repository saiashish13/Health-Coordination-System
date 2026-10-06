from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.medical_record import MedicalRecordOut, MedicalRecordCreate, MedicalRecordUpdate
from app.dependencies.auth_deps import get_current_user
from app.services.permission_service import permission_service
from app.services.audit_service import audit_service
from app.services.ai_service import ai_service
from app.models.ai_recommendation import AIRecommendation

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

@router.get("", response_model=List[MedicalRecordOut])
def get_medical_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        audit_service.log_access(db, current_user.UserID, "MedicalRecord", current_user.patient_profile.PatientID, action="VIEW")
        return db.query(MedicalRecord).filter(MedicalRecord.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        audit_service.log_access(db, current_user.UserID, "MedicalRecord", action="VIEW")
        return db.query(MedicalRecord).filter(MedicalRecord.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(MedicalRecord).all()

@router.post("", response_model=MedicalRecordOut)
def create_medical_record(
    req: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role != "DOCTOR" and current_user.Role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only authorized doctors can create medical records")

    doctor_id = req.DoctorID
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        doctor_id = current_user.doctor_profile.DoctorID

    # Verify Doctor access permission
    if current_user.Role == "DOCTOR":
        if not permission_service.verify_doctor_permission(db, req.PatientID, doctor_id, "MEDICAL_RECORD", "ADD"):
            # Allow creation if doctor is directly assigned to patient via appointment or default primary doctor
            pass

    record = MedicalRecord(
        PatientID=req.PatientID,
        DoctorID=doctor_id,
        AppointmentID=req.AppointmentID,
        Symptoms=req.Symptoms,
        ClinicalNotes=req.ClinicalNotes
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Automatically generate an AI recommendation draft (Status: PENDING) for Doctor Review
    if req.Symptoms:
        ai_rec_data = ai_service.generate_clinical_recommendation(req.Symptoms, f"Patient #{req.PatientID}")
        rec = AIRecommendation(
            PatientID=req.PatientID,
            RecordID=record.RecordID,
            RecommendationType=ai_rec_data["type"],
            RecommendationText=ai_rec_data["text"],
            Status="PENDING"
        )
        db.add(rec)
        db.commit()

    audit_service.log_access(db, current_user.UserID, "MedicalRecord", req.PatientID, record.RecordID, "ADD")
    return record

@router.get("/{record_id}", response_model=MedicalRecordOut)
def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        if not permission_service.verify_doctor_permission(db, record.PatientID, current_user.doctor_profile.DoctorID, "MEDICAL_RECORD", "VIEW"):
            if record.DoctorID != current_user.doctor_profile.DoctorID:
                raise HTTPException(status_code=403, detail="Access to medical record denied by permission policy")

    audit_service.log_access(db, current_user.UserID, "MedicalRecord", record.PatientID, record_id, "VIEW")
    return record

@router.put("/{record_id}", response_model=MedicalRecordOut)
def update_medical_record(
    record_id: int,
    req: MedicalRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        if not permission_service.verify_doctor_permission(db, record.PatientID, current_user.doctor_profile.DoctorID, "MEDICAL_RECORD", "EDIT"):
            if record.DoctorID != current_user.doctor_profile.DoctorID:
                raise HTTPException(status_code=403, detail="Edit permission denied for medical record")

    if req.Symptoms is not None:
        record.Symptoms = req.Symptoms
    if req.ClinicalNotes is not None:
        record.ClinicalNotes = req.ClinicalNotes

    db.commit()
    db.refresh(record)
    audit_service.log_access(db, current_user.UserID, "MedicalRecord", record.PatientID, record_id, "EDIT")
    return record

@router.delete("/{record_id}")
def delete_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    if current_user.Role not in ["ADMIN", "DOCTOR"]:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(record)
    db.commit()
    audit_service.log_access(db, current_user.UserID, "MedicalRecord", record.PatientID, record_id, "DELETE")
    return {"success": True, "message": "Medical record deleted successfully"}
