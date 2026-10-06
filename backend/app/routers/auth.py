import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.auth import RegisterRequest, LoginRequest, GoogleAuthRequest, TokenResponse, UserProfileResponse
from app.security.passwords import hash_password, verify_password
from app.security.jwt import create_access_token
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.Email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    role_upper = req.role.upper()
    user = User(
        FullName=req.fullName,
        Email=req.email,
        Phone=req.phone,
        PasswordHash=hash_password(req.password),
        Role=role_upper
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile_id = None

    if role_upper == "PATIENT":
        patient = Patient(UserID=user.UserID)
        db.add(patient)
        db.commit()
        db.refresh(patient)
        profile_id = patient.PatientID
    elif role_upper == "DOCTOR":
        doctor = Doctor(
            UserID=user.UserID,
            OrganizationID=req.organizationId,
            Specialty=req.specialty,
            LicenseNumber=req.licenseNumber,
            Phone=req.phone
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)
        profile_id = doctor.DoctorID

    token = create_access_token({
        "user_id": user.UserID,
        "email": user.Email,
        "role": user.Role,
        "profile_id": profile_id
    })

    return TokenResponse(
        access_token=token,
        user_id=user.UserID,
        role=user.Role,
        profile_id=profile_id,
        full_name=user.FullName,
        email=user.Email
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.Email == req.email).first()
    if not user or not verify_password(req.password, user.PasswordHash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    profile_id = None
    if user.Role == "PATIENT" and user.patient_profile:
        profile_id = user.patient_profile.PatientID
    elif user.Role == "DOCTOR" and user.doctor_profile:
        profile_id = user.doctor_profile.DoctorID

    token = create_access_token({
        "user_id": user.UserID,
        "email": user.Email,
        "role": user.Role,
        "profile_id": profile_id
    })

    return TokenResponse(
        access_token=token,
        user_id=user.UserID,
        role=user.Role,
        profile_id=profile_id,
        full_name=user.FullName,
        email=user.Email
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.Email == req.email).first()
    
    if not user:
        # Create user via Google OAuth auto-registration
        role_upper = (req.role or "PATIENT").upper()
        # Random hashed password for OAuth accounts
        random_pwd = hash_password(str(uuid.uuid4()))
        
        user = User(
            FullName=req.fullName,
            Email=req.email,
            PasswordHash=random_pwd,
            Role=role_upper
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        if role_upper == "PATIENT":
            patient = Patient(UserID=user.UserID)
            db.add(patient)
            db.commit()
        elif role_upper == "DOCTOR":
            doctor = Doctor(UserID=user.UserID)
            db.add(doctor)
            db.commit()

    profile_id = None
    if user.Role == "PATIENT" and user.patient_profile:
        profile_id = user.patient_profile.PatientID
    elif user.Role == "DOCTOR" and user.doctor_profile:
        profile_id = user.doctor_profile.DoctorID

    token = create_access_token({
        "user_id": user.UserID,
        "email": user.Email,
        "role": user.Role,
        "profile_id": profile_id
    })

    return TokenResponse(
        access_token=token,
        user_id=user.UserID,
        role=user.Role,
        profile_id=profile_id,
        full_name=user.FullName,
        email=user.Email
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: User = Depends(get_current_user)):
    profile_id = None
    if current_user.Role == "PATIENT" and current_user.patient_profile:
        profile_id = current_user.patient_profile.PatientID
    elif current_user.Role == "DOCTOR" and current_user.doctor_profile:
        profile_id = current_user.doctor_profile.DoctorID

    token = create_access_token({
        "user_id": current_user.UserID,
        "email": current_user.Email,
        "role": current_user.Role,
        "profile_id": profile_id
    })

    return TokenResponse(
        access_token=token,
        user_id=current_user.UserID,
        role=current_user.Role,
        profile_id=profile_id,
        full_name=current_user.FullName,
        email=current_user.Email
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    patient_id = current_user.patient_profile.PatientID if current_user.patient_profile else None
    doctor_id = current_user.doctor_profile.DoctorID if current_user.doctor_profile else None
    org_id = current_user.doctor_profile.OrganizationID if current_user.doctor_profile else None

    return UserProfileResponse(
        UserID=current_user.UserID,
        FullName=current_user.FullName,
        Email=current_user.Email,
        Phone=current_user.Phone,
        Role=current_user.Role,
        PatientID=patient_id,
        DoctorID=doctor_id,
        OrganizationID=org_id
    )

@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully"}
