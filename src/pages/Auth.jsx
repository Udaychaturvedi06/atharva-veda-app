import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Sparkles, KeyRound, User, Flame, ArrowRight } from 'lucide-react';

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
      setError(res.error || 'Authentication failure. Please verify credentials.');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFE259',
          margin: '0 auto 16px'
        }}>
          <Sparkles size={24} />
        </div>

        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#FFF', margin: '0 0 8px' }}>
          {isRegister ? 'Seeker Initiation' : 'The Threshold of Truth'}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 24px' }}>
          {isRegister 
            ? 'Forge your soul identity to persist your sacred rank and relics.' 
            : 'Enter the sanctuary to resume your contemplation.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Seeker Moniker (e.g., Arya_Seeker)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ flex: 1, background: 'none', border: 'none', color: '#FFF', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={18} style={{ color: '#94A3B8' }} />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ flex: 1, background: 'none', border: 'none', color: '#FFF', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '8px', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{loading ? 'Communing...' : isRegister ? 'Initiate Profile' : 'Enter Sanctum'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <button 
          type="button" 
          className="cyber-btn cyber-btn-gold"
          style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
          onClick={handleGuest}
          disabled={loading}
        >
          <Flame size={16} style={{ color: '#FF7B00' }} />
          <span>Quick Pilgrim Mode (Instant Guest Access)</span>
        </button>

        <div style={{ marginTop: '20px' }}>
          <button 
            type="button"
            className="cyber-btn"
            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: 'none', background: 'none' }}
            onClick={() => {
              sounds.playTibetanBowl();
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Already an initiated seeker? Log In' : 'New pilgrim to the Vedas? Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
