import json
from mcp.server.fastmcp import FastMCP
from database import SessionLocal, Vehicle

from sqlalchemy import or_

# Initialize FastMCP Server A
mcp = FastMCP("Rental_Read_Server")

@mcp.tool()
def get_available_vehicles(search: str = None) -> str:
    """Mencari mobil yang berstatus available dari database. filter berdasarkan nama atau jenis mobil."""
    db = SessionLocal()
    try:
        query = db.query(Vehicle).filter(Vehicle.status == "available")
        if search:
            query = query.filter(or_(Vehicle.nama.ilike(f"%{search}%"), Vehicle.jenis.ilike(f"%{search}%")))
        
        vehicles = query.all()
        if not vehicles:
            return json.dumps({"message": f"Tidak ada mobil {'dengan nama ' + search + ' '}yang tersedia saat ini.", "data": []})
        
        # Buat teks ringkasan untuk LLM
        text_summary = "Daftar Mobil yang Tersedia:\n"
        vehicle_list = []
        for v in vehicles:
            text_summary += f"- [ID: {v.id}] {v.nama} ({v.jenis}) - Harga: Rp {v.harga_per_hari:,}/hari\n"
            vehicle_list.append({
                "id": v.id,
                "nama": v.nama,
                "jenis": v.jenis,
                "harga_per_hari": v.harga_per_hari,
                "image_url": v.image_url or "",
                "status": v.status
            })
        
        return json.dumps({"message": text_summary, "data": vehicle_list})
    except Exception as e:
        return json.dumps({"message": f"Database Error: {str(e)}", "data": []})
    finally:
        db.close()

if __name__ == "__main__":
    # Menjalankan MCP server melalui mode standard i/o
    mcp.run()
