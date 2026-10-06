from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.doctor import Doctor
from app.models.user import User
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.patient_doctor_access import PatientDoctorAccess
from app.models.organization import Organization
from app.schemas.doctor import DoctorOut, DoctorUpdate
from app.schemas.appointment import AppointmentOut
from app.schemas.patient import PatientOut
from app.schemas.organization import OrganizationOut
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("", response_model=List[DoctorOut])
def get_all_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Doctor).all()

@router.get("/me", response_model=DoctorOut)
def get_doctor_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return current_user.doctor_profile

@router.put("/me", response_model=DoctorOut)
def update_doctor_me(
    req: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = current_user.doctor_profile
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    if req.Specialty is not None:
        doctor.Specialty = req.Specialty
    if req.LicenseNumber is not None:
        doctor.LicenseNumber = req.LicenseNumber
    if req.Phone is not None:
        doctor.Phone = req.Phone
    if req.OrganizationID is not None:
        doctor.OrganizationID = req.OrganizationID
    if req.FullName and current_user:
        current_user.FullName = req.FullName

    db.commit()
    db.refresh(doctor)
    return doctor

@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor_by_id(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.DoctorID == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.get("/{doctor_id}/appointments", response_model=List[AppointmentOut])
def get_doctor_appointments(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Appointment).filter(Appointment.DoctorID == doctor_id).all()

@router.get("/{doctor_id}/patients", response_model=List[PatientOut])
def get_doctor_patients(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve patients via PatientDoctorAccess or active appointments
    accesses = db.query(PatientDoctorAccess).filter(
        PatientDoctorAccess.DoctorID == doctor_id,
        PatientDoctorAccess.Status == "ACTIVE"
    ).all()
    patient_ids = [a.PatientID for a in accesses]

    # Also include patients with appointments with doctor
    appointments = db.query(Appointment).filter(Appointment.DoctorID == doctor_id).all()
    for appt in appointments:
        if appt.PatientID not in patient_ids:
            patient_ids.append(appt.PatientID)

    if not patient_ids:
        return []

    return db.query(Patient).filter(Patient.PatientID.in_(patient_ids)).all()

@router.get("/{doctor_id}/organizations", response_model=List[OrganizationOut])
def get_doctor_organizations(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.DoctorID == doctor_id).first()
    if not doctor or not doctor.OrganizationID:
        return []
    org = db.query(Organization).filter(Organization.OrganizationID == doctor.OrganizationID).first()
    return [org] if org else []
