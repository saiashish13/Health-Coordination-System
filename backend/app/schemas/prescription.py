from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.medicine import MedicineOut
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut

class PrescriptionItemCreate(BaseModel):
    MedicineID: int
    Dosage: Optional[str] = None
    Frequency: Optional[str] = None
    Duration: Optional[str] = None
    Instructions: Optional[str] = None

class PrescriptionItemOut(BaseModel):
    PrescriptionItemID: int
    PrescriptionID: int
    MedicineID: int
    Dosage: Optional[str] = None
    Frequency: Optional[str] = None
    Duration: Optional[str] = None
    Instructions: Optional[str] = None
    medicine: Optional[MedicineOut] = None

    model_config = ConfigDict(from_attributes=True)

class PrescriptionCreate(BaseModel):
    PatientID: int
    DoctorID: int
    RecordID: Optional[int] = None
    items: List[PrescriptionItemCreate] = []

class PrescriptionOut(BaseModel):
    PrescriptionID: int
    PatientID: int
    DoctorID: int
    RecordID: Optional[int] = None
    PrescriptionDate: datetime
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None
    items: List[PrescriptionItemOut] = []

    model_config = ConfigDict(from_attributes=True)

