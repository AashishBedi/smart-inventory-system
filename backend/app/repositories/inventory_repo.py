from sqlalchemy.orm import Session
from app.models.models import Inventory

def get_inventory_by_sku(db: Session, sku: str):
    return db.query(Inventory).filter(Inventory.sku == sku).first()

def create_inventory(db: Session, sku: str, total_quantity: int):
    inventory = Inventory(
        sku=sku,
        total_quantity=total_quantity,
        available_quantity=total_quantity
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    return inventory

def update_inventory_quantity(db: Session, inventory: Inventory, delta: int):
    inventory.available_quantity += delta
    db.commit()
    db.refresh(inventory)
    return inventory
