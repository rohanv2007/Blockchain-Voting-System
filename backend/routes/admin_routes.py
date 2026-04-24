"""
Admin API Routes — JWT auth, candidate management, election control, voter listing.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pathlib import Path

from database import get_db
from models import Candidate, Voter
import blockchain_service as bc

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ─── Auth Configuration ─────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "your-jwt-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

security = HTTPBearer()

# Static files directory for candidate images
UPLOAD_DIR = Path(__file__).parent.parent / "backend" / "candidate_images"
# Fix path: we're already in backend
UPLOAD_DIR = Path(__file__).parent / "candidate_images"
UPLOAD_DIR.mkdir(exist_ok=True)


def create_access_token(data: dict) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and ensure admin access."""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


# ─── Login ───────────────────────────────────────────────────────────

@router.post("/login")
async def admin_login(password: str = Form(...)):
    """Admin login with password, returns JWT token."""
    if password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password",
        )

    token = create_access_token({"sub": "admin", "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful",
    }


# ─── Candidate Management ────────────────────────────────────────────

@router.post("/candidate")
async def add_candidate(
    name: str = Form(...),
    party: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token),
):
    """Add a new candidate to the blockchain and local database."""
    # Handle image upload
    image_url = ""
    if image and image.filename:
        # Save the image
        ext = Path(image.filename).suffix or ".jpg"
        safe_name = name.lower().replace(" ", "_")
        filename = f"{safe_name}{ext}"
        file_path = UPLOAD_DIR / filename
        content = await image.read()
        with open(file_path, "wb") as f:
            f.write(content)
        image_url = f"/api/admin/candidate-image/{filename}"

    try:
        # Add to blockchain
        result = bc.add_candidate(name, party, image_url)

        # Mirror in local DB
        candidate = Candidate(
            name=name,
            party=party,
            image_url=image_url,
            candidate_id_on_chain=result["candidate_id_on_chain"],
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return {
            "message": f"Candidate '{name}' added successfully",
            "candidate": candidate.to_dict(),
            "tx_hash": result["tx_hash"],
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add candidate: {str(e)}")


@router.get("/candidates")
async def get_candidates(db: Session = Depends(get_db)):
    """Get all candidates with their vote counts from blockchain."""
    try:
        # Get from blockchain for accurate vote counts
        blockchain_candidates = bc.get_candidates()
        return {"candidates": blockchain_candidates}
    except Exception as e:
        # Fallback to local DB if blockchain is unavailable
        candidates = db.query(Candidate).all()
        return {"candidates": [c.to_dict() for c in candidates]}


@router.get("/candidate-image/{filename}")
async def get_candidate_image(filename: str):
    """Serve candidate images."""
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(str(file_path))


# ─── Election Control ────────────────────────────────────────────────

@router.post("/election/start")
async def start_election(
    name: str = Form(...),
    duration: int = Form(...),
    admin: dict = Depends(verify_admin_token),
):
    """Start a new election with the given duration in minutes."""
    try:
        result = bc.start_election(name, duration)
        return {
            "message": f"Election '{name}' started for {duration} minutes",
            "tx_hash": result["tx_hash"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start election: {str(e)}")


@router.post("/election/end")
async def end_election(admin: dict = Depends(verify_admin_token)):
    """Manually end the current election."""
    try:
        result = bc.end_election()
        return {
            "message": "Election ended successfully",
            "tx_hash": result["tx_hash"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to end election: {str(e)}")


@router.get("/election/status")
async def get_election_status():
    """Get the current election status."""
    try:
        status = bc.get_election_status()
        return {"election": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


# ─── Voter Management ────────────────────────────────────────────────

@router.get("/voters")
async def list_voters(
    db: Session = Depends(get_db),
    admin: dict = Depends(verify_admin_token),
):
    """List all registered voters."""
    voters = db.query(Voter).all()
    return {"voters": [v.to_dict() for v in voters]}
