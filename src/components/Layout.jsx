import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import GameHUD from './GameHUD';
import VedicCanvas3D from './VedicCanvas3D';
import { sounds } from '../utils/soundEngine';
import { useAuth } from '../contexts/AuthContext';
import { 
  Compass, 
  BookOpen, 
  Swords, 
  MessageSquareQuote, 
  Trophy, 
  BrainCircuit, 
  Settings as SettingsIcon,
  LogOut 
} from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    sounds.playTibetanBowl();
  };

  const navItems = [
    { to: '/dashboard', label: 'Sanctuary', icon: Compass },
    { to: '/campaign', label: 'Inner Trials', icon: Swords },
    { to: '/library', label: 'Vedas', icon: BookOpen },
    { to: '/quiz', label: 'Decryption', icon: BrainCircuit },
    { to: '/chat', label: 'Rishi AI', icon: MessageSquareQuote },
    { to: '/rankings', label: 'Leagues', icon: Trophy },
    { to: '/settings', label: 'Sanctum', icon: SettingsIcon },
  ];

  return (
    <div className="aaa-layout-root">
      {/* 3D Sacred Geometry Background Layer */}
      <VedicCanvas3D intensity={1.2} />

      {/* Diegetic Game HUD */}
      <GameHUD />

      {/* Main Content Area */}
      <main className="aaa-main-viewport">
        {children}
      </main>

      {/* Cyber-Vedic Bottom Command Dock */}
      <nav className="aaa-bottom-dock">
        <div className="dock-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
              >
                <div className="dock-icon-wrapper">
                  <Icon size={20} className="dock-icon" />
                  <div className="dock-glow-pip" />
                </div>
                <span className="dock-label">{item.label}</span>
              </NavLink>
            );
          })}

          <button 
            className="dock-item logout-btn" 
            onClick={() => {
              sounds.playCombatHit(false);
              logout();
              navigate('/login');
            }}
            title="Log Out Seeker"
          >
            <div className="dock-icon-wrapper">
              <LogOut size={18} className="dock-icon" />
            </div>
            <span className="dock-label">Exit</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
