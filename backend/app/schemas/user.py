from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    FullName: str
    Email: EmailStr
    Phone: Optional[str] = None
    Role: str

class UserCreate(UserBase):
    Password: str

class UserUpdate(BaseModel):
    FullName: Optional[str] = None
    Phone: Optional[str] = None
    Role: Optional[str] = None

class UserOut(UserBase):
    UserID: int
    CreatedAt: datetime

    model_config = ConfigDict(from_attributes=True)

