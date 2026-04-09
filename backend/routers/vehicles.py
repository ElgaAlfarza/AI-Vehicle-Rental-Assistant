from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import SessionLocal, Vehicle

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

class VehicleCreate(BaseModel):
    nama: str
    jenis: str
    harga_per_hari: int
    image_url: str

@router.get("/")
def get_vehicles():
    db = SessionLocal()
    try:
        vehicles = db.query(Vehicle).order_by(Vehicle.id.desc()).all()
        return [
            {
                "id": v.id,
                "nama": v.nama,
                "jenis": v.jenis,
                "harga_per_hari": v.harga_per_hari,
                "status": v.status,
                "image_url": v.image_url
            }
            for v in vehicles
        ]
    finally:
        db.close()

@router.post("/")
def add_vehicle(v: VehicleCreate):
    db = SessionLocal()
    try:
        new_v = Vehicle(
            nama=v.nama,
            jenis=v.jenis,
            harga_per_hari=v.harga_per_hari,
            image_url=v.image_url,
            status="available"
        )
        db.add(new_v)
        db.commit()
        db.refresh(new_v)
        return {"message": "Berhasil", "id": new_v.id}
    finally:
        db.close()
