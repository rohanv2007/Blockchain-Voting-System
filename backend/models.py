"""
SQLAlchemy database models for the Voting System.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class Voter(Base):
    """Voter registration records."""
    __tablename__ = "voters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    voter_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    ethereum_address = Column(String(42), unique=True, nullable=False)
    has_voted = Column(Boolean, default=False, nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    face_embedding_path = Column(String(500), nullable=False)
    blockchain_tx_hash = Column(String(66), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "voter_id": self.voter_id,
            "full_name": self.full_name,
            "ethereum_address": self.ethereum_address,
            "has_voted": self.has_voted,
            "registered_at": self.registered_at.isoformat() if self.registered_at else None,
            "blockchain_tx_hash": self.blockchain_tx_hash,
        }


class Candidate(Base):
    """Local mirror of blockchain candidates for quick queries."""
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    party = Column(String(200), nullable=False)
    image_url = Column(String(500), nullable=True)
    candidate_id_on_chain = Column(Integer, unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "party": self.party,
            "image_url": self.image_url,
            "candidate_id_on_chain": self.candidate_id_on_chain,
        }
