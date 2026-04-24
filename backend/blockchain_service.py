"""
Blockchain Service — Web3.py interface to the Voting smart contract on Ganache.
"""
import json
import os
from pathlib import Path
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# ─── Configuration ──────────────────────────────────────────────────
GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
ADMIN_PRIVATE_KEY = os.getenv("ADMIN_WALLET_PRIVATE_KEY", "")

# ─── Web3 Connection ────────────────────────────────────────────────
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

# ─── Contract ABI ────────────────────────────────────────────────────
# This ABI is generated after running `truffle compile`.
# It matches the Voting.sol contract we wrote.
CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "candidateId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "party", "type": "string"}
        ],
        "name": "CandidateAdded",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "endTime", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "totalVotes", "type": "uint256"}
        ],
        "name": "ElectionEnded",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "startTime", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "endTime", "type": "uint256"}
        ],
        "name": "ElectionStarted",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "address", "name": "voter", "type": "address"},
            {"indexed": True, "internalType": "uint256", "name": "candidateId", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_party", "type": "string"},
            {"internalType": "string", "name": "_imageUrl", "type": "string"}
        ],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "candidatesCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "candidates",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "party", "type": "string"},
            {"internalType": "string", "name": "imageUrl", "type": "string"},
            {"internalType": "uint256", "name": "voteCount", "type": "uint256"},
            {"internalType": "bool", "name": "exists", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_candidateId", "type": "uint256"},
            {"internalType": "address", "name": "_voterAddress", "type": "address"}
        ],
        "name": "castVote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "election",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256", "name": "startTime", "type": "uint256"},
            {"internalType": "uint256", "name": "endTime", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endElection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "getCandidate",
        "outputs": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "party", "type": "string"},
            {"internalType": "string", "name": "imageUrl", "type": "string"},
            {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCandidatesCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getElectionStatus",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256", "name": "startTime", "type": "uint256"},
            {"internalType": "uint256", "name": "endTime", "type": "uint256"},
            {"internalType": "uint256", "name": "_totalVotes", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getResults",
        "outputs": [
            {"internalType": "uint256[]", "name": "ids", "type": "uint256[]"},
            {"internalType": "string[]", "name": "names", "type": "string[]"},
            {"internalType": "string[]", "name": "parties", "type": "string[]"},
            {"internalType": "string[]", "name": "imageUrls", "type": "string[]"},
            {"internalType": "uint256[]", "name": "voteCounts", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_voter", "type": "address"}],
        "name": "hasVoted",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalVotes",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "voters",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "uint256", "name": "_durationInMinutes", "type": "uint256"}
        ],
        "name": "startElection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# ─── Contract Instance ───────────────────────────────────────────────

contract = None
admin_account = None


def init_blockchain():
    """Initialize the blockchain service. Call on app startup."""
    global contract, admin_account

    if not w3.is_connected():
        raise ConnectionError(f"Cannot connect to Ganache at {GANACHE_URL}. Is it running?")

    print(f"[OK] Connected to Ganache at {GANACHE_URL}")
    print(f"   Block number: {w3.eth.block_number}")

    # Set up admin account from private key
    if ADMIN_PRIVATE_KEY:
        admin_account = w3.eth.account.from_key(ADMIN_PRIVATE_KEY)
        print(f"   Admin address: {admin_account.address}")
    else:
        # Fallback: use first Ganache account
        admin_account = None
        print(f"   Admin address (fallback): {w3.eth.accounts[0]}")

    # Load contract
    if CONTRACT_ADDRESS:
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=CONTRACT_ABI,
        )
        print(f"   Contract loaded: {CONTRACT_ADDRESS}")
    else:
        print("[WARN] CONTRACT_ADDRESS not set in .env - deploy the contract first!")


def get_admin_address():
    """Get the admin (owner) Ethereum address."""
    if admin_account:
        return admin_account.address
    return w3.eth.accounts[0]


def _send_transaction(func):
    """Build, sign, and send a transaction from the admin account."""
    addr = get_admin_address()
    tx = func.build_transaction({
        "from": addr,
        "nonce": w3.eth.get_transaction_count(addr),
        "gas": 3000000,
        "gasPrice": w3.eth.gas_price,
    })

    if admin_account:
        signed = w3.eth.account.sign_transaction(tx, ADMIN_PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    else:
        tx_hash = w3.eth.send_transaction(tx)

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    return receipt


# ─── Candidate Functions ─────────────────────────────────────────────

def add_candidate(name: str, party: str, image_url: str):
    """Add a candidate to the smart contract."""
    func = contract.functions.addCandidate(name, party, image_url)
    receipt = _send_transaction(func)
    candidate_count = contract.functions.getCandidatesCount().call()
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "candidate_id_on_chain": candidate_count,
        "status": "success",
    }


def get_candidates():
    """Get all candidates from the blockchain."""
    count = contract.functions.getCandidatesCount().call()
    candidates = []
    for i in range(1, count + 1):
        c = contract.functions.getCandidate(i).call()
        candidates.append({
            "id": c[0],
            "name": c[1],
            "party": c[2],
            "imageUrl": c[3],
            "voteCount": c[4],
        })
    return candidates


# ─── Election Functions ──────────────────────────────────────────────

def start_election(name: str, duration_minutes: int):
    """Start a new election."""
    func = contract.functions.startElection(name, duration_minutes)
    receipt = _send_transaction(func)
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success",
    }


def end_election():
    """End the current election."""
    func = contract.functions.endElection()
    receipt = _send_transaction(func)
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success",
    }


def get_election_status():
    """Get current election status from the blockchain."""
    result = contract.functions.getElectionStatus().call()
    return {
        "name": result[0],
        "isActive": result[1],
        "startTime": result[2],
        "endTime": result[3],
        "totalVotes": result[4],
    }


# ─── Voting Functions ────────────────────────────────────────────────

def cast_vote(candidate_id: int, voter_address: str):
    """Cast a vote on the blockchain."""
    voter_addr = Web3.to_checksum_address(voter_address)

    # Double-check at service level before sending tx
    already_voted = contract.functions.hasVoted(voter_addr).call()
    if already_voted:
        raise ValueError("This voter has already cast a vote on the blockchain")

    func = contract.functions.castVote(candidate_id, voter_addr)
    receipt = _send_transaction(func)
    return {
        "tx_hash": receipt.transactionHash.hex(),
        "status": "success",
        "block_number": receipt.blockNumber,
    }


def has_voted(voter_address: str) -> bool:
    """Check if a voter has already voted."""
    addr = Web3.to_checksum_address(voter_address)
    return contract.functions.hasVoted(addr).call()


# ─── Results Functions ────────────────────────────────────────────────

def get_results():
    """Get election results from the blockchain."""
    result = contract.functions.getResults().call()
    candidates = []
    for i in range(len(result[0])):
        candidates.append({
            "id": result[0][i],
            "name": result[1][i],
            "party": result[2][i],
            "imageUrl": result[3][i],
            "voteCount": result[4][i],
        })
    return candidates


def get_vote_events():
    """Get all VoteCast events from the blockchain for audit trail."""
    try:
        event_filter = contract.events.VoteCast.create_filter(from_block=0)
        events = event_filter.get_all_entries()
        audit_trail = []
        for event in events:
            block = w3.eth.get_block(event["blockNumber"])
            audit_trail.append({
                "tx_hash": event["transactionHash"].hex(),
                "voter_address": event["args"]["voter"],
                "candidate_id": event["args"]["candidateId"],
                "timestamp": event["args"]["timestamp"],
                "block_number": event["blockNumber"],
                "block_timestamp": block["timestamp"],
            })
        return audit_trail
    except Exception as e:
        print(f"Error fetching events: {e}")
        return []


# ─── Account Management ──────────────────────────────────────────────

_next_account_index = 1  # Account 0 is admin


def get_next_voter_address() -> str:
    """Assign the next available Ganache account to a new voter."""
    global _next_account_index
    accounts = w3.eth.accounts

    # Find the next unused account
    if _next_account_index >= len(accounts):
        # Generate a new random address if we run out of Ganache accounts
        import secrets
        private_key = "0x" + secrets.token_hex(32)
        acct = w3.eth.account.from_key(private_key)
        return acct.address

    addr = accounts[_next_account_index]
    _next_account_index += 1
    return addr


def sync_account_index(used_count: int):
    """Sync the account index based on how many voters are already registered."""
    global _next_account_index
    _next_account_index = max(_next_account_index, used_count + 1)
