import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  UserPlus,
  Vote,
  BarChart3,
  Blocks,
  ArrowRight,
  Clock,
  CheckCircle,
  Lock,
  Globe,
} from 'lucide-react';
import { getElectionStatus } from '../utils/api';
import { getTimeRemaining } from '../utils/web3Utils';

const features = [
  {
    icon: Lock,
    title: 'Tamper-Proof',
    description: 'Every vote is immutably recorded on the Ethereum blockchain',
    color: 'from-primary-500 to-indigo-500',
  },
  {
    icon: CheckCircle,
    title: 'Face Verified',
    description: 'Biometric face recognition prevents voter impersonation',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Transparent',
    description: 'Complete audit trail visible to all stakeholders',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Blocks,
    title: 'Decentralized',
    description: 'No single point of failure or manipulation',
    color: 'from-emerald-500 to-green-500',
  },
];

const navCards = [
  {
    to: '/admin',
    icon: Shield,
    title: 'Admin Panel',
    description: 'Manage candidates, control elections, and monitor voters',
    gradient: 'from-primary-600/20 to-purple-600/20',
    border: 'border-primary-500/20 hover:border-primary-500/40',
    iconBg: 'bg-primary-500/15',
    iconColor: 'text-primary-400',
  },
  {
    to: '/register',
    icon: UserPlus,
    title: 'Register to Vote',
    description: 'Register with your face photo to participate in elections',
    gradient: 'from-emerald-600/20 to-green-600/20',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    to: '/vote',
    icon: Vote,
    title: 'Cast Your Vote',
    description: 'Verify your identity with face scan and cast your vote',
    gradient: 'from-amber-600/20 to-orange-600/20',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    to: '/results',
    icon: BarChart3,
    title: 'View Results',
    description: 'Live results, charts, and blockchain audit trail',
    gradient: 'from-cyan-600/20 to-blue-600/20',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
  },
];

function Home() {
  const [election, setElection] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getElectionStatus();
        setElection(data.election);
      } catch (err) {
        // Backend not running yet
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!election?.isActive || !election?.endTime) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(election.endTime);
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          {/* Election status pill */}
          {election && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/60 border border-dark-700/50 mb-8 animate-fade-in">
              <div className={`w-2.5 h-2.5 rounded-full ${
                election.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'
              }`} />
              <span className="text-sm text-dark-300">
                {election.isActive ? (
                  <>
                    <span className="font-medium text-emerald-400">{election.name}</span> is live
                  </>
                ) : (
                  'No active election'
                )}
              </span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 animate-slide-up">
            <span className="text-dark-100">Secure Voting on</span>
            <br />
            <span className="gradient-text">the Blockchain</span>
          </h1>

          <p className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A tamper-proof digital voting system powered by Ethereum blockchain
            and face verification. Every vote is transparent, immutable, and verifiable.
          </p>

          {/* Countdown Timer */}
          {election?.isActive && countdown && !countdown.expired && (
            <div className="inline-flex items-center gap-4 bg-dark-800/60 border border-dark-700/50 rounded-2xl px-8 py-4 mb-10 animate-scale-in">
              <Clock className="w-5 h-5 text-primary-400" />
              <span className="text-dark-400 text-sm">Time Remaining:</span>
              <div className="flex gap-3">
                {[
                  { value: countdown.hours, label: 'h' },
                  { value: countdown.minutes, label: 'm' },
                  { value: countdown.seconds, label: 's' },
                ].map(({ value, label }, i) => (
                  <div key={i} className="text-center">
                    <span className="text-2xl font-bold font-mono text-dark-100">
                      {String(value).padStart(2, '0')}
                    </span>
                    <span className="text-dark-500 text-xs ml-0.5">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/vote" className="gradient-btn flex items-center gap-2 text-base px-8 py-4">
              <Vote className="w-5 h-5" />
              Cast Your Vote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-dark-800/60 hover:bg-dark-700/60 border border-dark-600 rounded-xl text-dark-300 hover:text-dark-100 font-semibold transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Register First
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="glass-card p-5 text-center group hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-dark-100 font-semibold mb-1">{feature.title}</h3>
              <p className="text-dark-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-20">
        <h2 className="text-2xl font-display font-bold text-dark-100 text-center mb-10">
          Get Started
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {navCards.map((card, idx) => (
            <Link
              key={idx}
              to={card.to}
              className={`glass-card p-6 bg-gradient-to-br ${card.gradient} ${card.border} group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-dark-100 font-semibold mb-1 flex items-center gap-2">
                    {card.title}
                    <ArrowRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-dark-500 text-sm">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
