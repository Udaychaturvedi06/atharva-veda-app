import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { 
  Swords, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Trophy, 
  Skull, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const TRIALS = [
  {
    id: 'trial-1',
    name: 'Trial of Kāma (Untamed Desire)',
    demon: 'The Phantom of Craving',
    glyph: 'काम',
    realm: 'Chitta Vana (The Forest of Longing)',
    bossHp: 100,
    lore: 'Kāma chains the senses to external shadows. Counter with the Atharva truth of self-containment.',
    riddles: [
      {
        prompt: 'The illusion strikes: "Without possessing the world, you remain empty." What Vedic truth breaks this spell?',
        options: [
          'The Self (Atman) is already complete, full, and infinite (Purnamadah Purnamidam).',
          'Amass more gold and land to silence the inner voice.',
          'Surrender willpower to physical impulses.',
          'Escape the world into total sleep.'
        ],
        correct: 0,
        mantraDamage: 50
      },
      {
        prompt: 'Which sacred flame is invoked in the Atharvaveda to purify unaligned desire?',
        options: [
          'Vayu (The untamed wind)',
          'Pavitram Agni (The discriminating sacred flame of clarity)',
          'Tamoguna (The darkness of ignorance)',
          'Maya (The web of deceit)'
        ],
        correct: 1,
        mantraDamage: 50
      }
    ]
  },
  {
    id: 'trial-2',
    name: 'Trial of Krodha (Blinding Wrath)',
    demon: 'The Asura of Fury',
    glyph: 'क्रोध',
    realm: 'Jwala Sthana (The Valley of Scorching Anger)',
    bossHp: 120,
    lore: 'Anger burns the vessel that holds it. Counter the storm with Soma coolness and unwavering discernment.',
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
        mantraDamage: 60
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
        mantraDamage: 60
      }
    ]
  },
  {
    id: 'trial-3',
    name: 'Trial of Moha (Deep Delusion)',
    demon: 'The Weaver of Shadows',
    glyph: 'मोह',
    realm: 'Maya Sagara (The Ocean of Mirage)',
    bossHp: 140,
    lore: 'Mistaking the transient for the permanent is the root of sorrow. Pierce the veil with Vedic Vidya.',
    riddles: [
      {
        prompt: 'What is the light that disperses the mist of delusion according to the Gayatri mantra?',
        options: [
          'Savita’s divine radiant splendor inspiring our intellect',
          'The glow of moonlight alone',
          'Blind belief without investigation',
          'Strict physical discipline alone'
        ],
        correct: 0,
        mantraDamage: 70
      },
      {
        prompt: 'The Atharva Veda says Earth is our Mother. In contrast, what delusion does Moha sow?',
        options: [
          'That nature is sacred',
          'That man is separate from and master of all existence to exploit',
          'That all beings share one breath',
          'That cycles of seasons are holy'
        ],
        correct: 1,
        mantraDamage: 70
      }
    ]
  }
];

const Campaign = ({ addRp }) => {
  const [selectedTrial, setSelectedTrial] = useState(TRIALS[0]);
  const [battleActive, setBattleActive] = useState(false);
  const [currentRiddleIdx, setCurrentRiddleIdx] = useState(0);
  const [currentBossHp, setCurrentBossHp] = useState(100);
  const [combatLog, setCombatLog] = useState('');
  const [isVictory, setIsVictory] = useState(false);
  const [empoweredRune, setEmpoweredRune] = useState('Agni');
  const [screenShaking, setScreenShaking] = useState(false);

  const takeDamage = useGameStore(state => state.takeDamage);
  const completeTrial = useGameStore(state => state.completeTrial);
  const completedTrials = useGameStore(state => state.completedTrials);

  const startBattle = (trial) => {
    setSelectedTrial(trial);
    setCurrentBossHp(trial.bossHp);
    setCurrentRiddleIdx(0);
    setBattleActive(true);
    setIsVictory(false);
    setCombatLog(`⚔️ The ${trial.demon} has materialized! Prepare your Vedic focus.`);
    sounds.playCombatHit(true);
  };

  const triggerScreenShake = () => {
    setScreenShaking(true);
    setTimeout(() => setScreenShaking(false), 500);
  };

  const handleMantraStrike = (optionIdx) => {
    const currentRiddle = selectedTrial.riddles[currentRiddleIdx];
    
    if (optionIdx === currentRiddle.correct) {
      sounds.playUnlockChime();
      triggerScreenShake();
      const damageBonus = empoweredRune === 'Agni' ? 10 : 0;
      const newBossHp = Math.max(0, currentBossHp - (currentRiddle.mantraDamage + damageBonus));
      setCurrentBossHp(newBossHp);

      if (newBossHp === 0) {
        setIsVictory(true);
        completeTrial(selectedTrial.id, 300);
        sounds.playUnlockChime();
        setCombatLog(`✨ VICTORY! The ${selectedTrial.demon} was dissolved by pure Truth! +300 RP.`);
      } else {
        setCombatLog(`💥 CRITICAL STRIKE! ${empoweredRune} infused your mantra for ${currentRiddle.mantraDamage + damageBonus} damage!`);
        setCurrentRiddleIdx(prev => Math.min(selectedTrial.riddles.length - 1, prev + 1));
      }
    } else {
      sounds.playCombatHit(false);
      triggerScreenShake();
      takeDamage(25);
      setCombatLog('⚠️ False premise! The demon countered your thought. 25 Fortitude lost.');
    }
  };

  return (
    <div className={`battle-arena-full ${screenShaking ? 'shake-anim' : ''}`}>
      <div className="campaign-header">
        <div className="campaign-badge">
          <Swords size={16} className="gold-accent" />
          <span>INNER CONFLICT: THE ARISHADVARGAS</span>
        </div>
        <h1>The Cosmic Campaign</h1>
        <p className="campaign-desc">
          Defeat the 6 internal adversaries lurking in the mind through Vedic philosophical combat.
        </p>
      </div>

      {!battleActive ? (
        <div className="trials-roster-grid">
          {TRIALS.map((trial, index) => {
            const isCompleted = completedTrials.includes(trial.id);
            return (
              <div key={trial.id} className={`trial-card ${isCompleted ? 'trial-cleared' : ''}`}>
                <div className="trial-top">
                  <span className="trial-num">GATE 0{index + 1}</span>
                  {isCompleted ? (
                    <span className="cleared-tag"><CheckCircle2 size={14} /> Cleared</span>
                  ) : (
                    <span className="pending-tag">Adversary Guarding</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 46, 0, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF5E1E',
                    fontSize: '1.4rem', fontFamily: 'Noto Sans Devanagari, serif', fontWeight: 700
                  }}>
                    {trial.glyph}
                  </div>
                  <div>
                    <h3 className="trial-title">{trial.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#FF7B00' }}>{trial.demon}</span>
                  </div>
                </div>

                <p className="trial-lore">{trial.lore}</p>

                <div className="trial-footer">
                  <div className="reward-tag">
                    <Trophy size={14} />
                    <span>+300 RP & Astral Relic</span>
                  </div>
                  <button className="commence-battle-btn" onClick={() => startBattle(trial)}>
                    <span>{isCompleted ? 'Re-enter Duel' : 'Commence Duel'}</span>
                    <Swords size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dynamic Combat Stage */
        <div className="combat-stage">
          {/* Boss Astral Aura Stage */}
          <div className="boss-avatar-stage">
            <div className="boss-astral-aura">
              <span className="boss-inner-glyph">{selectedTrial.glyph}</span>
            </div>
            <h2 className="boss-name" style={{ marginTop: '12px' }}>{selectedTrial.demon}</h2>
            <span className="boss-realm">{selectedTrial.realm}</span>
          </div>

          {/* Boss HP Bar */}
          <div className="boss-hud-slate">
            <div className="boss-meta-row">
              <span style={{ color: '#FF7B00', fontWeight: 700, fontSize: '0.85rem' }}>
                DEMON LIFE MATRIX {currentBossHp <= selectedTrial.bossHp * 0.5 ? '⚠️ ENRAGED' : ''}
              </span>
              <span className="boss-hp-numeric">{currentBossHp} / {selectedTrial.bossHp} HP</span>
            </div>
            <div className="boss-hp-track">
              <div 
                className="boss-hp-fill" 
                style={{ width: `${(currentBossHp / selectedTrial.bossHp) * 100}%` }} 
              />
            </div>
          </div>

          {combatLog && (
            <div className="combat-log-banner">
              <span>{combatLog}</span>
            </div>
          )}

          {!isVictory ? (
            <div className="combat-action-box">
              {/* Elemental Strike Runes Bar */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFE259', fontWeight: 800, letterSpacing: '1px' }}>
                  ATTUNE CHAKRA ELEMENT BEFORE STRIKE:
                </span>
                <div className="combat-runes-dock">
                  {[
                    { id: 'Agni', label: '🔥 Agni (+10 DMG)', class: 'agni' },
                    { id: 'Soma', label: '🌊 Soma (Shield)', class: 'soma' },
                    { id: 'Vayu', label: '💨 Vayu (Speed)', class: 'vayu' },
                    { id: 'Akasha', label: '✨ Akasha (Truth)', class: 'akasha' }
                  ].map(rune => (
                    <button
                      key={rune.id}
                      className={`elemental-strike-orb ${rune.class} ${empoweredRune === rune.id ? 'active' : ''}`}
                      onClick={() => {
                        sounds.playUnlockChime();
                        setEmpoweredRune(rune.id);
                      }}
                      style={{
                        transform: empoweredRune === rune.id ? 'scale(1.15) translateY(-5px)' : 'none',
                        boxShadow: empoweredRune === rune.id ? '0 0 25px rgba(255, 226, 89, 0.7)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{rune.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="prompt-header">
                <Sparkles size={16} className="gold-accent" />
                <span className="step-count">EXCHANGE {currentRiddleIdx + 1} OF {selectedTrial.riddles.length}</span>
              </div>

              <p className="riddle-prompt">
                {selectedTrial.riddles[currentRiddleIdx].prompt}
              </p>

              <div className="mantra-options-grid">
                {selectedTrial.riddles[currentRiddleIdx].options.map((opt, i) => (
                  <button key={i} className="mantra-strike-btn" onClick={() => handleMantraStrike(i)}>
                    <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                    <span className="opt-text">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="victory-ceremony">
              <Trophy size={56} className="victory-trophy" />
              <h2>The Illusion Has Crumbled</h2>
              <p>You maintained steady fortitude and dispelled {selectedTrial.demon}. +300 Radiance Points bestowed!</p>
              <button className="primary-cta-btn" onClick={() => setBattleActive(false)}>
                <CheckCircle2 size={18} />
                <span>Return to Astral Map</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaign;
