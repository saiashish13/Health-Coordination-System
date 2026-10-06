from typing import Optional
from pydantic import BaseModel, ConfigDict

class OrganizationBase(BaseModel):
    OrganizationName: str
    OrganizationType: str # HOSPITAL, LAB, PHARMACY
    Address: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    OrganizationName: Optional[str] = None
    OrganizationType: Optional[str] = None
    Address: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[str] = None

class OrganizationOut(OrganizationBase):
    OrganizationID: int

    model_config = ConfigDict(from_attributes=True)

