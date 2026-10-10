from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut

class PatientBase(BaseModel):
    DateOfBirth: Optional[str] = None
    Gender: Optional[str] = None
    BloodGroup: Optional[str] = None
    Address: Optional[str] = None
    EmergencyContact: Optional[str] = None

class PatientCreate(PatientBase):
    UserID: int

class PatientUpdate(PatientBase):
    FullName: Optional[str] = None
    Phone: Optional[str] = None

class PatientOut(PatientBase):
    PatientID: int
    UserID: int
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

