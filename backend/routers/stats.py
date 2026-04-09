from fastapi import APIRouter
from sqlalchemy import func
from database import SessionLocal, Booking, Vehicle

router = APIRouter(prefix="/api", tags=["stats"])

@router.get("/stats")
def get_dashboard_stats():
    db = SessionLocal()
    try:
        # 1. Total kendaraan
        total_vehicles = db.query(Vehicle).count()
        
        # 2. Total pendapatan: (durasi * vehicle.harga) buat booking yg sukses / confirmed / paid
        all_bookings = db.query(Booking, Vehicle).join(Vehicle, Booking.vehicle_id == Vehicle.id).all()
        
        total_revenue = 0
        active_reservations = 0
        recent_activity = []
        
        for b, v in all_bookings:
            durasi = (b.tanggal_selesai - b.tanggal_mulai).days
            durasi = max(durasi, 1)
            total_revenue += (durasi * v.harga_per_hari)
            
            # Hitung reservasi yg statusnya belum finish / baru
            if b.status_pesanan in ['pending', 'confirmed']:
                active_reservations += 1
                
        # 3. Ambil 5 booking terakhir
        last_5 = db.query(Booking, Vehicle).join(Vehicle).order_by(Booking.id.desc()).limit(5).all()
        for b, v in last_5:
            recent_activity.append({
                "message": f"{b.nama_penyewa} memesan {v.nama}",
                "time": b.tanggal_mulai.strftime("%Y-%m-%d"),
                "status": "success" if b.status_pesanan == 'confirmed' else "pending"
            })
            
        return {
            "totalRevenue": total_revenue,
            "activeReservations": active_reservations,
            "totalVehicles": total_vehicles,
            "recentActivity": recent_activity
        }
    finally:
        db.close()
