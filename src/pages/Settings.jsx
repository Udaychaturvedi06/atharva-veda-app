import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Settings as SettingsIcon, Volume2, Shield, User, RefreshCw, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const toggleSound = useGameStore(state => state.toggleSound);
  const vedaBg = useGameStore(state => state.vedaBg);
  const setVedaBg = useGameStore(state => state.setVedaBg);

  const backgrounds = [
    { name: 'Rigveda Radiant Dawn', url: '/bg-rig.png' },
    { name: 'Atharvaveda Forest Mysticism', url: '/bg-atharva.png' },
    { name: 'Samaveda Cosmic Harmonics', url: '/bg-sama.png' },
    { name: 'Yajurveda Alchemical Flame', url: '/bg-yajur.png' }
  ];

  return (
    <div className="settings-chamber">
      <div className="settings-header">
        <div className="settings-badge">
          <SettingsIcon size={16} className="gold-accent" />
          <span>SANCTUM PREFERENCES</span>
        </div>
        <h1>Settings & Configuration</h1>
      </div>

      <div className="settings-grid">
        {/* Audio Section */}
        <div className="settings-card">
          <h3><Volume2 size={18} /> Sonic Environment</h3>
          <p className="card-sub">Control procedural Web Audio singing bowl feedback and chimes.</p>
          
          <div className="setting-toggle-row">
            <span>Sacred Soundscapes & Chimes</span>
            <button 
              className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
              onClick={() => {
                toggleSound();
                sounds.enabled = !soundEnabled;
                if (!soundEnabled) sounds.playUnlockChime();
              }}
            >
              <div className="switch-thumb" />
            </button>
          </div>
        </div>

        {/* Dynamic Atmosphere Background */}
        <div className="settings-card">
          <h3><Shield size={18} /> Cosmic Background Atmosphere</h3>
          <p className="card-sub">Select your primary lobby aesthetic backdrop.</p>

          <div className="bg-options-grid">
            {backgrounds.map((bg) => (
              <button
                key={bg.url}
                className={`bg-thumb-btn ${vedaBg === bg.url ? 'active' : ''}`}
                onClick={() => {
                  sounds.playTibetanBowl();
                  setVedaBg(bg.url);
                }}
              >
                <span>{bg.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="settings-card">
          <h3><User size={18} /> Seeker Identity</h3>
          <div className="account-details">
            <div className="detail-line">
              <span className="label">Username:</span>
              <span className="val">{user?.username || 'Seeker_Anonymous'}</span>
            </div>
            <div className="detail-line">
              <span className="label">Role:</span>
              <span className="val">{user?.role || 'Seeker'}</span>
            </div>
          </div>

          <button 
            className="logout-action-btn"
            onClick={() => {
              sounds.playCombatHit(false);
              logout();
            }}
          >
            <LogOut size={16} />
            <span>End Session (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
