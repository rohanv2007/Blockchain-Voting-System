import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import AdminPanel from '../components/AdminPanel';
import { adminLogin } from '../utils/api';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminLogin(password);
      localStorage.setItem('admin_token', data.access_token);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-dark-100 mb-2">
              Admin Login
            </h1>
            <p className="text-dark-400 text-sm">
              Enter the admin password to access the control panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm animate-slide-down">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="gradient-btn w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-100">
            Admin Panel
          </h1>
          <p className="text-dark-400 mt-1">
            Manage candidates, control elections, and monitor activity
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-dark-800/60 hover:bg-dark-700/60 border border-dark-600 rounded-xl text-dark-400 hover:text-dark-200 text-sm font-medium transition-all"
        >
          Logout
        </button>
      </div>

      <AdminPanel />
    </div>
  );
}

export default Admin;
