import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getLiveResults, getWinner } from '../utils/api';
import { formatTimestamp } from '../utils/web3Utils';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#14b8a6',
];

function ResultsDashboard() {
  const [results, setResults] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchResults = async () => {
    try {
      const [resultsData, winnerData] = await Promise.all([
        getLiveResults(),
        getWinner(),
      ]);
      setResults(resultsData);
      setWinner(winnerData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  const candidates = results?.candidates || [];
  const totalVotes = results?.totalVotes || 0;
  const election = results?.election || {};

  // Chart data
  const barData = candidates.map((c, i) => ({
    name: c.name,
    votes: c.voteCount,
    fill: COLORS[i % COLORS.length],
  }));

  const pieData = candidates
    .filter(c => c.voteCount > 0)
    .map((c, i) => ({
      name: c.name,
      value: c.voteCount,
      fill: COLORS[i % COLORS.length],
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 shadow-xl">
          <p className="text-dark-200 font-medium">{label}</p>
          <p className="text-primary-400 font-bold">{payload[0].value} votes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Total Votes</p>
              <p className="text-2xl font-bold text-dark-100">{totalVotes}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Candidates</p>
              <p className="text-2xl font-bold text-dark-100">{candidates.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              election.isActive ? 'bg-emerald-500/15' : 'bg-dark-700'
            }`}>
              <Clock className={`w-5 h-5 ${election.isActive ? 'text-emerald-400' : 'text-dark-500'}`} />
            </div>
            <div>
              <p className="text-dark-500 text-sm">Status</p>
              <p className={`font-semibold ${election.isActive ? 'text-emerald-400' : 'text-dark-400'}`}>
                {election.isActive ? 'Active' : 'Ended'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Winner Banner */}
      {winner?.winner && !election.isActive && (
        <div className="glass-card p-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400 text-sm font-medium mb-0.5">
                {winner.is_tie ? '🤝 Tie!' : '🏆 Winner'}
              </p>
              <h3 className="text-xl font-display font-bold text-dark-100">
                {winner.winner.name}
              </h3>
              <p className="text-dark-400 text-sm">
                {winner.winner.party} — {winner.winner.voteCount} votes ({winner.winner.percentage}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            Votes per Candidate
          </h3>
          {candidates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="votes"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                >
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-dark-500">
              No data available
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Vote Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-dark-500">
              No votes cast yet
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-dark-600 text-xs">
        <RefreshCw className="w-3 h-3" />
        Auto-refreshes every 10 seconds
        {lastUpdated && (
          <span>• Last: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}

export default ResultsDashboard;
