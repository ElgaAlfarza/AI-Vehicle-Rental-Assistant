-- Buat tabel vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jenis VARCHAR(50) NOT NULL,
    harga_per_hari INTEGER NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'available' -- 'available', 'booked'
);

-- Buat tabel bookings
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    nama_penyewa VARCHAR(100) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    status_pesanan VARCHAR(20) DEFAULT 'pending' -- 'pending', 'confirmed', 'completed'
);

-- Insert data dummy untuk kendaraan
INSERT INTO vehicles (nama, jenis, harga_per_hari, image_url, status) VALUES
('Toyota Avanza', 'MPV', 350000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600', 'available'),
('Mitsubishi Xpander', 'MPV', 400000, 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600', 'available'),
('Honda Brio', 'Hatchback', 250000, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600', 'available'),
('Toyota Innova Reborn', 'MPV', 600000, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=600', 'available'),
('Toyota Fortuner', 'SUV', 900000, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', 'available')
ON CONFLICT DO NOTHING;
