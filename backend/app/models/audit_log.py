from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AccessAuditLog(Base):
    __tablename__ = "AccessAuditLog"

    AuditID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), nullable=False)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=True)
    ResourceType = Column(String(50), nullable=False) # MedicalRecord, LabReport, Prescription, Diagnosis, Patient, etc.
    ResourceID = Column(Integer, nullable=True)
    Action = Column(String(50), nullable=False) # VIEW, ADD, EDIT, DELETE, DOWNLOAD
    AccessedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    patient = relationship("Patient", back_populates="audit_logs")
