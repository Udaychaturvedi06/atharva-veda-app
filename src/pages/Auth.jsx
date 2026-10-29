import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import {
  Sparkles,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Flame,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

// Rotating Sacred Verses for Left Panel
const ROTATING_VERSES = [
  {
    sanskrit: 'सत्यं बृहदृतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति',
    meaning: 'Truth, vast eternal order, dedication, austerity, sacred wisdom, and sacrifice uphold the Earth.',
    source: 'Atharvaveda 12.1.1 (Bhumi Sukta)'
  },
  {
    sanskrit: 'एकं सद्विप्रा बहुधा वदन्ति अग्निं यमं मातरिश्वानमाहुः',
    meaning: 'Truth is One, though the sages articulate It in myriad ways—as Agni, Yama, and Matarishvan.',
    source: 'Rigveda 1.164.46'
  },
  {
    sanskrit: 'तपसा चीयते ब्रह्म ततोऽन्नमभिजायते',
    meaning: 'Through focused spiritual heat (Tapas) cosmic consciousness blossoms, generating sustenance for existence.',
    source: 'Mundaka Upanishad 1.1.8'
  },
  {
    sanskrit: 'तन्मे मनः शिवसङ्कल्पमस्तु',
    meaning: 'May my restless mind be firmly anchored in benevolent and noble resolves.',
    source: 'Yajurveda (Shiva Sankalpa Sukta)'
  }
];

export const Auth = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGateOpening, setIsGateOpening] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Rotating verse state
  const [verseIndex, setVerseIndex] = useState(0);

  const { login, register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // Automatic verse rotation every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setVerseIndex((prev) => (prev + 1) % ROTATING_VERSES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Validation
  const validateForm = () => {
    if (username.trim().length < 3) {
      setError('Seeker moniker must contain at least 3 characters.');
      setShakeKey((k) => k + 1);
      sounds.playCombatHit(false);
      return false;
    }
    if (password.length < 6) {
      setError('Sacred passcode must be at least 6 characters in length.');
      setShakeKey((k) => k + 1);
      sounds.playCombatHit(false);
      return false;
    }
    return true;
  };

  const triggerGateAndNavigate = () => {
    setIsSuccess(true);
    setIsGateOpening(true);
    sounds.playUnlockChime();

    setTimeout(() => {
      navigate('/dashboard');
    }, 650);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const action = activeTab === 'register' ? register : login;
      const res = await action(username, password);

      setLoading(false);
      if (res.success) {
        triggerGateAndNavigate();
      } else {
        sounds.playCombatHit(false);
        setError(res.error || 'Authentication failure. Please verify credentials.');
        setShakeKey((k) => k + 1);
      }
    } catch {
      setLoading(false);
      sounds.playCombatHit(false);
      setError('Connection interrupted. Please verify your connection or use Guest Mode.');
      setShakeKey((k) => k + 1);
    }
  };

  const handleGuestEntry = async () => {
    setError('');
    setLoading(true);
    try {
      sounds.playTibetanBowl();
      const res = await loginAsGuest();
      setLoading(false);
      if (res.success) {
        triggerGateAndNavigate();
      }
    } catch {
      setLoading(false);
      setError('Guest sanctum access temporarily unavailable.');
    }
  };

  const currentVerse = ROTATING_VERSES[verseIndex];

  return (
    <div className="auth-page-root">
      {/* ===================================================================
          600ms GATE OPENING ANIMATION (Triggered on Authentication Success)
          =================================================================== */}
      <AnimatePresence>
        {isGateOpening && (
          <div className="gate-opening-overlay">
            <motion.div
              className="gate-door-left"
              initial={{ x: 0 }}
              animate={{ x: '-102%' }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="gate-door-right"
              initial={{ x: 0 }}
              animate={{ x: '102%' }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="gate-light-flood"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.95, 0.4] }}
              transition={{ duration: 0.65 }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          LEFT PANEL (Desktop Split View)
          =================================================================== */}
      <div className="auth-split-left">
        <div className="auth-left-brand">
          <div className="auth-left-logo">
            <div className="auth-left-logo-icon">
              <Sparkles size={18} />
            </div>
            <span>ATHARVA VEDA</span>
          </div>
        </div>

        {/* Crossfading Sacred Verse */}
        <div className="auth-verse-carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={verseIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="auth-verse-quote-box"
            >
              <div className="auth-verse-sanskrit">"{currentVerse.sanskrit}"</div>
              <p className="auth-verse-meaning">{currentVerse.meaning}</p>
              <div className="auth-verse-source">— {currentVerse.source}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="auth-left-footer">
          <span>7 Lokas</span>
          <span>•</span>
          <span>6 Inner Trials</span>
          <span>•</span>
          <span>Verbatim Sanskrit Samhitas</span>
        </div>
      </div>

      {/* ===================================================================
          RIGHT PANEL (Interactive Glass Card Form)
          =================================================================== */}
      <div className="auth-split-right">
        <motion.div
          key={shakeKey}
          initial={{ opacity: 0, y: 40 }}
          animate={
            shakeKey > 0
              ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.45 }}
          className="auth-card-wrapper"
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <GlassCard spotlight className="auth-card">
            {/* Login / Register Sliding Underline Tabs */}
            <div className="auth-tabs-wrap">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  sounds.playTibetanBowl();
                  setActiveTab('login');
                  setError('');
                }}
              >
                Log In
                {activeTab === 'login' && (
                  <motion.div layoutId="auth-tab-line" className="auth-tab-active-line" />
                )}
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  sounds.playTibetanBowl();
                  setActiveTab('register');
                  setError('');
                }}
              >
                Create Profile
                {activeTab === 'register' && (
                  <motion.div layoutId="auth-tab-line" className="auth-tab-active-line" />
                )}
              </button>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: '#FFF', margin: '0 0 6px' }}>
              {activeTab === 'register' ? 'Seeker Initiation' : 'The Threshold of Truth'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 24px', lineHeight: 1.5 }}>
              {activeTab === 'register'
                ? 'Forge your soul identity to persist Radiance Points, sacred relics, and rankings.'
                : 'Enter the sanctum to resume your spiritual contemplation and trials.'}
            </p>

            {/* Inline Zod-Style Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  className="auth-validation-msg"
                  style={{ marginBottom: '16px' }}
                >
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit}>
              {/* Username Input with Floating Label */}
              <div className="auth-input-group">
                <div className={`auth-input-wrapper ${username ? 'has-value' : ''} ${error ? 'error' : ''}`}>
                  <div className="auth-input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="seeker-username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    autoComplete="username"
                    className="auth-input-field"
                  />
                  <label htmlFor="seeker-username" className="auth-floating-label">
                    Seeker Moniker (e.g. Arya_Seeker)
                  </label>
                </div>
              </div>

              {/* Password Input with Floating Label and Show/Hide */}
              <div className="auth-input-group">
                <div className={`auth-input-wrapper ${password ? 'has-value' : ''} ${error ? 'error' : ''}`}>
                  <div className="auth-input-icon">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="seeker-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                    className="auth-input-field"
                  />
                  <label htmlFor="seeker-password" className="auth-floating-label">
                    Sacred Passcode (min 6 chars)
                  </label>
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button with Loading Spinner & Success Checkmark */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading || isSuccess}
                className="auth-submit-btn"
                icon={loading ? Loader2 : isSuccess ? Check : ArrowRight}
              >
                {loading
                  ? 'Communing with Sanctum...'
                  : isSuccess
                  ? 'Sanctum Opened'
                  : activeTab === 'register'
                  ? 'Initiate Profile'
                  : 'Enter Sanctum'}
              </Button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">OR PILGRIM ENTRY</span>
              <div className="auth-divider-line" />
            </div>

            {/* Guest Entry Button */}
            <Button
              type="button"
              variant="cyber"
              disabled={loading || isSuccess}
              className="auth-guest-btn"
              icon={Flame}
              onClick={handleGuestEntry}
            >
              Continue as Guest (Instant Access)
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
