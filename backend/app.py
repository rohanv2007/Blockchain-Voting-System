"""
Main FastAPI Application — Blockchain Voting System with Face Verification.
Initializes database, blockchain connection, and mounts all route modules.
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ─── Lifespan (startup/shutdown) ─────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup, cleanup on shutdown."""
    print("=" * 50)
    print("[VOTING] Blockchain Voting System - Starting Up")
    print("=" * 50)

    # Initialize database
    from database import init_db
    init_db()

    # Initialize blockchain connection
    try:
        import blockchain_service as bc
        bc.init_blockchain()

        # Sync account index with existing voter count
        from database import SessionLocal
        from models import Voter
        session = SessionLocal()
        voter_count = session.query(Voter).count()
        bc.sync_account_index(voter_count)
        session.close()
        print(f"   Registered voters: {voter_count}")
    except Exception as e:
        print(f"[WARNING] Blockchain initialization warning: {e}")
        print("   The app will start, but blockchain features won't work until Ganache is running")
        print("   and CONTRACT_ADDRESS is set in .env")

    print("=" * 50)
    print("[READY] Server is ready!")
    print("   API docs: http://localhost:8000/docs")
    print("=" * 50)

    yield  # App is running

    print("\n[STOP] Shutting down...")


# ─── App Instance ────────────────────────────────────────────────────

app = FastAPI(
    title="Blockchain Voting System",
    description="A tamper-proof digital voting system with face verification, powered by Ethereum blockchain",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS Middleware ─────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (Candidate Images) ─────────────────────────────────

CANDIDATE_IMAGES_DIR = Path(__file__).parent / "candidate_images"
CANDIDATE_IMAGES_DIR.mkdir(exist_ok=True)

# ─── Register Routes ─────────────────────────────────────────────────

from routes.admin_routes import router as admin_router
from routes.voter_routes import router as voter_router
from routes.results_routes import router as results_router

app.include_router(admin_router)
app.include_router(voter_router)
app.include_router(results_router)


# ─── Health Check ─────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """API health check endpoint."""
    import blockchain_service as bc
    from web3 import Web3

    blockchain_connected = False
    try:
        blockchain_connected = bc.w3.is_connected()
    except Exception:
        pass

    return {
        "status": "healthy",
        "blockchain_connected": blockchain_connected,
        "ganache_url": os.getenv("GANACHE_URL", "http://127.0.0.1:7545"),
        "contract_address": os.getenv("CONTRACT_ADDRESS", "Not set"),
    }


# ─── Run with Uvicorn ────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
