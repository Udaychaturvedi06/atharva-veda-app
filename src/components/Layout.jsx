import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameHUD from './GameHUD';
import { Tooltip } from './ui/Tooltip';
import { sounds } from '../utils/soundEngine';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/useGameStore';
import Lenis from 'lenis';
import {
  Compass,
  BookOpen,
  Swords,
  BrainCircuit,
  Gamepad2,
  MessageSquareQuote,
  Trophy,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';

const SacredScene = lazy(() => import('./3d/SacredScene'));

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Sanctuary', icon: Compass },
  { to: '/campaign', label: 'Inner Trials', icon: Swords },
  { to: '/library', label: 'Vedas', icon: BookOpen },
  { to: '/quiz', label: 'Decryption', icon: BrainCircuit },
  { to: '/arcade', label: 'Arcade', icon: Gamepad2 },
  { to: '/chat', label: 'Rishi AI', icon: MessageSquareQuote },
  { to: '/rankings', label: 'Leagues', icon: Trophy },
  { to: '/settings', label: 'Sanctum', icon: SettingsIcon },
];

export const Layout = ({ children, theme, toggleTheme }) => {
  const { logout } = useAuth();
  const vedaBg = useGameStore((state) => state.vedaBg);
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleNavClick = () => {
    sounds.playTibetanBowl();
  };

  return (
    <div className="aaa-layout-root">
      {/* Background Layer 1: vedaBg soft subtle overlay */}
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
      <Suspense fallback={null}>
        <SacredScene />
      </Suspense>

      {/* Top Game HUD */}
      <GameHUD theme={theme} toggleTheme={toggleTheme} />

      {/* Responsive Shell Body: Desktop Rail + Main Viewport */}
      <div className="shell-body-container">
        {/* Desktop Left Rail Navigation (≥1024px) */}
        <aside className="desktop-left-rail" aria-label="Primary Navigation">
          <div className="rail-inner">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Tooltip key={item.to} content={item.label} side="right">
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    className={`rail-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="rail-icon-box">
                      <Icon size={20} />
                      {isActive && (
                        <motion.div
                          layoutId="active-rail-indicator"
                          className="rail-active-indicator"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className="rail-label">{item.label}</span>
                  </NavLink>
                </Tooltip>
              );
            })}

            <Tooltip content="Exit Sanctum" side="right">
              <button
                type="button"
                className="rail-nav-item rail-logout"
                onClick={() => {
                  sounds.playCombatHit(false);
                  logout();
                  navigate('/login');
                }}
              >
                <div className="rail-icon-box">
                  <LogOut size={18} />
                </div>
                <span className="rail-label">Exit</span>
              </button>
            </Tooltip>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="aaa-main-viewport">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock (<1024px) */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
        <div className="dock-inner">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`dock-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <div className="dock-icon-wrapper">
                  <Icon size={19} />
                  {isActive && (
                    <motion.div
                      layoutId="active-dock-pill"
                      className="dock-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                <span className="dock-label">{item.label}</span>
              </NavLink>
            );
          })}

          <button
            type="button"
            className="dock-item"
            onClick={() => {
              sounds.playCombatHit(false);
              logout();
              navigate('/login');
            }}
            aria-label="Exit"
          >
            <div className="dock-icon-wrapper">
              <LogOut size={18} />
            </div>
            <span className="dock-label">Exit</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
