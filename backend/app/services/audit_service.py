from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AccessAuditLog

class AuditService:
    @staticmethod
    def log_access(
        db: Session,
        user_id: int,
        resource_type: str,
        patient_id: Optional[int] = None,
        resource_id: Optional[int] = None,
        action: str = "VIEW"
    ) -> AccessAuditLog:
        audit_entry = AccessAuditLog(
            UserID=user_id,
            PatientID=patient_id,
            ResourceType=resource_type,
            ResourceID=resource_id,
            Action=action
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry

audit_service = AuditService()
