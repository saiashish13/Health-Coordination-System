from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MedicalRecord(Base):
    __tablename__ = "MedicalRecords"

    RecordID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=False)
    AppointmentID = Column(Integer, ForeignKey("Appointments.AppointmentID"), nullable=True)
    RecordDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    Symptoms = Column(Text, nullable=True)
    ClinicalNotes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_records")
    diagnoses = relationship("Diagnosis", back_populates="medical_record", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="medical_record")
    ai_recommendations = relationship("AIRecommendation", back_populates="medical_record")
