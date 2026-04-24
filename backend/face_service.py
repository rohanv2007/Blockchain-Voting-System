"""
Face Verification Service using DeepFace with Facenet512 model.
Handles face registration (embedding extraction) and verification (cosine comparison).
"""
import os
import io
import numpy as np
from PIL import Image
from pathlib import Path

# ─── Configuration ──────────────────────────────────────────────────

FACES_DIR = Path(__file__).parent / "voter_faces"
FACES_DIR.mkdir(exist_ok=True)

MODEL_NAME = "Facenet512"
DISTANCE_METRIC = "cosine"
VERIFICATION_THRESHOLD = 0.40  # Cosine distance threshold (lower = stricter)

# Lazy-load DeepFace to speed up import
_deepface = None


def _get_deepface():
    """Lazy-load DeepFace library."""
    global _deepface
    if _deepface is None:
        from deepface import DeepFace
        _deepface = DeepFace
        print("[OK] DeepFace loaded with model:", MODEL_NAME)
    return _deepface


def _bytes_to_image_array(image_bytes: bytes) -> np.ndarray:
    """Convert image bytes to a numpy array (RGB)."""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    return np.array(image)


# ─── Face Registration ──────────────────────────────────────────────

def register_face(voter_id: str, image_bytes: bytes) -> dict:
    """
    Register a voter's face by extracting and saving the embedding.

    Args:
        voter_id: Unique voter identifier
        image_bytes: Raw image bytes of the voter's face photo

    Returns:
        dict with status, embedding_path, and any error message
    """
    try:
        DeepFace = _get_deepface()
        img_array = _bytes_to_image_array(image_bytes)

        # Extract face embedding
        embeddings = DeepFace.represent(
            img_path=img_array,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend="opencv",
        )

        if not embeddings or len(embeddings) == 0:
            return {
                "success": False,
                "error": "No face detected in the image. Please ensure your face is clearly visible.",
            }

        if len(embeddings) > 1:
            return {
                "success": False,
                "error": "Multiple faces detected. Please ensure only one face is in the frame.",
            }

        # Save the embedding as a numpy file
        embedding = np.array(embeddings[0]["embedding"])
        embedding_path = FACES_DIR / f"{voter_id}.npy"
        np.save(str(embedding_path), embedding)

        return {
            "success": True,
            "embedding_path": str(embedding_path),
            "embedding_size": len(embedding),
        }

    except ValueError as e:
        error_msg = str(e).lower()
        if "face" in error_msg and "detect" in error_msg:
            return {
                "success": False,
                "error": "No face could be detected. Please try again with better lighting and face the camera directly.",
            }
        return {"success": False, "error": f"Face processing error: {str(e)}"}

    except Exception as e:
        return {"success": False, "error": f"Registration failed: {str(e)}"}


# ─── Face Verification ──────────────────────────────────────────────

def verify_face(voter_id: str, live_image_bytes: bytes) -> dict:
    """
    Verify a voter's identity by comparing a live photo with the stored embedding.

    Args:
        voter_id: Unique voter identifier
        live_image_bytes: Raw image bytes from the webcam

    Returns:
        dict with matched (bool), confidence (float), distance, threshold
    """
    try:
        DeepFace = _get_deepface()

        # Check if the voter has a stored embedding
        embedding_path = FACES_DIR / f"{voter_id}.npy"
        if not embedding_path.exists():
            return {
                "matched": False,
                "error": f"No registered face found for voter ID: {voter_id}",
                "confidence": 0.0,
            }

        # Load stored embedding
        stored_embedding = np.load(str(embedding_path))

        # Extract embedding from live image
        live_img_array = _bytes_to_image_array(live_image_bytes)

        live_embeddings = DeepFace.represent(
            img_path=live_img_array,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend="opencv",
        )

        if not live_embeddings or len(live_embeddings) == 0:
            return {
                "matched": False,
                "error": "No face detected in the live image. Please face the camera directly.",
                "confidence": 0.0,
            }

        live_embedding = np.array(live_embeddings[0]["embedding"])

        # Calculate cosine distance
        cosine_distance = _cosine_distance(stored_embedding, live_embedding)

        # Convert distance to confidence percentage
        # Cosine distance ranges from 0 (identical) to 2 (opposite)
        # We map 0 → 100% and threshold → 0%
        confidence = max(0.0, (1.0 - cosine_distance)) * 100.0
        matched = cosine_distance < VERIFICATION_THRESHOLD

        return {
            "matched": matched,
            "confidence": round(confidence, 2),
            "distance": round(cosine_distance, 4),
            "threshold": VERIFICATION_THRESHOLD,
        }

    except ValueError as e:
        error_msg = str(e).lower()
        if "face" in error_msg:
            return {
                "matched": False,
                "error": "Could not detect a face. Ensure good lighting and face the camera.",
                "confidence": 0.0,
            }
        return {"matched": False, "error": str(e), "confidence": 0.0}

    except Exception as e:
        return {"matched": False, "error": f"Verification error: {str(e)}", "confidence": 0.0}


def _cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine distance between two vectors."""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 1.0

    cosine_similarity = dot_product / (norm_a * norm_b)
    return 1.0 - cosine_similarity


# ─── Utility Functions ───────────────────────────────────────────────

def has_registered_face(voter_id: str) -> bool:
    """Check if a voter has a registered face embedding."""
    return (FACES_DIR / f"{voter_id}.npy").exists()


def delete_face(voter_id: str) -> bool:
    """Delete a voter's face embedding file."""
    path = FACES_DIR / f"{voter_id}.npy"
    if path.exists():
        path.unlink()
        return True
    return False
