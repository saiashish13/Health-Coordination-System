from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationOut, OrganizationCreate, OrganizationUpdate
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("", response_model=List[OrganizationOut])
def get_organizations(
    type: Optional[str] = Query(None, description="HOSPITAL, LAB, PHARMACY"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Organization)
    if type:
        query = query.filter(Organization.OrganizationType == type.upper())
    return query.all()

@router.get("/{organization_id}", response_model=OrganizationOut)
def get_organization_by_id(
    organization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.OrganizationID == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.post("", response_model=OrganizationOut)
def create_organization(
    req: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["ADMIN", "HOSPITAL"]:
        raise HTTPException(status_code=403, detail="Permission denied to create organization")
        
    org = Organization(
        OrganizationName=req.OrganizationName,
        OrganizationType=req.OrganizationType.upper(),
        Address=req.Address,
        Phone=req.Phone,
        Email=req.Email
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.put("/{organization_id}", response_model=OrganizationOut)
def update_organization(
    organization_id: int,
    req: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["ADMIN", "HOSPITAL"]:
        raise HTTPException(status_code=403, detail="Permission denied to update organization")

    org = db.query(Organization).filter(Organization.OrganizationID == organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if req.OrganizationName:
        org.OrganizationName = req.OrganizationName
    if req.OrganizationType:
        org.OrganizationType = req.OrganizationType.upper()
    if req.Address:
        org.Address = req.Address
    if req.Phone:
        org.Phone = req.Phone
    if req.Email:
        org.Email = req.Email

    db.commit()
    db.refresh(org)
    return org
