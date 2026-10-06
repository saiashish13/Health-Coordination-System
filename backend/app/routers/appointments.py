from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.appointment import AppointmentOut, AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate
from app.dependencies.auth_deps import get_current_user
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentOut])
def get_all_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(Appointment).filter(Appointment.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        return db.query(Appointment).filter(Appointment.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(Appointment).all()

@router.post("", response_model=AppointmentOut)
def create_appointment(
    req: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.PatientID == req.PatientID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = db.query(Doctor).filter(Doctor.DoctorID == req.DoctorID).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    appt = Appointment(
        PatientID=req.PatientID,
        DoctorID=req.DoctorID,
        AppointmentDate=req.AppointmentDate,
        Reason=req.Reason,
        Status="SCHEDULED"
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    # Notify doctor & patient
    if doctor.user:
        notification_service.create_notification(
            db, doctor.user.UserID, "New Appointment Scheduled", f"Appointment #{appt.AppointmentID} scheduled for {req.AppointmentDate}"
        )
    if patient.user:
        notification_service.create_notification(
            db, patient.user.UserID, "Appointment Confirmation", f"Appointment #{appt.AppointmentID} scheduled with Dr. {doctor.user.FullName if doctor.user else ''}"
        )

    audit_service.log_access(db, current_user.UserID, "Appointment", req.PatientID, appt.AppointmentID, "ADD")
    return appt

@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.AppointmentID == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.put("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    req: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.AppointmentID == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if req.AppointmentDate:
        appt.AppointmentDate = req.AppointmentDate
    if req.Reason:
        appt.Reason = req.Reason

    db.commit()
    db.refresh(appt)
    audit_service.log_access(db, current_user.UserID, "Appointment", appt.PatientID, appt.AppointmentID, "EDIT")
    return appt

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    req: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.AppointmentID == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    status_upper = req.Status.upper()
    valid_statuses = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"]
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    appt.Status = status_upper
    db.commit()
    db.refresh(appt)

    # Notify patient
    if appt.patient and appt.patient.user:
        notification_service.create_notification(
            db, appt.patient.user.UserID, "Appointment Status Changed", f"Appointment #{appt.AppointmentID} status is now {status_upper}"
        )

    audit_service.log_access(db, current_user.UserID, "Appointment", appt.PatientID, appt.AppointmentID, "EDIT")
    return appt

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.AppointmentID == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appt)
    db.commit()
    audit_service.log_access(db, current_user.UserID, "Appointment", appt.PatientID, appointment_id, "DELETE")
    return {"success": True, "message": "Appointment deleted successfully"}
