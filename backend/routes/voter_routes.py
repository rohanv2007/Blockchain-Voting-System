"""
Voter API Routes — Registration with face photo, face verification, vote casting.
"""
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models import Voter
import face_service
import blockchain_service as bc

router = APIRouter(prefix="/api/voter", tags=["Voter"])


# ─── Voter Registration ──────────────────────────────────────────────

@router.post("/register")
async def register_voter(
    full_name: str = Form(...),
    voter_id: str = Form(...),
    face_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Register a new voter with their face photo.
    - Extracts face embedding using DeepFace
    - Assigns an Ethereum address from Ganache
    - Stores voter info in the database
    """
    # Check if voter is already registered
    existing = db.query(Voter).filter(Voter.voter_id == voter_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Voter with ID '{voter_id}' is already registered",
        )

    # Read the face photo
    image_bytes = await face_photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image data received")

    # Process face and extract embedding
    face_result = face_service.register_face(voter_id, image_bytes)

    if not face_result["success"]:
        raise HTTPException(
            status_code=400,
            detail=face_result.get("error", "Face registration failed"),
        )

    # Assign an Ethereum address
    eth_address = bc.get_next_voter_address()

    # Save to database
    voter = Voter(
        voter_id=voter_id,
        full_name=full_name,
        ethereum_address=eth_address,
        has_voted=False,
        face_embedding_path=face_result["embedding_path"],
    )

    try:
        db.add(voter)
        db.commit()
        db.refresh(voter)
    except Exception as e:
        db.rollback()
        # Clean up the saved embedding on DB failure
        face_service.delete_face(voter_id)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save voter record: {str(e)}",
        )

    return {
        "message": "Registration successful! Your face has been enrolled.",
        "voter": {
            "voter_id": voter.voter_id,
            "full_name": voter.full_name,
            "ethereum_address": voter.ethereum_address,
            "registered_at": voter.registered_at.isoformat() if voter.registered_at else None,
        },
    }


# ─── Face Verification ───────────────────────────────────────────────

@router.post("/verify-face")
async def verify_face(
    voter_id: str = Form(...),
    face_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Verify a voter's identity using face recognition.
    Compares the live webcam photo with the stored face embedding.
    Returns match status, confidence score, and voter info if matched.
    """
    # Check if voter exists
    voter = db.query(Voter).filter(Voter.voter_id == voter_id).first()
    if not voter:
        raise HTTPException(
            status_code=404,
            detail=f"No voter found with ID '{voter_id}'. Please register first.",
        )

    # Check if voter has already voted
    if voter.has_voted:
        raise HTTPException(
            status_code=400,
            detail="You have already cast your vote. Each voter can only vote once.",
        )

    # Read the live photo
    image_bytes = await face_photo.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image data received")

    # Verify face
    result = face_service.verify_face(voter_id, image_bytes)

    if "error" in result and not result.get("matched", False):
        return {
            "matched": False,
            "confidence": result.get("confidence", 0.0),
            "error": result["error"],
        }

    response = {
        "matched": result["matched"],
        "confidence": result["confidence"],
        "distance": result.get("distance", 0),
        "threshold": result.get("threshold", 0),
    }

    if result["matched"]:
        response["voter"] = {
            "voter_id": voter.voter_id,
            "full_name": voter.full_name,
            "ethereum_address": voter.ethereum_address,
        }
        response["message"] = f"Identity verified! Welcome, {voter.full_name}."
    else:
        response["message"] = "Face verification failed. The face does not match our records."

    return response


# ─── Cast Vote ────────────────────────────────────────────────────────

@router.post("/cast-vote")
async def cast_vote(
    voter_id: str = Form(...),
    candidate_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """
    Cast a vote on the blockchain after face verification.
    Double-voting is prevented at both backend DB and smart contract levels.
    """
    # Get voter from database
    voter = db.query(Voter).filter(Voter.voter_id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    # Backend-level double-vote check
    if voter.has_voted:
        raise HTTPException(
            status_code=400,
            detail="You have already voted. Each voter can only vote once.",
        )

    # Blockchain-level double-vote check
    try:
        already_voted = bc.has_voted(voter.ethereum_address)
        if already_voted:
            # Sync backend DB
            voter.has_voted = True
            db.commit()
            raise HTTPException(
                status_code=400,
                detail="Vote already recorded on the blockchain.",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Blockchain check failed: {str(e)}",
        )

    # Cast the vote on the blockchain
    try:
        result = bc.cast_vote(candidate_id, voter.ethereum_address)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cast vote on blockchain: {str(e)}",
        )

    # Update voter record in database
    voter.has_voted = True
    voter.blockchain_tx_hash = result["tx_hash"]
    db.commit()

    return {
        "message": "Your vote has been cast successfully and recorded on the blockchain!",
        "tx_hash": result["tx_hash"],
        "block_number": result.get("block_number"),
        "voter_id": voter.voter_id,
        "candidate_id": candidate_id,
    }
