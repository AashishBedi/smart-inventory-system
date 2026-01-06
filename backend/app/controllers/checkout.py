from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.repositories.db import get_db
from app.services.reservation_service import (
    confirm_reservation,
    cancel_reservation,
    ReservationError
)

router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("/confirm")
def confirm(reservation_id: str, db: Session = Depends(get_db)):
    try:
        reservation = confirm_reservation(db, reservation_id)
        return {
            "reservation_id": reservation.id,
            "status": reservation.status
        }
    except ReservationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cancel")
def cancel(reservation_id: str, db: Session = Depends(get_db)):
    try:
        reservation = cancel_reservation(db, reservation_id)
        return {
            "reservation_id": reservation.id,
            "status": reservation.status
        }
    except ReservationError as e:
        raise HTTPException(status_code=400, detail=str(e))
