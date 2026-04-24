"""
Results & Audit API Routes — Live results, audit trail, winner calculation.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import csv
import io
from fastapi.responses import StreamingResponse

import blockchain_service as bc

router = APIRouter(prefix="/api/results", tags=["Results"])


# ─── Live Results ─────────────────────────────────────────────────────

@router.get("/live")
async def get_live_results():
    """
    Get live election results from the blockchain.
    Returns all candidates with their current vote counts.
    """
    try:
        candidates = bc.get_results()
        election = bc.get_election_status()

        total_votes = sum(c["voteCount"] for c in candidates)

        # Calculate percentages
        for c in candidates:
            c["percentage"] = round(
                (c["voteCount"] / total_votes * 100) if total_votes > 0 else 0, 2
            )

        return {
            "candidates": candidates,
            "totalVotes": total_votes,
            "election": election,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch results: {str(e)}",
        )


# ─── Winner ──────────────────────────────────────────────────────────

@router.get("/winner")
async def get_winner():
    """
    Get the current leading candidate.
    """
    try:
        candidates = bc.get_results()
        if not candidates:
            return {"winner": None, "message": "No candidates found"}

        total_votes = sum(c["voteCount"] for c in candidates)
        if total_votes == 0:
            return {"winner": None, "message": "No votes have been cast yet"}

        winner = max(candidates, key=lambda c: c["voteCount"])
        winner["percentage"] = round(winner["voteCount"] / total_votes * 100, 2)

        # Check for tie
        max_votes = winner["voteCount"]
        tied = [c for c in candidates if c["voteCount"] == max_votes]

        election = bc.get_election_status()

        return {
            "winner": winner,
            "is_tie": len(tied) > 1,
            "tied_candidates": tied if len(tied) > 1 else [],
            "totalVotes": total_votes,
            "election_active": election["isActive"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to determine winner: {str(e)}",
        )


# ─── Audit Trail ─────────────────────────────────────────────────────

@router.get("/audit")
async def get_audit_trail(candidate_id: Optional[int] = Query(None)):
    """
    Get the complete audit trail of all votes from blockchain events.
    Optionally filter by candidate ID.
    """
    try:
        events = bc.get_vote_events()

        # Get candidate names for display
        candidates = bc.get_results()
        candidate_map = {c["id"]: c["name"] for c in candidates}

        audit = []
        for event in events:
            entry = {
                "tx_hash": event["tx_hash"],
                "voter_address": event["voter_address"],
                "candidate_id": event["candidate_id"],
                "candidate_name": candidate_map.get(event["candidate_id"], "Unknown"),
                "timestamp": event["timestamp"],
                "block_number": event["block_number"],
                "block_timestamp": event["block_timestamp"],
            }

            # Apply candidate filter if specified
            if candidate_id is not None and event["candidate_id"] != candidate_id:
                continue

            audit.append(entry)

        return {
            "audit_trail": audit,
            "total_entries": len(audit),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch audit trail: {str(e)}",
        )


# ─── Export CSV ──────────────────────────────────────────────────────

@router.get("/audit/export")
async def export_audit_csv():
    """Export the audit trail as a CSV file."""
    try:
        events = bc.get_vote_events()
        candidates = bc.get_results()
        candidate_map = {c["id"]: c["name"] for c in candidates}

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Transaction Hash",
            "Voter Address",
            "Candidate ID",
            "Candidate Name",
            "Timestamp",
            "Block Number",
        ])

        for event in events:
            writer.writerow([
                event["tx_hash"],
                event["voter_address"],
                event["candidate_id"],
                candidate_map.get(event["candidate_id"], "Unknown"),
                event["timestamp"],
                event["block_number"],
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=audit_trail.csv"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export audit trail: {str(e)}",
        )
