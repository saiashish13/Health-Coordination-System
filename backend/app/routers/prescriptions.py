from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prescription import Prescription
from app.models.prescription_item import PrescriptionItem
from app.models.patient import Patient
from app.models.medicine import Medicine
from app.models.user import User
from app.schemas.prescription import PrescriptionOut, PrescriptionCreate, PrescriptionItemOut, PrescriptionItemCreate
from app.dependencies.auth_deps import get_current_user
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="", tags=["Prescriptions"])

@router.get("/prescriptions", response_model=List[PrescriptionOut])
def get_all_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        audit_service.log_access(db, current_user.UserID, "Prescription", current_user.patient_profile.PatientID, action="VIEW")
        return db.query(Prescription).filter(Prescription.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        return db.query(Prescription).filter(Prescription.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(Prescription).all()

@router.post("/prescriptions", response_model=PrescriptionOut)
def create_prescription(
    req: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Only doctors can issue prescriptions")

    doctor_id = req.DoctorID
    if current_user.Role == "DOCTOR" and current_user.doctor_profile:
        doctor_id = current_user.doctor_profile.DoctorID

    patient = db.query(Patient).filter(Patient.PatientID == req.PatientID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    prescription = Prescription(
        PatientID=req.PatientID,
        DoctorID=doctor_id,
        RecordID=req.RecordID
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    for item in req.items:
        med = db.query(Medicine).filter(Medicine.MedicineID == item.MedicineID).first()
        if med:
            p_item = PrescriptionItem(
                PrescriptionID=prescription.PrescriptionID,
                MedicineID=item.MedicineID,
                Dosage=item.Dosage,
                Frequency=item.Frequency,
                Duration=item.Duration,
                Instructions=item.Instructions
            )
            db.add(p_item)

    db.commit()
    db.refresh(prescription)

    if patient.user:
        notification_service.create_notification(
            db, patient.user.UserID, "New Prescription Issued", f"Doctor issued Prescription #{prescription.PrescriptionID}"
        )

    audit_service.log_access(db, current_user.UserID, "Prescription", req.PatientID, prescription.PrescriptionID, "ADD")
    return prescription

@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionOut)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    presc = db.query(Prescription).filter(Prescription.PrescriptionID == prescription_id).first()
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")

    audit_service.log_access(db, current_user.UserID, "Prescription", presc.PatientID, prescription_id, "VIEW")
    return presc

@router.post("/prescriptions/{prescription_id}/items", response_model=PrescriptionItemOut)
def add_prescription_item(
    prescription_id: int,
    req: PrescriptionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    presc = db.query(Prescription).filter(Prescription.PrescriptionID == prescription_id).first()
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")

    item = PrescriptionItem(
        PrescriptionID=prescription_id,
        MedicineID=req.MedicineID,
        Dosage=req.Dosage,
        Frequency=req.Frequency,
        Duration=req.Duration,
        Instructions=req.Instructions
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/prescription-items/{item_id}", response_model=PrescriptionItemOut)
def update_prescription_item(
    item_id: int,
    req: PrescriptionItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(PrescriptionItem).filter(PrescriptionItem.PrescriptionItemID == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Prescription item not found")

    item.MedicineID = req.MedicineID
    if req.Dosage is not None:
        item.Dosage = req.Dosage
    if req.Frequency is not None:
        item.Frequency = req.Frequency
    if req.Duration is not None:
        item.Duration = req.Duration
    if req.Instructions is not None:
        item.Instructions = req.Instructions

    db.commit()
    db.refresh(item)
    return item

@router.delete("/prescription-items/{item_id}")
def delete_prescription_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(PrescriptionItem).filter(PrescriptionItem.PrescriptionItemID == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Prescription item not found")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Prescription item deleted"}
