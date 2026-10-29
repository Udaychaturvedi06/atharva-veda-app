import React from 'react';
import { GlassCard, Button, SectionHeading, Chip } from '../components/ui';
import { Gamepad2, Flame, Shield, Zap, Sparkles } from 'lucide-react';

const ARCADE_GAMES = [
  {
    id: 'agni-strike',
    title: 'Agni Strike',
    subtitle: 'Shoot-Em-Up',
    desc: 'Purify the descending Arishadvarga illusions with charged mantra beams.',
    glyph: '🔥',
    badge: 'Shooter'
  },
  {
    id: 'mantra-runner',
    title: 'Mantra Runner',
    subtitle: 'Endless Temple Run',
    desc: 'Traverse sacred forests and cosmic temples, clearing Vedic trivia gates.',
    glyph: '🏃',
    badge: 'Runner'
  },
  {
    id: 'chakra-breaker',
    title: 'Chakra Breaker',
    subtitle: 'Brick Breaker',
    desc: 'Shatter dense obstacle bricks across 7 chakras using the glowing bindu.',
    glyph: '🌀',
    badge: 'Arcade'
  },
  {
    id: 'naga-coil',
    title: 'Naga Coil',
    subtitle: 'Snake of Wisdom',
    desc: 'Guide the sacred kundalini serpent through offering bhogs and amrit.',
    glyph: '🐍',
    badge: 'Classic'
  },
  {
    id: 'om-beat',
    title: 'Om Beat',
    subtitle: 'Chant Rhythm',
    desc: 'Strike 4-lane cadences in sync with authentic Gayatri and Vedic meters.',
    glyph: '🥁',
    badge: 'Rhythm'
  },
  {
    id: 'memory-mandala',
    title: 'Memory Mandala',
    subtitle: 'Card Matching',
    desc: 'Uncover and pair ancient Sanskrit root words with their philosophical essences.',
    glyph: '🃏',
    badge: 'Puzzle'
  }
];

export const Arcade = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <SectionHeading
        title="Vedic Arcade Sanctum"
        subtitle="Step into interactive sacred gaming modules designed to hone focus, reflexes, and memory."
        icon={Gamepad2}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {ARCADE_GAMES.map((game) => (
          <GlassCard key={game.id} tilt spotlight style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.4rem' }}>{game.glyph}</span>
                <Chip variant="gold">{game.badge}</Chip>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.3rem', margin: '0 0 4px' }}>
                {game.title}
              </h3>
              <p style={{ color: 'var(--gold-bright)', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 12px' }}>
                {game.subtitle}
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {game.desc}
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <Button variant="cyber" style={{ width: '100%' }}>
                Enter Game Chamber
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Arcade;
