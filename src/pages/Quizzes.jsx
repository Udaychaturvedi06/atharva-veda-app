import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { 
  BrainCircuit, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from 'lucide-react';

const PUZZLES = [
  {
    rune: 'अथर्व',
    question: 'What is the literal root meaning of the word "Atharva"?',
    options: [
      'The Unwavering / Stable-Minded Sage of Wisdom',
      'The Melodic Chant of Ecstasy',
      'The Charioteer of Destruction',
      'The Desert Wanderer'
    ],
    correct: 0,
    hint: 'Composed of "a-" (not) + "tharva" (wavering or moving).'
  },
  {
    rune: 'सत्यम्',
    question: 'The sacred proclamation "Ekam Sat Vipra Bahudha Vadanti" belongs to which scripture?',
    options: [
      'Samaveda',
      'Rigveda (Mandala 1, Sukta 164)',
      'Atharvaveda',
      'Yajurveda'
    ],
    correct: 1,
    hint: '"Truth is One; the wise perceive and speak of it in varied ways."'
  },
  {
    rune: 'ओषधि',
    question: 'In the Atharva Veda, which deities are hailed as the living consciousness of medicinal plants?',
    options: [
      'Vanaspati and Oshadhi (Plant consciousness / Rudra)',
      'Yama and Chitragupta',
      'Varuna and Mitra',
      'Kubera'
    ],
    correct: 0,
    hint: 'This forms the foundational genesis of classical Ayurveda.'
  },
  {
    rune: 'गायत्री',
    question: 'Which sacred meter (Chanda) forms the metric cadence of the Gayatri Mantra?',
    options: [
      'Anustubh Meter (32 syllables in 4 feet)',
      'Gayatri Meter (24 syllables in 3 feet of 8)',
      'Tristubh Meter (44 syllables in 4 feet)',
      'Jagati Meter (48 syllables in 4 feet)'
    ],
    correct: 1,
    hint: 'Tri-pada (three feet) containing exactly eight syllables each.'
  }
];

const Quizzes = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const addRp = useGameStore(state => state.addRp);
  const currentPuzzle = PUZZLES[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);

    if (idx === currentPuzzle.correct) {
      sounds.playUnlockChime();
      setScore(s => s + 75);
      addRp(75);
    } else {
      sounds.playCombatHit(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < PUZZLES.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
      sounds.playUnlockChime();
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <div className="badge gold" style={{ marginBottom: '8px' }}>
          <BrainCircuit size={13} />
          <span>Vedic Decryption</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 8px' }}>
          The Decryption Chamber
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
          Test your comprehension of ancient root words, meters, and philosophical allegories.
        </p>
      </div>

      {!quizFinished ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'Orbitron, monospace' }}>
              QUESTION {currentIdx + 1} OF {PUZZLES.length}
            </span>
            <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: '#FFE259' }}>
              Score: {score} RP
            </span>
          </div>

          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.25rem', color: '#FFF', lineHeight: '1.6', margin: '0 0 24px' }}>
            {currentPuzzle.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentPuzzle.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === currentPuzzle.correct;
              return (
                <button
                  key={i}
                  disabled={selectedOpt !== null}
                  className="cyber-btn"
                  style={{
                    padding: '16px 20px',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    background: selectedOpt !== null
                      ? isCorrect ? 'rgba(16, 185, 129, 0.15)' : isSelected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)'
                      : 'rgba(255, 255, 255, 0.03)',
                    borderColor: selectedOpt !== null
                      ? isCorrect ? '#10B981' : isSelected ? '#EF4444' : 'rgba(255,255,255,0.06)'
                      : 'rgba(255, 255, 255, 0.08)'
                  }}
                  onClick={() => handleSelect(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#FFE259', fontWeight: 800 }}>{String.fromCharCode(65 + i)}.</span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.95rem' }}>{opt}</span>
                  </div>
                  {selectedOpt !== null && isCorrect && <CheckCircle2 size={18} style={{ color: '#10B981' }} />}
                  {selectedOpt !== null && isSelected && !isCorrect && <XCircle size={18} style={{ color: '#EF4444' }} />}
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#FFE259' }}>
                💡 {currentPuzzle.hint}
              </span>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '10px 24px', fontSize: '0.85rem' }}
                onClick={nextQuestion}
              >
                {currentIdx + 1 === PUZZLES.length ? 'View Results' : 'Next Inscription'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Trophy size={56} style={{ color: '#FFE259', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#FFF' }}>Decryption Completed</h2>
          <p style={{ color: '#CBD5E1', maxWidth: '400px', margin: '8px auto 24px', lineHeight: '1.6' }}>
            You solved the ancient inscriptions and accumulated <strong style={{ color: '#FFE259' }}>+{score} Radiance Points</strong>.
          </p>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', display: 'inline-flex', padding: '12px 28px' }}
            onClick={restartQuiz}
          >
            <RefreshCw size={16} />
            <span>Retake Decryption</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
