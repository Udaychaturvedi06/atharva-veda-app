import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { Trophy, Crown, Sparkles, Flame, Swords, Shield, ChevronUp } from 'lucide-react';

const LOKAS = [
  { level: 7, name: 'Satya-loka', tier: 'Brahmarshi', threshold: '15,000+ RP', desc: 'Realm of Absolute Truth and Non-Duality', color: '#F6AD55' },
  { level: 6, name: 'Tapo-loka', tier: 'Maharshi', threshold: '7,000+ RP', desc: 'Realm of Transcendent Austerity & Fire', color: '#9F7AEA' },
  { level: 5, name: 'Jana-loka', tier: 'Rishi', threshold: '3,500+ RP', desc: 'Realm of Cosmic Visionaries and Hymn Seers', color: '#ED8936' },
  { level: 4, name: 'Mahar-loka', tier: 'Upadhyaya', threshold: '1,800+ RP', desc: 'Plane of Supreme Scholarship and Reflection', color: '#F6E05E' },
  { level: 3, name: 'Svar-loka', tier: 'Sadhaka', threshold: '750+ RP', desc: 'Celestial Heavens of Harmonic Melodies', color: '#63B3ED' },
  { level: 2, name: 'Bhuvar-loka', tier: 'Brahmachari', threshold: '250+ RP', desc: 'Intermediate Astral Ocean of Prana', color: '#4FD1C5' },
  { level: 1, name: 'Bhur-loka', tier: 'Jijnasu', threshold: '0+ RP', desc: 'Terrestrial Soil of the Humble Seeker', color: '#A0AEC0' }
];

const MOCK_LEADERS = [
  { rank: 1, name: 'Vasishta_Cosmic', loka: 'Satya-loka', title: 'Brahmarshi', rp: 16840, streak: 42, badge: '🌟' },
  { rank: 2, name: 'Arya_Agni33', loka: 'Tapo-loka', title: 'Maharshi', rp: 9420, streak: 28, badge: '⚡' },
  { rank: 3, name: 'Soma_Chanter', loka: 'Jana-loka', title: 'Rishi', rp: 4890, streak: 19, badge: '🌙' },
  { rank: 4, name: 'Vidya_Pravin', loka: 'Mahar-loka', title: 'Upadhyaya', rp: 2450, streak: 14, badge: '📜' },
  { rank: 5, name: 'Ananda_Seeker', loka: 'Svar-loka', title: 'Sadhaka', rp: 1210, streak: 9, badge: '📿' },
];

const Rankings = ({ playerRp }) => {
  const getRank = useGameStore(state => state.getRank);
  const currentRank = getRank();
  const streak = useGameStore(state => state.streak);
  const [challengedSeeker, setChallengedSeeker] = useState(null);

  const handleChallenge = (seeker) => {
    sounds.playCombatHit(true);
    setChallengedSeeker(seeker.name);
  };

  return (
    <div className="meru-spire-container">
      {/* Rankings Header */}
      <div className="rankings-header">
        <div className="rankings-badge">
          <Trophy size={16} className="gold-accent" />
          <span>MOUNT MERU • ASCENSION OF THE 7 LOKAS</span>
        </div>
        <h1>The Cosmic Ascension Spire</h1>
        <p className="rankings-sub">
          As you decipher sacred hymns and defeat internal enemies, your soul rises across the seven celestial planes of consciousness.
        </p>
      </div>

      {/* User Standing Spotlight */}
      <div className="user-leaderboard-banner">
        <div className="banner-left">
          <Crown size={28} className="crown-gold" />
          <div>
            <span className="user-tag">Your Current Loka Residence</span>
            <h3 className="user-rank-title">{currentRank.title} ({currentRank.tier})</h3>
          </div>
        </div>
        <div className="banner-right">
          <div className="stat-pill">
            <Sparkles size={16} className="gold-accent" />
            <span>{playerRp} RP</span>
          </div>
          <div className="stat-pill">
            <Flame size={16} className="flame-accent" />
            <span>{streak}d Tapasya</span>
          </div>
        </div>
      </div>

      {/* Challenge Alert */}
      {challengedSeeker && (
        <div className="combat-log-banner" style={{ borderLeftColor: '#FF5E1E' }}>
          <span>⚔️ <strong>Chant Duel Sent!</strong> You challenged <strong>{challengedSeeker}</strong> to a timed Decryption Shloka face-off.</span>
        </div>
      )}

      {/* Mount Meru 7 Lokas Progression Track */}
      <div>
        <div className="section-header">
          <ChevronUp size={18} className="gold-accent" />
          <h2>The Seven Lokas of Meru</h2>
        </div>

        <div className="spire-peaks-grid">
          {LOKAS.map((loka) => {
            const isUserHere = currentRank.tier.toLowerCase() === loka.tier.toLowerCase();
            return (
              <div 
                key={loka.level} 
                className={`peak-level-card ${isUserHere ? 'current' : ''}`}
                style={{ borderColor: isUserHere ? '#FFE259' : loka.color + '44' }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: loka.color, letterSpacing: '1px' }}>
                  LOKA 0{loka.level}
                </span>
                <h3 className="peak-loka-name">{loka.name}</h3>
                <span className="peak-threshold">{loka.threshold}</span>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '8px', lineHeight: '1.4' }}>
                  {loka.desc}
                </p>
                {isUserHere && (
                  <div style={{ marginTop: '12px', background: 'rgba(255, 226, 89, 0.2)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.7rem', color: '#FFE259', fontWeight: 800 }}>
                    📍 YOU ARE HERE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table with Duel Actions */}
      <div className="leaderboard-table-slate">
        <div className="table-header-row">
          <span className="col-rank">Pos</span>
          <span className="col-user">Seeker</span>
          <span className="col-title">Celestial Loka</span>
          <span className="col-streak">Streak</span>
          <span className="col-rp">Radiance (RP)</span>
          <span style={{ textAlign: 'right' }}>Duel</span>
        </div>

        {MOCK_LEADERS.map((leader) => (
          <div key={leader.rank} className={`table-item-row pos-${leader.rank}`}>
            <span className="col-rank">
              {leader.rank === 1 && <span className="rank-medal gold">🥇</span>}
              {leader.rank === 2 && <span className="rank-medal silver">🥈</span>}
              {leader.rank === 3 && <span className="rank-medal bronze">🥉</span>}
              {leader.rank > 3 && `#${leader.rank}`}
            </span>
            <span className="col-user">
              <span className="user-badge">{leader.badge}</span>
              <strong>{leader.name}</strong>
            </span>
            <span className="col-title">{leader.loka} ({leader.title})</span>
            <span className="col-streak">{leader.streak}d</span>
            <span className="col-rp">{leader.rp.toLocaleString()} RP</span>
            <span style={{ textAlign: 'right' }}>
              <button 
                className="rune-btn" 
                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => handleChallenge(leader)}
              >
                <Swords size={12} />
                <span>Challenge</span>
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rankings;
