import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Sparkles, Volume2, Mic, Zap, Award, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import eventBus from './eventBus';

export const LessonPlayer = ({ session, onClose, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [micActive, setMicActive] = useState(false);

  const { addRp, consumePrana, restorePrana } = useGameStore();

  const currentExercise = session[currentIdx] || session[0];
  const verse = currentExercise?.verse;

  // Keyboard controls: 1-4 to select, Enter to check/continue
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFinished) return;
      if (['1', '2', '3', '4'].includes(e.key) && !isChecked) {
        const idx = parseInt(e.key, 10) - 1;
        setSelectedAnswer(idx);
        sounds.playTap();
      } else if (e.key === 'Enter') {
        if (!isChecked && selectedAnswer !== null) {
          handleCheck();
        } else if (isChecked) {
          handleContinue();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    setIsChecked(true);

    // Mock check: index 0 is canonical correct for demo options
    const correct = selectedAnswer === 0;
    setIsCorrect(correct);

    if (correct) {
      sounds.playSuccess();
      setScore((s) => s + 50);
      addRp(50);
      restorePrana(5);
      setFeedback({
        title: 'Satyam! Truth Unveiled',
        explanation: 'Your pronunciation and discernment align with the Vedic meter.',
        rishiTip: 'Contemplate how the meter (Chanda) protects the breath of the seeker.'
      });
      eventBus.emit('lesson:answer', { correct: true, exId: currentExercise.id });
    } else {
      sounds.playError();
      consumePrana(10);
      setFeedback({
        title: 'Veiled by Maya',
        explanation: 'The cadence wavered. Reflect upon the dhatu (root) of the sacred word.',
        rishiTip: 'Do not hurry the chant. Let the sound emerge from the navel through the throat.'
      });
      eventBus.emit('lesson:answer', { correct: false, exId: currentExercise.id });
    }
  };

  const handleContinue = useCallback(() => {
    if (currentIdx + 1 < session.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsChecked(false);
      setIsCorrect(false);
      setFeedback(null);
    } else {
      setIsFinished(true);
      sounds.playLevelUp();
      eventBus.emit('lesson:complete', { score });
      if (onComplete) onComplete(score);
    }
  }, [currentIdx, session.length, score, onComplete]);

  const toggleMic = () => {
    sounds.playTap();
    setMicActive(!micActive);
  };

  const progressPercent = ((currentIdx + (isChecked ? 1 : 0)) / session.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 7, 13, 0.96)',
        backdropFilter: 'blur(20px)',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}
          aria-label="Close Lesson"
        >
          <X size={24} />
        </button>

        {/* Segmented Progress Thread */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 20px', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--gold), var(--cyan))',
              boxShadow: '0 0 10px var(--gold)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        <Chip label={`RP: +${score}`} variant="gold" icon={<Sparkles size={14} />} />
      </div>

      {/* Main Exercise Viewport */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        {!isFinished ? (
          <GlassCard elevation={2} style={{ width: '100%', maxWidth: 640, padding: 32, textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <Chip label={currentExercise.type.replace('_', ' ').toUpperCase()} variant="cyan" />
            </div>

            <div style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '1.8rem', color: 'var(--gold-bright)', marginBottom: 12 }}>
              {verse?.devanagari || 'ॐ भूर्भुवः स्वः'}
            </div>

            <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', marginBottom: 24 }}>
              {verse?.translation || 'Decode and recite the sacred hymn with clarity.'}
            </p>

            {/* Simulated Pitch Tracking Ribbon if Chant Mode */}
            {currentExercise.type === 'chant_pitch' && (
              <div style={{ margin: '16px 0', padding: 16, background: 'rgba(0, 240, 255, 0.05)', borderRadius: 12, border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>Svara Pitch Contour (Sa-Ga-Pa)</span>
                  <Button size="sm" variant={micActive ? 'primary' : 'ghost'} icon={<Mic size={14} />} onClick={toggleMic}>
                    {micActive ? 'Mic Active' : 'Enable Mic'}
                  </Button>
                </div>
                <div style={{ height: 40, background: 'rgba(0,0,0,0.4)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'var(--cyan)',
                      boxShadow: '0 0 8px var(--cyan)',
                      transform: micActive ? 'translateY(calc(-10px + 20px * var(--breath, 0.5)))' : 'translateY(0)',
                      transition: 'transform 0.1s ease'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Multiple Choice / Token Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                verse?.words?.[0]?.gloss || 'Truth / Supreme Reality',
                'Illusion of Time',
                'Fleeting Worldly Desires',
                'Cosmic Dissolution'
              ].map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isChecked) {
                        sounds.playTap();
                        setSelectedAnswer(idx);
                      }
                    }}
                    style={{
                      padding: '16px 14px',
                      background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1.5px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      color: isSelected ? '#fff' : 'var(--text-1)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      cursor: isChecked ? 'default' : 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        ) : (
          /* Finished Screen */
          <GlassCard elevation={3} style={{ width: '100%', maxWidth: 480, padding: 36, textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
                border: '2px solid var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--gold-bright)'
              }}
            >
              <Award size={36} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
              Lesson Consecrated
            </h2>
            <p style={{ color: 'var(--text-1)', fontSize: '0.9rem', marginBottom: 20 }}>
              The Sutra thread has expanded across the Pada Spiral.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--gold-bright)' }}>
                  <AnimatedNumber value={score} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Radiance Gained</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--cyan)' }}>
                  100%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Accuracy</div>
              </div>
            </div>

            <Button variant="primary" icon={<RotateCcw size={16} />} onClick={onClose}>
              Return to Sanctuary
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Bottom Action / Feedback Bar */}
      {!isFinished && (
        <div
          style={{
            padding: '20px 24px',
            background: isChecked
              ? isCorrect
                ? 'rgba(79, 209, 197, 0.15)'
                : 'rgba(255, 77, 109, 0.15)'
              : 'rgba(15, 13, 24, 0.85)',
            borderTop: isChecked
              ? isCorrect
                ? '1px solid var(--success)'
                : '1px solid var(--danger)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.3s ease'
          }}
        >
          {isChecked && feedback ? (
            <div>
              <div style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--danger)', fontSize: '1rem', marginBottom: 2 }}>
                {feedback.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                {feedback.explanation}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
              Press 1-4 to select, Enter to verify
            </div>
          )}

          <div>
            {!isChecked ? (
              <Button
                variant="primary"
                disabled={selectedAnswer === null}
                icon={<Check size={18} />}
                onClick={handleCheck}
              >
                Verify Chant
              </Button>
            ) : (
              <Button
                variant={isCorrect ? 'primary' : 'danger'}
                icon={<ArrowRight size={18} />}
                onClick={handleContinue}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
