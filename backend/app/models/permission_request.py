from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PermissionRequest(Base):
    __tablename__ = "PermissionRequests"

    RequestID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=False)
    RequestedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    Status = Column(String(50), nullable=False, default="PENDING") # PENDING, APPROVED, REJECTED, REVOKED
    Reason = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="permission_requests")
    doctor = relationship("Doctor", back_populates="permission_requests")
