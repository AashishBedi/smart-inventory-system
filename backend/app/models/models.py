from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    sku = Column(String, primary_key=True, index=True)
    total_quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, index=True)
    sku = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # ACTIVE, CONFIRMED, CANCELLED, EXPIRED
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
