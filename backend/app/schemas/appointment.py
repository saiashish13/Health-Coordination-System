from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut

class AppointmentBase(BaseModel):
    PatientID: int
    DoctorID: int
    AppointmentDate: datetime
    Reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    AppointmentDate: Optional[datetime] = None
    Reason: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    Status: str # SCHEDULED, CONFIRMED, COMPLETED, CANCELLED

class AppointmentOut(AppointmentBase):
    AppointmentID: int
    Status: str
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None

    model_config = ConfigDict(from_attributes=True)

