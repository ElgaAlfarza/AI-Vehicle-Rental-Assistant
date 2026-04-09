from mcp.server.fastmcp import FastMCP
from database import SessionLocal, Vehicle, Booking
from datetime import datetime, timedelta
import json

# Initialize FastMCP Server B
mcp = FastMCP("Rental_Write_Server")

@mcp.tool()
def create_booking(nama_penyewa: str, nama_mobil: str, tanggal_mulai: str, durasi_hari: int, user_id: int = None) -> str:
    """
    Membuat reservasi baru.
    - nama_penyewa: Nama penyewa
    - nama_mobil: Nama mobil yang ingin disewa (harus mirip dengan yang ada di DB)
    - tanggal_mulai: Format YYYY-MM-DD
    - durasi_hari: Berapa hari ingin menyewa
    - user_id: (Opsional) ID pengguna yang memesan
    """
    db = SessionLocal()
    try:
        # Cari mobil berdasarkan nama
        vehicle = db.query(Vehicle).filter(Vehicle.nama.ilike(f"%{nama_mobil}%"), Vehicle.status == 'available').first()
        
        if not vehicle:
            return json.dumps({"status": "error", "message": f"Mobil '{nama_mobil}' tidak ditemukan atau sedang tidak tersedia."})
        
        start_date = datetime.strptime(tanggal_mulai, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=durasi_hari)
        
        new_booking = Booking(
            user_id=user_id,
            nama_penyewa=nama_penyewa,
            vehicle_id=vehicle.id,
            tanggal_mulai=start_date,
            tanggal_selesai=end_date,
            status_pesanan='pending',
            payment_status='unpaid'
        )

        
        # Ubah status mobil menjadi booked
        vehicle.status = "booked"
        
        db.add(new_booking)
        db.commit()
        
        return f"Berhasil! Pemesanan atas nama {nama_penyewa} untuk mobil {vehicle.nama} telah dicatat. Sewa dari {tanggal_mulai} sampai {tanggal_selesai}."
    except ValueError:
        return "Gagal: Format tanggal salah. Gunakan format YYYY-MM-DD."
    except Exception as e:
        db.rollback()
        return f"Error sistem: {str(e)}"
    finally:
        db.close()

if __name__ == "__main__":
    mcp.run()
