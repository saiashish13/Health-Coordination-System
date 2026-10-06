from typing import List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.security.jwt import decode_access_token
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    return user

def require_authenticated_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user

def require_role(allowed_roles: List[str]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.Role.upper()
        allowed_upper = [r.upper() for r in allowed_roles]
        if user_role not in allowed_upper:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}"
            )
        return current_user
    return role_checker

def require_patient(current_user: User = Depends(get_current_user)) -> User:
    if current_user.Role.upper() != "PATIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to Patients")
    return current_user

def require_doctor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.Role.upper() != "DOCTOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to Doctors")
    return current_user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.Role.upper() != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to Administrators")
    return current_user

def require_lab(current_user: User = Depends(get_current_user)) -> User:
    if current_user.Role.upper() not in ["LAB", "ADMIN"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to Laboratory personnel")
    return current_user

def require_pharmacy(current_user: User = Depends(get_current_user)) -> User:
    if current_user.Role.upper() not in ["PHARMACY", "ADMIN"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access restricted to Pharmacy personnel")
    return current_user
