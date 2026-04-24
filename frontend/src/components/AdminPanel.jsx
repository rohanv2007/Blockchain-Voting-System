import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Play,
  Square,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import {
  addCandidate,
  getCandidates,
  startElection,
  endElection,
  getElectionStatus,
  getVoters,
} from '../utils/api';
import { formatTimestamp } from '../utils/web3Utils';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('candidates');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Candidate state
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [candidateImage, setCandidateImage] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Election state
  const [electionName, setElectionName] = useState('');
  const [duration, setDuration] = useState(60);
  const [election, setElection] = useState(null);

  // Voters state
  const [voters, setVoters] = useState([]);

  const tabs = [
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'election', label: 'Election Control', icon: Trophy },
    { id: 'voters', label: 'Registered Voters', icon: UserCheck },
  ];

  useEffect(() => {
    fetchCandidates();
    fetchElectionStatus();
    fetchVoters();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // ─── Data Fetching ──────────────────────────────────────────────

  const fetchCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const fetchElectionStatus = async () => {
    try {
      const data = await getElectionStatus();
      setElection(data.election || null);
    } catch (err) {
      console.error('Failed to fetch election status:', err);
    }
  };

  const fetchVoters = async () => {
    try {
      const data = await getVoters();
      setVoters(data.voters || []);
    } catch (err) {
      console.error('Failed to fetch voters:', err);
    }
  };

  // ─── Actions ────────────────────────────────────────────────────

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateParty.trim()) return;

    setLoading(true);
    try {
      await addCandidate(candidateName, candidateParty, candidateImage);
      showMessage(`Candidate "${candidateName}" added successfully!`);
      setCandidateName('');
      setCandidateParty('');
      setCandidateImage(null);
      fetchCandidates();
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to add candidate', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async (e) => {
    e.preventDefault();
    if (!electionName.trim() || duration <= 0) return;

    setLoading(true);
    try {
      await startElection(electionName, duration);
      showMessage(`Election "${electionName}" started for ${duration} minutes!`);
      setElectionName('');
      fetchElectionStatus();
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to start election', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndElection = async () => {
    if (!window.confirm('Are you sure you want to end the election? This cannot be undone.')) return;

    setLoading(true);
    try {
      await endElection();
      showMessage('Election ended successfully');
      fetchElectionStatus();
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to end election', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-slide-down ${
          message.type === 'error'
            ? 'bg-red-500/90 text-white'
            : 'bg-emerald-500/90 text-white'
        }`}>
          {message.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-dark-800/60 rounded-2xl border border-dark-700/50">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary-600/20 text-primary-400 shadow-sm'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Candidates Tab ──────────────────────────────────────── */}
      {activeTab === 'candidates' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Candidate Form */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-400" />
              Add New Candidate
            </h3>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Candidate Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="input-field"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Party Name</label>
                <input
                  type="text"
                  value={candidateParty}
                  onChange={(e) => setCandidateParty(e.target.value)}
                  className="input-field"
                  placeholder="Enter party name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Photo (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCandidateImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="candidate-image"
                  />
                  <label
                    htmlFor="candidate-image"
                    className="flex items-center gap-2 w-full py-3 px-4 bg-dark-900/80 border border-dark-600 rounded-xl text-dark-400 hover:border-primary-500/50 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {candidateImage ? candidateImage.name : 'Choose image file...'}
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !candidateName || !candidateParty}
                className="gradient-btn w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Candidate
              </button>
            </form>
          </div>

          {/* Candidates List */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Registered Candidates ({candidates.length})
            </h3>
            {candidates.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-500">No candidates added yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {candidates.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-dark-900/40 rounded-xl border border-dark-700/30">
                    <div className="w-12 h-12 rounded-xl bg-dark-700 overflow-hidden flex items-center justify-center shrink-0">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-dark-500">{c.name?.[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-dark-100 font-medium truncate">{c.name}</p>
                      <p className="text-dark-500 text-sm">{c.party}</p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-lg font-bold gradient-text">{c.voteCount || 0}</p>
                      <p className="text-dark-600 text-xs">votes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Election Control Tab ────────────────────────────────── */}
      {activeTab === 'election' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Election Status */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              Current Election Status
            </h3>
            {election ? (
              <div className="space-y-4">
                <div className="p-4 bg-dark-900/40 rounded-xl">
                  <p className="text-dark-500 text-sm mb-1">Election Name</p>
                  <p className="text-dark-100 font-semibold text-lg">{election.name || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-dark-900/40 rounded-xl">
                    <p className="text-dark-500 text-sm mb-1">Status</p>
                    <span className={election.isActive ? 'badge-success' : 'badge-danger'}>
                      {election.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                  <div className="p-4 bg-dark-900/40 rounded-xl">
                    <p className="text-dark-500 text-sm mb-1">Total Votes</p>
                    <p className="text-dark-100 font-bold text-xl">{election.totalVotes || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-dark-900/40 rounded-xl">
                    <p className="text-dark-500 text-sm mb-1">Start Time</p>
                    <p className="text-dark-300 text-sm">{formatTimestamp(election.startTime)}</p>
                  </div>
                  <div className="p-4 bg-dark-900/40 rounded-xl">
                    <p className="text-dark-500 text-sm mb-1">End Time</p>
                    <p className="text-dark-300 text-sm">{formatTimestamp(election.endTime)}</p>
                  </div>
                </div>
                {election.isActive && (
                  <button
                    onClick={handleEndElection}
                    disabled={loading}
                    className="gradient-btn-danger w-full flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                    End Election Now
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-500">No election data available</p>
                <p className="text-dark-600 text-sm mt-1">Start a new election from the form</p>
              </div>
            )}
          </div>

          {/* Start Election Form */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Start New Election
            </h3>
            <form onSubmit={handleStartElection} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Election Name</label>
                <input
                  type="text"
                  value={electionName}
                  onChange={(e) => setElectionName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Student Council Election 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="1"
                  max="10080"
                  required
                />
                <p className="text-dark-600 text-xs mt-1">
                  {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration} minutes`}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !electionName || duration <= 0 || election?.isActive}
                className="gradient-btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Election
              </button>
              {election?.isActive && (
                <p className="text-amber-400 text-xs text-center flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  End the current election before starting a new one
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ─── Voters Tab ──────────────────────────────────────────── */}
      {activeTab === 'voters' && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary-400" />
              Registered Voters ({voters.length})
            </h3>
            <button
              onClick={fetchVoters}
              className="text-sm text-dark-400 hover:text-dark-200 flex items-center gap-1 transition-colors"
            >
              <Loader2 className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {voters.length === 0 ? (
            <div className="text-center py-10">
              <UserCheck className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-500">No voters registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700/50">
                    <th className="text-left py-3 px-4 text-dark-500 font-medium">Voter ID</th>
                    <th className="text-left py-3 px-4 text-dark-500 font-medium">Full Name</th>
                    <th className="text-left py-3 px-4 text-dark-500 font-medium">ETH Address</th>
                    <th className="text-center py-3 px-4 text-dark-500 font-medium">Voted</th>
                    <th className="text-left py-3 px-4 text-dark-500 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v, idx) => (
                    <tr key={idx} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                      <td className="py-3 px-4 text-dark-300 font-mono text-xs">{v.voter_id}</td>
                      <td className="py-3 px-4 text-dark-200">{v.full_name}</td>
                      <td className="py-3 px-4 text-dark-400 font-mono text-xs">
                        {v.ethereum_address ? `${v.ethereum_address.slice(0, 8)}...${v.ethereum_address.slice(-6)}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {v.has_voted ? (
                          <span className="badge-success">✓ Voted</span>
                        ) : (
                          <span className="badge-warning">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-dark-500 text-xs">
                        {v.registered_at ? new Date(v.registered_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
