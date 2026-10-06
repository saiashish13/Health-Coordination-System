from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AIInteraction(Base):
    __tablename__ = "AIInteractions"

    InteractionID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    InteractionType = Column(String(50), nullable=True) # CHAT, SUMMARY, TRIAGE, GENERAL
    UserQuery = Column(Text, nullable=False)
    AIResponse = Column(Text, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="ai_interactions")
