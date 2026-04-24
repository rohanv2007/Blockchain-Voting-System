# 🗳️ Blockchain-Based Voting System with Face Verification

A tamper-proof digital voting system powered by **Ethereum blockchain** and **AI-based face verification**. Built with Solidity, FastAPI, React, and DeepFace.

![Tech Stack](https://img.shields.io/badge/Solidity-^0.8.21-363636?logo=solidity)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Ethereum](https://img.shields.io/badge/Ethereum-Ganache-3C3C3D?logo=ethereum)

---

## 📋 Features

- ✅ **Blockchain-backed voting** — Every vote is immutably stored on Ethereum
- ✅ **Face verification** — DeepFace + Facenet512 biometric identity check
- ✅ **Double-vote prevention** — Enforced at both smart contract AND backend levels
- ✅ **Admin dashboard** — Manage candidates, control elections, monitor voters
- ✅ **Real-time results** — Live charts with auto-refresh every 10 seconds
- ✅ **Blockchain audit trail** — View every transaction with timestamps
- ✅ **CSV export** — Export audit trail data
- ✅ **JWT authentication** — Secure admin access
- ✅ **Dark theme UI** — Modern, premium design with glassmorphism

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  FastAPI Backend  │────▶│   Ganache (ETH) │
│   (Vite + TW)   │◀────│  (Python 3.10+)  │◀────│   Blockchain    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                         ┌────┴────┐
                         │ DeepFace │
                         │ SQLite   │
                         └─────────┘
```

---

## 📦 Prerequisites

Ensure you have the following installed:

| Tool       | Version  | Install Command / Link                     |
|------------|----------|--------------------------------------------|
| **Node.js**    | 18+      | https://nodejs.org/                        |
| **Python**     | 3.10+    | https://python.org/                        |
| **Ganache**    | Latest   | `npm install -g ganache`                   |
| **Truffle**    | Latest   | `npm install -g truffle`                   |
| **Git**        | Latest   | https://git-scm.com/                       |
| **MetaMask**   | Latest   | Browser extension (optional, for admin)    |

---

## 🚀 Step-by-Step Setup

### Step 1: Clone / Navigate to the Project

```bash
cd voting-system
```

### Step 2: Start Ganache (Local Blockchain)

Open a **new terminal** and run:

```bash
ganache --port 7545 --accounts 20 --defaultBalanceEther 100 --deterministic
```

> ⚠️ Keep this terminal running! Ganache provides your local Ethereum blockchain.

You should see output with 20 accounts and their private keys. **Copy the private key of Account (0)** — you'll need it in Step 5.

### Step 3: Deploy Smart Contract

```bash
cd blockchain
npm install
truffle compile
truffle migrate --network development
```

After deployment, you'll see:
```
========================================
Voting Contract deployed successfully!
Contract Address: 0x.....  ← COPY THIS
Deployer (Admin): 0x.....
========================================
```

**Copy the Contract Address!**

### Step 4: Configure Backend

```bash
cd ../backend
```

Edit the `.env` file:

```env
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<paste contract address from Step 3>
ADMIN_WALLET_PRIVATE_KEY=<paste private key of Account 0 from Ganache>
ADMIN_PASSWORD=admin123
SECRET_KEY=blockchain-voting-jwt-secret-key-2026
DATABASE_URL=sqlite:///./voting.db
```

### Step 5: Install & Start Backend

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

> The first run will download the Facenet512 model (~95MB). Subsequent runs use cached model.

Backend API docs: **http://localhost:8000/docs**

### Step 6: Install & Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## 🎮 How to Use

### Admin Flow

1. Go to **http://localhost:5173/admin**
2. Login with password: `admin123`
3. **Add Candidates**: Enter name, party, and optionally upload a photo
4. **Start Election**: Enter election name and duration in minutes
5. Monitor registered voters in the Voters tab

### Voter Flow

1. Go to **http://localhost:5173/register**
2. Enter your **Full Name** and **Voter ID** (any unique string)
3. **Capture your face** using the webcam
4. Submit registration

5. Go to **http://localhost:5173/vote**
6. Enter your **Voter ID** from registration
7. **Scan your face** — the system compares it with your registered photo
8. If verified ✅, select a candidate and **Cast Your Vote**
9. You'll see the **blockchain transaction hash** as confirmation

### View Results

1. Go to **http://localhost:5173/results**
2. See **live bar and pie charts** of vote distribution
3. Switch to **Audit Trail** tab to see all blockchain transactions
4. **Export** the audit trail as CSV

---

## 📁 Project Structure

```
voting-system/
├── blockchain/                 # Smart contract layer
│   ├── contracts/
│   │   ├── Voting.sol          # Main voting contract
│   │   └── Migrations.sol      # Truffle migrations contract
│   ├── migrations/
│   │   ├── 1_initial_migration.js
│   │   └── 2_deploy_voting.js
│   ├── test/
│   │   └── voting.test.js      # Contract unit tests
│   ├── truffle-config.js
│   └── package.json
│
├── backend/                    # FastAPI backend
│   ├── app.py                  # Main application
│   ├── database.py             # SQLAlchemy setup
│   ├── models.py               # DB models
│   ├── blockchain_service.py   # Web3.py blockchain interface
│   ├── face_service.py         # DeepFace face recognition
│   ├── routes/
│   │   ├── admin_routes.py     # Admin endpoints
│   │   ├── voter_routes.py     # Voter endpoints
│   │   └── results_routes.py   # Results & audit endpoints
│   ├── voter_faces/            # Face embeddings (auto-created)
│   ├── candidate_images/       # Candidate photos (auto-created)
│   ├── requirements.txt
│   └── .env
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/         # 8 React components
│   │   ├── pages/              # 5 page components
│   │   ├── context/            # Web3 context provider
│   │   ├── utils/              # API & Web3 utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml          # Optional Docker setup
└── README.md                   # This file
```

---

## 🧪 Running Tests

### Smart Contract Tests

```bash
cd blockchain
truffle test --network development
```

### Backend API Test (manual)

```bash
# Health check
curl http://localhost:8000/api/health

# Admin login
curl -X POST http://localhost:8000/api/admin/login -F "password=admin123"

# Get election status
curl http://localhost:8000/api/admin/election/status
```

---

## 🔧 Troubleshooting

### "Cannot connect to Ganache"
- Make sure Ganache is running: `ganache --port 7545`
- Check the GANACHE_URL in `.env` matches the port

### "CONTRACT_ADDRESS not set"
- Deploy the contract first: `cd blockchain && truffle migrate`
- Copy the contract address to `backend/.env`

### "No face detected"
- Ensure good lighting
- Face the camera directly
- Remove hats, masks, or sunglasses
- Make sure only one face is visible

### "Module not found" (Python)
- Activate your virtual environment: `venv\Scripts\activate`
- Run: `pip install -r requirements.txt`

### "CORS error" in browser
- Make sure the backend is running on port 8000
- Make sure the frontend is running on port 5173
- The Vite proxy handles `/api` → `localhost:8000`

### "Already voted" error
- Each voter ID can only vote once
- This is enforced at both the database AND blockchain level
- To reset for testing, delete `voting.db` and redeploy the contract

### "Ganache accounts exhausted"
- By default, Ganache provides 20 accounts
- For more: `ganache --port 7545 --accounts 50`

### DeepFace model download timeout
- First run downloads Facenet512 (~95MB)
- Ensure stable internet connection
- Model is cached at `~/.deepface/weights/`

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| Double-vote prevention | Smart contract `mapping(address => bool)` + SQLite `has_voted` flag |
| Admin authentication | JWT tokens with expiration |
| Face verification | Facenet512 model with cosine distance threshold |
| Vote immutability | Ethereum blockchain — transactions cannot be altered |
| Audit trail | All votes queryable via blockchain events |
| Identity binding | Each voter gets a unique Ethereum address |

---

## 📝 API Documentation

Once the backend is running, visit: **http://localhost:8000/docs**

This provides an interactive Swagger UI for all API endpoints.

---

## 🎓 Built For

Final Year College Project — Blockchain-Based Voting System with Face Verification

**Tech Stack:**
- Solidity + Truffle + Ganache (Blockchain)
- FastAPI + DeepFace + Web3.py (Backend)
- React + Vite + Tailwind CSS + Recharts (Frontend)
