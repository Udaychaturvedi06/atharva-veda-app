import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Sparkles, KeyRound, User, Flame, ArrowRight, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const action = isRegister ? register : login;
    const res = await action(username, password);

    setLoading(false);
    if (res.success) {
      sounds.playUnlockChime();
      navigate('/dashboard');
    } else {
      sounds.playCombatHit(false);
      setError(res.error || 'Authentication failure. Please check your credentials.');
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);
    sounds.playUnlockChime();
    navigate('/dashboard');
  };

  return (
    <div className="auth-chamber">
      <div className="auth-card-slate">
        <div className="auth-top-icon">
          <Sparkles size={28} className="gold-accent" />
        </div>

        <h1 className="auth-title">
          {isRegister ? 'Seeker Initiation' : 'The Threshold of Truth'}
        </h1>
        <p className="auth-sub">
          {isRegister 
            ? 'Inscribe your spiritual moniker to preserve your relics, ranks, and Tapasya across lifetimes.' 
            : 'Enter the sanctum to resume your cosmic contemplation.'}
        </p>

        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Seeker Moniker (e.g., Arya_Seeker)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <KeyRound size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Sacred Key (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="primary-cta-btn submit-btn">
            <span>{loading ? 'Attuning Frequencies...' : isRegister ? 'Initiate Seeker Profile' : 'Cross Threshold'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Quick Pilgrim Access */}
        <button 
          type="button" 
          className="guest-cta-btn" 
          onClick={handleGuest}
          disabled={loading}
        >
          <Flame size={16} className="flame-accent" />
          <span>Pilgrim Pass (Instant Guest Entry)</span>
        </button>

        <div className="auth-toggle-mode">
          <button 
            type="button" 
            className="switch-auth-btn"
            onClick={() => {
              sounds.playTibetanBowl();
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Already an initiated seeker? Log In' : 'New pilgrim to the Vedas? Inscribe Moniker'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
