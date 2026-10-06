from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Appointment(Base):
    __tablename__ = "Appointments"

    AppointmentID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=False)
    AppointmentDate = Column(DateTime, nullable=False, default=datetime.utcnow)
    Status = Column(String(50), nullable=False, default="SCHEDULED") # SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
    Reason = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    medical_records = relationship("MedicalRecord", back_populates="appointment")
