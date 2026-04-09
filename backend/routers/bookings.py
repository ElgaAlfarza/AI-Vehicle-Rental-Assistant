from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import SessionLocal, Booking, Vehicle

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

class PaymentUpdate(BaseModel):
    payment_status: str

@router.get("/")
def get_bookings(user_id: Optional[int] = None):
    db = SessionLocal()
    try:
        query = db.query(Booking, Vehicle).join(Vehicle, Booking.vehicle_id == Vehicle.id)
        if user_id is not None:
            query = query.filter(Booking.user_id == user_id)
            
        results = query.order_by(Booking.id.desc()).all()
        
        return [
            {
                "id": b.id,
                "nama_penyewa": b.nama_penyewa,
                "vehicle_nama": v.nama,
                "vehicle_image": v.image_url,
                "harga_per_hari": v.harga_per_hari,
                "tanggal_mulai": b.tanggal_mulai.strftime("%Y-%m-%d"),
                "tanggal_selesai": b.tanggal_selesai.strftime("%Y-%m-%d"),
                "durasi_hari": (b.tanggal_selesai - b.tanggal_mulai).days,
                "total_harga": v.harga_per_hari * max((b.tanggal_selesai - b.tanggal_mulai).days, 1),
                "status_pesanan": b.status_pesanan,
                "payment_status": b.payment_status or "unpaid"
            }
            for (b, v) in results
        ]
    finally:
        db.close()

@router.put("/{booking_id}/payment")
def update_payment(booking_id: int, payload: PaymentUpdate):
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            booking.payment_status = payload.payment_status
            db.commit()
            return {"message": "Success"}
        return {"error": "Booking not found"}
    finally:
        db.close()
