import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { 
  Sparkles, 
  Flame, 
  Swords, 
  BookOpen, 
  ScrollText, 
  ArrowRight,
  Award,
  Eye,
  CheckCircle2
} from 'lucide-react';

const DAILY_VERSES = [
  {
    veda: 'atharva',
    book: 12,
    hymn: 1,
    verse: 12,
    sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||',
    transliteration: 'mātā bhūmiḥ putro ahaṁ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu',
    english: 'The Earth is my mother and I am the child of the soil. The rain-cloud is my father, let him nourish us.',
    theme: 'Prithvi Sukta (Ode to Mother Earth)',
    insight: 'Ancient ecological unity: Humanity and soil are bound in an eternal filial covenant.'
  }
];

const Home = ({ addRp, setVedaBg, heal }) => {
  const navigate = useNavigate();
  const relics = useGameStore(state => state.relics);
  const streak = useGameStore(state => state.streak);
  const [tapasyaOffered, setTapasyaOffered] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const daily = DAILY_VERSES[0];

  const handleTapasya = () => {
    if (tapasyaOffered) return;
    sounds.playUnlockChime();
    addRp(150);
    heal(20);
    setTapasyaOffered(true);
  };

  const vedaPortals = [
    { id: 'rig', title: 'Rigveda', desc: 'Cosmic Mantras & Solar Radiance', count: '1,028 Suktas', color: '#F59E0B' },
    { id: 'atharva', title: 'Atharvaveda', desc: 'Healing, Society & Daily Mysticism', count: '730 Suktas', color: '#10B981' },
    { id: 'sama', title: 'Samaveda', desc: 'Melodies of Transcendence & Sonic Joy', count: '1,875 Mantras', color: '#3B82F6' },
    { id: 'yajur', title: 'Yajurveda', desc: 'Inner Sacrificial Alchemy & Discipline', count: '1,975 Shlokas', color: '#EC4899' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Sanctuary Hero Banner */}
      <section className="glass-panel" style={{ padding: '36px', background: 'radial-gradient(ellipse at top left, rgba(212, 175, 55, 0.12) 0%, rgba(19, 17, 28, 0.8) 70%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFE259', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          <Sparkles size={14} />
          <span>Sanctuary of Consciousness • Day {streak} Tapasya</span>
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: '#FFF', margin: '10px 0' }}>
          The Inner Sanctuary
        </h1>
        <p style={{ color: '#CBD5E1', maxWidth: '650px', lineHeight: '1.6', fontSize: '1rem', margin: '0 0 24px' }}>
          Welcome, Seeker. Contemplate primordial Sanskrit revelation, decipher cosmic truth, and conquer the six inner adversaries of the mind.
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleTapasya}
          >
            <Flame size={16} />
            <span>{tapasyaOffered ? 'Tapasya Offered (+150 RP)' : 'Perform Daily Tapasya (+150 RP)'}</span>
          </button>

          <button 
            className="cyber-btn cyber-btn-gold" 
            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
            onClick={() => {
              sounds.playTibetanBowl();
              navigate('/campaign');
            }}
          >
            <Swords size={16} />
            <span>Enter Arishadvarga Trials</span>
          </button>
        </div>
      </section>

      {/* 2. Shloka of the Day Card */}
      <section className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(212, 175, 55, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="badge gold">
            <ScrollText size={13} />
            <span>Daily Sacred Hymn</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'Orbitron, monospace' }}>
            {daily.veda.toUpperCase()} {daily.book}.{daily.hymn}.{daily.verse}
          </span>
        </div>

        <div style={{ borderLeft: '3px solid #FFE259', paddingLeft: '20px', margin: '16px 0' }}>
          <p style={{ fontFamily: 'Noto Sans Devanagari, serif', fontSize: '1.5rem', color: '#FFF', lineHeight: '1.8' }}>
            {daily.sanskrit}
          </p>
          <p style={{ fontStyle: 'italic', color: '#CBD5E1', fontSize: '0.95rem', marginTop: '6px' }}>
            {daily.transliteration}
          </p>
        </div>

        <p style={{ color: '#E2E8F0', fontSize: '1.05rem', lineHeight: '1.6', margin: '16px 0' }}>
          "{daily.english}"
        </p>

        {showInsight && (
          <div style={{ background: 'rgba(255, 226, 89, 0.08)', border: '1px solid rgba(255, 226, 89, 0.2)', borderRadius: '12px', padding: '14px 18px', margin: '16px 0', color: '#FFE259', fontSize: '0.9rem' }}>
            💡 <strong>Esoteric Insight:</strong> {daily.insight}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            className="cyber-btn"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => {
              sounds.playUnlockChime();
              setShowInsight(!showInsight);
            }}
          >
            <Eye size={15} />
            <span>{showInsight ? 'Hide Insight' : 'Reveal Esoteric Meaning'}</span>
          </button>

          <button 
            className="cyber-btn cyber-btn-gold"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={() => {
              sounds.playTibetanBowl();
              navigate(`/verse/${daily.book}/${daily.hymn}/${daily.verse}?veda=${daily.veda}`);
            }}
          >
            <span>Detailed Verse Breakdown</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* 3. The Four Vedas Realmgate */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={18} style={{ color: '#FFE259' }} />
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#FFF', margin: 0 }}>
            The Four Vedic Portals
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {vedaPortals.map(portal => (
            <div 
              key={portal.id}
              className="glass-panel"
              style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              onClick={() => {
                sounds.playTibetanBowl();
                navigate(`/library?veda=${portal.id}`);
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: portal.color, letterSpacing: '1px' }}>
                  {portal.count}
                </span>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: '#FFF', margin: '8px 0 6px' }}>
                  {portal.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.5' }}>
                  {portal.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFE259', fontSize: '0.8rem', fontWeight: 700, marginTop: '16px' }}>
                <span>Enter Archive</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Sanctified Relics Inventory */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Award size={18} style={{ color: '#FFE259' }} />
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#FFF', margin: 0 }}>
            Soul Artifacts
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {relics.map(relic => (
            <div 
              key={relic.id}
              className="glass-panel"
              style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div style={{ fontSize: '2rem', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                {relic.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{relic.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: '#FFE259', fontWeight: 700 }}>{relic.rarity}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '4px 0 0' }}>{relic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
