from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.organization import OrganizationOut
from app.schemas.prescription import PrescriptionOut

class MedicationOrderCreate(BaseModel):
    PatientID: int
    PharmacyID: int
    PrescriptionID: int

class MedicationOrderStatusUpdate(BaseModel):
    Status: str # PENDING, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED

class MedicationOrderOut(BaseModel):
    OrderID: int
    PatientID: int
    PharmacyID: int
    PrescriptionID: int
    OrderDate: datetime
    Status: str
    patient: Optional[PatientOut] = None
    pharmacy: Optional[OrganizationOut] = None
    prescription: Optional[PrescriptionOut] = None

    model_config = ConfigDict(from_attributes=True)

