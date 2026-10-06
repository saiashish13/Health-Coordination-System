from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medicine import Medicine
from app.models.user import User
from app.schemas.medicine import MedicineOut, MedicineCreate, MedicineUpdate
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("", response_model=List[MedicineOut])
def get_all_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Medicine).all()

@router.get("/{medicine_id}", response_model=MedicineOut)
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    med = db.query(Medicine).filter(Medicine.MedicineID == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.post("", response_model=MedicineOut)
def create_medicine(
    req: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["ADMIN", "PHARMACY", "DOCTOR"]:
        raise HTTPException(status_code=403, detail="Permission denied to add medicines")

    med = Medicine(
        MedicineName=req.MedicineName,
        GenericName=req.GenericName,
        DosageForm=req.DosageForm,
        Manufacturer=req.Manufacturer
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med

@router.put("/{medicine_id}", response_model=MedicineOut)
def update_medicine(
    medicine_id: int,
    req: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["ADMIN", "PHARMACY"]:
        raise HTTPException(status_code=403, detail="Permission denied to edit medicines")

    med = db.query(Medicine).filter(Medicine.MedicineID == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    if req.MedicineName:
        med.MedicineName = req.MedicineName
    if req.GenericName is not None:
        med.GenericName = req.GenericName
    if req.DosageForm is not None:
        med.DosageForm = req.DosageForm
    if req.Manufacturer is not None:
        med.Manufacturer = req.Manufacturer

    db.commit()
    db.refresh(med)
    return med

@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role not in ["ADMIN", "PHARMACY"]:
        raise HTTPException(status_code=403, detail="Permission denied to delete medicines")

    med = db.query(Medicine).filter(Medicine.MedicineID == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(med)
    db.commit()
    return {"success": True, "message": "Medicine deleted successfully"}
