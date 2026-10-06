from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Prescription(Base):
    __tablename__ = "Prescriptions"

    PrescriptionID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    DoctorID = Column(Integer, ForeignKey("Doctors.DoctorID"), nullable=False)
    RecordID = Column(Integer, ForeignKey("MedicalRecords.RecordID"), nullable=True)
    PrescriptionDate = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    medical_record = relationship("MedicalRecord", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")
    medication_orders = relationship("MedicationOrder", back_populates="prescription")
