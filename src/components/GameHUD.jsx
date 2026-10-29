import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { Flame, Zap, Sparkles, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { motion, AnimatePresence } from 'framer-motion';

export const GameHUD = ({ theme = 'dark', toggleTheme }) => {
  const hp = useGameStore((state) => state.hp);
  const maxHp = useGameStore((state) => state.maxHp);
  const prana = useGameStore((state) => state.prana);
  const maxPrana = useGameStore((state) => state.maxPrana);
  const rp = useGameStore((state) => state.rp);
  const streak = useGameStore((state) => state.streak);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const getRank = useGameStore((state) => state.getRank);
  const getNextRankThreshold = useGameStore((state) => state.getNextRankThreshold);

  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const [rankUpEvent, setRankUpEvent] = useState(null);
  const prevRankTier = useRef(null);

  const rank = getRank();
  const nextThreshold = getNextRankThreshold();
  const prevThreshold = rank.threshold;
  const rankProgress = Math.min(
    100,
    Math.max(5, ((rp - prevThreshold) / (nextThreshold - prevThreshold || 1)) * 100)
  );

  // Synchronize sound engine with store
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Rank-up celebration detector
  useEffect(() => {
    if (prevRankTier.current && prevRankTier.current !== rank.tier) {
      setRankUpEvent(rank);
      sounds.playUnlockChime();
      const timer = setTimeout(() => setRankUpEvent(null), 2500);
      return () => clearTimeout(timer);
    }
    prevRankTier.current = rank.tier;
  }, [rank]);

  // Scroll detection: collapse on scroll down, expand on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80 && currentY > lastScrollY.current) {
        setCollapsed(true);
      } else if (currentY < lastScrollY.current || currentY <= 30) {
        setCollapsed(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    toggleSound();
    if (!soundEnabled) sounds.playUnlockChime();
  };

  return (
    <>
      {/* Rank Up Celebration Overlay */}
      <AnimatePresence>
        {rankUpEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(7, 7, 13, 0.92) 80%)',
              backdropFilter: 'blur(16px)',
              pointerEvents: 'none'
            }}
          >
            <Sparkles size={56} style={{ color: 'var(--gold-bright)', marginBottom: '16px' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--gold-bright)', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>
              Ascension Attained
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '3rem', margin: '8px 0' }}>
              {rankUpEvent.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              Tier: <strong style={{ color: rankUpEvent.color }}>{rankUpEvent.tier}</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD */}
      <header
        className={`game-hud-container ${collapsed ? 'hud-collapsed' : ''}`}
        style={{
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: collapsed ? 'translateY(-12px) scale(0.96)' : 'none',
          opacity: collapsed ? 0.9 : 1
        }}
      >
        {/* Left: Player Vital Bars */}
        <div className="hud-vitals">
          <div className="hud-meter-wrap hp-meter" title={`Spiritual Fortitude: ${hp}/${maxHp}`}>
            <div className="meter-icon agni-glow">
              <Flame size={15} />
            </div>
            <div className="meter-track">
              <div
                className="meter-fill hp-fill"
                style={{ width: `${Math.min(100, (hp / maxHp) * 100)}%` }}
              />
            </div>
            <span className="meter-val">{hp} HP</span>
          </div>

          <div className="hud-meter-wrap prana-meter" title={`Prana Chanting Focus: ${prana}/${maxPrana}`}>
            <div className="meter-icon prana-glow">
              <Zap size={14} />
            </div>
            <div className="meter-track">
              <div
                className="meter-fill prana-fill"
                style={{ width: `${Math.min(100, (prana / maxPrana) * 100)}%` }}
              />
            </div>
            <span className="meter-val">{prana} PR</span>
          </div>
        </div>

        {/* Center: Rank Badge & Radiance Progress */}
        <div className="hud-center">
          <div className="rank-badge" style={{ borderColor: rank.color }}>
            <Sparkles size={13} color={rank.color} />
            <div className="rank-details">
              <span className="rank-tier" style={{ color: rank.color }}>{rank.tier}</span>
              <span className="rank-title">{rank.title}</span>
            </div>
          </div>
          <div className="xp-bar-container" title={`${rp} / ${nextThreshold} RP`}>
            <div className="xp-bar-fill" style={{ width: `${rankProgress}%` }} />
          </div>
        </div>

        {/* Right: Streak & Controls */}
        <div className="hud-actions">
          <div className="streak-pill" title={`${streak} Day Tapasya Meditation Streak`}>
            <Flame size={15} className="streak-flame" />
            <span className="streak-count">
              <AnimatedNumber value={streak} />d
            </span>
          </div>

          <button
            className="hud-icon-btn"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute Sacred Soundscapes' : 'Enable Sacred Soundscapes'}
            title={soundEnabled ? 'Mute Sacred Soundscapes' : 'Enable Sacred Soundscapes'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {toggleTheme && (
            <button
              className="hud-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
        </div>
      </header>
    </>
  );
};

export default GameHUD;
