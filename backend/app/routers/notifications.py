from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationOut, NotificationCreate
from app.dependencies.auth_deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(Notification.UserID == current_user.UserID).order_by(Notification.CreatedAt.desc()).all()

@router.get("/unread", response_model=List[NotificationOut])
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.UserID == current_user.UserID,
        Notification.IsRead == False
    ).order_by(Notification.CreatedAt.desc()).all()

@router.post("", response_model=NotificationOut)
def create_notification_manual(
    req: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.Role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admins can manually send system notifications")

    notif = Notification(
        UserID=req.UserID,
        Title=req.Title,
        Message=req.Message,
        IsRead=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.NotificationID == notification_id,
        Notification.UserID == current_user.UserID
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.IsRead = True
    db.commit()
    db.refresh(notif)
    return notif

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.UserID == current_user.UserID,
        Notification.IsRead == False
    ).update({"IsRead": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}
