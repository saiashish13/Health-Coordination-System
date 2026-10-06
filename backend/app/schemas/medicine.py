from typing import Optional
from pydantic import BaseModel, ConfigDict

class MedicineBase(BaseModel):
    MedicineName: str
    GenericName: Optional[str] = None
    DosageForm: Optional[str] = None
    Manufacturer: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    MedicineName: Optional[str] = None
    GenericName: Optional[str] = None
    DosageForm: Optional[str] = None
    Manufacturer: Optional[str] = None

class MedicineOut(MedicineBase):
    MedicineID: int

    model_config = ConfigDict(from_attributes=True)

