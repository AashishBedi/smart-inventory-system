from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time
from app.models import idempotency

from app.models.database import engine
from app.models import models
from app.controllers.inventory import router as inventory_router
from app.controllers.checkout import router as checkout_router
from app.jobs.expire_reservations import expire_reservations

app = FastAPI(title="Smart Inventory Reservation System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB tables
models.Base.metadata.create_all(bind=engine)

# Routers
app.include_router(inventory_router)
app.include_router(checkout_router)


def expiry_worker():
    while True:
        expire_reservations()
        time.sleep(60)  # run every 60 seconds


@app.on_event("startup")
def start_expiry_job():
    thread = threading.Thread(target=expiry_worker, daemon=True)
    thread.start()
