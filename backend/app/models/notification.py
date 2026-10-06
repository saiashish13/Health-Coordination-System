from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Notification(Base):
    __tablename__ = "Notifications"

    NotificationID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), nullable=False)
    Title = Column(String(150), nullable=False)
    Message = Column(Text, nullable=False)
    IsRead = Column(Boolean, default=False, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
