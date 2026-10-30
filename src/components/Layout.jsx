import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GameHUD from './GameHUD';
import CommandPalette from './ui/CommandPalette';
import { sounds } from '../utils/soundEngine';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/useGameStore';
import ErrorBoundary from './ui/ErrorBoundary';
import Lenis from 'lenis';
import {
  Compass,
  ArrowRightCircle,
  BookOpen,
  Gamepad2,
  MessageSquareQuote,
  Trophy,
  Settings as SettingsIcon,
  LogOut,
  Search,
  WifiOff,
  MoreHorizontal
} from 'lucide-react';

const SacredScene = lazy(() => import('./3d/SacredScene'));

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Sanctuary', icon: Compass },
  { to: '/library', label: 'Manuscripts', icon: BookOpen },
  { to: '/path', label: 'Path', icon: ArrowRightCircle },
  { to: '/arcade', label: 'Arcade', icon: Gamepad2 }
];

const SECONDARY_NAV = [
  { to: '/chat', label: 'Rishi AI', icon: MessageSquareQuote },
  { to: '/rankings', label: 'Sangha Leagues', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }
];

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

export const Layout = ({ children, theme, toggleTheme }) => {
  const { logout } = useAuth();
  const vedaBg = useGameStore((state) => state.vedaBg);
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef(null);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMobileMore, setShowMobileMore] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Ctrl+K / Cmd+K Command Palette trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sounds.playTap();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Lenis smooth scroll with prefers-reduced-motion protection
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Do not bind smooth scroll interception when user requests reduced motion
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2
    });
    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleNavClick = () => {
    sounds.playTap();
  };

  return (
    <div className="aaa-layout-root">
      {/* Skip to Content Accessible Link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: -100,
          left: 16,
          background: 'var(--gold)',
          color: '#000',
          padding: '8px 16px',
          fontWeight: 700,
          zIndex: 999999,
          borderRadius: 4
        }}
        onFocus={(e) => (e.target.style.top = '16px')}
        onBlur={(e) => (e.target.style.top = '-100px')}
      >
        Skip to main sacred content
      </a>

      {/* Offline Status Banner */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            background: 'var(--danger)',
            color: '#fff',
            fontSize: '0.85rem',
            textAlign: 'center',
            padding: '6px 12px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <WifiOff size={16} /> Offline Seeker Mode &bull; Progress preserved locally in browser sanctum
        </div>
      )}

      {/* Background Layer 1: vedaBg texture */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${vedaBg || '/bg-rig.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.16,
          zIndex: -3,
          pointerEvents: 'none',
          transition: 'background-image 0.8s ease-in-out'
        }}
      />

      {/* Background Layer 2: 3D Sacred Geometry Scene */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <SacredScene />
        </Suspense>
      </ErrorBoundary>

      {/* Top Game HUD */}
      <GameHUD theme={theme} toggleTheme={toggleTheme} />

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Shell Body: Desktop Rail + Main Viewport */}
      <div className="shell-body-container" style={{ display: 'flex', minHeight: '100vh', paddingTop: 64 }}>
        {/* Desktop Left Rail Navigation (≥1024px) */}
        <aside className="desktop-left-rail" aria-label="Primary Navigation">
          <nav className="desktop-rail-nav">
            {/* Quick Command Palette Button */}
            <button
              onClick={() => {
                sounds.playTap();
                setIsCommandOpen(true);
              }}
              className="rail-item search-trigger-btn"
              title="Seek (Ctrl+K)"
            >
              <Search size={22} className="rail-icon" color="var(--amber-glow, #FFB020)" />
              <span className="rail-label">Seek (Ctrl+K)</span>
            </button>

            {ALL_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={`rail-item ${isActive ? 'rail-item--active' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-rail-indicator"
                      className="rail-active-glow"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={22} className="rail-icon" />
                  <span className="rail-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Rail Footer Logout */}
          <div className="desktop-rail-footer">
            <button
              onClick={() => {
                sounds.playTap();
                logout();
                navigate('/login');
              }}
              className="rail-item rail-item-logout"
              title="Exit Sanctuary"
            >
              <LogOut size={22} className="rail-icon" />
              <span className="rail-label">Exit Sanctuary</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main id="main-content" className="shell-main-viewport" style={{ flex: 1, paddingBottom: 80 }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Floating Bottom Dock (<1024px) */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
        <div className="mobile-dock-glass">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`mobile-dock-btn ${isActive ? 'mobile-dock-btn--active' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-dock-pill"
                    className="mobile-dock-active-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={20} className="mobile-dock-icon" />
                <span className="mobile-dock-label">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setShowMobileMore(!showMobileMore);
            }}
            className={`mobile-dock-btn ${showMobileMore ? 'mobile-dock-btn--active' : ''}`}
          >
            <MoreHorizontal size={20} />
            <span className="mobile-dock-label">More</span>
          </button>
        </div>

        {/* Mobile More Drawer */}
        <AnimatePresence>
          {showMobileMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'fixed',
                bottom: 80,
                left: 16,
                right: 16,
                background: 'rgba(15, 13, 24, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                zIndex: 1000,
                boxShadow: '0 12px 40px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        sounds.playTap();
                        setShowMobileMore(false);
                        navigate(item.to);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '12px 8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        color: 'var(--text-1)',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={20} color="var(--gold)" />
                      <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Layout;
