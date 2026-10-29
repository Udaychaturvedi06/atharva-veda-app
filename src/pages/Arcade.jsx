import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Chip } from '../components/ui/Chip';
import HighScoreList from '../arcade/ui/HighScoreList';
import { Gamepad2, ArrowRight } from 'lucide-react';

// Game Modules
import AgniStrikeModule from '../arcade/games/AgniStrike';
import MantraRunnerModule from '../arcade/games/MantraRunner';
import ChakraBreakerModule from '../arcade/games/ChakraBreaker';
import NagaCoilModule from '../arcade/games/NagaCoil';
import OmBeatModule from '../arcade/games/OmBeat';
import MemoryMandalaModule from '../arcade/games/MemoryMandala';

export const ALL_GAMES = [
  AgniStrikeModule,
  MantraRunnerModule,
  ChakraBreakerModule,
  NagaCoilModule,
  OmBeatModule,
  MemoryMandalaModule
];

export const Arcade = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  // If gameId is present in route, render the selected Game Chamber
  if (gameId) {
    const activeModule = ALL_GAMES.find((g) => g.id === gameId);

    if (activeModule) {
      const GameComponent = activeModule.Component;
      return (
        <div style={{ padding: '10px 0' }}>
          <GameComponent />
        </div>
      );
    }
  }

  // Otherwise, render the Arcade Hub Sanctum
  return (
    <div className="arcade-hub-container">
      <SectionHeading
        title="Vedic Arcade Sanctum"
        subtitle="Hone sharp reflexes, mental concentration, and Sanskrit memory through 60 FPS sacred arcade simulations."
        icon={Gamepad2}
      />

      <div className="arcade-hub-grid">
        {ALL_GAMES.map((game) => (
          <GlassCard
            key={game.id}
            tilt
            spotlight
            className="arcade-hub-card"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="arcade-hub-glyph">{game.glyph}</span>
                <HighScoreList gameId={game.id} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.4rem', margin: '0 0 6px' }}>
                {game.title}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                {game.controls}
              </p>
            </div>

            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => {
                sounds.playUnlockChime();
                navigate(`/arcade/${game.id}`);
              }}
            >
              Enter Game Chamber
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Arcade;
