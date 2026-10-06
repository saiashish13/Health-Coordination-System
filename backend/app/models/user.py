from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "Users"

    UserID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    FullName = Column(String(150), nullable=False)
    Email = Column(String(150), unique=True, index=True, nullable=False)
    Phone = Column(String(50), nullable=True)
    PasswordHash = Column(String(255), nullable=False)
    Role = Column(String(50), nullable=False, default="PATIENT") # PATIENT, DOCTOR, ADMIN, LAB, PHARMACY
    CreatedAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AccessAuditLog", back_populates="user", cascade="all, delete-orphan")
