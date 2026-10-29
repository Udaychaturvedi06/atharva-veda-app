import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../../utils/soundEngine';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, RotateCcw, ArrowLeft, Sparkles, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

export const GameOver = ({ gameId, score, onRestart }) => {
  const navigate = useNavigate();
  const awardArcade = useGameStore((state) => state.awardArcade);
  const [earnedRp, setEarnedRp] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);

  useEffect(() => {
    sounds.playCombatHit(false);
    const rp = awardArcade(gameId, score);
    setEarnedRp(rp);

    // Save High Score
    const storageKey = `sutra_highscore_${gameId}`;
    const prevBest = parseInt(localStorage.getItem(storageKey) || '0', 10);
    if (score > prevBest) {
      localStorage.setItem(storageKey, score.toString());
      setIsHighScore(true);
      sounds.playUnlockChime();
    }
  }, [gameId, score, awardArcade]);

  return (
    <div className="countdown-overlay">
      <div style={{ textAlign: 'center', maxWidth: '380px', padding: '32px', background: 'rgba(10, 10, 18, 0.95)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-md)', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {isHighScore ? '🏆' : '💀'}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.8rem', margin: '0 0 6px' }}>
          {isHighScore ? 'New High Score!' : 'Ritual Concluded'}
        </h2>

        <div style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', color: 'var(--gold-bright)', margin: '12px 0' }}>
          {score.toLocaleString()} PTS
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <Chip variant="gold" icon={Sparkles}>
            +{earnedRp} RP Awarded
          </Chip>
          {score >= 3000 && (
            <Chip variant="cyber" icon={Award}>
              Relic Unlocked!
            </Chip>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="primary"
            icon={RotateCcw}
            onClick={onRestart}
          >
            Play Again
          </Button>

          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/arcade')}
          >
            Return to Arcade Sanctum
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
