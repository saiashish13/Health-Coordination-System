from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PrescriptionItem(Base):
    __tablename__ = "PrescriptionItems"

    PrescriptionItemID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    PrescriptionID = Column(Integer, ForeignKey("Prescriptions.PrescriptionID"), nullable=False)
    MedicineID = Column(Integer, ForeignKey("Medicines.MedicineID"), nullable=False)
    Dosage = Column(String(100), nullable=True)
    Frequency = Column(String(100), nullable=True)
    Duration = Column(String(100), nullable=True)
    Instructions = Column(Text, nullable=True)

    # Relationships
    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine", back_populates="prescription_items")
