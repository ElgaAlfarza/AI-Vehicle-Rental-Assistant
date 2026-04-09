from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(500);"))
        print("✅ Kolom image_url berhasil ditambahkan.")
    except Exception as e:
        print("⚠️ Kolom mungkin sudah ada:", e)
        
    images = [
        ("Toyota Avanza", "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"),
        ("Mitsubishi Xpander", "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600"),
        ("Honda Brio", "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600"),
        ("Toyota Innova Reborn", "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=600"),
        ("Toyota Fortuner", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600")
    ]
    for nama, url in images:
        conn.execute(text("UPDATE vehicles SET image_url = :url WHERE nama = :nama"), {"url": url, "nama": nama})
    
    print("✅ Image URL untuk semua kendaraan berhasil diupdate.")
