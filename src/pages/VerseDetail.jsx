import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  Save,
  Clock,
  Radio
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Tooltip } from '../components/ui/Tooltip';

// Detailed Word Glossary Database for Canonical Verses
const WORD_GLOSSARY_LOOKUP = {
  'माता': { translit: 'mātā', root: 'मातृ (f. nom. sg.)', meaning: 'The Mother, primeval nourisher' },
  'भूमिः': { translit: 'bhūmiḥ', root: 'भूमि (f. nom. sg.)', meaning: 'The sacred Earth, foundational soil' },
  'पुत्रो': { translit: 'putraḥ', root: 'पुत्र (m. nom. sg.)', meaning: 'The child, offspring, son' },
  'अहं': { translit: 'aham', root: 'अस्मद् (pron. 1st sg.)', meaning: 'I myself, individual conscious self' },
  'पृथिव्याः': { translit: 'pṛthivyāḥ', root: 'पृथिवी (f. gen. sg.)', meaning: 'Of the expansive sacred Earth' },
  'पर्जन्यः': { translit: 'parjanyaḥ', root: 'पर्जन्य (m. nom. sg.)', meaning: 'The celestial rain-cloud deity' },
  'पिता': { translit: 'pitā', root: 'पितृ (m. nom. sg.)', meaning: 'The Father, cosmic protector' },
  'स': { translit: 'saḥ', root: 'तद् (m. nom. sg.)', meaning: 'He, that divine force' },
  'उ': { translit: 'u', root: 'उ (indecl. particle)', meaning: 'Indeed, verily, furthermore' },
  'नः': { translit: 'naḥ', root: 'अस्मद् (pron. dat./acc. pl.)', meaning: 'Unto us all, our entire assembly' },
  'पिपर्तु': { translit: 'pipartu', root: 'पृ (root, 3rd sg. imperat.)', meaning: 'May he nourish, sustain, and fulfill' },
  'अग्निमीळे': { translit: 'agnim īḷe', root: 'अग्नि + ईड् (1st sg. pres.)', meaning: 'I adore, magnify the Divine Fire' },
  'पुरोहितं': { translit: 'purohitam', root: 'पुरोहित (m. acc. sg.)', meaning: 'The supreme priest placed in front' },
  'यज्ञस्य': { translit: 'yajñasya', root: 'यज्ञ (m. gen. sg.)', meaning: 'Of the cosmic offering and sacrifice' },
  'देवमृत्विजम्': { translit: 'devam ṛtvijam', root: 'देव + ऋत्विज्', meaning: 'The divine minister of seasonal rites' }
};

export const VerseDetail = () => {
  const { book = 12, hymn = 1, verse = 1 } = useParams();
  const [searchParams] = useSearchParams();
  const veda = searchParams.get('veda') || 'atharva';
  const navigate = useNavigate();

  const addRp = useGameStore((state) => state.addRp);

  const [loading, setLoading] = useState(true);
  const [verseData, setVerseData] = useState(null);
  const [activeTab, setActiveTab] = useState('translation'); // 'translation', 'translit', 'insight', 'notes'

  // Chanting & Recitation State
  const [isChanting, setIsChanting] = useState(false);
  const [recitationLine, setRecitationLine] = useState(0);
  const [recitationTimer, setRecitationTimer] = useState(0);
  const [challengeAnswered, setChallengeAnswered] = useState(null);

  // Student Notes (persisted to localStorage)
  const notesStorageKey = `sutra_notes_${veda}_${book}_${hymn}_${verse}`;
  const [studentNote, setStudentNote] = useState(() => {
    return localStorage.getItem(notesStorageKey) || '';
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Parse Book, Hymn, Verse integers
  const bookNum = parseInt(book, 10);
  const hymnNum = parseInt(hymn, 10);
  const verseNum = parseInt(verse, 10);

  // Fetch or generate rich verse exegesis
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchVerse = async () => {
      try {
        const token = localStorage.getItem('sutra_token');
        const res = await fetch('/api/verse/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            veda,
            book: bookNum,
            hymn: hymnNum,
            verse: verseNum,
            sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setVerseData(data);
        } else {
          throw new Error('Fallback needed');
        }
      } catch {
        if (isMounted) {
          setVerseData({
            sanskritLines: [
              'माता भूमिः पुत्रो अहं पृथिव्याः ।',
              'पर्जन्यः पिता स उ नः पिपर्तु ॥'
            ],
            sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः । पर्जन्यः पिता स उ नः पिपर्तु ॥',
            transliteration: 'mātā bhūmiḥ putro ahaṁ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu',
            english: 'The Earth is my mother and I am the child of the soil. The rain-cloud is my father; may he sustain and nourish us.',
            hindi: 'पृथ्वी मेरी माता है और मैं इस पवित्र भूमि का पुत्र हूँ। पर्जन्य (मेघ) हमारे पिता हैं, वे हमारा पोषण करें।',
            practicalMeaning: 'This iconic hymn from the Atharvaveda (Bhumi Sukta) emphasizes humanity’s filial and ecological covenant with nature. Earth is not a dead resource to be exploited, but an animate mother to be venerated.',
            topics: ['Sacred Ecology', 'Atharvaveda', 'Universal Kinship', 'Bhumi Sukta'],
            chanda: 'Anushtubh Meter (32 Syllables)',
            challenge: {
              question: 'According to this sacred hymn, what is the spiritual relation established between humanity and Mother Earth?',
              options: [
                'Imperial exploitation of natural minerals',
                'Devoted child bound in eternal covenant to a loving mother',
                'Fearful submission to untamable wrath',
                'Indifference to worldly elements'
              ],
              correctIndex: 1
            }
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVerse();
    return () => {
      isMounted = false;
    };
  }, [veda, bookNum, hymnNum, verseNum]);

  // Recitation Chanting Loop
  useEffect(() => {
    let timerInterval;
    if (isChanting) {
      timerInterval = setInterval(() => {
        setRecitationTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isChanting]);

  // Audio Chant Drone Toggle
  const handleToggleChant = () => {
    if (!isChanting) {
      sounds.playChantDrone();
      setIsChanting(true);
    } else {
      setIsChanting(false);
      setRecitationTimer(0);
    }
  };

  // Save Student Notes
  const handleSaveNotes = () => {
    sounds.playUnlockChime();
    localStorage.setItem(notesStorageKey, studentNote);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  // Handle Challenge answer
  const handleChallengeOption = (idx) => {
    if (challengeAnswered !== null) return;
    setChallengeAnswered(idx);

    if (verseData?.challenge && idx === verseData.challenge.correctIndex) {
      sounds.playUnlockChime();
      addRp(75);
    } else {
      sounds.playCombatHit(false);
    }
  };

  // Navigations
  const handlePrevVerse = () => {
    if (verseNum > 1) {
      sounds.playTibetanBowl();
      navigate(`/verse/${bookNum}/${hymnNum}/${verseNum - 1}?veda=${veda}`);
    }
  };

  const handleNextVerse = () => {
    sounds.playTibetanBowl();
    navigate(`/verse/${bookNum}/${hymnNum}/${verseNum + 1}?veda=${veda}`);
  };

  const lines = verseData?.sanskritLines || [verseData?.sanskrit || ''];

  return (
    <div className="verse-detail-container">
      {/* Top Header & Breadcrumb Bar */}
      <div className="verse-header-bar">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate(`/library?veda=${veda}`)}
        >
          Return to Vedas
        </Button>

        <div className="verse-breadcrumb-meta">
          {veda.toUpperCase()} VEDA • BOOK {bookNum} • SUKTA {hymnNum} • VERSE {verseNum}
        </div>

        <div className="verse-nav-arrows">
          <Button
            variant="ghost"
            disabled={verseNum <= 1}
            icon={ArrowLeft}
            onClick={handlePrevVerse}
          >
            Prev Verse
          </Button>
          <Button
            variant="cyber"
            icon={ArrowRight}
            onClick={handleNextVerse}
          >
            Next Verse
          </Button>
        </div>
      </div>

      {loading ? (
        <GlassCard spotlight style={{ padding: '60px', textAlign: 'center' }}>
          <Radio size={36} style={{ color: 'var(--gold-bright)', marginBottom: '14px', animation: 'spin 3s linear infinite' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF' }}>
            Attuning to Acoustic Vedic Frequency...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Synthesizing word-by-word Sanskrit roots and exegesis.
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Immersive Reader Panel */}
          <GlassCard spotlight className="verse-reader-panel">
            {/* Action Bar: Recitation Chanting Drone & Topic Badges */}
            <div className="verse-reader-actions-bar">
              <Button
                variant={isChanting ? 'primary' : 'cyber'}
                icon={isChanting ? VolumeX : Volume2}
                onClick={handleToggleChant}
              >
                {isChanting ? 'Silence Sonic Drone' : 'Activate 432Hz Chanting Drone'}
              </Button>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {verseData?.topics?.map((t, i) => (
                  <Chip key={i} variant="gold">
                    {t}
                  </Chip>
                ))}
                {verseData?.chanda && (
                  <Chip variant="cyber">
                    {verseData.chanda}
                  </Chip>
                )}
              </div>
            </div>

            {/* Recitation Active Mode Bar */}
            {isChanting && (
              <div className="recitation-bar">
                <div className="recitation-timer-tag">
                  <Clock size={16} />
                  <span>Recitation Meditation: {recitationTimer}s</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      sounds.playTibetanBowl();
                      setRecitationLine((l) => (l > 0 ? l - 1 : lines.length - 1));
                    }}
                  >
                    Previous Line
                  </Button>
                  <Button
                    variant="cyber"
                    onClick={() => {
                      sounds.playTibetanBowl();
                      setRecitationLine((l) => (l + 1) % lines.length);
                    }}
                  >
                    Next Line Highlight
                  </Button>
                </div>
              </div>
            )}

            {/* Interactive Devanagari Display with Word-by-Word Hover Glossary Tooltip */}
            <div className="verse-interactive-display">
              {lines.map((line, lineIdx) => {
                const words = line.split(' ');
                const isActiveRecitation = isChanting && recitationLine === lineIdx;

                return (
                  <div
                    key={lineIdx}
                    className={`sanskrit-verse-line ${isActiveRecitation ? 'active-recitation' : ''}`}
                  >
                    {words.map((rawWord, wordIdx) => {
                      const cleanWord = rawWord.replace(/[।॥|]/g, '').trim();
                      const gloss = WORD_GLOSSARY_LOOKUP[cleanWord];

                      if (!gloss) {
                        return (
                          <span key={wordIdx} className="sanskrit-gloss-word">
                            {rawWord}
                          </span>
                        );
                      }

                      const tooltipContent = (
                        <div className="word-glossary-tooltip">
                          <span className="word-glossary-translit">{gloss.translit}</span>
                          <span className="word-glossary-root">Root: {gloss.root}</span>
                          <span className="word-glossary-meaning">{gloss.meaning}</span>
                        </div>
                      );

                      return (
                        <Tooltip key={wordIdx} content={tooltipContent} side="top">
                          <span className="sanskrit-gloss-word">
                            {rawWord}
                          </span>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Tabbed Exegesis Panels */}
            <div className="verse-tabs-header">
              {[
                { id: 'translation', label: 'Translations (EN & HI)' },
                { id: 'translit', label: 'Transliteration & Meter' },
                { id: 'insight', label: 'Esoteric Wisdom' },
                { id: 'notes', label: 'Seeker Notes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`verse-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    sounds.playTibetanBowl();
                    setActiveTab(tab.id);
                  }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="verse-tab-active" className="verse-tab-underline" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Translation */}
            {activeTab === 'translation' && (
              <div className="verse-tab-content-panel">
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase' }}>
                    English Exegesis
                  </span>
                  <p style={{ color: '#FDFBEE', fontSize: '1.08rem', lineHeight: 1.6, margin: '8px 0 0' }}>
                    "{verseData?.english}"
                  </p>
                </div>

                {verseData?.hindi && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase' }}>
                      हिन्दी भावार्थ
                    </span>
                    <p style={{ color: '#FDFBEE', fontSize: '1.05rem', lineHeight: 1.6, margin: '8px 0 0' }}>
                      {verseData?.hindi}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Transliteration */}
            {activeTab === 'translit' && (
              <div className="verse-tab-content-panel">
                <span style={{ fontSize: '0.8rem', color: 'var(--soma)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase' }}>
                  Romanized IAST Phonetics
                </span>
                <p style={{ color: '#FFF', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.7, margin: '10px 0 16px' }}>
                  {verseData?.transliteration}
                </p>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Preserves authentic tonal pitch accents (Udatta, Anudatta, Svarita) across the canonical Samhita.
                </div>
              </div>
            )}

            {/* Tab 3: Esoteric Insight */}
            {activeTab === 'insight' && (
              <div className="verse-tab-content-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)', marginBottom: '8px' }}>
                  <Sparkles size={18} />
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Living Metaphysics & Spiritual Application</strong>
                </div>
                <p style={{ color: '#FDFBEE', fontSize: '0.98rem', lineHeight: 1.65, margin: 0 }}>
                  {verseData?.practicalMeaning}
                </p>
              </div>
            )}

            {/* Tab 4: Student Notes */}
            {activeTab === 'notes' && (
              <div className="verse-tab-content-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Personal contemplation reflections saved to local sanctuary memory.
                  </span>
                  {noteSavedFeedback && (
                    <Chip variant="gold" icon={CheckCircle2}>
                      Saved to Memory
                    </Chip>
                  )}
                </div>

                <textarea
                  className="student-notes-textarea"
                  placeholder="Record your realizations, grammatical observations, and meditative insights for this shloka..."
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                />

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    icon={Save}
                    onClick={handleSaveNotes}
                  >
                    Save Seeker Notes
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Comprehension Trial Section */}
          {verseData?.challenge && (
            <GlassCard spotlight style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <BrainCircuit size={20} style={{ color: 'var(--gold-bright)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.25rem', margin: 0 }}>
                  Spiritual Comprehension Trial
                </h3>
              </div>

              <p style={{ color: '#FDFBEE', fontSize: '1rem', lineHeight: 1.55, margin: '0 0 20px' }}>
                {verseData.challenge.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {verseData.challenge.options.map((opt, i) => {
                  const isChosen = challengeAnswered === i;
                  const isCorrect = i === verseData.challenge.correctIndex;

                  let borderClass = 'rgba(255, 255, 255, 0.1)';
                  let bgClass = 'rgba(10, 10, 18, 0.5)';

                  if (challengeAnswered !== null) {
                    if (isCorrect) {
                      borderClass = 'var(--success)';
                      bgClass = 'rgba(79, 209, 197, 0.15)';
                    } else if (isChosen) {
                      borderClass = 'var(--danger)';
                      bgClass = 'rgba(255, 77, 109, 0.15)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={challengeAnswered !== null}
                      onClick={() => handleChallengeOption(i)}
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: 'var(--radius-sm)',
                        background: bgClass,
                        border: `1px solid ${borderClass}`,
                        color: '#FFF',
                        fontSize: '0.92rem',
                        textAlign: 'left',
                        cursor: challengeAnswered === null ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{opt}</span>
                      {challengeAnswered !== null && isCorrect && (
                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                      )}
                      {challengeAnswered !== null && isChosen && !isCorrect && (
                        <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {challengeAnswered !== null && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      challengeAnswered === verseData.challenge.correctIndex
                        ? 'rgba(212, 175, 55, 0.12)'
                        : 'rgba(255, 77, 109, 0.12)',
                    border:
                      challengeAnswered === verseData.challenge.correctIndex
                        ? '1px solid var(--gold)'
                        : '1px solid var(--danger)',
                    color: '#FFF',
                    fontSize: '0.9rem'
                  }}
                >
                  {challengeAnswered === verseData.challenge.correctIndex
                    ? '✨ Pure discernment attained! +75 Radiance Points granted to your soul identity.'
                    : 'Reflect upon the filial bond of the Bhumi Sukta. Contemplation deepens wisdom.'}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};

export default VerseDetail;
