from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Medicine(Base):
    __tablename__ = "Medicines"

    MedicineID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    MedicineName = Column(String(150), nullable=False)
    GenericName = Column(String(150), nullable=True)
    DosageForm = Column(String(100), nullable=True) # Tablet, Syrup, Injection, etc.
    Manufacturer = Column(String(150), nullable=True)

    # Relationships
    prescription_items = relationship("PrescriptionItem", back_populates="medicine")
