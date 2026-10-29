import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { PUZZLES } from '../data/puzzles';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Zap,
  HelpCircle,
  FastForward,
  Award,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 20;

// Fisher-Yates shuffle
function sampleQuestions(list, count) {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const Quizzes = () => {
  const { prana, consumePrana, addRp, completeQuiz } = useGameStore();

  const [questions, setQuestions] = useState(() => sampleQuestions(PUZZLES, TOTAL_QUESTIONS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [eliminatedOpts, setEliminatedOpts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [notification, setNotification] = useState(null);

  const currentQ = questions[currentIdx] || questions[0];
  const timerRef = useRef(null);

  // Lifeline notification helper
  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Next Question logic
  const handleNextQuestion = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setEliminatedOpts([]);
      setTimeLeft(QUESTION_TIME);
    } else {
      setQuizFinished(true);
      sounds.playUnlockChime();
    }
  }, [currentIdx, questions.length]);

  // Handle Option Selection
  const handleSelect = useCallback((idx) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    clearInterval(timerRef.current);

    const isCorrect = idx === currentQ.correct;
    if (isCorrect) {
      sounds.playUnlockChime();
      const points = 75 + Math.floor(timeLeft * 2);
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      addRp(points);
    } else {
      sounds.playCombatHit(false);
    }
  }, [selectedOpt, currentQ.correct, timeLeft, addRp]);

  // Timeout handling
  const handleTimeout = useCallback(() => {
    if (selectedOpt !== null) return;
    sounds.playCombatHit(false);
    setSelectedOpt(-1); // Mark as timed out
  }, [selectedOpt]);

  // Timer loop
  useEffect(() => {
    if (quizFinished || selectedOpt !== null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quizFinished, selectedOpt, currentIdx, handleTimeout]);

  // On Quiz Completion
  useEffect(() => {
    if (quizFinished) {
      const accuracy = (correctCount / TOTAL_QUESTIONS) * 100;
      if (accuracy >= 70) {
        completeQuiz(150);
      }
    }
  }, [quizFinished, correctCount, completeQuiz]);

  // Lifelines
  const useFiftyFifty = () => {
    if (eliminatedOpts.length > 0 || selectedOpt !== null) return;
    if (!consumePrana(15)) {
      notify('Not enough Prana! Need 15');
      return;
    }
    sounds.playShoot();
    const wrongIndices = currentQ.options
      .map((_, i) => i)
      .filter((i) => i !== currentQ.correct);
    // Eliminate 2 wrong choices
    const toEliminate = wrongIndices.slice(0, 2);
    setEliminatedOpts(toEliminate);
    notify('50/50 invoked: 2 false paths eliminated!');
  };

  const useAddTime = () => {
    if (selectedOpt !== null) return;
    if (!consumePrana(10)) {
      notify('Not enough Prana! Need 10');
      return;
    }
    sounds.playUnlockChime();
    setTimeLeft((t) => t + 10);
    notify('+10 Seconds added to the cosmic sandglass!');
  };

  const useSkip = () => {
    if (selectedOpt !== null) return;
    if (!consumePrana(20)) {
      notify('Not enough Prana! Need 20');
      return;
    }
    sounds.playUnlockChime();
    notify('Question bypassed through Pranic evasion!');
    handleNextQuestion();
  };

  const restartQuiz = () => {
    sounds.playUnlockChime();
    setQuestions(sampleQuestions(PUZZLES, TOTAL_QUESTIONS));
    setCurrentIdx(0);
    setSelectedOpt(null);
    setEliminatedOpts([]);
    setTimeLeft(QUESTION_TIME);
    setScore(0);
    setCorrectCount(0);
    setQuizFinished(false);
  };

  // Timer circle calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const timerOffset = circumference - (timeLeft / QUESTION_TIME) * circumference;
  const isTimerLow = timeLeft <= 5;
  const isTimerMed = timeLeft <= 10 && timeLeft > 5;

  return (
    <div className="quiz-page">
      {/* Header Bar */}
      <div className="quiz-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold-bright)', margin: 0 }}>
            Vedic Decryption
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Decode the sacred glyphs and mystical hymns of the Atharva Samhita
          </p>
        </div>

        <div className="quiz-stats">
          <Chip label={`Prana: ${prana}`} variant="soma" icon={<Zap size={14} />} />
          <Chip label={`Score: ${score}`} variant="gold" icon={<Award size={14} />} />
          <Chip label={`Folio ${currentIdx + 1} / ${TOTAL_QUESTIONS}`} variant="cyan" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar-wrap">
        <ProgressBar
          value={currentIdx + (selectedOpt !== null ? 1 : 0)}
          max={TOTAL_QUESTIONS}
          variant="gold"
          size="sm"
          shimmer
        />
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid var(--cyan)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--cyan)',
            textAlign: 'center',
            marginBottom: 'var(--space-4)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {notification}
        </motion.div>
      )}

      {!quizFinished ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="quiz-card" elevation={2}>
              <div className="quiz-card-top">
                <div className="quiz-glyph-badge">
                  <span className="quiz-glyph-rune">{currentQ.rune || 'ॐ'}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>Sacred Seal</span>
                </div>

                {/* Sandglass Timer */}
                <div className="quiz-timer-svg-wrap">
                  <svg className="quiz-timer-svg" viewBox="0 0 60 60">
                    <circle
                      className="quiz-timer-bg-circle"
                      cx="30"
                      cy="30"
                      r={radius}
                    />
                    <circle
                      className={`quiz-timer-progress-circle ${isTimerLow ? 'danger' : isTimerMed ? 'warning' : ''}`}
                      cx="30"
                      cy="30"
                      r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={timerOffset}
                    />
                  </svg>
                  <span className="quiz-timer-text">{timeLeft}s</span>
                </div>
              </div>

              <h2 className="quiz-question-text">{currentQ.question}</h2>

              {/* Options */}
              <div className="quiz-options-grid">
                {currentQ.options.map((opt, idx) => {
                  const isEliminated = eliminatedOpts.includes(idx);
                  let optStateClass = '';

                  if (selectedOpt !== null) {
                    if (idx === currentQ.correct) {
                      optStateClass = 'correct';
                    } else if (selectedOpt === idx) {
                      optStateClass = 'wrong';
                    }
                  } else if (isEliminated) {
                    optStateClass = 'eliminated';
                  }

                  return (
                    <button
                      key={idx}
                      className={`quiz-opt-btn ${optStateClass}`}
                      onClick={() => handleSelect(idx)}
                      disabled={selectedOpt !== null || isEliminated}
                    >
                      <span className="quiz-opt-badge">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Post-selection feedback & explanation */}
              {selectedOpt !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="quiz-hint-box"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {selectedOpt === currentQ.correct ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Truth Decrypted!
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <XCircle size={16} /> Illusion Veiled the Answer
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0 }}>{currentQ.hint || 'Reflect on this hymn in the sacred Library.'}</p>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="primary" size="sm" onClick={handleNextQuestion}>
                      {currentIdx + 1 < TOTAL_QUESTIONS ? 'Next Riddle' : 'View Exegesis Results'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Lifelines Bar */}
              <div className="quiz-lifelines-bar">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} color="var(--gold)" /> Pranic Invocations (Lifelines):
                </span>

                <div className="quiz-lifeline-actions">
                  <button
                    className="quiz-lifeline-btn"
                    onClick={useFiftyFifty}
                    disabled={eliminatedOpts.length > 0 || selectedOpt !== null}
                    title="Removes 2 incorrect choices (Costs 15 Prana)"
                  >
                    <HelpCircle size={14} /> 50/50 (-15 Prana)
                  </button>

                  <button
                    className="quiz-lifeline-btn"
                    onClick={useAddTime}
                    disabled={selectedOpt !== null}
                    title="Adds 10 seconds to the clock (Costs 10 Prana)"
                  >
                    <Zap size={14} /> +10s (-10 Prana)
                  </button>

                  <button
                    className="quiz-lifeline-btn"
                    onClick={useSkip}
                    disabled={selectedOpt !== null}
                    title="Skip question without penalty (Costs 20 Prana)"
                  >
                    <FastForward size={14} /> Skip (-20 Prana)
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Results Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="quiz-results-card" elevation={3}>
            <div className="quiz-results-icon">
              <Trophy size={42} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
              Decryption Completed
            </h2>
            <p style={{ color: 'var(--text-1)', maxWidth: 460, margin: '0 auto' }}>
              You have penetrated the sacred veil of the Atharva Samhita and unlocked divine contemplation.
            </p>

            <div className="quiz-results-stats-grid">
              <div className="quiz-stat-box">
                <div className="quiz-stat-val">
                  <AnimatedNumber value={score} />
                </div>
                <div className="quiz-stat-lbl">Points Earned</div>
              </div>

              <div className="quiz-stat-box">
                <div className="quiz-stat-val">{correctCount} / {TOTAL_QUESTIONS}</div>
                <div className="quiz-stat-lbl">Correct Mantras</div>
              </div>

              <div className="quiz-stat-box">
                <div className="quiz-stat-val">
                  {Math.round((correctCount / TOTAL_QUESTIONS) * 100)}%
                </div>
                <div className="quiz-stat-lbl">Clarity Level</div>
              </div>
            </div>

            {(correctCount / TOTAL_QUESTIONS) >= 0.7 && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                maxWidth: 420,
                margin: '0 auto var(--space-6)',
                color: 'var(--gold-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}>
                <Award size={18} /> Mastery Achieved: +150 Radiance Points awarded to Sanctum!
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" icon={<RotateCcw size={18} />} onClick={restartQuiz}>
                Decrypt Another Folio
              </Button>
              <Button variant="ghost" icon={<BookOpen size={18} />} onClick={() => window.location.href = '/library'}>
                Study in Library
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default Quizzes;
