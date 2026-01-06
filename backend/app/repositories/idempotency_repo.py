from sqlalchemy.orm import Session
from app.models.idempotency import IdempotencyKey

def get_idempotency_key(db: Session, key: str):
    return db.query(IdempotencyKey).filter(IdempotencyKey.key == key).first()

def save_idempotency_key(db: Session, key: str, response: str):
    record = IdempotencyKey(key=key, response=response)
    db.add(record)
    db.commit()
    return record
