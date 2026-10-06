from typing import Optional
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: str = "PATIENT" # PATIENT, DOCTOR, ADMIN, LAB, PHARMACY
    phone: Optional[str] = None
    organizationId: Optional[int] = None
    specialty: Optional[str] = None
    licenseNumber: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    fullName: str
    role: Optional[str] = "PATIENT"
    providerId: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    profile_id: Optional[int] = None
    full_name: str
    email: str

class UserProfileResponse(BaseModel):
    UserID: int
    FullName: str
    Email: str
    Phone: Optional[str] = None
    Role: str
    PatientID: Optional[int] = None
    DoctorID: Optional[int] = None
    OrganizationID: Optional[int] = None
