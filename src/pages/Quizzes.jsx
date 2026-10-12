import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { 
  BrainCircuit, 
  Flame, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Zap,
  Timer
} from 'lucide-react';

const PUZZLES = [
  {
    rune: 'अथर्व',
    question: 'What is the literal root meaning of the word "Atharva"?',
    options: [
      'The Unwavering / Stable-Minded Priest of Wisdom',
      'The Melodic Song of Transcendence',
      'The Charioteer of Destruction',
      'The Wandering Desert Ascetic'
    ],
    correct: 0,
    hint: 'Composed of "a-" (not) + "tharva" (flickering, wavering).'
  },
  {
    rune: 'सत्यम्',
    question: 'The sacred proclamation "Ekam Sat Vipra Bahudha Vadanti" belongs to which scripture?',
    options: [
      'Samaveda (Chhandogya)',
      'Rigveda (Mandala 1, Sukta 164)',
      'Atharvaveda (Kanda 12)',
      'Yajurveda (Adhyaya 40)'
    ],
    correct: 1,
    hint: '"Truth is One; the wise perceive and call it by varied names."'
  },
  {
    rune: 'ओषधि',
    question: 'In the Atharva Veda, which deities are hailed as the living consciousness of medicinal herbs?',
    options: [
      'Vanaspati and Oshadhi (Plant consciousness / Rudra)',
      'Yama and Chitragupta',
      'Varuna and Mitra',
      'Kubera and Yakshas'
    ],
    correct: 0,
    hint: 'This forms the foundational botanical genesis of classical Ayurveda.'
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
  const [combo, setCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);

  const addRp = useGameStore(state => state.addRp);
  const currentPuzzle = PUZZLES[currentIdx];

  // 25s Countdown Timer per question
  useEffect(() => {
    if (quizFinished || selectedOpt !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, selectedOpt, quizFinished]);

  const handleTimeExpire = () => {
    setSelectedOpt(-1); // Expired
    sounds.playCombatHit(false);
    setCombo(1);
  };

  const handleSelect = (idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);

    if (idx === currentPuzzle.correct) {
      sounds.playUnlockChime();
      const points = 75 * combo;
      setScore(s => s + points);
      setCombo(c => Math.min(4, c + 1));
      addRp(points);
    } else {
      sounds.playCombatHit(false);
      setCombo(1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < PUZZLES.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOpt(null);
      setTimeLeft(25);
    } else {
      setQuizFinished(true);
      sounds.playUnlockChime();
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setCombo(1);
    setTimeLeft(25);
    setQuizFinished(false);
  };

  return (
    <div className="quiz-chamber">
      <div className="quiz-header">
        <div className="chamber-pill">
          <BrainCircuit size={16} className="gold-accent" />
          <span>THE CIPHER CRYPT • VEDIC DECRYPTION</span>
        </div>
        <h1>The Mandala Crypt</h1>
        <p className="quiz-sub">
          Race the sandglass to decipher root syllables, meters, and philosophical allegories.
        </p>
      </div>

      {!quizFinished ? (
        <div className="puzzle-box" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Top HUD with Timer & Combo Multiplier */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontWeight: 800 }}>
              <Timer size={18} />
              <span>{timeLeft}s REMAINING</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} className="flame-accent" />
              <span style={{ color: '#FFE259', fontWeight: 800, fontSize: '1rem' }}>
                COMBO x{combo} ({score} RP)
              </span>
            </div>
          </div>

          {/* Central Rune Sigil */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px', padding: '6px 16px', marginBottom: '16px',
            fontFamily: 'Noto Sans Devanagari, serif', fontSize: '1.4rem', color: '#FFE259'
          }}>
            {currentPuzzle.rune}
          </div>

          <h2 className="puzzle-question">{currentPuzzle.question}</h2>

          <div className="puzzle-options-list">
            {currentPuzzle.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === currentPuzzle.correct;
              return (
                <button
                  key={i}
                  disabled={selectedOpt !== null}
                  className={`quiz-opt-btn ${
                    selectedOpt !== null
                      ? isCorrect ? 'correct' : isSelected ? 'wrong' : ''
                      : ''
                  }`}
                  onClick={() => handleSelect(i)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="opt-val">{opt}</span>
                  {selectedOpt !== null && isCorrect && <CheckCircle2 size={18} className="stat-icon" />}
                  {selectedOpt !== null && isSelected && !isCorrect && <XCircle size={18} className="stat-icon" />}
                </button>
              );
            })}
          </div>

          {selectedOpt !== null && (
            <div className="puzzle-next-row">
              <span className="puzzle-hint-text">
                {selectedOpt === -1 ? '⏳ Sandglass ran out!' : `💡 ${currentPuzzle.hint}`}
              </span>
              <button className="primary-cta-btn next-btn" onClick={nextQuestion}>
                <span>{currentIdx + 1 === PUZZLES.length ? 'Unlock Cipher Vault' : 'Next Inscription'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-results-card">
          <Trophy size={60} className="trophy-gold" />
          <h2>Crypt Deciphered</h2>
          <p className="results-summary">
            Your intellect triumphed over obscurity! You accumulated{' '}
            <strong className="gold-highlight">+{score} Radiance Points</strong>.
          </p>

          <button className="primary-cta-btn" onClick={restartQuiz}>
            <RefreshCw size={16} />
            <span>Reset Crypt Mechanisms</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
