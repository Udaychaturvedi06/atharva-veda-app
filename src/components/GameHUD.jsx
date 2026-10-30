import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Flame, Zap, Heart, Volume2, VolumeX, Sun, Moon, Sparkles, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RankMedallion from './ui/RankMedallion';
import LiquidOrb from './ui/LiquidOrb';
import { useNavigate, useLocation } from 'react-router-dom';

// Rank-Up Fullscreen Celebration Canvas
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

    for (let i = 0; i < 120; i++) {
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
          p.vy += 0.08;
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
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100001
      }}
    />
  );
};

export const GameHUD = ({ theme = 'dark', toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [rankUpEvent, setRankUpEvent] = useState(null);
  const [rpGainSpark, setRpGainSpark] = useState(false);
  const lastScrollY = useRef(0);
  const currentRank = useMemo(() => {
    return (typeof getRank === 'function' ? getRank() : null) || {
      threshold: 0,
      title: 'Jijnasu (The Curious Seeker)',
      tier: 'Novice',
      color: '#A0AEC0'
    };
  }, [getRank]);

  const nextThreshold = (typeof getNextRankThreshold === 'function' ? getNextRankThreshold() : null) || 250;
  const prevRankRef = useRef(currentRank.title);
  const prevRpRef = useRef(rp);

  const currentThreshold = currentRank.threshold || 0;
  const progressToNext = nextThreshold > currentThreshold
    ? Math.min(100, Math.max(0, ((rp - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;

  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith('/verse/') || location.pathname.startsWith('/library');

  // Collapse on scroll down, expand on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY.current) {
        setCollapsed(true);
      } else if (currentScrollY < lastScrollY.current) {
        setCollapsed(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // RP gain animation spark
  useEffect(() => {
    if (rp > prevRpRef.current) {
      setRpGainSpark(true);
      const timer = setTimeout(() => setRpGainSpark(false), 800);
      return () => clearTimeout(timer);
    }
    prevRpRef.current = rp;
  }, [rp]);

  // Rank-up celebration trigger
  useEffect(() => {
    if (currentRank.title !== prevRankRef.current) {
      prevRankRef.current = currentRank.title;
      setRankUpEvent(currentRank);
      sounds.playLevelUp();
      const timer = setTimeout(() => {
        setRankUpEvent(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentRank]);

  const handleMuteClick = () => {
    toggleSound();
    sounds.playTap();
  };

  const handleThemeClick = () => {
    toggleTheme();
    sounds.playTap();
  };

  return (
    <>
      <header
        className={`game-hud ${collapsed ? 'game-hud--collapsed' : ''}`}
        onClick={() => collapsed && setCollapsed(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: collapsed ? 44 : 64,
          background: 'rgba(7, 7, 13, 0.82)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* LEFT: Rank Medallion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <RankMedallion rank={currentRank} rp={rp} nextThreshold={nextThreshold} />
          {!collapsed && (
            <div style={{ display: 'none', flexDirection: 'column' }} className="hud-rank-label">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentRank.color }}>
                {currentRank.title}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                {rp} RP / {nextThreshold} RP
              </span>
            </div>
          )}
        </div>

        {/* CENTER: Context-Aware Meter (Hidden on reading routes to ensure serene study) */}
        {!isReaderRoute ? (
          <div
            style={{
              flex: 1,
              maxWidth: 360,
              margin: '0 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {rpGainSpark && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: -16,
                  color: 'var(--gold-bright)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-hud)'
                }}
              >
                +RP Elevated!
              </motion.div>
            )}

            {/* Glowing horizontal Sutra Thread */}
            <div
              style={{
                width: '100%',
                height: 3,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressToNext}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))',
                  boxShadow: '0 0 10px rgba(255, 226, 89, 0.8)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            {!collapsed && (
              <span style={{ fontSize: '0.7rem', color: 'var(--silver-muted, #94A3B8)', marginTop: 4, fontFamily: 'var(--font-hud)' }}>
                TAPASYA ASCENSION &bull; {Math.round(progressToNext)}%
              </span>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', color: 'var(--color-silver-3)', letterSpacing: '0.08em' }}>
              THE LIVING ARCHIVE &bull; CONTEMPLATIVE STUDY
            </span>
          </div>
        )}

        {/* RIGHT: Vitals Orbs + Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Combat Vitals Orbs (Fortitude & Prana) are hidden during contemplative reading */}
          {!isReaderRoute && (
            <>
              {/* Liquid Orb: Fortitude (Signal Red) */}
              <LiquidOrb
                type="hp"
                current={hp}
                max={maxHp}
                icon={<Heart size={16} />}
                label="Fortitude (HP)"
                color="var(--signal-red, #EF4444)"
                secondaryColor="var(--signal-red-glow, rgba(239, 68, 68, 0.4))"
                details="Your spiritual endurance. Regenerates during calm and sacred homa rituals."
              />

              {/* Liquid Orb: Prana (Sage Green) */}
              <LiquidOrb
                type="prana"
                current={prana}
                max={maxPrana}
                icon={<Zap size={16} />}
                label="Prana (Mana)"
                color="var(--sage-healing, #769E84)"
                secondaryColor="var(--sage-glow, rgba(118, 158, 132, 0.35))"
                details="Breath and focus energy used for chanting, invocations, and arcade abilities."
              />
            </>
          )}

          {/* Liquid Orb: Streak (Amber Glow) */}
          <LiquidOrb
            type="streak"
            current={streak}
            max={30}
            icon={<Flame size={16} />}
            label="Tapasya Streak"
            color="var(--amber-glow, #FFB020)"
            secondaryColor="rgba(255, 176, 32, 0.4)"
            details={`${streak} consecutive days of Vedic sadhana. Safeguarded by earned Grace days.`}
          />

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

          {/* Sound Toggle */}
          <button
            onClick={handleMuteClick}
            onMouseEnter={() => sounds.playHover()}
            style={{
              background: 'transparent',
              border: 'none',
              color: soundEnabled ? 'var(--gold)' : 'var(--text-2)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeClick}
            onMouseEnter={() => sounds.playHover()}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme === 'light' ? 'var(--gold)' : 'var(--soma)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Avatar Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                sounds.playTap();
                setShowAvatarMenu(!showAvatarMenu);
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-bright)',
                cursor: 'pointer'
              }}
              aria-label="Seeker Profile Menu"
            >
              <User size={16} />
            </button>

            <AnimatePresence>
              {showAvatarMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: 180,
                    background: 'rgba(15, 13, 24, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 0',
                    zIndex: 1000,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                      {user?.username || 'Seeker'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                      {currentRank.tier}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      navigate('/settings');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <SettingsIcon size={14} /> Sanctum Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={14} /> Exit Sanctuary
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Rank-Up Celebration Modal */}
      <AnimatePresence>
        {rankUpEvent && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 7, 13, 0.9)',
              backdropFilter: 'blur(20px)',
              zIndex: 100000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 20
            }}
          >
            <RankUpCanvas />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', zIndex: 100002 }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                  border: `2px solid ${rankUpEvent.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: `0 0 30px ${rankUpEvent.color}`
                }}
              >
                <Sparkles size={42} color={rankUpEvent.color} />
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                  color: 'var(--gold-bright)',
                  margin: '0 0 10px',
                  textShadow: '0 0 30px rgba(255, 226, 89, 0.6)'
                }}
              >
                SEEKER ASCENSION
              </h1>

              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.4rem',
                  color: rankUpEvent.color,
                  fontWeight: 700,
                  marginBottom: 16
                }}
              >
                {rankUpEvent.title}
              </div>

              <p style={{ color: 'var(--text-1)', maxWidth: 440, margin: '0 auto 24px', fontSize: '1rem' }}>
                Your Tapasya and dedication have awakened a deeper resonance within the Atharva realms.
              </p>

              <button
                onClick={() => setRankUpEvent(null)}
                style={{
                  padding: '10px 28px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  color: '#07070D',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
                }}
              >
                Accept Mantle
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameHUD;
