import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, Crown, Sparkles, Flame } from 'lucide-react';

const MOCK_LEADERS = [
  { rank: 1, name: 'Vasishta_Cosmic', title: 'Brahmarshi', rp: 16840, streak: 42, badge: '🌟' },
  { rank: 2, name: 'Arya_Agni33', title: 'Maharshi', rp: 9420, streak: 28, badge: '⚡' },
  { rank: 3, name: 'Soma_Chanter', title: 'Rishi', rp: 4890, streak: 19, badge: '🌙' },
  { rank: 4, name: 'Vidya_Pravin', title: 'Upadhyaya', rp: 2450, streak: 14, badge: '📜' },
  { rank: 5, name: 'Ananda_Seeker', title: 'Sadhaka', rp: 1210, streak: 9, badge: '📿' },
];

const Rankings = ({ playerRp }) => {
  const getRank = useGameStore(state => state.getRank);
  const currentRank = getRank();
  const streak = useGameStore(state => state.streak);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <Trophy size={13} />
          <span>Hall of Sages</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 8px' }}>
          Astral Leaderboards
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
          Seekers ascending the hierarchy of Tapasya across all four Vedic dimensions.
        </p>
      </div>

      {/* User Standing Spotlight */}
      <div className="glass-panel" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'radial-gradient(ellipse at center left, rgba(212,175,55,0.1) 0%, rgba(19,17,28,0.8) 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Crown size={32} style={{ color: '#FFE259' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#FFE259', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Spiritual Standing
            </span>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#FFF', margin: '4px 0 0' }}>
              {currentRank.title} ({currentRank.tier})
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: '#FFE259', padding: '8px 16px' }}>
            <Sparkles size={14} />
            <span>{playerRp} RP</span>
          </div>
          <div className="badge" style={{ background: 'rgba(255,94,30,0.1)', color: '#FF7B00', padding: '8px 16px' }}>
            <Flame size={14} />
            <span>{streak}d Streak</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94A3B8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 16px' }}>Rank</th>
              <th style={{ padding: '12px 16px' }}>Seeker</th>
              <th style={{ padding: '12px 16px' }}>Vedic Title</th>
              <th style={{ padding: '12px 16px' }}>Streak</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Radiance (RP)</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERS.map((leader) => (
              <tr 
                key={leader.rank}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
              >
                <td style={{ padding: '16px', fontWeight: 700, color: leader.rank <= 3 ? '#FFE259' : '#94A3B8' }}>
                  {leader.rank === 1 && '🥇 #1'}
                  {leader.rank === 2 && '🥈 #2'}
                  {leader.rank === 3 && '🥉 #3'}
                  {leader.rank > 3 && `#${leader.rank}`}
                </td>
                <td style={{ padding: '16px', color: '#FFF', fontWeight: 600 }}>
                  <span style={{ marginRight: '8px' }}>{leader.badge}</span>
                  <span>{leader.name}</span>
                </td>
                <td style={{ padding: '16px', color: '#CBD5E1' }}>{leader.title}</td>
                <td style={{ padding: '16px', color: '#FF7B00', fontWeight: 600 }}>{leader.streak}d</td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#FFE259' }}>
                  {leader.rp.toLocaleString()} RP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rankings;
