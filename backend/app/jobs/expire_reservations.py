from datetime import datetime
from app.models.database import SessionLocal
from app.repositories.reservation_repo import (
    get_expired_active_reservations,
    update_reservation_status,
)
from app.repositories.inventory_repo import (
    get_inventory_by_sku,
    update_inventory_quantity,
)


def expire_reservations():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        expired_reservations = get_expired_active_reservations(db, now)

        for reservation in expired_reservations:
            inventory = get_inventory_by_sku(db, reservation.sku)

            if inventory:
                update_inventory_quantity(
                    db,
                    inventory,
                    reservation.quantity
                )

            update_reservation_status(
                db,
                reservation,
                "EXPIRED"
            )
    finally:
        db.close()
