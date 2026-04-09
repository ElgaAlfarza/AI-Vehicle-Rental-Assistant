import os
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Gunakan .env atau nilai default untuk testing
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/rental_mobil")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # "user" or "admin"

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    jenis = Column(String(50), nullable=False)
    harga_per_hari = Column(Integer, nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default='available')

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    
    # Optional FK since we're allowing AI creation which might lack rigid binding briefly, 
    # but we'll enforce it ideally.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    nama_penyewa = Column(String(100), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    tanggal_mulai = Column(Date, nullable=False)
    tanggal_selesai = Column(Date, nullable=False)
    status_pesanan = Column(String(20), default='pending')
    
    # New payment status feature
    payment_status = Column(String(20), default='unpaid')  # "unpaid", "paid", "refunded"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
