from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MedicationOrder(Base):
    __tablename__ = "MedicationOrders"

    OrderID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PatientID = Column(Integer, ForeignKey("Patients.PatientID"), nullable=False)
    PharmacyID = Column(Integer, ForeignKey("Organizations.OrganizationID"), nullable=False)
    PrescriptionID = Column(Integer, ForeignKey("Prescriptions.PrescriptionID"), nullable=False)
    OrderDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    Status = Column(String(50), nullable=False, default="PENDING") # PENDING, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED

    # Relationships
    patient = relationship("Patient", back_populates="medication_orders")
    pharmacy = relationship("Organization", back_populates="medication_orders")
    prescription = relationship("Prescription", back_populates="medication_orders")
