import React, { useState, useEffect } from 'react';
import {
  ScanFace,
  IdCard,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Vote,
  AlertCircle,
  Blocks,
  PartyPopper,
} from 'lucide-react';
import WebcamCapture, { base64ToBlob } from './WebcamCapture';
import CandidateCard from './CandidateCard';
import { verifyFace, castVote, getCandidates } from '../utils/api';
import { shortenTxHash } from '../utils/web3Utils';

const STEPS = ['Enter Voter ID', 'Face Verification', 'Cast Your Vote'];

function VotingBooth() {
  const [currentStep, setCurrentStep] = useState(0);
  const [voterId, setVoterId] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [voteResult, setVoteResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('Failed to fetch candidates');
    }
  };

  // ─── Step 1: Voter ID ────────────────────────────────────────────

  const handleVoterIdSubmit = (e) => {
    e.preventDefault();
    if (!voterId.trim()) return;
    setError('');
    setCurrentStep(1);
  };

  // ─── Step 2: Face Verification ────────────────────────────────────

  const handleScanFace = async () => {
    if (!capturedImage) return;

    setScanning(true);
    setError('');
    setVerificationResult(null);

    try {
      const blob = base64ToBlob(capturedImage);
      const result = await verifyFace(voterId, blob);
      setVerificationResult(result);

      if (result.matched) {
        // Auto-advance after a brief delay
        setTimeout(() => setCurrentStep(2), 1500);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Verification failed';
      setError(detail);
      setVerificationResult({ matched: false, confidence: 0, error: detail });
    } finally {
      setScanning(false);
    }
  };

  // ─── Step 3: Cast Vote ────────────────────────────────────────────

  const handleCastVote = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');

    try {
      const result = await castVote(voterId, selectedCandidate);
      setVoteResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  // ─── Vote Success Screen ─────────────────────────────────────────

  if (voteResult) {
    return (
      <div className="max-w-lg mx-auto text-center animate-scale-in">
        <div className="glass-card p-10">
          <div className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
            <PartyPopper className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-dark-100 mb-3">
            Vote Cast Successfully!
          </h2>
          <p className="text-dark-400 mb-6">
            Your vote has been permanently recorded on the blockchain.
            It cannot be altered or deleted.
          </p>
          <div className="bg-dark-900/60 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-dark-500 text-sm">Transaction Hash</span>
              <span className="text-primary-400 text-sm font-mono">{shortenTxHash(voteResult.tx_hash)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-500 text-sm">Block Number</span>
              <span className="text-dark-200 text-sm font-mono">{voteResult.block_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-500 text-sm">Voter ID</span>
              <span className="text-dark-200 text-sm font-mono">{voteResult.voter_id}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm mb-6">
            <Blocks className="w-4 h-4" />
            Your vote is immutably stored on the Ethereum blockchain
          </div>
          <a href="/results" className="gradient-btn inline-flex items-center gap-2">
            View Live Results
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  idx < currentStep
                    ? 'bg-emerald-500 text-white'
                    : idx === currentStep
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-dark-700 text-dark-500'
                }`}
              >
                {idx < currentStep ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 ${
                idx <= currentStep ? 'text-dark-300' : 'text-dark-600'
              }`}>
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-18px] ${
                idx < currentStep ? 'bg-emerald-500' : 'bg-dark-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-card p-8">
        {/* ─── Step 1: Enter Voter ID ──────────────────────────── */}
        {currentStep === 0 && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IdCard className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-dark-100 mb-2">
                Enter Your Voter ID
              </h2>
              <p className="text-dark-400 text-sm">
                Enter the same ID you used during registration
              </p>
            </div>

            <form onSubmit={handleVoterIdSubmit} className="space-y-4">
              <input
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="input-field text-center text-lg tracking-wider"
                placeholder="Enter your voter ID"
                required
              />
              <button
                type="submit"
                disabled={!voterId.trim()}
                className="gradient-btn w-full flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ─── Step 2: Face Verification ───────────────────────── */}
        {currentStep === 1 && (
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ScanFace className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-dark-100 mb-2">
                Face Verification
              </h2>
              <p className="text-dark-400 text-sm">
                Look at the camera and scan your face to verify your identity
              </p>
            </div>

            {/* Scanning overlay */}
            {scanning && (
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                  <div className="loader mb-4" />
                  <p className="text-primary-400 font-medium">Scanning face...</p>
                  <p className="text-dark-500 text-sm mt-1">Comparing with registered data</p>
                </div>
              </div>
            )}

            {/* Verification result */}
            {verificationResult && !scanning && (
              <div className={`mb-6 p-4 rounded-xl border animate-scale-in ${
                verificationResult.matched
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {verificationResult.matched ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <span className={`font-semibold ${
                    verificationResult.matched ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {verificationResult.matched ? 'Identity Verified ✓' : 'Verification Failed ✗'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-dark-400">Confidence:</span>
                  <span className={`font-bold text-lg ${
                    verificationResult.matched ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {verificationResult.confidence?.toFixed(1)}%
                  </span>
                </div>
                {verificationResult.voter && (
                  <p className="text-dark-300 text-sm mt-2">
                    Welcome, <span className="font-medium text-dark-100">{verificationResult.voter.full_name}</span>
                  </p>
                )}
                {verificationResult.error && (
                  <p className="text-red-400 text-sm mt-2">{verificationResult.error}</p>
                )}
              </div>
            )}

            {!verificationResult?.matched && (
              <>
                <WebcamCapture
                  onCapture={(img) => setCapturedImage(img)}
                  capturedImage={capturedImage}
                  onRetake={() => { setCapturedImage(null); setVerificationResult(null); }}
                />

                {capturedImage && !scanning && (
                  <button
                    onClick={handleScanFace}
                    className="gradient-btn w-full flex items-center justify-center gap-2 mt-4"
                  >
                    <ScanFace className="w-5 h-5" />
                    Scan My Face
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => { setCurrentStep(0); setVerificationResult(null); setCapturedImage(null); }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-dark-500 hover:text-dark-300 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Voter ID
            </button>
          </div>
        )}

        {/* ─── Step 3: Cast Vote ───────────────────────────────── */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Vote className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-dark-100 mb-2">
                Select Your Candidate
              </h2>
              <p className="text-dark-400 text-sm">
                Choose one candidate and cast your vote. This action is irreversible.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm mb-6 animate-slide-down">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Candidate Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {candidates.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  selected={selectedCandidate === c.id}
                  onSelect={setSelectedCandidate}
                />
              ))}
            </div>

            {candidates.length === 0 && (
              <div className="text-center py-10">
                <p className="text-dark-500">No candidates available</p>
              </div>
            )}

            {/* Cast Vote Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedCandidate || loading}
              className="gradient-btn-success w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Recording vote on blockchain...
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5" />
                  Cast My Vote
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-md mx-4 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-dark-100 mb-2">
                Confirm Your Vote
              </h3>
              <p className="text-dark-400 text-sm">
                You are about to vote for{' '}
                <span className="font-semibold text-dark-200">
                  {candidates.find(c => c.id === selectedCandidate)?.name}
                </span>
                . This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-dark-700/60 hover:bg-dark-600/60 border border-dark-600 rounded-xl text-dark-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCastVote}
                className="flex-1 gradient-btn-success flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VotingBooth;
