from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.diagnosis import Diagnosis
from app.models.medical_record import MedicalRecord
from app.models.user import User
from app.schemas.diagnosis import DiagnosisOut, DiagnosisCreate, DiagnosisUpdate
from app.dependencies.auth_deps import get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="", tags=["Diagnoses"])

@router.get("/diagnoses", response_model=List[DiagnosisOut])
def get_all_diagnoses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Diagnosis).all()

@router.post("/medical-records/{record_id}/diagnoses", response_model=DiagnosisOut)
def create_diagnosis(
    record_id: int,
    req: DiagnosisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors can issue diagnoses")

    diag = Diagnosis(
        RecordID=record_id,
        ICDCode=req.ICDCode,
        Description=req.Description
    )
    db.add(diag)
    db.commit()
    db.refresh(diag)
    audit_service.log_access(db, current_user.UserID, "Diagnosis", record.PatientID, diag.DiagnosisID, "ADD")
    return diag

@router.get("/medical-records/{record_id}/diagnoses", response_model=List[DiagnosisOut])
def get_record_diagnoses(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.RecordID == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    audit_service.log_access(db, current_user.UserID, "Diagnosis", record.PatientID, record_id, "VIEW")
    return db.query(Diagnosis).filter(Diagnosis.RecordID == record_id).all()

@router.put("/diagnoses/{diagnosis_id}", response_model=DiagnosisOut)
def update_diagnosis(
    diagnosis_id: int,
    req: DiagnosisUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diag = db.query(Diagnosis).filter(Diagnosis.DiagnosisID == diagnosis_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors can edit diagnoses")

    if req.ICDCode is not None:
        diag.ICDCode = req.ICDCode
    if req.Description is not None:
        diag.Description = req.Description

    db.commit()
    db.refresh(diag)
    audit_service.log_access(db, current_user.UserID, "Diagnosis", diag.medical_record.PatientID if diag.medical_record else None, diagnosis_id, "EDIT")
    return diag

@router.delete("/diagnoses/{diagnosis_id}")
def delete_diagnosis(
    diagnosis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    diag = db.query(Diagnosis).filter(Diagnosis.DiagnosisID == diagnosis_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(diag)
    db.commit()
    return {"success": True, "message": "Diagnosis deleted successfully"}
