import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { Flame, Shield, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';

const GameHUD = () => {
  const hp = useGameStore(state => state.hp);
  const maxHp = useGameStore(state => state.maxHp);
  const prana = useGameStore(state => state.prana);
  const maxPrana = useGameStore(state => state.maxPrana);
  const rp = useGameStore(state => state.rp);
  const streak = useGameStore(state => state.streak);
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const toggleSound = useGameStore(state => state.toggleSound);
  const getRank = useGameStore(state => state.getRank);
  const getNextRankThreshold = useGameStore(state => state.getNextRankThreshold);

  const rank = getRank();
  const nextThreshold = getNextRankThreshold();
  const prevThreshold = rank.threshold;
  const rankProgress = Math.min(
    100,
    Math.max(5, ((rp - prevThreshold) / (nextThreshold - prevThreshold || 1)) * 100)
  );

  const handleSoundToggle = () => {
    toggleSound();
    sounds.enabled = !soundEnabled;
    if (!soundEnabled) sounds.playUnlockChime();
  };

  return (
    <header className="game-hud-container">
      {/* Left: Player Vital Bars (HP & Prana) */}
      <div className="hud-vitals">
        <div className="hud-meter-wrap hp-meter" title={`Spiritual Fortitude: ${hp}/${maxHp}`}>
          <div className="meter-icon agni-glow">
            <Flame size={16} />
          </div>
          <div className="meter-track">
            <div 
              className="meter-fill hp-fill" 
              style={{ width: `${(hp / maxHp) * 100}%` }} 
            />
          </div>
          <span className="meter-val">{hp} HP</span>
        </div>

        <div className="hud-meter-wrap prana-meter" title={`Prana / Chanting Focus: ${prana}/${maxPrana}`}>
          <div className="meter-icon prana-glow">
            <Zap size={15} />
          </div>
          <div className="meter-track">
            <div 
              className="meter-fill prana-fill" 
              style={{ width: `${(prana / maxPrana) * 100}%` }} 
            />
          </div>
          <span className="meter-val">{prana} PR</span>
        </div>
      </div>

      {/* Center: Rank Badge & Tapasya Progress */}
      <div className="hud-center">
        <div className="rank-badge" style={{ borderColor: rank.color }}>
          <Sparkles size={14} color={rank.color} />
          <div className="rank-details">
            <span className="rank-tier" style={{ color: rank.color }}>{rank.tier}</span>
            <span className="rank-title">{rank.title}</span>
          </div>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: `${rankProgress}%` }} />
          <span className="xp-label">{rp} / {nextThreshold} RP</span>
        </div>
      </div>

      {/* Right: Streak & Controls */}
      <div className="hud-actions">
        <div className="streak-pill" title={`${streak} Day Tapasya Meditation Streak`}>
          <Flame size={16} className="streak-flame" />
          <span className="streak-count">{streak}d</span>
        </div>

        <button 
          className="hud-icon-btn" 
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Mute Sacred Soundscapes' : 'Enable Sacred Soundscapes'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </header>
  );
};

export default GameHUD;
