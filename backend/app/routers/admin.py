from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.organization import Organization
from app.models.appointment import Appointment
from app.models.audit_log import AccessAuditLog
from app.schemas.user import UserOut
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut
from app.schemas.organization import OrganizationOut
from app.schemas.appointment import AppointmentOut
from app.schemas.audit import AccessAuditLogOut
from app.dependencies.auth_deps import require_admin, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(require_admin)])

@router.get("/users", response_model=List[UserOut])
def get_all_users_admin(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/doctors", response_model=List[DoctorOut])
def get_all_doctors_admin(db: Session = Depends(get_db)):
    return db.query(Doctor).all()

@router.get("/patients", response_model=List[PatientOut])
def get_all_patients_admin(db: Session = Depends(get_db)):
    return db.query(Patient).all()

@router.get("/organizations", response_model=List[OrganizationOut])
def get_all_organizations_admin(db: Session = Depends(get_db)):
    return db.query(Organization).all()

@router.get("/appointments", response_model=List[AppointmentOut])
def get_all_appointments_admin(db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.get("/audit-logs", response_model=List[AccessAuditLogOut])
def get_all_audit_logs_admin(db: Session = Depends(get_db)):
    return db.query(AccessAuditLog).order_by(AccessAuditLog.AccessedAt.desc()).all()

@router.get("/statistics")
def get_admin_statistics(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "patients": db.query(Patient).count(),
        "doctors": db.query(Doctor).count(),
        "organizations": db.query(Organization).count(),
        "hospitals": db.query(Organization).filter(Organization.OrganizationType == "HOSPITAL").count(),
        "labs": db.query(Organization).filter(Organization.OrganizationType == "LAB").count(),
        "pharmacies": db.query(Organization).filter(Organization.OrganizationType == "PHARMACY").count(),
        "appointments": db.query(Appointment).count(),
        "audit_activities": db.query(AccessAuditLog).count()
    }

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.Role = role.upper()
    db.commit()
    db.refresh(user)
    return user
