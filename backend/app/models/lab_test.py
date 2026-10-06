from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class LabTest(Base):
    __tablename__ = "LabTests"

    TestID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=True)
    OrganizationID = Column(Integer, ForeignKey("Organizations.OrganizationID"), nullable=True)
    TestName = Column(String(150), nullable=False)
    TestDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    Status = Column(String(50), nullable=False, default="ORDERED") # ORDERED, IN_PROGRESS, COMPLETED, CANCELLED

    # Relationships
    patient = relationship("Patient", back_populates="lab_tests")
    doctor = relationship("Doctor", back_populates="lab_tests")
    organization = relationship("Organization", back_populates="lab_tests")
    report = relationship("LabReport", back_populates="lab_test", uselist=False, cascade="all, delete-orphan")
