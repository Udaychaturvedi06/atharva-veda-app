import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { 
  Volume2, 
  ArrowLeft, 
  BrainCircuit, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const VerseDetail = () => {
  const { book = 12, hymn = 1, verse = 1 } = useParams();
  const [searchParams] = useSearchParams();
  const veda = searchParams.get('veda') || 'atharva';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verseData, setVerseData] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
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
            practicalMeaning: 'This iconic Prithvi Sukta from the Atharvaveda emphasizes humanity’s ecological kinship with nature. We do not own the earth; we are its children.',
            topics: ['Sacred Ecology', 'Atharvaveda', 'Universal Kinship'],
            chanda: 'Anustubh Meter (32 Syllables)',
            challenge: {
              question: 'In this hymn, what is the core bond defined between the seeker and Mother Earth?',
              options: [
                'Exploitative dominion over resources',
                'Devoted child to a nurturing mother',
                'Indifference to nature',
                'Fear of elemental wrath'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button 
        className="cyber-btn"
        style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}
        onClick={() => navigate(`/library?veda=${veda}`)}
      >
        <ArrowLeft size={16} /> <span>Back to Vedas</span>
      </button>

      <div>
        <span style={{ fontSize: '0.8rem', color: '#FFE259', fontFamily: 'Orbitron, monospace', fontWeight: 700 }}>
          {veda.toUpperCase()} VEDA • MANDALA/KANDA {book} • SUKTA {hymn} • SHLOKA {verse}
        </span>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#FFF', margin: '4px 0 0' }}>
          Verse Exegesis & Breakdown
        </h1>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <span style={{ color: '#FFE259' }}>Attuning to Vedic Acoustic Frequencies...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left: Main Sanskrit & Exegesis */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button 
                className="cyber-btn cyber-btn-gold"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={() => {
                  sounds.playTibetanBowl();
                  setAudioPlaying(!audioPlaying);
                }}
              >
                <Volume2 size={16} />
                <span>{audioPlaying ? 'Chanting Resonating' : 'Play Sonic Vibrations'}</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {verseData?.topics?.map((t, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Devanagari */}
            <div style={{ borderLeft: '3px solid #FFE259', paddingLeft: '20px', margin: '20px 0' }}>
              <p style={{ fontFamily: 'Noto Sans Devanagari, serif', fontSize: '1.6rem', color: '#FFF', lineHeight: '1.8' }}>
                {verseData?.sanskrit}
              </p>
              <p style={{ fontStyle: 'italic', color: '#CBD5E1', fontSize: '1rem', marginTop: '8px' }}>
                {verseData?.transliteration}
              </p>
            </div>

            {/* Translations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '28px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#FFE259', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  English Translation
                </h3>
                <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                  "{verseData?.english}"
                </p>
              </div>

              {verseData?.hindi && (
                <div>
                  <h3 style={{ fontSize: '0.85rem', color: '#FFE259', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    हिन्दी भावार्थ
                  </h3>
                  <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    {verseData?.hindi}
                  </p>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '0.85rem', color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  Living Wisdom & Application
                </h3>
                <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  {verseData?.practicalMeaning}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Comprehension Challenge */}
          {verseData?.challenge && (
            <div className="glass-panel" style={{ padding: '32px', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BrainCircuit size={18} style={{ color: '#FFE259' }} />
                <h3 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', fontSize: '1.2rem', margin: 0 }}>
                  Comprehension Trial
                </h3>
              </div>
              <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 20px' }}>
                {verseData.challenge.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {verseData.challenge.options.map((opt, i) => {
                  const isChosen = challengeAnswered === i;
                  const isCorrect = i === verseData.challenge.correctIndex;
                  return (
                    <button
                      key={i}
                      disabled={challengeAnswered !== null}
                      className="cyber-btn"
                      style={{
                        padding: '12px 16px',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        background: challengeAnswered !== null
                          ? isCorrect ? 'rgba(16, 185, 129, 0.15)' : isChosen ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)'
                          : 'rgba(255, 255, 255, 0.03)',
                        borderColor: challengeAnswered !== null
                          ? isCorrect ? '#10B981' : isChosen ? '#EF4444' : 'rgba(255,255,255,0.06)'
                          : 'rgba(255, 255, 255, 0.08)'
                      }}
                      onClick={() => handleChallenge(i)}
                    >
                      <span>{opt}</span>
                      {challengeAnswered !== null && isCorrect && <CheckCircle2 size={16} style={{ color: '#10B981' }} />}
                      {challengeAnswered !== null && isChosen && !isCorrect && <AlertCircle size={16} style={{ color: '#EF4444' }} />}
                    </button>
                  );
                })}
              </div>

              {challengeAnswered !== null && (
                <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', fontSize: '0.85rem', color: '#FFE259' }}>
                  {challengeAnswered === verseData.challenge.correctIndex
                    ? '✨ Deep insight attained! +75 Radiance Points granted.'
                    : 'Reflect further upon the verse. Contemplation is an endless spring.'}
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
