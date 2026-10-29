import React, { useRef, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useSutraAnchor } from '../systems/sutraContext';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { Flame, Heart, Zap, Sparkles, Volume2, Sun, Moon, Wind } from 'lucide-react';

export const DevPlayground = () => {
  const anchor1Ref = useRef(null);
  const anchor2Ref = useRef(null);
  const anchor3Ref = useRef(null);

  useSutraAnchor('playground-1', anchor1Ref);
  useSutraAnchor('playground-2', anchor2Ref);
  useSutraAnchor('playground-3', anchor3Ref);

  const { hp, prana, streak, takeDamage, heal, restorePrana, consumePrana } = useGameStore();
  const [rootFreq, setRootFreq] = useState(146.83);

  const handleTuneSa = (freq) => {
    setRootFreq(freq);
    sounds.setRootSa(freq);
    sounds.playTap();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Chip label="Developer Laboratory" variant="gold" icon={<Sparkles size={14} />} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--gold-bright)', margin: '12px 0 6px' }}>
          V2 Creative North Star Playground
        </h1>
        <p style={{ color: 'var(--text-1)', maxWidth: 600, margin: '0 auto' }}>
          Interactive verification suite for the 5 signature Vedic systems: The Sutra Thread, Breath Sync, Living Light, State-Reactive UI, and Tuned Sound Synthesis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* System 1: Sutra Thread */}
        <div ref={anchor1Ref}>
          <GlassCard elevation={2} style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} /> 1. Sutra Thread
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>
              This card is registered as an anchor. Notice the luminous golden thread threading directly through it.
            </p>
            <div style={{ marginTop: 16 }}>
              <Chip label="Anchor #1 (playground-1)" variant="gold" />
            </div>
          </GlassCard>
        </div>

        {/* System 2: Breath Sync */}
        <div ref={anchor2Ref}>
          <GlassCard elevation={2} style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--soma)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wind size={18} /> 2. Breath Sync (Pranayama)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>
              Driven by an 8s continuous rAF clock setting CSS var <code>--breath</code>. Watch this diaphragm scale in sync with cosmic breath.
            </p>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--soma) 0%, transparent 70%)',
                border: '2px solid var(--soma)',
                margin: '20px auto 10px',
                transform: 'scale(calc(0.85 + 0.3 * var(--breath, 0.5)))',
                transition: 'transform 0.1s linear',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#fff'
              }}
            >
              Breath
            </div>
          </GlassCard>
        </div>

        {/* System 3: State-Reactive UI */}
        <div ref={anchor3Ref}>
          <GlassCard elevation={2} style={{ padding: 24 }}>
            <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={18} /> 3. State-Reactive UI
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>
              Test how low HP (&lt;25) causes red vignette & thread flicker, while high Prana (&gt;80) hums bright cyan.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <Button size="sm" variant="danger" onClick={() => takeDamage(30)}>Damage (-30 HP)</Button>
              <Button size="sm" variant="primary" onClick={() => heal(30)}>Heal (+30 HP)</Button>
              <Button size="sm" variant="ghost" onClick={() => consumePrana(20)}>Use Prana (-20)</Button>
              <Button size="sm" variant="ghost" onClick={() => restorePrana(25)}>Restore Prana (+25)</Button>
            </div>
            <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-2)' }}>
              Current: HP={hp} | Prana={prana} | Streak={streak}
            </div>
          </GlassCard>
        </div>

        {/* System 4: Tuned Sound Synthesizer */}
        <GlassCard elevation={2} style={{ padding: 24 }}>
          <h3 style={{ color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={18} /> 4. Tuned WebAudio Synth
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>
            All interaction sounds tuned to root frequency Sa: <strong>{rootFreq} Hz</strong>.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
            <Button size="sm" variant={rootFreq === 130.81 ? 'primary' : 'ghost'} onClick={() => handleTuneSa(130.81)}>C3 (130Hz)</Button>
            <Button size="sm" variant={rootFreq === 146.83 ? 'primary' : 'ghost'} onClick={() => handleTuneSa(146.83)}>D3 (146Hz)</Button>
            <Button size="sm" variant={rootFreq === 164.81 ? 'primary' : 'ghost'} onClick={() => handleTuneSa(164.81)}>E3 (164Hz)</Button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <Button size="sm" variant="ghost" onClick={() => sounds.playHover()}>Hover Bell</Button>
            <Button size="sm" variant="ghost" onClick={() => sounds.playTap()}>Woodblock Tap</Button>
            <Button size="sm" variant="primary" onClick={() => sounds.playSuccess()}>Sa-Ga-Pa Chord</Button>
            <Button size="sm" variant="danger" onClick={() => sounds.playError()}>Muted Gong</Button>
            <Button size="sm" variant="primary" onClick={() => sounds.playLevelUp()}>Tanpura Swell</Button>
          </div>
        </GlassCard>

        {/* System 5: Living Light Diurnal Cycle */}
        <GlassCard elevation={2} style={{ padding: 24 }}>
          <h3 style={{ color: 'var(--saffron)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sun size={18} /> 5. Living Light
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>
            Cycles through 5 Vedic diurnal Praharas based on local time. Preview color moods:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <Button size="sm" variant="ghost" onClick={() => {
              document.documentElement.style.setProperty('--light-glow', '#805AD5');
              document.documentElement.style.setProperty('--light-ambient', '#09081E');
            }}>Brahma-Muhurta</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              document.documentElement.style.setProperty('--light-glow', '#FF7B00');
              document.documentElement.style.setProperty('--light-ambient', '#180B07');
            }}>Sunrise (Ushas)</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              document.documentElement.style.setProperty('--light-glow', '#D4AF37');
              document.documentElement.style.setProperty('--light-ambient', '#0C0C14');
            }}>Zenith (Madhyahna)</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              document.documentElement.style.setProperty('--light-glow', '#FF4D6D');
              document.documentElement.style.setProperty('--light-ambient', '#1A070F');
            }}>Sandhya (Dusk)</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DevPlayground;
