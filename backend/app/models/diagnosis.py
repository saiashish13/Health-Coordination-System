from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Diagnosis(Base):
    __tablename__ = "Diagnoses"

    DiagnosisID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    RecordID = Column(Integer, ForeignKey("MedicalRecords.RecordID"), nullable=False)
    ICDCode = Column(String(50), nullable=True)
    Description = Column(Text, nullable=False)
    DiagnosedDate = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="diagnoses")
