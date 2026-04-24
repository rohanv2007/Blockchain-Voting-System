import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  Blocks,
} from 'lucide-react';
import { getAuditTrail, exportAuditCSV, getCandidates } from '../utils/api';
import { shortenAddress, shortenTxHash, formatTimestamp } from '../utils/web3Utils';

function AuditTrail() {
  const [audit, setAudit] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCandidate, setFilterCandidate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auditData, candidatesData] = await Promise.all([
        getAuditTrail(),
        getCandidates(),
      ]);
      setAudit(auditData.audit_trail || []);
      setCandidates(candidatesData.candidates || []);
    } catch (err) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAuditCSV();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Apply filters
  const filteredAudit = audit.filter((entry) => {
    if (filterCandidate && entry.candidate_id !== parseInt(filterCandidate)) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        entry.tx_hash?.toLowerCase().includes(term) ||
        entry.voter_address?.toLowerCase().includes(term) ||
        entry.candidate_name?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="glass-card p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
            <Blocks className="w-5 h-5 text-primary-400" />
            Blockchain Audit Trail ({audit.length} transactions)
          </h3>

          <button
            onClick={handleExport}
            disabled={exporting || audit.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700/60 hover:bg-dark-600/60 border border-dark-600 rounded-xl text-dark-300 hover:text-dark-100 text-sm font-medium transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by tx hash, address, or candidate..."
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <select
              value={filterCandidate}
              onChange={(e) => setFilterCandidate(e.target.value)}
              className="input-field pl-10 appearance-none cursor-pointer"
            >
              <option value="">All Candidates</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredAudit.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-500">
              {audit.length === 0
                ? 'No transactions recorded yet'
                : 'No transactions match your filters'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">Transaction Hash</th>
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">Voter Address</th>
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">Candidate</th>
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">Block</th>
                  <th className="text-left py-3 px-4 text-dark-500 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((entry, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-dark-600">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-primary-400 font-mono text-xs hover:text-primary-300 cursor-pointer transition-colors"
                        title={entry.tx_hash}
                      >
                        {shortenTxHash(entry.tx_hash)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-dark-400 font-mono text-xs"
                        title={entry.voter_address}
                      >
                        {shortenAddress(entry.voter_address)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-dark-200">
                      {entry.candidate_name || `Candidate #${entry.candidate_id}`}
                    </td>
                    <td className="py-3 px-4 text-dark-500 font-mono text-xs">
                      #{entry.block_number}
                    </td>
                    <td className="py-3 px-4 text-dark-500 text-xs">
                      {formatTimestamp(entry.block_timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditTrail;
