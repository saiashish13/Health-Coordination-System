from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AIRecommendation(Base):
    __tablename__ = "AIRecommendations"

    RecommendationID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    RecordID = Column(Integer, ForeignKey("MedicalRecords.RecordID"), nullable=True)
    RecommendationType = Column(String(50), nullable=False) # FOLLOW_UP, DIAGNOSIS_SUGGESTION, LAB_SUGGESTION, MEDICATION_CARE
    RecommendationText = Column(Text, nullable=False)
    Status = Column(String(50), nullable=False, default="PENDING") # PENDING, REVIEWED, REJECTED
    ReviewedByDoctor = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=True)
    ReviewedAt = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="ai_recommendations")
    medical_record = relationship("MedicalRecord", back_populates="ai_recommendations")
    doctor_reviewer = relationship("Doctor", back_populates="ai_recommendations_reviewed")
