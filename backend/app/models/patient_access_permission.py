from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PatientAccessPermission(Base):
    __tablename__ = "PatientAccessPermissions"

    PermissionID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    AccessID = Column(Integer, ForeignKey("PatientDoctorAccess.AccessID"), nullable=False)
    ResourceType = Column(String(50), nullable=False) # MEDICAL_RECORD, LAB_REPORT, PRESCRIPTION, APPOINTMENT, DIAGNOSIS
    CanView = Column(Boolean, default=True, nullable=False)
    CanAdd = Column(Boolean, default=False, nullable=False)
    CanEdit = Column(Boolean, default=False, nullable=False)

    # Relationships
    access = relationship("PatientDoctorAccess", back_populates="permissions")
