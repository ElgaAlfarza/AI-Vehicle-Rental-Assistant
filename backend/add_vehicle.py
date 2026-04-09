import os
from database import SessionLocal, Vehicle

def create_vehicle():
    print("=== Tambah Kendaraan Baru ke Database ===\n")
    
    nama = input("Nama Kendaraan (contoh: 'Honda CR-V'): ")
    jenis = input("Jenis Kendaraan (contoh: 'SUV', 'Hatchback'): ")
    
    while True:
        try:
            harga = int(input("Harga per Hari (contoh: 350000): "))
            break
        except ValueError:
            print("Harap masukkan angka yang valid!")
            
    image_url = input("URL Gambar (Opsional, tekan Enter untuk lewati): ")
    
    db = SessionLocal()
    try:
        new_vehicle = Vehicle(
            nama=nama,
            jenis=jenis,
            harga_per_hari=harga,
            image_url=image_url if image_url.strip() else None,
            status="available"
        )
        
        db.add(new_vehicle)
        db.commit()
        print(f"\n✅ Berhasil! '{nama}' telah ditambahkan ke database.")
        print("Silakan refresh halaman Inventory Anda untuk melihatnya.")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Gagal menambahkan kendaraan: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_vehicle()
