from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DiagnosisBase(BaseModel):
    RecordID: int
    ICDCode: Optional[str] = None
    Description: str

class DiagnosisCreate(DiagnosisBase):
    pass

class DiagnosisUpdate(BaseModel):
    ICDCode: Optional[str] = None
    Description: Optional[str] = None

class DiagnosisOut(DiagnosisBase):
    DiagnosisID: int
    DiagnosedDate: datetime

    model_config = ConfigDict(from_attributes=True)

