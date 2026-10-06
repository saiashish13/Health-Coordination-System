from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medication_order import MedicationOrder
from app.models.patient import Patient
from app.models.organization import Organization
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas.medication_order import MedicationOrderOut, MedicationOrderCreate, MedicationOrderStatusUpdate
from app.dependencies.auth_deps import get_current_user
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/medication-orders", tags=["Medication Orders"])

@router.get("", response_model=List[MedicationOrderOut])
def get_medication_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(MedicationOrder).filter(MedicationOrder.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "PHARMACY" and current_user.doctor_profile and current_user.doctor_profile.OrganizationID:
        return db.query(MedicationOrder).filter(MedicationOrder.PharmacyID == current_user.doctor_profile.OrganizationID).all()
    return db.query(MedicationOrder).all()

@router.post("", response_model=MedicationOrderOut)
def create_medication_order(
    req: MedicationOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == req.PatientID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    pharmacy = db.query(Organization).filter(
        Organization.OrganizationID == req.PharmacyID,
        Organization.OrganizationType == "PHARMACY"
    ).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy organization not found")

    presc = db.query(Prescription).filter(Prescription.PrescriptionID == req.PrescriptionID).first()
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")

    order = MedicationOrder(
        PatientID=req.PatientID,
        PharmacyID=req.PharmacyID,
        PrescriptionID=req.PrescriptionID,
        Status="PENDING"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    if patient.user:
        notification_service.create_notification(
            db, patient.user.UserID, "Medication Order Placed", f"Medication order #{order.OrderID} submitted to pharmacy."
        )

    audit_service.log_access(db, current_user.UserID, "MedicationOrder", req.PatientID, order.OrderID, "ADD")
    return order

@router.get("/{order_id}", response_model=MedicationOrderOut)
def get_medication_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(MedicationOrder).filter(MedicationOrder.OrderID == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Medication order not found")
    return order

@router.patch("/{order_id}/status", response_model=MedicationOrderOut)
def update_medication_order_status(
    order_id: int,
    req: MedicationOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(MedicationOrder).filter(MedicationOrder.OrderID == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Medication order not found")

    status_upper = req.Status.upper()
    valid_statuses = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "COMPLETED", "CANCELLED"]
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid order status. Allowed: {valid_statuses}")

    order.Status = status_upper
    db.commit()
    db.refresh(order)

    if order.patient and order.patient.user:
        notification_service.create_notification(
            db, order.patient.user.UserID, "Medication Order Status Updated", f"Order #{order.OrderID} is now {status_upper}."
        )

    return order
