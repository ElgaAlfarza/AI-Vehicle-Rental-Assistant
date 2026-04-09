import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/rental_mobil")

def run_migration():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        with conn.begin():
            # Create users table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(200) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user' NOT NULL
                )
            """))
            print("Users table created.")
            
            # Insert default Admin and User
            # We use simple hash representations for demo (in prod use bcrypt)
            conn.execute(text("""
                INSERT INTO users (username, password_hash, role) 
                VALUES ('admin', 'admin', 'admin'), ('user', 'user', 'user')
                ON CONFLICT (username) DO NOTHING
            """))
            print("Default admin and user created.")

            # Alter bookings table to add user_id (nullable for now) and payment_status
            try:
                conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
                conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'"))
                print("Bookings table altered successfully.")
            except Exception as e:
                print("Note on altering bookings:", e)

if __name__ == "__main__":
    run_migration()
