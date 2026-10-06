from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class LabReport(Base):
    __tablename__ = "LabReports"

    ReportID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    TestID = Column(Integer, ForeignKey("LabTests.TestID"), nullable=False, unique=True)
    ReportDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    Results = Column(Text, nullable=False)
    ReportFileURL = Column(String(500), nullable=True)

    # Relationships
    lab_test = relationship("LabTest", back_populates="report")
