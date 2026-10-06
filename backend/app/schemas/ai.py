from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.patient import PatientOut
from app.schemas.doctor import DoctorOut

class AIInteractionCreate(BaseModel):
    PatientID: int
    UserQuery: str
    InteractionType: Optional[str] = "CHAT"

class AIInteractionOut(BaseModel):
    InteractionID: int
    PatientID: int
    InteractionType: Optional[str] = None
    UserQuery: str
    AIResponse: str
    CreatedAt: datetime
    patient: Optional[PatientOut] = None

    model_config = ConfigDict(from_attributes=True)

class AIRecommendationCreate(BaseModel):
    PatientID: int
    RecordID: Optional[int] = None
    RecommendationType: str
    RecommendationText: str

class AIRecommendationReviewUpdate(BaseModel):
    Status: str # REVIEWED, REJECTED

class AIRecommendationOut(BaseModel):
    RecommendationID: int
    PatientID: int
    RecordID: Optional[int] = None
    RecommendationType: str
    RecommendationText: str
    Status: str
    ReviewedByDoctor: Optional[int] = None
    ReviewedAt: Optional[datetime] = None
    CreatedAt: datetime
    patient: Optional[PatientOut] = None
    doctor_reviewer: Optional[DoctorOut] = None

    model_config = ConfigDict(from_attributes=True)

