import json
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.repositories.db import get_db
from app.repositories.inventory_repo import get_inventory_by_sku
from app.repositories.idempotency_repo import (
    get_idempotency_key,
    save_idempotency_key
)
from app.services.reservation_service import reserve_inventory, ReservationError

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/reserve")
def reserve(
    sku: str,
    user_id: str,
    quantity: int,
    idempotency_key: str = Header(...),
    db: Session = Depends(get_db)
):
    existing = get_idempotency_key(db, idempotency_key)

    if existing:
        return json.loads(existing.response)

    try:
        reservation = reserve_inventory(db, sku, user_id, quantity)

        response = {
            "reservation_id": reservation.id,
            "expires_at": reservation.expires_at.isoformat()
        }

        save_idempotency_key(db, idempotency_key, json.dumps(response))
        return response

    except ReservationError as e:
        raise HTTPException(status_code=409, detail=str(e))
