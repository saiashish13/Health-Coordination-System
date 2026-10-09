from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.permission_request import PermissionRequest
from app.models.patient_doctor_access import PatientDoctorAccess
from app.models.patient_access_permission import PatientAccessPermission
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.permission import (
    PermissionRequestOut, PermissionRequestCreate, PermissionRequestStatusUpdate,
    PatientDoctorAccessOut, PatientAccessPermissionOut
)
from app.dependencies.auth_deps import get_current_user
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="", tags=["Permissions & Access Control"])

@router.post("/access-requests", response_model=PermissionRequestOut)
def create_access_request(
    req: PermissionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role != "DOCTOR" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Only doctors can request access to patient records")

    doctor_id = current_user.doctor_profile.DoctorID
    patient = db.query(Patient).filter(Patient.PatientID == req.PatientID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    perm_req = PermissionRequest(
        PatientID=req.PatientID,
        DoctorID=doctor_id,
        Reason=req.Reason,
        Status="PENDING"
    )
    db.add(perm_req)
    db.commit()
    db.refresh(perm_req)

    if patient.user:
        notification_service.create_notification(
            db, patient.user.UserID, "Access Permission Requested",
            f"Dr. {current_user.FullName} has requested access to view your medical records."
        )
    notification_service.create_notification(
        db, current_user.UserID, "Permission Request Sent",
        f"You requested medical access for Patient ID #{req.PatientID} ({patient.user.FullName if patient.user else 'Patient'})."
    )

    audit_service.log_access(db, current_user.UserID, "PermissionRequest", req.PatientID, perm_req.RequestID, "ADD")
    return perm_req

@router.get("/access-requests", response_model=List[PermissionRequestOut])
def get_access_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(PermissionRequest).filter(PermissionRequest.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        return db.query(PermissionRequest).filter(PermissionRequest.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(PermissionRequest).all()

@router.get("/access-requests/{request_id}", response_model=PermissionRequestOut)
def get_access_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(PermissionRequest).filter(PermissionRequest.RequestID == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")
    return req

@router.patch("/access-requests/{request_id}/approve", response_model=PermissionRequestOut)
def approve_access_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(PermissionRequest).filter(PermissionRequest.RequestID == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    if current_user.Role == "PATIENT" and (not current_user.patient_profile or current_user.patient_profile.PatientID != req.PatientID):
        raise HTTPException(status_code=403, detail="Only the patient can approve this request")

    req.Status = "APPROVED"

    # Check or create PatientDoctorAccess
    access = db.query(PatientDoctorAccess).filter(
        PatientDoctorAccess.PatientID == req.PatientID,
        PatientDoctorAccess.DoctorID == req.DoctorID
    ).first()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)

    if not access:
        access = PatientDoctorAccess(
            PatientID=req.PatientID,
            DoctorID=req.DoctorID,
            GrantedAt=now,
            ExpiresAt=expires_at,
            Status="ACTIVE"
        )
        db.add(access)
        db.commit()
        db.refresh(access)

        # Create default resource permissions
        resources = ["MEDICAL_RECORD", "LAB_REPORT", "PRESCRIPTION", "APPOINTMENT", "DIAGNOSIS"]
        for r in resources:
            perm = PatientAccessPermission(
                AccessID=access.AccessID,
                ResourceType=r,
                CanView=True,
                CanAdd=True,
                CanEdit=False
            )
            db.add(perm)
        db.commit()
    else:
        access.Status = "ACTIVE"
        access.GrantedAt = now
        access.ExpiresAt = expires_at
        db.commit()

    if req.doctor and req.doctor.user:
        notification_service.create_notification(
            db, req.doctor.user.UserID, "Access Permission Confirmed (Approved)",
            f"Patient ID #{req.PatientID} ({current_user.FullName}) approved and confirmed your medical access request."
        )
    notification_service.create_notification(
        db, current_user.UserID, "Access Permission Confirmed",
        f"You have confirmed and granted medical record access to Dr. {req.doctor.user.FullName if req.doctor and req.doctor.user else ''}."
    )

    audit_service.log_access(db, current_user.UserID, "PermissionRequest", req.PatientID, request_id, "EDIT")
    return req

@router.patch("/access-requests/{request_id}/reject", response_model=PermissionRequestOut)
def reject_access_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(PermissionRequest).filter(PermissionRequest.RequestID == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    req.Status = "REJECTED"
    db.commit()
    db.refresh(req)

    if req.doctor and req.doctor.user:
        notification_service.create_notification(
            db, req.doctor.user.UserID, "Access Permission Denied (Rejected)",
            f"Patient ID #{req.PatientID} ({current_user.FullName}) declined your medical record access request."
        )
    notification_service.create_notification(
        db, current_user.UserID, "Access Permission Denied",
        f"You declined access request from Dr. {req.doctor.user.FullName if req.doctor and req.doctor.user else ''}."
    )

    return req

@router.patch("/access-requests/{request_id}/revoke", response_model=PermissionRequestOut)
def revoke_access_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(PermissionRequest).filter(PermissionRequest.RequestID == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    req.Status = "REVOKED"
    
    access = db.query(PatientDoctorAccess).filter(
        PatientDoctorAccess.PatientID == req.PatientID,
        PatientDoctorAccess.DoctorID == req.DoctorID
    ).first()
    if access:
        access.Status = "REVOKED"
        db.commit()

    db.commit()
    db.refresh(req)

    if req.doctor and req.doctor.user:
        notification_service.create_notification(
            db, req.doctor.user.UserID, "Access Permission Revoked",
            f"Patient ID #{req.PatientID} revoked your access permissions."
        )

    return req

@router.get("/patient-doctor-access", response_model=List[PatientDoctorAccessOut])
def get_patient_doctor_access_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        return db.query(PatientDoctorAccess).filter(PatientDoctorAccess.PatientID == current_user.patient_profile.PatientID).all()
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        return db.query(PatientDoctorAccess).filter(PatientDoctorAccess.DoctorID == current_user.doctor_profile.DoctorID).all()
    return db.query(PatientDoctorAccess).all()

@router.get("/access-permissions", response_model=List[PatientAccessPermissionOut])
def get_access_permissions_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PatientAccessPermission).all()
