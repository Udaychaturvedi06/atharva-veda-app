import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Eye,
  User,
  Download,
  AlertTriangle,
  LogOut,
  Sparkles,
  Check,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Modal } from '../components/ui/Modal';

export const Settings = () => {
  const { user, logout } = useAuth();

  // Zustand Store Integration
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const getRank = useGameStore((state) => state.getRank);
  const currentRank = getRank();
  const rp = useGameStore((state) => state.rp);
  const streak = useGameStore((state) => state.streak);

  // Local Settings States
  const [sfxVolume, setSfxVolume] = useState(80);
  const [droneVolume, setDroneVolume] = useState(65);
  const [particleDensity, setParticleDensity] = useState('medium'); // 'low', 'medium', 'high'
  const [reducedMotion, setReducedMotion] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  // Danger Zone Double-Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmStep, setResetConfirmStep] = useState(1);
  const [resetFeedback, setResetFeedback] = useState(false);

  // Toggle Dark/Light Theme
  const handleToggleTheme = (mode) => {
    sounds.playTibetanBowl();
    setThemeMode(mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  // Test Chime Sound
  const handleTestChime = () => {
    sounds.playTibetanBowl();
  };

  // Export Progress JSON Snapshot
  const handleExportProgress = () => {
    sounds.playUnlockChime();
    const storeState = useGameStore.getState();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(storeState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `atharva_sanctum_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Confirm Reset Progress
  const handleConfirmReset = () => {
    if (resetConfirmStep === 1) {
      sounds.playCombatHit(false);
      setResetConfirmStep(2);
      return;
    }

    // Step 2 Executed: Clear Local Storage
    sounds.playCombatHit(false);
    localStorage.removeItem('sutra-game-store');
    setIsResetModalOpen(false);
    setResetConfirmStep(1);
    setResetFeedback(true);

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
          <SettingsIcon size={16} />
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Sanctum Control Room
          </span>
        </div>
        <h1 className="settings-title">Sanctum Settings & Customization</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Calibrate audio acoustic harmonics, sacred visual geometries, and soul identity credentials.
        </p>
      </div>

      <div className="settings-grid">
        {/* ===================================================================
            SECTION 1: AUDIO HARMONICS
            =================================================================== */}
        <GlassCard spotlight className="settings-group-card">
          <div className="settings-group-header">
            <div className="settings-group-icon">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="settings-group-title">Acoustic Soundscapes</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>432Hz Procedural Audio Synthesis</span>
            </div>
          </div>

          {/* Master Sound Toggle */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Master Audio Resonance</span>
              <span className="settings-row-desc">Enable or mute all sacred chimes and tones</span>
            </div>
            <Button
              variant={soundEnabled ? 'primary' : 'ghost'}
              icon={soundEnabled ? Volume2 : VolumeX}
              onClick={() => {
                toggleSound();
                sounds.enabled = !soundEnabled;
                if (!soundEnabled) sounds.playUnlockChime();
              }}
            >
              {soundEnabled ? 'Resonating' : 'Muted'}
            </Button>
          </div>

          {/* SFX Volume Slider */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Sacred SFX Gain</span>
              <span className="settings-row-desc">{sfxVolume}% Harmonics</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(Number(e.target.value))}
              className="settings-slider"
            />
          </div>

          {/* Chanting Drone Volume Slider */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Drone Vibrations</span>
              <span className="settings-row-desc">{droneVolume}% Continuous Hum</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={droneVolume}
              onChange={(e) => setDroneVolume(Number(e.target.value))}
              className="settings-slider"
            />
          </div>

          {/* Root Note Sa Selector */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Root Frequency (Sa)</span>
              <span className="settings-row-desc">All synthesizers retune to this tonic</span>
            </div>
            <div className="settings-btn-group">
              {[
                { label: 'C3 (130Hz)', freq: 130.81 },
                { label: 'D3 (146Hz)', freq: 146.83 },
                { label: 'E3 (164Hz)', freq: 164.81 }
              ].map((note) => (
                <button
                  key={note.label}
                  type="button"
                  className="settings-segmented-btn"
                  onClick={() => {
                    sounds.setRootSa(note.freq);
                    sounds.playSuccess();
                  }}
                >
                  {note.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test Chime Button */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Button
              variant="cyber"
              icon={Bell}
              onClick={handleTestChime}
            >
              Test Tibetan Bowl Chime
            </Button>
          </div>
        </GlassCard>

        {/* ===================================================================
            SECTION 2: VISUALS & SACRED GEOMETRY
            =================================================================== */}
        <GlassCard spotlight className="settings-group-card">
          <div className="settings-group-header">
            <div className="settings-group-icon">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="settings-group-title">Visual Geometries</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Renderer & Particle Parameters</span>
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Sanctum Color Theme</span>
              <span className="settings-row-desc">Cyber-Vedic Indigo or Warm Parchment</span>
            </div>
            <div className="settings-btn-group">
              <button
                type="button"
                className={`settings-segmented-btn ${themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => handleToggleTheme('dark')}
              >
                <Moon size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Indigo
              </button>
              <button
                type="button"
                className={`settings-segmented-btn ${themeMode === 'light' ? 'active' : ''}`}
                onClick={() => handleToggleTheme('light')}
              >
                <Sun size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Parchment
              </button>
            </div>
          </div>

          {/* Particle Density */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">3D Ember Density</span>
              <span className="settings-row-desc">Instanced GPU Ember Particle Count</span>
            </div>
            <div className="settings-btn-group">
              {['low', 'medium', 'high'].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`settings-segmented-btn ${particleDensity === d ? 'active' : ''}`}
                  onClick={() => {
                    sounds.playTibetanBowl();
                    setParticleDensity(d);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion */}
          <div className="settings-row">
            <div className="settings-row-label-wrap">
              <span className="settings-row-label">Reduce Motion</span>
              <span className="settings-row-desc">Disable camera tilt & particle drift</span>
            </div>
            <Button
              variant={reducedMotion ? 'primary' : 'ghost'}
              onClick={() => {
                sounds.playTibetanBowl();
                setReducedMotion(!reducedMotion);
              }}
            >
              {reducedMotion ? 'Enabled' : 'Off'}
            </Button>
          </div>
        </GlassCard>

        {/* ===================================================================
            SECTION 3: SOUL PROFILE & EXPORT
            =================================================================== */}
        <GlassCard spotlight className="settings-group-card">
          <div className="settings-group-header">
            <div className="settings-group-icon">
              <User size={20} />
            </div>
            <div>
              <h3 className="settings-group-title">Soul Identity</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Session & Progress Export</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Seeker Moniker:</span>
              <strong style={{ color: '#FFF' }}>{user?.username || 'Arya_Seeker'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Soul Rank:</span>
              <Chip variant="gold" icon={Sparkles}>
                {currentRank.title} ({currentRank.tier})
              </Chip>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Radiance Points:</span>
              <span style={{ color: 'var(--gold-bright)', fontFamily: 'var(--font-hud)', fontWeight: 700 }}>
                {rp.toLocaleString()} RP
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Tapasya Streak:</span>
              <span style={{ color: 'var(--saffron)', fontWeight: 600 }}>{streak} Days</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Button
              variant="cyber"
              icon={Download}
              onClick={handleExportProgress}
            >
              Export Soul Progress JSON
            </Button>
            <Button
              variant="ghost"
              icon={LogOut}
              onClick={() => {
                sounds.playCombatHit(false);
                logout();
              }}
            >
              End Session
            </Button>
          </div>
        </GlassCard>

        {/* ===================================================================
            SECTION 4: DANGER ZONE
            =================================================================== */}
        <GlassCard spotlight className="settings-group-card" style={{ borderColor: 'rgba(255, 77, 109, 0.3)' }}>
          <div className="settings-group-header">
            <div className="settings-group-icon danger">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="settings-group-title" style={{ color: 'var(--danger)' }}>
                Danger Zone
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Irreversible Progress Operations</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            Resetting soul progress purges all accumulated Radiance Points, unlocked relics, streak records,
            and Arishadvarga campaign battle conquests.
          </p>

          <Button
            variant="danger"
            icon={AlertTriangle}
            onClick={() => {
              sounds.playCombatHit(false);
              setResetConfirmStep(1);
              setIsResetModalOpen(true);
            }}
          >
            Reset Spiritual Progress
          </Button>

          {resetFeedback && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              Spiritual slate purified. Re-entering sanctuary...
            </div>
          )}
        </GlassCard>
      </div>

      {/* Double Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetConfirmStep(1);
        }}
        title="Confirm Spiritual Reset"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '14px' }} />

          <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', margin: '0 0 10px' }}>
            {resetConfirmStep === 1
              ? 'Are you certain you wish to purge your progress?'
              : 'Final Warning: All soul relics and RP will be erased forever!'}
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
            {resetConfirmStep === 1
              ? 'This action cannot be undone. You will return to the threshold of Jijnasu (0 RP).'
              : 'Click below to confirm complete erasure of your persistent sanctum storage.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmStep(1);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={AlertTriangle}
              onClick={handleConfirmReset}
            >
              {resetConfirmStep === 1 ? 'Proceed to Confirmation' : 'Confirm Complete Purge'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
