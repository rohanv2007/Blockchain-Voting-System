import React from 'react';
import { User, Landmark } from 'lucide-react';

function CandidateCard({ candidate, selected, onSelect, showVotes, rank }) {
  const { id, name, party, imageUrl, voteCount, percentage } = candidate;

  return (
    <div
      onClick={() => onSelect && onSelect(id)}
      className={`glass-card p-5 transition-all duration-300 cursor-pointer group ${
        selected
          ? 'border-primary-500/60 shadow-lg shadow-primary-500/15 ring-2 ring-primary-500/30'
          : 'hover:border-dark-500/50 hover:-translate-y-1 hover:shadow-xl'
      } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Rank badge (for results) */}
      {rank && (
        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
          rank === 1
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            : rank === 2
            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-dark-800'
            : 'bg-gradient-to-br from-amber-700 to-amber-800 text-white'
        }`}>
          #{rank}
        </div>
      )}

      {/* Candidate Image */}
      <div className="relative w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-dark-700 border border-dark-600/50 group-hover:border-primary-500/30 transition-all">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-10 h-10 text-dark-500" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-dark-100 text-center mb-1">
        {name}
      </h3>

      {/* Party */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <Landmark className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm text-dark-400">{party}</span>
      </div>

      {/* Vote Count (for results view) */}
      {showVotes && (
        <div className="border-t border-dark-700/50 pt-3 mt-3">
          <div className="text-center">
            <span className="text-2xl font-bold gradient-text">{voteCount || 0}</span>
            <span className="text-dark-500 text-sm ml-1">votes</span>
          </div>
          {percentage !== undefined && (
            <>
              <div className="mt-2 w-full bg-dark-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-dark-500 text-center mt-1">{percentage}%</p>
            </>
          )}
        </div>
      )}

      {/* Selection indicator */}
      {onSelect && (
        <div className="mt-3 flex justify-center">
          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
            selected
              ? 'border-primary-500 bg-primary-500'
              : 'border-dark-500 group-hover:border-dark-400'
          }`}>
            {selected && (
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-scale-in" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateCard;
