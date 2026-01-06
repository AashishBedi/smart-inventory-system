from sqlalchemy.orm import Session
from datetime import datetime
from app.models.models import Reservation

def create_reservation(
    db: Session,
    reservation_id: str,
    sku: str,
    user_id: str,
    quantity: int,
    status: str,
    expires_at: datetime
):
    reservation = Reservation(
        id=reservation_id,
        sku=sku,
        user_id=user_id,
        quantity=quantity,
        status=status,
        expires_at=expires_at
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

def get_reservation_by_id(db: Session, reservation_id: str):
    return db.query(Reservation).filter(Reservation.id == reservation_id).first()

def update_reservation_status(db: Session, reservation: Reservation, status: str):
    reservation.status = status
    db.commit()
    db.refresh(reservation)
    return reservation

def get_expired_active_reservations(db: Session, now: datetime):
    return (
        db.query(Reservation)
        .filter(
            Reservation.status == "ACTIVE",
            Reservation.expires_at < now
        )
        .all()
    )

