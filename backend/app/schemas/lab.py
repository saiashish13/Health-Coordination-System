from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut
from app.schemas.organization import OrganizationOut

class LabTestBase(BaseModel):
    PatientID: int
    DoctorID: Optional[int] = None
    OrganizationID: Optional[int] = None
    TestName: str

class LabTestCreate(LabTestBase):
    pass

class LabTestStatusUpdate(BaseModel):
    Status: str # ORDERED, IN_PROGRESS, COMPLETED, CANCELLED

class LabReportCreate(BaseModel):
    TestID: int
    Results: str
    ReportFileURL: Optional[str] = None

class LabReportOut(BaseModel):
    ReportID: int
    TestID: int
    ReportDate: datetime
    Results: str
    ReportFileURL: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LabTestOut(LabTestBase):
    TestID: int
    TestDate: datetime
    Status: str
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None
    organization: Optional[OrganizationOut] = None
    report: Optional[LabReportOut] = None

    model_config = ConfigDict(from_attributes=True)

