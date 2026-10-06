from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NotificationCreate(BaseModel):
    UserID: int
    Title: str
    Message: str

class NotificationOut(BaseModel):
    NotificationID: int
    UserID: int
    Title: str
    Message: str
    IsRead: bool
    CreatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

