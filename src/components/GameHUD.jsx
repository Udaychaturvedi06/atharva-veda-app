import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Flame, Zap, Sparkles, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { motion, AnimatePresence } from 'framer-motion';

// Canvas-driven Ember Particles for Rank-Up Celebration
const RankUpCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FFE259', '#D4AF37', '#FF7B00', '#FF5E1E', '#FFFFFF'];

    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        radius: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      let alive = false;
      for (const p of particles) {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // subtle gravity
          p.alpha -= p.decay;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export const GameHUD = ({ theme = 'dark', toggleTheme }) => {
  const { user } = useAuth();
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

  // Vitals damage & heal reaction pulse states
  const prevHp = useRef(hp);
  const prevPrana = useRef(prana);
  const [hpFlash, setHpFlash] = useState(null); // 'damage' or 'heal'
  const [pranaFlash, setPranaFlash] = useState(null);

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

  // Damage / Heal reaction triggers
  useEffect(() => {
    if (hp < prevHp.current) {
      setHpFlash('damage');
      const timer = setTimeout(() => setHpFlash(null), 600);
      return () => clearTimeout(timer);
    } else if (hp > prevHp.current) {
      setHpFlash('heal');
      const timer = setTimeout(() => setHpFlash(null), 600);
      return () => clearTimeout(timer);
    }
    prevHp.current = hp;
  }, [hp]);

  useEffect(() => {
    if (prana > prevPrana.current) {
      setPranaFlash('surge');
      const timer = setTimeout(() => setPranaFlash(null), 600);
      return () => clearTimeout(timer);
    }
    prevPrana.current = prana;
  }, [prana]);

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

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'ॐ';

  return (
    <>
      {/* Rank Up Celebration Overlay with Ember Fireworks */}
      <AnimatePresence>
        {rankUpEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 0%, rgba(7, 7, 13, 0.94) 80%)',
              backdropFilter: 'blur(20px)',
              pointerEvents: 'none'
            }}
          >
            <RankUpCanvas />

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <Sparkles size={56} style={{ color: 'var(--gold-bright)', marginBottom: '16px' }} />
              <span
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--gold-bright)',
                  fontWeight: 800,
                  letterSpacing: '5px',
                  textTransform: 'uppercase'
                }}
              >
                Ascension Attained
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  color: '#FFF',
                  fontSize: 'clamp(2.5rem, 6vw, 3.8rem)',
                  margin: '10px 0',
                  textShadow: '0 0 30px rgba(212, 175, 55, 0.6)'
                }}
              >
                {rankUpEvent.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                Tier: <strong style={{ color: rankUpEvent.color }}>{rankUpEvent.tier}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD */}
      <header
        className={`game-hud-container ${collapsed ? 'hud-collapsed' : ''}`}
        style={{
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: collapsed ? 'translateY(-10px) scale(0.97)' : 'none',
          opacity: collapsed ? 0.92 : 1
        }}
      >
        {/* Left: Avatar Ring + Player Vital Bars */}
        <div className="hud-vitals" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar Ring with Rank Color */}
          <div
            className="hud-avatar-ring"
            title={`${user?.username || 'Seeker'} — ${rank.title}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: `2px solid ${rank.color}`,
              boxShadow: `0 0 12px ${rank.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(19, 17, 28, 0.85)',
              color: '#FFF',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.95rem',
              flexShrink: 0
            }}
          >
            {userInitial}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* HP Fortitude Meter with Damage / Heal flash */}
            <div
              className={`hud-meter-wrap hp-meter ${hpFlash === 'damage' ? 'meter-damage-flash' : hpFlash === 'heal' ? 'meter-heal-pulse' : ''}`}
              title={`Spiritual Fortitude: ${hp}/${maxHp}`}
            >
              <div className="meter-icon agni-glow">
                <Flame size={14} />
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill hp-fill"
                  style={{ width: `${Math.min(100, (hp / maxHp) * 100)}%` }}
                />
              </div>
              <span className="meter-val">{hp} HP</span>
            </div>

            {/* Prana Chanting Focus Meter with Surge pulse */}
            <div
              className={`hud-meter-wrap prana-meter ${pranaFlash === 'surge' ? 'meter-surge-pulse' : ''}`}
              title={`Prana Chanting Focus: ${prana}/${maxPrana}`}
            >
              <div className="meter-icon prana-glow">
                <Zap size={13} />
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
            <div
              className="xp-bar-fill"
              style={{
                width: `${rankProgress}%`,
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
        </div>

        {/* Right: Streak Flame with Animated Number, Mute, Theme */}
        <div className="hud-actions">
          <div className="streak-pill" title={`${streak} Day Tapasya Meditation Streak`}>
            <Flame size={15} className="streak-flame" />
            <span className="streak-count">
              <AnimatedNumber value={streak} />d
            </span>
          </div>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute Sacred Soundscapes' : 'Enable Sacred Soundscapes'}
            title={soundEnabled ? 'Mute Sacred Soundscapes' : 'Enable Sacred Soundscapes'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {toggleTheme && (
            <button
              type="button"
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
