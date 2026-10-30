import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { recitationEngine } from '../utils/recitationEngine';
import { CANONICAL_VERSES, findCanonicalVerse } from '../data/canonicalVerses';
import { useSutraAnchor } from '../systems/sutraContext';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  Edit3,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Info,
  Radio,
  Sliders,
  Wind
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

export const VerseDetail = () => {
  const { book = '12', hymn = '1', verse = '1' } = useParams();
  const [searchParams] = useSearchParams();
  const vedaParam = searchParams.get('veda') || 'Atharvaveda';
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  useSutraAnchor('verse-detail-scroll', scrollRef);

  // Verse Data Resolution
  const targetRef = `${book}.${hymn}.${verse}`;
  const canonicalVerse = findCanonicalVerse(targetRef);

  // Reading & Display States
  const [activeTab, setActiveTab] = useState('meaning'); // 'meaning', 'anatomy', 'context', 'notes'
  const [selectedWord, setSelectedWord] = useState(null);
  const [colorSwara, setColorSwara] = useState(true);
  const [showLivingMargins, setShowLivingMargins] = useState(true);

  // Recitation Engine States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85); // 0.85x Vedic slow chanting default
  const [tanpuraActive, setTanpuraActive] = useState(false);

  // Chanting Practice & Acoustic Resonance States
  const [practiceMode, setPracticeMode] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState(null);
  const [vocalResonance, setVocalResonance] = useState(0); // 0-100% real acoustic resonance

  // Student Contemplation Note
  const [studentNote, setStudentNote] = useState(() => {
    return localStorage.getItem(`sutra_notes_${book}_${hymn}_${verse}`) || '';
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Compute character ranges for live word-boundary tracking during recitation
  const wordRanges = useMemo(() => {
    if (!canonicalVerse?.words || !canonicalVerse?.devanagari) return [];
    let currentPos = 0;
    const cleanFull = canonicalVerse.devanagari.replace(/[॥।_|]/g, ' ').replace(/\u0951/g, '').replace(/\u0952/g, '');
    return canonicalVerse.words.map((w) => {
      const cleanW = w.text.replace(/[॥।_|]/g, '').replace(/\u0951/g, '').replace(/\u0952/g, '');
      const idx = cleanFull.indexOf(cleanW, currentPos);
      if (idx !== -1) {
        currentPos = idx + cleanW.length;
        return { start: idx, end: idx + cleanW.length };
      }
      return { start: -1, end: -1 };
    });
  }, [canonicalVerse]);

  // Sync / Stop Recitation on Unmount or Route Change
  useEffect(() => {
    return () => {
      recitationEngine.stop();
      recitationEngine.stopDrone();
      recitationEngine.stopMicAnalysis();
    };
  }, [book, hymn, verse]);

  // Handle note edits
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setStudentNote(val);
    localStorage.setItem(`sutra_notes_${book}_${hymn}_${verse}`, val);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  // Recitation Handlers
  const handleToggleRecitation = useCallback(() => {
    sounds.playTap();

    if (isPlaying) {
      if (isPaused) {
        recitationEngine.resume();
        setIsPaused(false);
      } else {
        recitationEngine.pause();
        setIsPaused(true);
      }
      return;
    }

    if (!canonicalVerse) return;

    // Start recitation of authentic Devanagari text
    recitationEngine.recite(canonicalVerse.devanagari, {
      rate: playbackSpeed,
      pitch: 0.95,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveCharIndex(null);
      },
      onError: (err) => {
        console.warn('Recitation Error:', err);
        setIsPlaying(false);
        setIsPaused(false);
      },
      onBoundary: ({ charIndex }) => {
        setActiveCharIndex(charIndex);
      }
    });
  }, [isPlaying, isPaused, canonicalVerse, playbackSpeed]);

  const handleStopRecitation = () => {
    sounds.playTap();
    recitationEngine.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveCharIndex(null);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackSpeed(newSpeed);
    if (isPlaying && !isPaused) {
      // Re-trigger with updated speed
      recitationEngine.stop();
      recitationEngine.recite(canonicalVerse.devanagari, {
        rate: newSpeed,
        pitch: 0.95,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setActiveCharIndex(null);
        },
        onBoundary: ({ charIndex }) => setActiveCharIndex(charIndex)
      });
    }
  };

  // Tanpura Drone Toggle
  const handleToggleTanpura = () => {
    sounds.playTap();
    if (tanpuraActive) {
      recitationEngine.stopDrone();
      setTanpuraActive(false);
    } else {
      recitationEngine.startDrone(146.83); // Sacred Sa (D3)
      setTanpuraActive(true);
    }
  };

  // Practice Mode & Microphone Resonance Handlers
  const handleToggleMic = async () => {
    sounds.playTap();
    if (micActive) {
      recitationEngine.stopMicAnalysis();
      setMicActive(false);
      setVocalResonance(0);
      setMicError(null);
    } else {
      try {
        setMicError(null);
        await recitationEngine.startMicAnalysis(({ resonance }) => {
          setVocalResonance(resonance);
        });
        setMicActive(true);
      } catch (err) {
        setMicError(err.message || 'Microphone access denied.');
        setMicActive(false);
      }
    }
  };

  // UNMATCHED / UNAVAILABLE VERSE FALLBACK
  if (!canonicalVerse) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          padding: '40px 32px',
          background: 'rgba(22, 23, 21, 0.85)',
          border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.14))',
          borderRadius: 16
        }}>
          <Compass size={40} color="var(--amber-warm, #C59A56)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--silver-moon, #D5D3CB)', marginBottom: 12 }}>
            Manuscript Fragment In Archival Preparation
          </h2>
          <p style={{ color: 'var(--silver-muted, #94A3B8)', lineHeight: 1.6, marginBottom: 24, fontSize: '0.95rem' }}>
            Reference <strong>{vedaParam} {book}.{hymn}.{verse}</strong> is registered in the index, but its critical Devanagari transcription, svara accents, and word-by-word philological anatomy have not yet completed scholar review for the V3 digital archive.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/library')}>
              Return to Manuscripts Archive
            </Button>
            <Button variant="ghost" onClick={() => navigate('/verse/12/1/1')}>
              Read Pṛthivī Sūkta (AVŚ 12.1.1)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px 140px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* 1. ARCHIVAL CITATION & PROVENANCE BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <Button size="sm" variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate('/library')}>
          Manuscripts Archive
        </Button>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={`${canonicalVerse.veda} • ${canonicalVerse.ref}`} variant="gold" />
          <span style={{ fontSize: '0.8rem', color: 'var(--silver-muted, #94A3B8)' }}>
            {canonicalVerse.recension}
          </span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            padding: '3px 8px',
            borderRadius: 6,
            background: 'rgba(135, 148, 122, 0.15)',
            border: '1px solid rgba(135, 148, 122, 0.3)',
            color: 'var(--sage-soft, #87947A)',
            fontWeight: 600
          }}>
            <ShieldCheck size={13} /> VERIFIED ARCHIVAL TRANSCRIPTION
          </div>
        </div>
      </div>

      {/* 2. LIVING ARCHIVE READER STAGE */}
      <div style={{ display: 'grid', gridTemplateColumns: showLivingMargins ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Main Text Scroll Area */}
        <div ref={scrollRef}>
          <GlassCard elevation={3} style={{
            padding: '36px 32px',
            border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.16))',
            background: 'rgba(22, 23, 21, 0.92)'
          }}>
            {/* Header: Title & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(213, 211, 203, 0.08)', paddingBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--amber-warm, #C59A56)', margin: 0, fontSize: '1.25rem' }}>
                  {canonicalVerse.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--silver-muted, #94A3B8)' }}>
                  Chandas (Meter): <strong>{canonicalVerse.meter}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setColorSwara(!colorSwara)}
                  style={{
                    background: colorSwara ? 'rgba(197, 154, 86, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid ' + (colorSwara ? 'var(--amber-warm, #C59A56)' : 'rgba(255, 255, 255, 0.1)'),
                    borderRadius: 6,
                    color: colorSwara ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  title="Toggle Vedic Svara Accent Coloring"
                >
                  Svara Accents: {colorSwara ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setShowLivingMargins(!showLivingMargins)}
                  style={{
                    background: showLivingMargins ? 'rgba(135, 148, 122, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid ' + (showLivingMargins ? 'var(--sage-soft, #87947A)' : 'rgba(255, 255, 255, 0.1)'),
                    borderRadius: 6,
                    color: showLivingMargins ? 'var(--sage-soft, #87947A)' : 'var(--silver-muted, #94A3B8)',
                    fontSize: '0.75rem',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Living Margins
                </button>
              </div>
            </div>

            {/* Sacred Inscription Stage: Devanagari Word Tokens */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 14px',
              padding: '28px 16px',
              background: 'rgba(10, 11, 10, 0.5)',
              borderRadius: 12,
              border: '1px solid rgba(213, 211, 203, 0.06)',
              margin: '20px 0 28px'
            }}>
              {canonicalVerse.words.map((w, idx) => {
                const isSelected = selectedWord?.text === w.text;
                const range = wordRanges[idx];
                const isRecitingThisWord = isPlaying && !isPaused && activeCharIndex !== null && range && range.start !== -1 && activeCharIndex >= range.start && activeCharIndex <= range.end;
                const swaraPrimary = w.swara?.[0] || 'udatta';

                let tokenColor = 'var(--silver-moon, #D5D3CB)';
                if (isRecitingThisWord) {
                  tokenColor = '#FFFFFF';
                } else if (colorSwara) {
                  if (swaraPrimary === 'udatta') tokenColor = 'var(--amber-warm, #C59A56)';
                  else if (swaraPrimary === 'svarita') tokenColor = 'var(--sage-soft, #87947A)';
                  else if (swaraPrimary === 'anudatta') tokenColor = 'var(--silver-muted, #94A3B8)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedWord(w);
                      setShowLivingMargins(true);
                    }}
                    onMouseEnter={() => sounds.playHover()}
                    style={{
                      fontFamily: 'var(--font-sanskrit, "Noto Serif Devanagari", serif)',
                      fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                      color: tokenColor,
                      background: isRecitingThisWord
                        ? 'rgba(197, 154, 86, 0.4)'
                        : isSelected
                        ? 'rgba(197, 154, 86, 0.22)'
                        : 'transparent',
                      border: 'none',
                      borderBottom: isRecitingThisWord
                        ? '2px solid #FFFFFF'
                        : isSelected
                        ? '2px solid var(--amber-warm, #C59A56)'
                        : '2px solid transparent',
                      boxShadow: isRecitingThisWord ? '0 0 16px rgba(197, 154, 86, 0.7)' : 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.15s ease',
                      lineHeight: 1.4
                    }}
                    title={`Click to inspect pada anatomy: ${w.gloss}`}
                  >
                    {w.text}
                  </button>
                );
              })}
            </div>

            {/* IAST Transliteration */}
            <div style={{
              fontSize: '1.05rem',
              color: 'var(--silver-moon, #D5D3CB)',
              fontStyle: 'italic',
              lineHeight: 1.65,
              textAlign: 'center',
              marginBottom: 24,
              padding: '0 12px'
            }}>
              {canonicalVerse.iast}
            </div>

            {/* Translation & Attribution */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderLeft: '3px solid var(--amber-warm, #C59A56)',
              padding: '16px 20px',
              borderRadius: '0 8px 8px 0',
              marginBottom: 28
            }}>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--silver-moon, #D5D3CB)',
                lineHeight: 1.7,
                margin: 0,
                fontFamily: 'var(--font-body, "Newsreader", serif)'
              }}>
                &ldquo;{canonicalVerse.translation}&rdquo;
              </p>
              <div style={{
                marginTop: 10,
                fontSize: '0.75rem',
                color: 'var(--silver-muted, #94A3B8)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Info size={13} color="var(--amber-warm, #C59A56)" />
                {canonicalVerse.translatorAttribution}
              </div>
            </div>

            {/* PRACTICE & ACOUSTIC RESONANCE MODE */}
            <div style={{
              background: 'rgba(15, 16, 14, 0.7)',
              border: '1px solid rgba(213, 211, 203, 0.1)',
              borderRadius: 12,
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wind size={18} color="var(--amber-warm, #C59A56)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--silver-moon, #D5D3CB)' }}>
                    Vedic Rhythmic Breath Pacer & Acoustic Resonance
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    size="sm"
                    variant={practiceMode ? 'primary' : 'ghost'}
                    onClick={() => {
                      sounds.playTap();
                      setPracticeMode(!practiceMode);
                    }}
                  >
                    {practiceMode ? 'Pacer: ACTIVE' : 'Start Chanting Practice'}
                  </Button>
                  {practiceMode && (
                    <Button
                      size="sm"
                      variant={micActive ? 'primary' : 'ghost'}
                      icon={micActive ? <Mic size={14} /> : <MicOff size={14} />}
                      onClick={handleToggleMic}
                    >
                      {micActive ? `Resonance: ${vocalResonance}%` : 'Enable Mic'}
                    </Button>
                  )}
                </div>
              </div>

              {practiceMode && (
                <div>
                  {/* Breath Cadence Bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', marginBottom: 4 }}>
                      <span>Pūraka (Inhale 4s)</span>
                      <span>Kumbhaka (Retain 4s)</span>
                      <span>Recaka (Chant 4s)</span>
                    </div>
                    <div style={{
                      height: 6,
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--amber-warm, #C59A56), var(--sage-soft, #87947A))',
                        animation: 'pacerCycle 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }} />
                    </div>
                  </div>

                  {/* Live Acoustic Waveform / Resonance Gauge */}
                  {micActive ? (
                    <div style={{
                      padding: 12,
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 8,
                      border: '1px solid rgba(135, 148, 122, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--sage-soft, #87947A)' }}>Vocal Projection Resonance</span>
                          <span style={{ color: 'var(--silver-moon, #D5D3CB)', fontWeight: 600 }}>{vocalResonance}%</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${vocalResonance}%`,
                            height: '100%',
                            background: vocalResonance > 40 ? 'var(--sage-soft, #87947A)' : 'var(--amber-warm, #C59A56)',
                            transition: 'width 0.1s ease-out'
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', maxWidth: 220, lineHeight: 1.3 }}>
                        Real-time acoustic amplitude. Steady vocal breath without strain.
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', margin: 0, fontStyle: 'italic' }}>
                      Follow the 12-second breath cycle above. Enable microphone to see your live acoustic resonance without arbitrary percentage scores.
                    </p>
                  )}

                  {micError && (
                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--signal-red, #EF4444)' }}>
                      {micError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TABBED COMMENTARY VIEWPORT */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(213, 211, 203, 0.1)', paddingBottom: 10, marginBottom: 16, overflowX: 'auto' }}>
                {[
                  { id: 'meaning', label: 'Hermeneutic Insight', icon: BookOpen },
                  { id: 'anatomy', label: 'Meter Anatomy', icon: Layers },
                  { id: 'context', label: 'Scriptural Context', icon: Sparkles },
                  { id: 'notes', label: 'Sadhana Contemplation', icon: Edit3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isTabActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        sounds.playTap();
                        setActiveTab(tab.id);
                      }}
                      style={{
                        background: isTabActive ? 'rgba(197, 154, 86, 0.15)' : 'transparent',
                        border: isTabActive ? '1px solid var(--amber-warm, #C59A56)' : '1px solid transparent',
                        borderRadius: 6,
                        color: isTabActive ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: isTabActive ? 600 : 500
                      }}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'meaning' && (
                <div style={{ color: 'var(--silver-moon, #D5D3CB)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--amber-warm, #C59A56)', margin: '0 0 8px' }}>
                    Esoteric Realization
                  </h4>
                  <p style={{ margin: 0 }}>{canonicalVerse.esotericInsight}</p>
                </div>
              )}

              {activeTab === 'anatomy' && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--amber-warm, #C59A56)', margin: '0 0 8px' }}>
                    Chandas Architecture: {canonicalVerse.meter}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--silver-muted, #94A3B8)', marginBottom: 14 }}>
                    Vedic meter protects the mind (<em>yad akṣaraṃ chādayati tan mātrā chandasaḥ</em>). Syllables are calibrated into Laghu (light, 1 mora) and Guru (heavy, 2 morae).
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    {['Pāda 1', 'Pāda 2', 'Pāda 3', 'Pāda 4'].map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--amber-warm, #C59A56)', fontWeight: 600 }}>{p}</div>
                        <div style={{ letterSpacing: '4px', fontSize: '1.1rem', color: 'var(--sage-soft, #87947A)', marginTop: 4 }}>
                          • — • —
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'context' && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--amber-warm, #C59A56)', margin: '0 0 8px' }}>
                    Transmission & Recension
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--silver-moon, #D5D3CB)', lineHeight: 1.6, marginBottom: 14 }}>
                    Preserved through the unbroken oral mnemonic traditions of the <strong>{canonicalVerse.recension}</strong>. Atharvavedic suktas bridge cosmic ritual metaphysics with everyday terrestrial and ecological harmony.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canonicalVerse.themes.map((th) => (
                      <Chip key={th} label={`Theme: ${th}`} variant="gold" />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ fontFamily: 'var(--font-display, Cinzel)', color: 'var(--amber-warm, #C59A56)', margin: 0 }}>
                      Personal Sādhana Contemplation
                    </h4>
                    {noteSavedFeedback && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--sage-soft, #87947A)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> Preserved locally in sanctum
                      </span>
                    )}
                  </div>
                  <textarea
                    value={studentNote}
                    onChange={handleNoteChange}
                    placeholder="Record your philological inquiries, philosophical insights, or meditative questions on this verse..."
                    rows={5}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(213, 211, 203, 0.15)',
                      borderRadius: 8,
                      padding: 12,
                      color: 'var(--silver-moon, #D5D3CB)',
                      fontFamily: 'var(--font-body, serif)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* 3. LIVING MARGINS DRAWER (RIGHT PANEL ON DESKTOP) */}
        {showLivingMargins && (
          <aside style={{
            position: 'sticky',
            top: 84,
            background: 'rgba(22, 23, 21, 0.95)',
            border: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.14))',
            borderRadius: 14,
            padding: 20,
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(213, 211, 203, 0.08)', paddingBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-display, Cinzel)', fontSize: '0.9rem', color: 'var(--amber-warm, #C59A56)', fontWeight: 600 }}>
                Living Margins
              </span>
              <button
                onClick={() => setShowLivingMargins(false)}
                style={{ background: 'none', border: 'none', color: 'var(--silver-muted, #94A3B8)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

            {selectedWord ? (
              <div>
                <div style={{
                  fontFamily: 'var(--font-sanskrit, "Noto Serif Devanagari", serif)',
                  fontSize: '1.8rem',
                  color: 'var(--amber-warm, #C59A56)',
                  marginBottom: 10
                }}>
                  {selectedWord.text}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--silver-muted, #94A3B8)', display: 'block', fontSize: '0.75rem' }}>Dhātu (Root):</span>
                    <strong style={{ color: 'var(--silver-moon, #D5D3CB)' }}>√{selectedWord.root}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--silver-muted, #94A3B8)', display: 'block', fontSize: '0.75rem' }}>Grammatical Form:</span>
                    <strong style={{ color: 'var(--silver-moon, #D5D3CB)' }}>{selectedWord.grammar || 'Indéclinable / Noun'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--silver-muted, #94A3B8)', display: 'block', fontSize: '0.75rem' }}>Archival Gloss:</span>
                    <strong style={{ color: 'var(--silver-moon, #D5D3CB)' }}>{selectedWord.gloss}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--silver-muted, #94A3B8)', display: 'block', fontSize: '0.75rem' }}>Svara Pitch Accent:</span>
                    <span style={{
                      display: 'inline-block',
                      marginTop: 4,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(197, 154, 86, 0.15)',
                      color: 'var(--amber-warm, #C59A56)'
                    }}>
                      {(selectedWord.swara || ['udatta']).join(', ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(213, 211, 203, 0.08)' }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      sounds.playTap();
                      recitationEngine.recite(selectedWord.text, { rate: 0.75 });
                    }}
                    icon={<Volume2 size={13} />}
                  >
                    Pronounce Token
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--silver-muted, #94A3B8)' }}>
                <Layers size={28} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  Tap any Sanskrit word token in the inscription above to inspect its etymological root (<em>dhātu</em>), grammatical case, and svara accents.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 4. DEDICATED RECITATION CONTROL DOCK */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(16, 17, 15, 0.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle, rgba(213, 211, 203, 0.16))',
        padding: '14px 24px',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Playback & Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="primary"
            icon={isPlaying && !isPaused ? <Volume2 size={16} /> : <VolumeX size={16} />}
            onClick={handleToggleRecitation}
          >
            {isPlaying && !isPaused ? 'Pause Chanting' : isPaused ? 'Resume Recitation' : 'Listen Recitation'}
          </Button>

          {isPlaying && (
            <Button size="sm" variant="ghost" onClick={handleStopRecitation}>
              Stop
            </Button>
          )}

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--silver-muted, #94A3B8)' }}>
            <Sliders size={14} color="var(--amber-warm, #C59A56)" />
            <span>Speed:</span>
            <select
              value={playbackSpeed}
              onChange={handleSpeedChange}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--amber-warm, #C59A56)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 4,
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <option value="0.7">0.70x (Vedic Slow)</option>
              <option value="0.85">0.85x (Chanting Cadence)</option>
              <option value="1.0">1.00x (Standard)</option>
              <option value="1.2">1.20x (Fluent Pāṭha)</option>
            </select>
          </div>

          {/* Tanpura Acoustic Drone Accompaniment */}
          <button
            onClick={handleToggleTanpura}
            style={{
              background: tanpuraActive ? 'rgba(197, 154, 86, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid ' + (tanpuraActive ? 'var(--amber-warm, #C59A56)' : 'rgba(255, 255, 255, 0.1)'),
              borderRadius: 6,
              color: tanpuraActive ? 'var(--amber-warm, #C59A56)' : 'var(--silver-muted, #94A3B8)',
              padding: '6px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
            title="Toggle Continuous Tanpura Drone (Sa = 146.83 Hz)"
          >
            <Radio size={14} /> Tanpura Drone: {tanpuraActive ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Reader Navigation to Other Hymns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              sounds.playTap();
              navigate('/chat');
            }}
          >
            Inquire with Rishi AI
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              sounds.playTap();
              navigate('/library');
            }}
          >
            Manuscripts Index
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerseDetail;
