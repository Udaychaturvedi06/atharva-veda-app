import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../../utils/soundEngine';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ArcadeCabinet = ({
  title,
  glyph = '🕹️',
  children,
  isPaused,
  onTogglePause,
  onRestart
}) => {
  const navigate = useNavigate();
  const [scanlines, setScanlines] = useState(true);
  const [soundActive, setSoundActive] = useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !soundActive;
    setSoundActive(!soundActive);
    if (!soundActive) sounds.playUnlockChime();
  };

  return (
    <div className="arcade-cabinet-frame">
      {/* Neon Marquee Header */}
      <div className="arcade-marquee-header">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => {
            sounds.playTibetanBowl();
            navigate('/arcade');
          }}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          Arcade Hub
        </Button>

        <div className="arcade-marquee-title">
          <span>{glyph}</span>
          <span>{title.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onRestart && (
            <button
              type="button"
              className="hud-icon-btn"
              title="Restart Game"
              onClick={onRestart}
            >
              <RotateCcw size={16} />
            </button>
          )}

          {onTogglePause && (
            <button
              type="button"
              className="hud-icon-btn"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              onClick={onTogglePause}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}

          <button
            type="button"
            className="hud-icon-btn"
            title={scanlines ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
            onClick={() => setScanlines(!scanlines)}
          >
            <Tv size={16} style={{ color: scanlines ? 'var(--cyan)' : 'var(--text-muted)' }} />
          </button>

          <button
            type="button"
            className="hud-icon-btn"
            title={soundActive ? 'Mute SFX' : 'Enable SFX'}
            onClick={toggleSound}
          >
            {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Screen Viewport with optional CRT Scanlines & Vignette */}
      <div className="arcade-crt-screen-wrap">
        {scanlines && <div className="arcade-scanlines-layer" />}
        <div className="arcade-crt-vignette" />
        {children}
      </div>
    </div>
  );
};

export default ArcadeCabinet;
