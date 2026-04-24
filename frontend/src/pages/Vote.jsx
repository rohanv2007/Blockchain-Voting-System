import React from 'react';
import VotingBooth from '../components/VotingBooth';

function Vote() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-100 mb-2">
          Voting Booth
        </h1>
        <p className="text-dark-400">
          Verify your identity and cast your vote securely on the blockchain
        </p>
      </div>
      <VotingBooth />
    </div>
  );
}

export default Vote;
