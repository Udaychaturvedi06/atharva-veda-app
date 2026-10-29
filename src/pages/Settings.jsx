import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import { Settings as SettingsIcon, Volume2, Shield, User, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const toggleSound = useGameStore(state => state.toggleSound);
  const vedaBg = useGameStore(state => state.vedaBg);
  const setVedaBg = useGameStore(state => state.setVedaBg);

  const backgrounds = [
    { name: 'Rigveda Dawn', url: '/bg-rig.png' },
    { name: 'Atharvaveda Forest', url: '/bg-atharva.png' },
    { name: 'Samaveda Harmonics', url: '/bg-sama.png' },
    { name: 'Yajurveda Flame', url: '/bg-yajur.png' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <SettingsIcon size={13} />
          <span>Sanctum Controls</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 8px' }}>
          Settings & Customization
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Audio Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Volume2 size={20} style={{ color: '#FFE259' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', margin: 0, fontSize: '1.2rem' }}>
              Sonic Soundscape
            </h3>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 20px' }}>
            Procedural 432Hz Tibetan singing bowl feedback on interactions.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#E2E8F0', fontSize: '0.95rem' }}>Sacred Sound Effects</span>
            <button 
              className={`cyber-btn ${soundEnabled ? 'cyber-btn-gold' : ''}`}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              onClick={() => {
                toggleSound();
                sounds.enabled = !soundEnabled;
                if (!soundEnabled) sounds.playUnlockChime();
              }}
            >
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Backdrop Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield size={20} style={{ color: '#FFE259' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', margin: 0, fontSize: '1.2rem' }}>
              Veda Background
            </h3>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 20px' }}>
            Select the cosmological visual backdrop for your sanctuary.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {backgrounds.map(bg => (
              <button
                key={bg.url}
                className={`cyber-btn ${vedaBg === bg.url ? 'cyber-btn-gold' : ''}`}
                style={{ padding: '10px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
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

        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <User size={20} style={{ color: '#FFE259' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', margin: 0, fontSize: '1.2rem' }}>
              Seeker Identity
            </h3>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 20px' }}>
            Active session credentials and account status.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#94A3B8' }}>Username:</span>
              <strong style={{ color: '#FFF' }}>{user?.username || 'Seeker'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#94A3B8' }}>Role:</span>
              <span className="badge gold">{user?.role || 'Seeker'}</span>
            </div>
          </div>

          <button 
            className="cyber-btn"
            style={{ width: '100%', padding: '10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
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
