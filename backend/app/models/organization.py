from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "Organizations"

    OrganizationID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    OrganizationName = Column(String(150), nullable=False)
    OrganizationType = Column(String(50), nullable=False) # HOSPITAL, LAB, PHARMACY
    Address = Column(String(255), nullable=True)
    Phone = Column(String(50), nullable=True)
    Email = Column(String(150), nullable=True)

    # Relationships
    doctors = relationship("Doctor", back_populates="organization")
    lab_tests = relationship("LabTest", back_populates="organization")
    medication_orders = relationship("MedicationOrder", back_populates="pharmacy")
