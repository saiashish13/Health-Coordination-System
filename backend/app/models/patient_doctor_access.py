from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PatientDoctorAccess(Base):
    __tablename__ = "PatientDoctorAccess"

    AccessID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=False)
    GrantedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    ExpiresAt = Column(DateTime, nullable=True)
    Status = Column(String(50), nullable=False, default="ACTIVE") # ACTIVE, EXPIRED, REVOKED

    # Relationships
    patient = relationship("Patient", back_populates="doctor_accesses")
    doctor = relationship("Doctor", back_populates="patient_accesses")
    permissions = relationship("PatientAccessPermission", back_populates="access", cascade="all, delete-orphan")
