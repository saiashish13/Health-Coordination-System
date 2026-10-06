from sqlalchemy.orm import Session
from app.models.notification import Notification

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str
    ) -> Notification:
        notif = Notification(
            UserID=user_id,
            Title=title,
            Message=message,
            IsRead=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

notification_service = NotificationService()
