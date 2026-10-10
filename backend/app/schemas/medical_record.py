from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut

class MedicalRecordBase(BaseModel):
    PatientID: int
    DoctorID: int
    AppointmentID: Optional[int] = None
    Symptoms: Optional[str] = None
    ClinicalNotes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    Symptoms: Optional[str] = None
    ClinicalNotes: Optional[str] = None

class MedicalRecordOut(MedicalRecordBase):
    RecordID: int
    RecordDate: datetime
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None

    model_config = ConfigDict(from_attributes=True)

