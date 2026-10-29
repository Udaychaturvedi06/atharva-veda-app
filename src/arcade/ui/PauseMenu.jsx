import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PauseMenu = ({ onResume, onRestart }) => {
  const navigate = useNavigate();

  return (
    <div className="countdown-overlay">
      <div style={{ textAlign: 'center', width: '320px', padding: '32px', background: 'rgba(10, 10, 18, 0.95)', border: '1px solid var(--glass-border-gold)', borderRadius: 'var(--radius-md)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.6rem', margin: '0 0 20px' }}>
          Game Paused
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            variant="primary"
            icon={Play}
            onClick={onResume}
          >
            Resume Game
          </Button>

          <Button
            variant="cyber"
            icon={RotateCcw}
            onClick={onRestart}
          >
            Restart
          </Button>

          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/arcade')}
          >
            Quit to Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
