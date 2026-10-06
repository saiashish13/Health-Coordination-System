from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Doctor(Base):
    __tablename__ = "Doctors"

    DoctorID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), unique=True, nullable=False)
    OrganizationID = Column(Integer, ForeignKey("Organizations.OrganizationID"), nullable=True)
    Specialty = Column(String(100), nullable=True)
    LicenseNumber = Column(String(100), nullable=True)
    Phone = Column(String(50), nullable=True)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    organization = relationship("Organization", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    lab_tests = relationship("LabTest", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    permission_requests = relationship("PermissionRequest", back_populates="doctor")
    patient_accesses = relationship("PatientDoctorAccess", back_populates="doctor")
    ai_recommendations_reviewed = relationship("AIRecommendation", back_populates="doctor_reviewer")
