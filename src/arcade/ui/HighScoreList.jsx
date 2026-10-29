import React from 'react';
import { Trophy } from 'lucide-react';

export const HighScoreList = ({ gameId }) => {
  const bestScore = parseInt(localStorage.getItem(`sutra_highscore_${gameId}`) || '0', 10);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold-bright)', fontSize: '0.85rem', fontFamily: 'var(--font-hud)' }}>
      <Trophy size={14} />
      <span>Best: {bestScore.toLocaleString()}</span>
    </div>
  );
};

export default HighScoreList;
