from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut
from app.schemas.patient import PatientOut

class AccessAuditLogOut(BaseModel):
    AuditID: int
    UserID: int
    PatientID: Optional[int] = None
    ResourceType: str
    ResourceID: Optional[int] = None
    Action: str
    AccessedAt: datetime
    user: Optional[UserOut] = None
    patient: Optional[PatientOut] = None

    model_config = ConfigDict(from_attributes=True)

