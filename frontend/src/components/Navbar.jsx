import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Vote,
  Shield,
  UserPlus,
  BarChart3,
  Home,
  Menu,
  X,
  Blocks,
} from 'lucide-react';
import { getElectionStatus } from '../utils/api';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/admin', label: 'Admin', icon: Shield },
  { to: '/register', label: 'Register', icon: UserPlus },
  { to: '/vote', label: 'Vote', icon: Vote },
  { to: '/results', label: 'Results', icon: BarChart3 },
];

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [electionActive, setElectionActive] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getElectionStatus();
        setElectionActive(data.election?.isActive || false);
      } catch {
        // Ignore if backend is not running
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <Blocks className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text hidden sm:block">
              BlockVote
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Election Status Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                electionActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-dark-700/50 text-dark-400 border border-dark-600/50'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  electionActive ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'
                }`}
              />
              {electionActive ? 'Election Active' : 'No Active Election'}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-dark-400 hover:text-dark-200 rounded-lg hover:bg-dark-800"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
