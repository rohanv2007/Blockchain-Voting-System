/**
 * Web3 utility functions and contract configuration.
 * Used for direct blockchain interaction from the frontend (admin features).
 */

// Contract address — update this after deploying with Truffle
export const CONTRACT_ADDRESS = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601';

// Minimal ABI for frontend read-only operations
export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'getCandidatesCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'getCandidate',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'party', type: 'string' },
      { internalType: 'string', name: 'imageUrl', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getElectionStatus',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: '_totalVotes', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getResults',
    outputs: [
      { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
      { internalType: 'string[]', name: 'names', type: 'string[]' },
      { internalType: 'string[]', name: 'parties', type: 'string[]' },
      { internalType: 'string[]', name: 'imageUrls', type: 'string[]' },
      { internalType: 'uint256[]', name: 'voteCounts', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_voter', type: 'address' }],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Shorten an Ethereum address for display.
 * e.g., 0x1234...abcd
 */
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format a Unix timestamp to a readable date string.
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Format a transaction hash for display.
 */
export const shortenTxHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

/**
 * Calculate time remaining from a Unix timestamp.
 */
export const getTimeRemaining = (endTimestamp) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTimestamp - now;

  if (remaining <= 0) return { expired: true, hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return { expired: false, hours, minutes, seconds };
};
