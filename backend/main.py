import os
import asyncio
import json
from contextlib import asynccontextmanager, AsyncExitStack
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from openai import OpenAI

from mcp import StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.session import ClientSession

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Inisialisasi OpenAI Client untuk OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
) if OPENROUTER_API_KEY else None

mcp_sessions = {
    "read": None,
    "write": None
}
mcp_stacks = {}

async def init_mcp_server(name: str, script_name: str):
    """Menghubungkan ke subprocess MCP Server"""
    server_params = StdioServerParameters(command="python", args=[script_name])
    stack = AsyncExitStack()
    mcp_stacks[name] = stack
    
    process_read, process_write = await stack.enter_async_context(stdio_client(server_params))
    session = await stack.enter_async_context(ClientSession(process_read, process_write))
    await session.initialize()
    
    mcp_sessions[name] = session
    print(f"✅ [{name.upper()}] MCP Server '{script_name}' berhasil terhubung.")

from database import SessionLocal, engine, Base
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-migration
    try:
        # Create all tables first
        Base.metadata.create_all(bind=engine)
        
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid'"))
            conn.execute(text("""
                INSERT INTO users (username, password_hash, role) 
                VALUES ('admin', 'admin', 'admin'), ('user', 'user', 'user')
                ON CONFLICT (username) DO NOTHING
            """))
            print("Migration completed.")
    except Exception as e:
        print("Migration failed (might already exist):", e)
        
    try:
        if os.path.exists("mcp_read.py") and os.path.exists("mcp_write.py"):
            await init_mcp_server("read", "mcp_read.py")
            await init_mcp_server("write", "mcp_write.py")
        else:
            print("⚠️ File mcp_read.py atau mcp_write.py tidak ditemukan!")
    except Exception as e:
        print("❌ Gagal menginisiasi server MCP:", e)
    
    yield
    for stack in mcp_stacks.values():
        await stack.aclose()

app = FastAPI(lifespan=lifespan, title="Rental Mobil OpenAI Orchestrator")

# Konfigurasi CORS Web React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: int = None

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not client:
        return {"reply": "OPENROUTER_API_KEY tidak ditemukan di file .env. Pastikan Anda telah memasukkannya.", "action": None}

    # 1. Definisi Format JSON Tools OpenAI
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_available_vehicles",
                "description": "Mencari status ketersediaan mobil, jenis/tipe mobil, beserta harga sewanya dari database PostgreSQL. Tool ini WAJIB dijalankan jika user menanyakan apapun tentang ketersediaan mobil.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "search": {"type": "string", "description": "Kata kunci spesifik (misalnya 'SUV', 'Avanza', 'BMW') untuk mem-filter hasil yang akan dimunculkan ke user. Wajib diisi jika user secara eksplisit menanyakan satu jenis/nama mobil tersebut agar UI tidak menampilkan semua mobil yang tidak relevan."}
                    },
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "create_booking",
                "description": "Membuat pemesanan rental mobil jika pengguna sudah deal dengan mobilnya. Harus disertai data komplit.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "nama_penyewa": {"type": "string"},
                        "nama_mobil": {"type": "string"},
                        "tanggal_mulai": {"type": "string", "description": "Format: YYYY-MM-DD"},
                        "durasi_hari": {"type": "integer"}
                    },
                    "required": ["nama_penyewa", "nama_mobil", "tanggal_mulai", "durasi_hari"]
                }
            }
        }
    ]

    messages = [
        {"role": "system", "content": "Anda adalah AI customer service Rental Mobil Tropical Tech. Jika user menanyakan ketersediaan mobil (baik secara umum maupun spesifik misal 'mobil murah', 'SUV', dll), Anda WAJIB memanggil function get_available_vehicles terlebih dahulu. Setelah mendapatkan balasan Function dari database berisi rentetan teks mobil yang tersedia, Anda memilah isinya di otak Anda, menyaring jenis atau harganya, lalu menjawab pengguna dengan list/kalimat spesifik secara ramah."},
        {"role": "user", "content": req.message}
    ]

    # 2. Chat ke OpenAI
    try:
        response = client.chat.completions.create(
            model="nvidia/nemotron-3-super-120b-a12b:free",
            messages=messages,
            tools=tools,
            tool_choice="auto"  # Biarkan AI menentukan apakah perlu call function
        )
    except Exception as e:
        error_msg = f"OpenAI Request Error: {str(e)}"
        print(error_msg)
        return {"reply": error_msg, "action": None}

    response_message = response.choices[0].message

    # 3. Apakah GPT ingin memanggil function tool?
    if response_message.tool_calls:
        # Masukkan rekam jejak function call aslinya dari Assistant (Wajib standar OpenAI)
        messages.append(response_message)
        
        tool_call = response_message.tool_calls[0]
        tool_name = tool_call.function.name
        try:
            args = json.loads(tool_call.function.arguments)
        except:
            args = {}

        # 4. Mengeksekusi MCP Client lokal ke PostgreSQL
        tool_result = ""
        vehicles_data = []
        try:
            if tool_name == "get_available_vehicles" and mcp_sessions["read"]:
                mcp_resp = await mcp_sessions["read"].call_tool("get_available_vehicles", arguments=args)
                raw_result = mcp_resp.content[0].text
                # Parse JSON dari MCP Read
                try:
                    parsed = json.loads(raw_result)
                    tool_result = parsed.get("message", raw_result)
                    vehicles_data = parsed.get("data", [])
                except json.JSONDecodeError:
                    tool_result = raw_result
            elif tool_name == "create_booking" and mcp_sessions["write"]:
                if req.user_id:
                    args['user_id'] = req.user_id
                mcp_resp = await mcp_sessions["write"].call_tool("create_booking", arguments=args)
                tool_result = mcp_resp.content[0].text
            else:
                tool_result = "Error: System Tool is missing!"
        except Exception as e:
            tool_result = f"Local Process Failed: {str(e)}"

        # 5. Kita kirim balik hasilnya ke OpenAI dalam bentuk 'tool' role
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": tool_name,
            "content": str(tool_result),
        })
        
        # 6. Kirim ke GPT lagi agar diubah jadi kalimat natural ramah (Summarization)
        try:
            final_response = client.chat.completions.create(
                model="nvidia/nemotron-3-super-120b-a12b:free",
                messages=messages
            )
            return {"reply": final_response.choices[0].message.content, "action": tool_name, "vehicles": vehicles_data}
        except Exception as e:
            error_str = str(e)
            print("Chat Result Parsing Exception:", error_str)
            return {
                "reply": f"Fungsi `{tool_name}` sukses berjalan di Server Lokal Anda. Tetapi OpenAI gagal membalas pesannya. Detail Error: {error_str}\n\nRespon DB Murni:\n{tool_result}", 
                "action": tool_name,
                "vehicles": vehicles_data
            }

    # Bebas dari pemanggilan tool
    return {"reply": response_message.content, "action": None}

# ============================================================
# REST API — Includes routers for separated endpoints
# ============================================================
from routers import vehicles, bookings, stats

app.include_router(vehicles.router)
app.include_router(bookings.router)
app.include_router(stats.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
