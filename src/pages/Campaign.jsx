import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Award,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Clock,
  Compass
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';

// All 6 Canonical Arishadvarga Inner Trials
const ALL_TRIALS = [
  {
    id: 'trial-1',
    name: 'Trial of Kāma (Untamed Craving)',
    demon: 'The Asura of Unquenchable Desire',
    glyph: 'काम',
    bossHp: 150,
    color: '#FF4D6D',
    lore: 'Kāma binds the senses to fleeting mirages. Counter with the Atharva truth of inner fullness (Purnata).',
    riddles: [
      {
        prompt: 'The illusion whispers: "Without external objects, you remain incomplete." What Vedic truth dispels this?',
        options: [
          'The Self (Atman) is already complete, full, and infinite (Purnamadah Purnamidam).',
          'Amass more sensory possessions to silence the yearning mind.',
          'Surrender willpower to temporary sensory impulses.',
          'Fall into spiritual numbness.'
        ],
        correct: 0,
        damage: 40
      },
      {
        prompt: 'Which sacred element is invoked in the Atharvaveda to purify unaligned burning desires?',
        options: [
          'Vayu (The untamed hurricane)',
          'Pavitram Agni (The discriminating sacred flame of clarity)',
          'Tamoguna (The darkness of ignorance)',
          'Maya (The web of deceit)'
        ],
        correct: 1,
        damage: 40
      },
      {
        prompt: 'In Atharvaveda 9.2 (Kama Sukta), what is the first seed born in the cosmos?',
        options: [
          'Primal Divine Aspiration towards Supreme Truth',
          'Hatred and division',
          'Mechanical matter',
          'Sorrow'
        ],
        correct: 0,
        damage: 40
      },
      {
        prompt: 'How does Viveka (spiritual discernment) transform desire?',
        options: [
          'Redirects the fire of desire toward liberation rather than fleeting sensations',
          'Suppresses all thoughts until explosion',
          'Denies reality completely',
          'Indulges in all desires simultaneously'
        ],
        correct: 0,
        damage: 40
      }
    ]
  },
  {
    id: 'trial-2',
    name: 'Trial of Krodha (Blinding Wrath)',
    demon: 'The Asura of Fury & Discord',
    glyph: 'क्रोध',
    bossHp: 160,
    color: '#FF7B00',
    lore: 'Anger burns the vessel that holds it. Counter with the cooling soma of Shanti (equanimity).',
    riddles: [
      {
        prompt: 'When wrath surges like wild fire, what does the Rigveda invoke for divine equilibrium?',
        options: [
          'Vengeance with greater force',
          'Shanti (Cosmic peace and equanimity across earth and sky)',
          'Complete isolation in darkness',
          'Unchecked shouting of battle cries'
        ],
        correct: 1,
        damage: 40
      },
      {
        prompt: 'What happens to the seeker’s intellect (Buddhi) when Wrath takes command?',
        options: [
          'It is sharpened to perfection',
          'It is clouded and destroyed, plunging memory into oblivion',
          'It gains supernatural perception',
          'It connects directly to Indra'
        ],
        correct: 1,
        damage: 40
      },
      {
        prompt: 'Atharva seers teach that anger is suppressed energy. How is it alchemized into spiritual power?',
        options: [
          'Through disciplined Tapasya and focused meditation',
          'By striking bystanders',
          'By harboring bitter resentment',
          'By loud wailing'
        ],
        correct: 0,
        damage: 40
      },
      {
        prompt: 'Which Vedic prayer from the Samaveda harmonizes a discordant, angry heart?',
        options: [
          'Maha-Namni chants of supreme sonic resonance',
          'Curses against enemies',
          'Silent condemnation',
          'Frenzied screams'
        ],
        correct: 0,
        damage: 40
      }
    ]
  },
  {
    id: 'trial-3',
    name: 'Trial of Lobha (Insatiable Greed)',
    demon: 'The Serpent of Covetousness',
    glyph: 'लोभ',
    bossHp: 170,
    color: '#FFE259',
    lore: 'Greed believes abundance lies in hoarding. Counter with Santosha and the Vedic art of selfless Dana.',
    riddles: [
      {
        prompt: 'In Rigveda 10.117, what is said of one who hoards food and eats alone?',
        options: [
          'He eats only sin and eats his own destruction',
          'He is wise and secure',
          'He attains immortality',
          'He pleases the gods'
        ],
        correct: 0,
        damage: 45
      },
      {
        prompt: 'Which Vedic virtue is the eternal antidote to insatiable acquisitiveness?',
        options: [
          'Santosha (Contentment in the boundless wealth of the Self)',
          'Amassing greater hoards',
          'Envy of neighbors',
          'Excessive taxation'
        ],
        correct: 0,
        damage: 45
      },
      {
        prompt: 'The first verse of Isha Upanishad proclaims: "Tena tyaktena bhunjitha". What does this instruct?',
        options: [
          'Renounce and enjoy; covet not anyone’s wealth',
          'Conquer and hoard without mercy',
          'Flee to a mountain cave',
          'Destroy all goods'
        ],
        correct: 0,
        damage: 45
      },
      {
        prompt: 'In Atharvaveda economics, what is the role of wealth (Artha)?',
        options: [
          'To be circulated like cosmic rain for the welfare of all beings',
          'To be buried underground',
          'To create dynasties of tyranny',
          'To be burned in waste'
        ],
        correct: 0,
        damage: 45
      }
    ]
  },
  {
    id: 'trial-4',
    name: 'Trial of Moha (Deep Delusion)',
    demon: 'The Weaver of the Veil of Maya',
    glyph: 'मोह',
    bossHp: 180,
    color: '#63B3ED',
    lore: 'Mistaking the transient mortal body for the eternal witness is the root of grief.',
    riddles: [
      {
        prompt: 'What is the solar light that disperses the mist of delusion in the Gayatri mantra?',
        options: [
          'Savita’s divine radiant splendor illuminating our intellect',
          'The glow of moonlight alone',
          'Blind belief without investigation',
          'Strict physical postures alone'
        ],
        correct: 0,
        damage: 45
      },
      {
        prompt: 'The Atharva Veda says Earth is our Mother. In contrast, what delusion does Moha sow?',
        options: [
          'That nature is sacred and animate',
          'That humanity is separate and entitled to exploit existence ruthlessly',
          'That all beings share one life breath',
          'That seasons are holy cycles'
        ],
        correct: 1,
        damage: 45
      },
      {
        prompt: 'What remains unaffected when Maya’s illusions dissolve?',
        options: [
          'The eternal, luminous witness consciousness (Atman)',
          'Physical titles and certificates',
          'Material possessions',
          'Fears of loss'
        ],
        correct: 0,
        damage: 45
      },
      {
        prompt: 'Which Upanishadic prayer dispels Moha: "Asato ma..."?',
        options: [
          'Lead me from untruth to truth, darkness to light, death to immortality',
          'Give me victory in combat',
          'Make me wealthy in livestock',
          'Shield me from cold winds'
        ],
        correct: 0,
        damage: 45
      }
    ]
  },
  {
    id: 'trial-5',
    name: 'Trial of Mada (Egoic Arrogance & Hubris)',
    demon: 'The Colossus of Vanity',
    glyph: 'मद',
    bossHp: 190,
    color: '#9F7AEA',
    lore: 'Pride inflates the finite persona into a false god. Counter with Vinaya (humility) before the infinite cosmos.',
    riddles: [
      {
        prompt: 'When Indra in the Kena Upanishad believed he won victory by his own power, what happened?',
        options: [
          'Brahman appeared as an enigmatic Yaksha, and Indra could not move a single blade of grass',
          'He was crowned supreme forever',
          'The demons surrendered immediately',
          'The oceans dried up'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'What is the true nature of individual ego (Ahamkara) in Vedic philosophy?',
        options: [
          'A transient instrument of consciousness, not the ultimate Lord',
          'The supreme center of all galaxies',
          'An infallible master',
          'The only thing that exists'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'Which attitude disarms Mada in the company of other seekers?',
        options: [
          'Namrata (Reverence for the divine presence within all beings)',
          'Loud boasting of achievements',
          'Display of expensive robes',
          'Interrupting spiritual discourses'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'Atharvaveda 12.1.1 states that Earth holds both the proud and the humble equally. What does this teach?',
        options: [
          'Cosmic impartiality and the insignificance of mortal vanity',
          'That arrogance is rewarded',
          'That mountains will collapse',
          'That speech should be silent'
        ],
        correct: 0,
        damage: 50
      }
    ]
  },
  {
    id: 'trial-6',
    name: 'Trial of Mātsarya (Malice & Envy)',
    demon: 'The Shadow of Jealousy',
    glyph: 'मात्सर्य',
    bossHp: 200,
    color: '#00F0FF',
    lore: 'Envy cannot rejoice in another’s light. Counter with Mudita (sympathetic joy) and cosmic brotherhood.',
    riddles: [
      {
        prompt: 'In the Rigvedic Samjnana Sukta (10.191), what is the formula for dissolving envy?',
        options: [
          'Sam gachhadhvam, sam vadadhvam: Walk united, speak in unison, understand with one heart',
          'Compete aggressively with peers',
          'Isolate oneself from society',
          'Speak ill of successful seekers'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'When another seeker attains spiritual realization, what should a true sadhaka feel?',
        options: [
          'Mudita (Ecstatic sympathetic joy, seeing one’s own soul flourishing in another)',
          'Bitter comparison and self-pity',
          'Suspicion of deceit',
          'Desire to diminish their achievement'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'Why does Vedic non-duality (Advaita) render jealousy absurd?',
        options: [
          'Because there is only One Consciousness; to envy another is to envy oneself',
          'Because all things are divided forever',
          'Because competition is sacred',
          'Because karma does not exist'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'Which mantra from the Vedas best expresses cosmic unity: "Vasudhaiva..."?',
        options: [
          'Vasudhaiva Kutumbakam (The entire cosmos is one single family)',
          'Sarve Bhavantu Sukhinah',
          'Om Namah Shivaya',
          'Hare Rama'
        ],
        correct: 0,
        damage: 50
      }
    ]
  }
];

export const Campaign = ({ addRp: propAddRp }) => {
  const storeAddRp = useGameStore((state) => state.addRp);
  const takeDamage = useGameStore((state) => state.takeDamage);
  const completeTrial = useGameStore((state) => state.completeTrial);
  const completedTrials = useGameStore((state) => state.completedTrials);
  const unlockRelic = useGameStore((state) => state.unlockRelic);
  const hp = useGameStore((state) => state.hp);

  const addRp = propAddRp || storeAddRp;

  const [selectedTrial, setSelectedTrial] = useState(ALL_TRIALS[0]);
  const [battleActive, setBattleActive] = useState(false);
  const [riddleIdx, setRiddleIdx] = useState(0);
  const [bossHp, setBossHp] = useState(150);
  const [combo, setCombo] = useState(1);
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);

  // Elemental Rune Buffs: 'agni' (+50% dmg), 'soma' (shield), 'vayu' (+6s timer), 'akasha' (remove 1 wrong)
  const [activeRune, setActiveRune] = useState('agni');
  const [shieldActive, setShieldActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(12);
  const [eliminatedOption, setEliminatedOption] = useState(null);

  const bossCanvasRef = useRef(null);

  // Start Battle
  const handleStartTrial = (trial) => {
    sounds.playUnlockChime();
    setSelectedTrial(trial);
    setBossHp(trial.bossHp);
    setRiddleIdx(0);
    setCombo(1);
    setIsVictory(false);
    setIsDefeated(false);
    setShieldActive(false);
    setEliminatedOption(null);
    setTimerSeconds(12);
    setBattleActive(true);
  };

  // Timeout damage
  const handleTimeoutDamage = useCallback(() => {
    sounds.playCombatHit(true);
    if (!shieldActive) {
      takeDamage(20);
    } else {
      setShieldActive(false);
    }
    setCombo(1);
    if (hp <= 20) {
      setIsDefeated(true);
    }
  }, [shieldActive, takeDamage, hp]);

  // 12s Countdown Timer loop
  useEffect(() => {
    if (!battleActive || isVictory || isDefeated) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Time expired = Boss counter-strike
          handleTimeoutDamage();
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [battleActive, isVictory, isDefeated, handleTimeoutDamage]);

  // Apply Elemental Rune
  const handleSelectRune = (runeType) => {
    sounds.playShoot();
    setActiveRune(runeType);

    if (runeType === 'soma') {
      setShieldActive(true);
    } else if (runeType === 'vayu') {
      setTimerSeconds((t) => t + 6);
    } else if (runeType === 'akasha') {
      const currentRiddle = selectedTrial.riddles[riddleIdx];
      const wrongIdx = currentRiddle.options.findIndex((_, idx) => idx !== currentRiddle.correct);
      setEliminatedOption(wrongIdx);
    }
  };

  // Submit Answer
  const handleAnswer = (chosenIdx) => {
    const currentRiddle = selectedTrial.riddles[riddleIdx];
    const isCorrect = chosenIdx === currentRiddle.correct;

    if (isCorrect) {
      sounds.playUnlockChime();
      let damageDealt = currentRiddle.damage;
      if (activeRune === 'agni') damageDealt = Math.floor(damageDealt * 1.5);

      const nextHp = Math.max(0, bossHp - damageDealt);
      setBossHp(nextHp);
      setCombo((c) => c + 1);

      if (nextHp <= 0) {
        // Victory!
        setIsVictory(true);
        completeTrial(selectedTrial.id, 250);
        addRp(250);

        // Relic drop
        unlockRelic({
          id: `relic_${selectedTrial.id}`,
          name: `Aegis of ${selectedTrial.glyph}`,
          desc: `Trophy of triumph over ${selectedTrial.demon}`,
          rarity: 'Legendary',
          icon: '💎'
        });
        sounds.playUnlockChime();
      } else {
        // Next Riddle
        setRiddleIdx((prev) => (prev + 1) % selectedTrial.riddles.length);
        setTimerSeconds(12);
        setEliminatedOption(null);
      }
    } else {
      // Wrong answer
      sounds.playCombatHit(true);
      if (shieldActive) {
        setShieldActive(false);
      } else {
        takeDamage(25);
        if (hp <= 25) {
          setIsDefeated(true);
        }
      }
      setCombo(1);
      setTimerSeconds(12);
    }
  };

  // Boss Canvas Render Animation Loop
  useEffect(() => {
    if (!battleActive || !bossCanvasRef.current) return;
    const canvas = bossCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 260;

    let animId;
    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, 600, 260);

      const isEnraged = bossHp <= selectedTrial.bossHp * 0.35;
      const pulse = Math.sin(t) * (isEnraged ? 18 : 8);

      // Central Asuric Aura Rings
      ctx.strokeStyle = isEnraged ? 'rgba(255, 77, 109, 0.4)' : `${selectedTrial.color}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(300, 130, 75 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(300, 130, 95 + pulse * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing Devanagari Boss Glyph
      ctx.fillStyle = isEnraged ? '#FF4D6D' : selectedTrial.color;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = isEnraged ? 35 : 20;
      ctx.font = 'bold 72px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedTrial.glyph, 300, 130 + Math.sin(t * 0.7) * 6);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [battleActive, bossHp, selectedTrial]);

  const currentRiddle = selectedTrial.riddles[riddleIdx];
  const bossHpPercent = Math.min(100, Math.max(0, (bossHp / selectedTrial.bossHp) * 100));

  return (
    <div className="campaign-container">
      {/* Header */}
      <div className="campaign-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)' }}>
            <Swords size={16} />
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Inner Warfare • The 6 Arishadvargas
            </span>
          </div>
          <h1 className="campaign-title">Arishadvarga Inner Trials</h1>
        </div>

        {battleActive && (
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => setBattleActive(false)}
          >
            Retreat from Battle
          </Button>
        )}
      </div>

      {!battleActive ? (
        /* Realmgate Trials Grid */
        <div className="trials-grid">
          {ALL_TRIALS.map((trial) => {
            const isCompleted = completedTrials.includes(trial.id);

            return (
              <GlassCard
                key={trial.id}
                tilt
                spotlight
                className="trial-card"
                onClick={() => handleStartTrial(trial)}
              >
                <div className="trial-glyph-watermark">{trial.glyph}</div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.78rem', color: trial.color }}>
                      {trial.demon.toUpperCase()}
                    </span>
                    {isCompleted && (
                      <Chip variant="gold" icon={Sparkles}>
                        Conquered
                      </Chip>
                    )}
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.35rem', margin: '0 0 10px' }}>
                    {trial.name}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                    {trial.lore}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Boss HP: {trial.bossHp} • 4 Exegesis Gates
                  </span>
                  <span style={{ color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', fontWeight: 600 }}>
                    Initiate Trial <Swords size={15} />
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* Battle Arena Stage */
        <GlassCard spotlight className={`battle-arena-card ${bossHp <= selectedTrial.bossHp * 0.35 ? 'enraged' : ''}`}>
          {/* Boss HP Bar & Stage */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <strong style={{ color: '#FFF', fontSize: '1.15rem' }}>{selectedTrial.demon}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '10px' }}>
                  ({selectedTrial.name})
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-hud)', color: selectedTrial.color, fontWeight: 700 }}>
                {bossHp} / {selectedTrial.bossHp} HP
              </span>
            </div>

            <ProgressBar progress={bossHpPercent} variant="danger" />
          </div>

          {/* Canvas Boss Stage */}
          <div className="boss-stage-wrap">
            <canvas ref={bossCanvasRef} className="boss-canvas-display" />
          </div>

          {/* Elemental Rune Tactical Selector */}
          <div>
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Select Active Elemental Rune Counter:
            </div>
            <div className="elemental-runes-row">
              <button
                type="button"
                className={`rune-power-btn ${activeRune === 'agni' ? 'active' : ''}`}
                onClick={() => handleSelectRune('agni')}
              >
                <Flame size={14} style={{ color: '#FF7B00' }} />
                <span>Agni Flame (+50% Dmg)</span>
              </button>

              <button
                type="button"
                className={`rune-power-btn ${activeRune === 'soma' ? 'active' : ''}`}
                onClick={() => handleSelectRune('soma')}
              >
                <Shield size={14} style={{ color: '#00F0FF' }} />
                <span>Soma Shield {shieldActive ? '(Active)' : '(Blocks 1 Hit)'}</span>
              </button>

              <button
                type="button"
                className={`rune-power-btn ${activeRune === 'vayu' ? 'active' : ''}`}
                onClick={() => handleSelectRune('vayu')}
              >
                <Zap size={14} style={{ color: '#FFE259' }} />
                <span>Vayu Gale (+6s Timer)</span>
              </button>

              <button
                type="button"
                className={`rune-power-btn ${activeRune === 'akasha' ? 'active' : ''}`}
                onClick={() => handleSelectRune('akasha')}
              >
                <Compass size={14} style={{ color: '#9F7AEA' }} />
                <span>Akasha Clarity (Banish 1 Wrong)</span>
              </button>
            </div>
          </div>

          {/* Exchange Prompt & Options */}
          <div className="battle-exchange-box">
            <div className="battle-timer-ring-wrap">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: timerSeconds <= 4 ? 'var(--danger)' : 'var(--gold-bright)', fontFamily: 'var(--font-hud)', fontSize: '0.92rem' }}>
                <Clock size={16} />
                <span>Focus Window: {timerSeconds}s</span>
              </div>

              {combo > 1 && (
                <Chip variant="gold">
                  {combo}x Combo Chain
                </Chip>
              )}
            </div>

            <p style={{ color: '#FFF', fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 16px' }}>
              {currentRiddle.prompt}
            </p>

            <div className="battle-answers-grid">
              {currentRiddle.options.map((opt, i) => {
                if (eliminatedOption === i) return null; // Banished by Akasha rune

                return (
                  <button
                    key={i}
                    type="button"
                    className="battle-answer-btn"
                    onClick={() => handleAnswer(i)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Defeat Screen Modal */}
          {isDefeated && (
            <div className="countdown-overlay">
              <div style={{ textAlign: 'center', maxWidth: '380px', padding: '32px', background: 'rgba(10, 10, 18, 0.96)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--danger)', fontSize: '1.8rem', margin: '0 0 10px' }}>
                  Consciousness Clouded
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  The Asura of {selectedTrial.name} overwhelmed your spiritual focus. Re-anchor yourself in the sanctuary.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Button
                    variant="primary"
                    icon={RotateCcw}
                    onClick={() => handleStartTrial(selectedTrial)}
                  >
                    Retry Battle
                  </Button>
                  <Button
                    variant="ghost"
                    icon={ArrowLeft}
                    onClick={() => setBattleActive(false)}
                  >
                    Retreat
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Victory Ceremony Modal */}
          {isVictory && (
            <div className="countdown-overlay">
              <div style={{ textAlign: 'center', maxWidth: '420px', padding: '36px', background: 'rgba(10, 10, 18, 0.96)', border: '2px solid var(--gold)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💎</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.9rem', margin: '0 0 8px' }}>
                  Arishadvarga Vanquished!
                </h2>
                <p style={{ color: 'var(--gold-bright)', fontSize: '1.05rem', margin: '0 0 16px' }}>
                  {selectedTrial.demon} Dissolved into Pure Awareness
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                  <Chip variant="gold" icon={Sparkles}>
                    +250 RP Consecrated
                  </Chip>
                  <Chip variant="cyber" icon={Award}>
                    Legendary Relic Unlocked!
                  </Chip>
                </div>
                <Button
                  variant="primary"
                  icon={ArrowLeft}
                  onClick={() => setBattleActive(false)}
                >
                  Return to Realms
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default Campaign;
