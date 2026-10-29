import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEngine';
import { Award, ChevronRight, X } from 'lucide-react';

const RANKS = [
  { threshold: 0, title: 'Jijnasu', tier: 'Novice', color: '#A0AEC0', glyph: 'जि' },
  { threshold: 250, title: 'Brahmachari', tier: 'Adept', color: '#4FD1C5', glyph: 'ब्र' },
  { threshold: 750, title: 'Sadhaka', tier: 'Ascendant', color: '#63B3ED', glyph: 'सा' },
  { threshold: 1800, title: 'Upadhyaya', tier: 'Master', color: '#F6E05E', glyph: 'उ' },
  { threshold: 3500, title: 'Rishi', tier: 'Grandmaster', color: '#ED8936', glyph: 'ऋ' },
  { threshold: 7000, title: 'Maharshi', tier: 'Immortal', color: '#9F7AEA', glyph: 'म' },
  { threshold: 15000, title: 'Brahmarshi', tier: 'Transcendent', color: '#F6AD55', glyph: 'ॐ' }
];

export const RankMedallion = ({ rank, rp, nextThreshold }) => {
  const [showLadder, setShowLadder] = useState(false);

  // Find index of current rank
  const currentRankIdx = RANKS.findIndex((r) => r.title.startsWith(rank?.title?.split(' ')[0] || 'Jijnasu'));
  const safeIdx = currentRankIdx >= 0 ? currentRankIdx : 0;
  const currentRankObj = RANKS[safeIdx];

  // 7 arcs: each arc is 360 / 7 = ~51.4 degrees minus a 4 degree gap
  const numArcs = 7;
  const arcSpan = 360 / numArcs;
  const gap = 4;
  const radius = 20;
  const cx = 25;
  const cy = 25;

  const handleOpenLadder = () => {
    sounds.playTap();
    setShowLadder(true);
  };

  return (
    <>
      <button
        onClick={handleOpenLadder}
        onMouseEnter={() => sounds.playHover()}
        style={{
          width: 50,
          height: 50,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="View Rank Ladder"
      >
        <svg viewBox="0 0 50 50" style={{ width: 50, height: 50, overflow: 'visible' }}>
          {Array.from({ length: numArcs }).map((_, i) => {
            const startAngle = (i * arcSpan + gap / 2 - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * arcSpan - gap / 2 - 90) * (Math.PI / 180);

            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);

            const isAchieved = i <= safeIdx;
            const isCurrent = i === safeIdx;
            const arcColor = isAchieved ? RANKS[i].color : 'rgba(255,255,255,0.12)';

            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={arcColor}
                strokeWidth={isCurrent ? 3 : 2}
                strokeLinecap="round"
                style={{
                  filter: isCurrent ? `drop-shadow(0 0 4px ${arcColor})` : 'none',
                  opacity: isCurrent ? 'calc(0.7 + 0.3 * var(--breath, 0.5))' : 1,
                  transition: 'stroke 0.3s ease'
                }}
              />
            );
          })}
        </svg>

        {/* Center Glyph */}
        <span
          style={{
            position: 'absolute',
            fontFamily: 'var(--font-sanskrit)',
            fontSize: '1rem',
            fontWeight: 700,
            color: currentRankObj.color,
            textShadow: `0 0 8px ${currentRankObj.color}`
          }}
        >
          {currentRankObj.glyph}
        </span>
      </button>

      {/* Rank Ladder Bottom Sheet / Modal */}
      <AnimatePresence>
        {showLadder && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setShowLadder(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                background: 'rgba(16, 14, 26, 0.96)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="var(--gold-bright)" />
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontSize: '1.25rem' }}>
                    The 7 Sacred Seeker Ranks
                  </h3>
                </div>
                <button
                  onClick={() => setShowLadder(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(212,175,55,0.08)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                  Current RP: <strong>{rp}</strong> &bull; Next Elevation: <strong>{nextThreshold} RP</strong> ({nextThreshold - rp} RP remaining)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RANKS.map((r, idx) => {
                  const isCurrent = idx === safeIdx;
                  const isAchieved = idx <= safeIdx;
                  return (
                    <div
                      key={r.title}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: isCurrent ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isCurrent ? `1px solid ${r.color}` : '1px solid rgba(255,255,255,0.05)',
                        opacity: isAchieved ? 1 : 0.45
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-sanskrit)',
                            fontSize: '1.2rem',
                            color: r.color,
                            fontWeight: 700,
                            width: 24,
                            textAlign: 'center'
                          }}
                        >
                          {r.glyph}
                        </span>
                        <div>
                          <div style={{ color: isCurrent ? '#fff' : 'var(--text-1)', fontWeight: isCurrent ? 700 : 500 }}>
                            {r.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                            {r.tier} Tier &bull; Requires {r.threshold} RP
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <span style={{ fontSize: '0.75rem', background: r.color, color: '#000', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RankMedallion;
