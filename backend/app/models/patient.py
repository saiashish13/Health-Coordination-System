from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Patient(Base):
    __tablename__ = "Patients"

    PatientID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), unique=True, nullable=False)
    DateOfBirth = Column(String(50), nullable=True)
    Gender = Column(String(20), nullable=True)
    BloodGroup = Column(String(10), nullable=True)
    Address = Column(String(255), nullable=True)
    EmergencyContact = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
    lab_tests = relationship("LabTest", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    medication_orders = relationship("MedicationOrder", back_populates="patient", cascade="all, delete-orphan")
    permission_requests = relationship("PermissionRequest", back_populates="patient", cascade="all, delete-orphan")
    doctor_accesses = relationship("PatientDoctorAccess", back_populates="patient", cascade="all, delete-orphan")
    ai_interactions = relationship("AIInteraction", back_populates="patient", cascade="all, delete-orphan")
    ai_recommendations = relationship("AIRecommendation", back_populates="patient", cascade="all, delete-orphan")
    audit_logs = relationship("AccessAuditLog", back_populates="patient", cascade="all, delete-orphan")
