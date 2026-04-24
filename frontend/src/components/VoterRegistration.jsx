import React, { useState } from 'react';
import {
  UserPlus,
  IdCard,
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import WebcamCapture, { base64ToBlob } from './WebcamCapture';
import { registerVoter } from '../utils/api';

function VoterRegistration() {
  const [fullName, setFullName] = useState('');
  const [voterId, setVoterId] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleCapture = (imageSrc) => {
    setCapturedImage(imageSrc);
    setError('');
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Please enter your full name');
    if (!voterId.trim()) return setError('Please enter your voter ID');
    if (!capturedImage) return setError('Please capture your face photo');

    setLoading(true);
    try {
      const blob = base64ToBlob(capturedImage);
      const data = await registerVoter(fullName, voterId, blob);
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center animate-scale-in">
        <div className="glass-card p-10">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-100 mb-3">
            Registration Complete!
          </h2>
          <p className="text-dark-400 mb-6">
            Your face has been successfully enrolled. You can now proceed to vote when the election is active.
          </p>
          <div className="bg-dark-900/60 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-dark-500 text-sm">Name</span>
              <span className="text-dark-200 text-sm font-medium">{success.voter?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500 text-sm">Voter ID</span>
              <span className="text-dark-200 text-sm font-mono">{success.voter?.voter_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500 text-sm">ETH Address</span>
              <span className="text-dark-200 text-sm font-mono text-xs">
                {success.voter?.ethereum_address ? `${success.voter.ethereum_address.slice(0, 10)}...${success.voter.ethereum_address.slice(-8)}` : ''}
              </span>
            </div>
          </div>
          <a
            href="/vote"
            className="gradient-btn inline-flex items-center gap-2"
          >
            Go to Voting Booth
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-primary-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-100 mb-2">
            Voter Registration
          </h2>
          <p className="text-dark-400">
            Register with your face photo to participate in the election
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-400 mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Voter ID Field */}
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-400 mb-2">
              <IdCard className="w-4 h-4" />
              Voter ID (National ID Number)
            </label>
            <input
              type="text"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              className="input-field"
              placeholder="Enter your voter ID"
              required
            />
          </div>

          {/* Webcam Capture */}
          <div>
            <label className="flex items-center gap-2 text-sm text-dark-400 mb-2">
              <Camera className="w-4 h-4" />
              Face Photo
            </label>
            <WebcamCapture
              onCapture={handleCapture}
              capturedImage={capturedImage}
              onRetake={handleRetake}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !fullName || !voterId || !capturedImage}
            className="gradient-btn w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Face Data...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Registration
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VoterRegistration;
