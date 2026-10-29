import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { 
  Swords, 
  Trophy, 
  Skull, 
  CheckCircle2, 
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';

const TRIALS = [
  {
    id: 'trial-1',
    name: 'Trial of Kāma (Untamed Craving)',
    demon: 'The Asura of Attachment',
    glyph: 'काम',
    bossHp: 100,
    lore: 'Kāma chains the senses to external mirages. Counter with the Atharva truth of inner fullness (Purnata).',
    riddles: [
      {
        prompt: 'The illusion strikes: "Without possessing the world, you remain incomplete." What Vedic truth dispels this?',
        options: [
          'The Self (Atman) is already complete, full, and infinite (Purnamadah Purnamidam).',
          'Amass more material possessions to quiet the yearning mind.',
          'Surrender willpower to temporary sensory impulses.',
          'Fall into spiritual numbness.'
        ],
        correct: 0,
        damage: 50
      },
      {
        prompt: 'Which sacred element is invoked in the Atharvaveda to purify burning unaligned desire?',
        options: [
          'Vayu (The untamed wind)',
          'Pavitram Agni (The discriminating sacred flame of clarity)',
          'Tamoguna (The darkness of ignorance)',
          'Maya (The web of deceit)'
        ],
        correct: 1,
        damage: 50
      }
    ]
  },
  {
    id: 'trial-2',
    name: 'Trial of Krodha (Blinding Wrath)',
    demon: 'The Asura of Fury',
    glyph: 'क्रोध',
    bossHp: 120,
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
        damage: 60
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
        damage: 60
      }
    ]
  },
  {
    id: 'trial-3',
    name: 'Trial of Moha (Deep Delusion)',
    demon: 'The Weaver of Shadows',
    glyph: 'मोह',
    bossHp: 140,
    lore: 'Mistaking the transient for the eternal is the root of sorrow. Pierce the veil with Vedic Vidya.',
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
        damage: 70
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
        damage: 70
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

  const handleMantraStrike = (optIdx) => {
    const currentRiddle = selectedTrial.riddles[currentRiddleIdx];
    
    if (optIdx === currentRiddle.correct) {
      sounds.playUnlockChime();
      const newBossHp = Math.max(0, currentBossHp - currentRiddle.damage);
      setCurrentBossHp(newBossHp);

      if (newBossHp === 0) {
        setIsVictory(true);
        completeTrial(selectedTrial.id, 300);
        sounds.playUnlockChime();
        setCombatLog(`✨ VICTORY! The ${selectedTrial.demon} was dissolved by pure Truth! +300 RP.`);
      } else {
        setCombatLog(`💥 CRITICAL STRIKE! Truth shattered the illusion for ${currentRiddle.damage} damage!`);
        setCurrentRiddleIdx(prev => Math.min(selectedTrial.riddles.length - 1, prev + 1));
      }
    } else {
      sounds.playCombatHit(false);
      takeDamage(20);
      setCombatLog('⚠️ False premise! The demon countered your thought. You took 20 Fortitude damage.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <Swords size={13} />
          <span>Arishadvarga Warfare</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 8px' }}>
          The Inner Trials
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
          Confront and purify the 6 internal adversaries of consciousness through philosophical combat.
        </p>
      </div>

      {!battleActive ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {TRIALS.map((trial, index) => {
            const isCompleted = completedTrials.includes(trial.id);
            return (
              <div 
                key={trial.id}
                className="glass-panel"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderColor: isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--glass-border)' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'Orbitron, monospace' }}>
                      GATE 0{index + 1}
                    </span>
                    {isCompleted ? (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                        <CheckCircle2 size={12} /> Cleared
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                        Trial Awaits
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 94, 30, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF7B00',
                      fontSize: '1.4rem', fontFamily: 'Noto Sans Devanagari, serif', fontWeight: 700
                    }}>
                      {trial.glyph}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', color: '#FFF', margin: 0 }}>
                        {trial.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#FF7B00' }}>{trial.demon}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.5', margin: '0 0 16px' }}>
                    {trial.lore}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#FFE259', fontWeight: 700 }}>+300 RP Reward</span>
                  <button 
                    className="cyber-btn cyber-btn-gold"
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                    onClick={() => startBattle(trial)}
                  >
                    <span>{isCompleted ? 'Re-challenge' : 'Begin Trial'}</span>
                    <Swords size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Combat View */
        <div className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(255, 94, 30, 0.4)' }}>
          {/* Boss Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skull size={20} style={{ color: '#FF4500' }} />
                <h2 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', fontSize: '1.4rem', margin: 0 }}>
                  {selectedTrial.demon}
                </h2>
              </div>
              <span style={{ fontFamily: 'Orbitron, monospace', color: '#FF7B00', fontWeight: 700 }}>
                {currentBossHp} / {selectedTrial.bossHp} HP
              </span>
            </div>

            <div className="meter-track" style={{ width: '100%', height: '10px' }}>
              <div 
                className="hp-fill" 
                style={{ 
                  width: `${(currentBossHp / selectedTrial.bossHp) * 100}%`,
                  background: 'linear-gradient(90deg, #FF4500, #FF8C00)' 
                }} 
              />
            </div>
          </div>

          {/* Combat Log */}
          {combatLog && (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderLeft: '3px solid #FFE259', padding: '12px 16px', borderRadius: '8px', color: '#E2E8F0', fontSize: '0.9rem', marginBottom: '20px' }}>
              {combatLog}
            </div>
          )}

          {!isVictory ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFE259', fontSize: '0.75rem', fontWeight: 700 }}>
                <Sparkles size={14} />
                <span>EXCHANGE {currentRiddleIdx + 1} OF {selectedTrial.riddles.length}</span>
              </div>

              <p style={{ color: '#FFF', fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>
                {selectedTrial.riddles[currentRiddleIdx].prompt}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '8px' }}>
                {selectedTrial.riddles[currentRiddleIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    className="cyber-btn"
                    style={{ padding: '14px 18px', justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.92rem', lineHeight: '1.4' }}
                    onClick={() => handleMantraStrike(i)}
                  >
                    <span style={{ color: '#FFE259', fontWeight: 800, marginRight: '8px' }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Trophy size={50} style={{ color: '#FFE259', margin: '0 auto 12px' }} />
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#FFF' }}>The Adversary is Dissolved</h2>
              <p style={{ color: '#CBD5E1', maxWidth: '400px', margin: '8px auto 20px' }}>
                Your clarity prevailed over doubt. +300 Radiance Points awarded to your soul profile.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', display: 'inline-flex', padding: '12px 28px' }}
                onClick={() => setBattleActive(false)}
              >
                Return to Gates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaign;
