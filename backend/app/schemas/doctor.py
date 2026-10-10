from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserOut
from app.schemas.organization import OrganizationOut

class DoctorBase(BaseModel):
    HospitalName: Optional[str] = None
    Specialty: Optional[str] = None
    LicenseNumber: Optional[str] = None
    Phone: Optional[str] = None
    OrganizationID: Optional[int] = None

class DoctorCreate(DoctorBase):
    UserID: int

class DoctorUpdate(DoctorBase):
    FullName: Optional[str] = None
    HospitalName: Optional[str] = None

class DoctorOut(DoctorBase):
    DoctorID: int
    UserID: int
    user: Optional[UserOut] = None
    organization: Optional[OrganizationOut] = None

    model_config = ConfigDict(from_attributes=True)

