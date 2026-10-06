from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.patient_doctor_access import PatientDoctorAccess
from app.models.patient_access_permission import PatientAccessPermission

class PermissionService:
    @staticmethod
    def verify_doctor_permission(
        db: Session,
        patient_id: int,
        doctor_id: int,
        resource_type: str, # MEDICAL_RECORD, LAB_REPORT, PRESCRIPTION, APPOINTMENT, DIAGNOSIS
        action_type: str = "VIEW" # VIEW, ADD, EDIT
    ) -> bool:
        access = db.query(PatientDoctorAccess).filter(
            PatientDoctorAccess.PatientID == patient_id,
            PatientDoctorAccess.DoctorID == doctor_id,
            PatientDoctorAccess.Status == "ACTIVE"
        ).first()

        if not access:
            return False

        # Check expiration
        if access.ExpiresAt and datetime.utcnow() > access.ExpiresAt:
            # Mark as expired
            access.Status = "EXPIRED"
            db.commit()
            return False

        # Check granular permissions
        perm = db.query(PatientAccessPermission).filter(
            PatientAccessPermission.AccessID == access.AccessID,
            PatientAccessPermission.ResourceType == resource_type
        ).first()

        if not perm:
            # Default allow view if active access link exists, but strictly enforce flags if present
            return True if action_type == "VIEW" else False

        if action_type == "VIEW":
            return perm.CanView
        elif action_type == "ADD":
            return perm.CanAdd
        elif action_type == "EDIT":
            return perm.CanEdit

        return False

permission_service = PermissionService()
