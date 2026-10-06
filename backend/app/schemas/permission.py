from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut

class PermissionRequestCreate(BaseModel):
    PatientID: int
    Reason: Optional[str] = None

class PermissionRequestStatusUpdate(BaseModel):
    Status: str # APPROVED, REJECTED, REVOKED

class PatientAccessPermissionBase(BaseModel):
    ResourceType: str # MEDICAL_RECORD, LAB_REPORT, PRESCRIPTION, APPOINTMENT, DIAGNOSIS
    CanView: bool = True
    CanAdd: bool = False
    CanEdit: bool = False

class PatientAccessPermissionOut(PatientAccessPermissionBase):
    PermissionID: int
    AccessID: int

    model_config = ConfigDict(from_attributes=True)

class PatientDoctorAccessOut(BaseModel):
    AccessID: int
    PatientID: int
    DoctorID: int
    GrantedAt: datetime
    ExpiresAt: Optional[datetime] = None
    Status: str
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None
    permissions: List[PatientAccessPermissionOut] = []

    model_config = ConfigDict(from_attributes=True)

class PermissionRequestOut(BaseModel):
    RequestID: int
    PatientID: int
    DoctorID: int
    RequestedAt: datetime
    Status: str
    Reason: Optional[str] = None
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None

    model_config = ConfigDict(from_attributes=True)

