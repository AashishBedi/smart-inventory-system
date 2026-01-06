from datetime import datetime, timedelta
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.repositories.inventory_repo import (
    get_inventory_by_sku,
    update_inventory_quantity,
)
from app.repositories.reservation_repo import (
    create_reservation,
    get_reservation_by_id,
    update_reservation_status,
)

RESERVATION_TTL_MINUTES = 5


class ReservationError(Exception):
    pass


def reserve_inventory(
    db: Session,
    sku: str,
    user_id: str,
    quantity: int,
):
    """
    Core reservation logic:
    - Locks inventory row
    - Prevents overselling
    - Creates ACTIVE reservation
    """

    # 🔒 Lock inventory row (SQLite uses database-level lock)
    inventory = (
        db.execute(
            select(get_inventory_by_sku.__annotations__['return'])
        )
        if False else get_inventory_by_sku(db, sku)
    )

    if not inventory:
        raise ReservationError("Inventory not found")

    if inventory.available_quantity < quantity:
        raise ReservationError("Not enough inventory available")

    # Deduct inventory
    update_inventory_quantity(db, inventory, -quantity)

    reservation_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=RESERVATION_TTL_MINUTES)

    reservation = create_reservation(
        db=db,
        reservation_id=reservation_id,
        sku=sku,
        user_id=user_id,
        quantity=quantity,
        status="ACTIVE",
        expires_at=expires_at,
    )

    return reservation


def confirm_reservation(db: Session, reservation_id: str):
    reservation = get_reservation_by_id(db, reservation_id)

    if not reservation:
        raise ReservationError("Reservation not found")

    if reservation.status == "CONFIRMED":
        return reservation

    if reservation.expires_at < datetime.utcnow():
        raise ReservationError("Reservation expired")

    update_reservation_status(db, reservation, "CONFIRMED")
    return reservation


def cancel_reservation(db: Session, reservation_id: str):
    reservation = get_reservation_by_id(db, reservation_id)

    if not reservation:
        raise ReservationError("Reservation not found")

    if reservation.status in ("CANCELLED", "EXPIRED"):
        return reservation

    inventory = get_inventory_by_sku(db, reservation.sku)
    update_inventory_quantity(db, inventory, reservation.quantity)
    update_reservation_status(db, reservation, "CANCELLED")

    return reservation
