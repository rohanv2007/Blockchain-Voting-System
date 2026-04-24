import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
} from 'lucide-react';
import ResultsDashboard from '../components/ResultsDashboard';
import AuditTrail from '../components/AuditTrail';

function Results() {
  const [activeTab, setActiveTab] = useState('results');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-100 mb-2">
          Election Results
        </h1>
        <p className="text-dark-400">
          Live vote counts and blockchain audit trail
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-dark-800/60 rounded-2xl border border-dark-700/50 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'results'
              ? 'bg-primary-600/20 text-primary-400'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Live Results
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'audit'
              ? 'bg-primary-600/20 text-primary-400'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {activeTab === 'results' ? <ResultsDashboard /> : <AuditTrail />}
    </div>
  );
}

export default Results;
