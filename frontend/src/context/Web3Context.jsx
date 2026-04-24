/**
 * Web3 Context — MetaMask connection provider for admin-side blockchain interactions.
 * Voters don't need MetaMask; the backend wallet handles their transactions.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/web3Utils';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);

        const chain = await web3Instance.eth.getChainId();
        setChainId(Number(chain));

        if (CONTRACT_ADDRESS) {
          const contractInstance = new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
          );
          setContract(contractInstance);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accts) => {
          setAccount(accts[0] || null);
          setIsConnected(accts.length > 0);
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        return true;
      } else {
        console.warn('MetaMask is not installed');
        return false;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setContract(null);
    setIsConnected(false);
    setChainId(null);
  };

  const value = {
    web3,
    account,
    contract,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;
