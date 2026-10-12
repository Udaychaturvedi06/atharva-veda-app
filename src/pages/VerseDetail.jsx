import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { 
  Sparkles, 
  Volume2, 
  ArrowLeft, 
  BrainCircuit, 
  CheckCircle2,
  AlertCircle,
  Music,
  Eye,
  Award
} from 'lucide-react';

const WORD_BREAKDOWN_SAMPLE = [
  { deva: 'माता', translit: 'mātā', root: 'Mā (To measure, shape, nurture)', meaning: 'Mother / The nurturing ground' },
  { deva: 'भूमिः', translit: 'bhūmiḥ', root: 'Bhū (To exist, be, flourish)', meaning: 'Earth / The fertile soil of being' },
  { deva: 'पुत्रो', translit: 'putraḥ', root: 'Pu + Tra (Purifying lineage)', meaning: 'Child / Offspring of the cosmos' },
  { deva: 'अहं', translit: 'aham', root: 'Ah (Ego / Individual soul)', meaning: 'I am / The conscious self' },
  { deva: 'पृथिव्याः', translit: 'pṛthivyāḥ', root: 'Prath (To expand, broaden)', meaning: 'Of the Vast Mother Earth' }
];

const VerseDetail = () => {
  const { book = 12, hymn = 1, verse = 1 } = useParams();
  const [searchParams] = useSearchParams();
  const veda = searchParams.get('veda') || 'atharva';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verseData, setVerseData] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeWord, setActiveWord] = useState(null);
  const [meterTaps, setMeterTaps] = useState(0);
  const [challengeAnswered, setChallengeAnswered] = useState(null);
  
  const addRp = useGameStore(state => state.addRp);

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
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            veda,
            book: parseInt(book),
            hymn: parseInt(hymn),
            verse: parseInt(verse),
            sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setVerseData(data);
        } else {
          throw new Error('Fallback needed');
        }
      } catch (err) {
        if (isMounted) {
          setVerseData({
            sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||',
            transliteration: 'mātā bhūmiḥ putro ahaṁ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu',
            english: 'The Earth is my mother and I am the child of the soil. The rain-cloud is my father; may he sustain us.',
            hindi: 'पृथ्वी मेरी माता है और मैं इस भूमि का पुत्र हूँ। पर्जन्य (मेघ) हमारे पिता हैं, वे हमारा पोषण करें।',
            practicalMeaning: 'This iconic Prithvi Sukta from the Atharvaveda establishes that humans are ecological stewards rather than masters of nature.',
            topics: ['Sacred Ecology', 'Atharvaveda', 'Universal Kinship'],
            chanda: 'Anustubh Meter (32 Syllables)',
            challenge: {
              question: 'In this hymn, what is the eternal bond articulated between the seeker and Mother Earth?',
              options: [
                'Exploitative domination over all resources',
                'Devoted child to a nurturing mother',
                'Aloof detachment from nature',
                'Superstitious terror of earthquakes'
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
    return () => { isMounted = false; };
  }, [veda, book, hymn, verse]);

  const handleMeterTap = () => {
    sounds.playTibetanBowl();
    setMeterTaps(prev => prev + 1);
    if ((meterTaps + 1) % 8 === 0) {
      sounds.playUnlockChime();
      addRp(20);
    }
  };

  const handleChallenge = (idx) => {
    if (challengeAnswered !== null) return;
    setChallengeAnswered(idx);
    if (verseData?.challenge && idx === verseData.challenge.correctIndex) {
      sounds.playUnlockChime();
      addRp(75);
    } else {
      sounds.playCombatHit(false);
    }
  };

  return (
    <div className="verse-detail-chamber">
      <button className="back-nav-btn" onClick={() => navigate(`/library?veda=${veda}`)}>
        <ArrowLeft size={16} /> <span>Return to Library</span>
      </button>

      <div className="verse-chamber-header">
        <span className="chamber-coordinate">
          {veda.toUpperCase()} VEDA • MANDALA/KANDA {book} • SUKTA {hymn} • SHLOKA {verse}
        </span>
        <h1>The Shloka Dissection Lab</h1>
      </div>

      {loading ? (
        <div className="loading-vortex">
          <div className="vortex-spinner" />
          <span>Attuning to Vedic Acoustic Resonance...</span>
        </div>
      ) : (
        <div className="verse-breakdown-layout">
          {/* Main Sanskrit Slate */}
          <div className="sanskrit-main-slate">
            <div className="slate-top-controls">
              <button 
                className={`audio-recitation-btn ${audioPlaying ? 'active' : ''}`}
                onClick={() => {
                  sounds.playTibetanBowl();
                  setAudioPlaying(!audioPlaying);
                }}
              >
                <Volume2 size={18} />
                <span>{audioPlaying ? 'Acoustic Waves Resonating...' : 'Listen to Sonic Vibrations'}</span>
              </button>

              <div className="verse-tag-row">
                <span className="verse-topic-pill" style={{ borderColor: '#FFE259', color: '#FFE259' }}>
                  {verseData?.chanda || 'Anustubh Meter'}
                </span>
                {verseData?.topics?.map((t, i) => (
                  <span key={i} className="verse-topic-pill">{t}</span>
                ))}
              </div>
            </div>

            {audioPlaying && (
              <div className="audio-wave-anim">
                <span className="wave-bar bar-1" />
                <span className="wave-bar bar-2" />
                <span className="wave-bar bar-3" />
                <span className="wave-bar bar-4" />
                <span className="wave-bar bar-5" />
              </div>
            )}

            <div className="sanskrit-primary" style={{ margin: '20px 0' }}>
              <p className="devanagari-large">{verseData?.sanskrit}</p>
              <p className="roman-transliteration">{verseData?.transliteration}</p>
            </div>

            {/* INTERACTIVE SANSKRIT WORD DISSECTION PRISM */}
            <div style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '0.78rem', color: '#FFE259', fontWeight: 800, letterSpacing: '1px' }}>
                TAP INDIVIDUAL WORD TILES FOR SANSKRIT ROOT (DHATU) ANALYSIS:
              </span>
              <div className="dissection-prism">
                {WORD_BREAKDOWN_SAMPLE.map((w, idx) => (
                  <button
                    key={idx}
                    className={`sanskrit-word-pill ${activeWord === idx ? 'active' : ''}`}
                    onClick={() => {
                      sounds.playUnlockChime();
                      setActiveWord(activeWord === idx ? null : idx);
                    }}
                  >
                    <span className="pill-deva">{w.deva}</span>
                    <span className="pill-root">{w.translit}</span>
                  </button>
                ))}
              </div>

              {activeWord !== null && (
                <div className="word-dhatu-breakdown">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#FFE259', fontSize: '1.1rem', fontFamily: 'Noto Sans Devanagari' }}>
                      {WORD_BREAKDOWN_SAMPLE[activeWord].deva} ({WORD_BREAKDOWN_SAMPLE[activeWord].translit})
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#00F0FF', fontWeight: 700 }}>
                      ROOT: {WORD_BREAKDOWN_SAMPLE[activeWord].root}
                    </span>
                  </div>
                  <p style={{ color: '#E2E8F0', marginTop: '6px', fontSize: '0.9rem' }}>
                    Meaning: {WORD_BREAKDOWN_SAMPLE[activeWord].meaning}
                  </p>
                </div>
              )}
            </div>

            {/* CHANDA RHYTHM METRIC BEAT-KEEPER PAD */}
            <div className="chanda-meter-pad">
              <div>
                <span style={{ fontSize: '0.75rem', color: '#FFE259', fontWeight: 800 }}>
                  CHANDA RHYTHM BEAT-KEEPER (TAP TO METRONOME)
                </span>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '4px' }}>
                  Tap the golden orb in cadence with the 8-syllable quarter foot. Every 8 beats rewards +20 RP!
                </p>
              </div>
              <button className="meter-tap-circle" onClick={handleMeterTap}>
                <span>{meterTaps % 8} / 8</span>
              </button>
            </div>

            {/* Translation Blocks */}
            <div className="translations-container" style={{ marginTop: '28px' }}>
              <div className="translation-block english-block">
                <h3>English Exegesis</h3>
                <p>{verseData?.english}</p>
              </div>

              {verseData?.hindi && (
                <div className="translation-block hindi-block">
                  <h3>हिन्दी भावार्थ</h3>
                  <p>{verseData?.hindi}</p>
                </div>
              )}

              <div className="translation-block philosophical-block">
                <h3>Living Wisdom (Practical Application)</h3>
                <p>{verseData?.practicalMeaning}</p>
              </div>
            </div>
          </div>

          {/* Comprehension Trial Sidebar */}
          {verseData?.challenge && (
            <div className="comprehension-chamber">
              <div className="chamber-top">
                <BrainCircuit size={18} className="gold-accent" />
                <h3>Decryption Trial</h3>
              </div>
              <p className="challenge-q">{verseData.challenge.question}</p>

              <div className="challenge-options">
                {verseData.challenge.options.map((opt, i) => {
                  const isChosen = challengeAnswered === i;
                  const isCorrect = i === verseData.challenge.correctIndex;
                  return (
                    <button
                      key={i}
                      disabled={challengeAnswered !== null}
                      className={`challenge-opt-btn ${
                        challengeAnswered !== null 
                          ? isCorrect ? 'correct' : isChosen ? 'wrong' : '' 
                          : ''
                      }`}
                      onClick={() => handleChallenge(i)}
                    >
                      <span>{opt}</span>
                      {challengeAnswered !== null && isCorrect && <CheckCircle2 size={16} />}
                      {challengeAnswered !== null && isChosen && !isCorrect && <AlertCircle size={16} />}
                    </button>
                  );
                })}
              </div>

              {challengeAnswered !== null && (
                <div className="challenge-result-msg">
                  {challengeAnswered === verseData.challenge.correctIndex
                    ? '✨ Deep insight attained! +75 Radiance Points granted.'
                    : 'Contemplate further upon the verse. Vedic reflection is an endless spring.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerseDetail;
