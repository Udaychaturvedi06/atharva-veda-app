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
  Compass,
  Eye,
  X,
  Zap
} from 'lucide-react';

const BLESSINGS = [
  "Agni bestows divine perception upon your intellect today.",
  "May the waters of Saraswati clear all doubt from your breath.",
  "Earth sustains your posture; Indra empowers your resolute will.",
  "Vayu brings fresh prana to dispel mental fatigue and stagnation."
];

const DAILY_CARDS = [
  {
    veda: 'atharva',
    book: 12,
    hymn: 1,
    verse: 12,
    sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||',
    transliteration: 'mātā bhūmiḥ putro ahaṁ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu',
    english: 'The Earth is my mother and I am the child of the soil. The rain-cloud is my father, let him nourish us.',
    theme: 'Prithvi Sukta (Ode to Mother Earth)',
    esotericInsight: 'Ancient ecological consciousness: Humanity is not an overlord of nature, but its sacred offspring.'
  },
  {
    veda: 'rig',
    book: 1,
    hymn: 1,
    verse: 1,
    sanskrit: 'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम् | होतारं रत्नधातमम् ||',
    transliteration: 'agnim īḷe purohitaṁ yajñasya devam ṛtvijam | hotāraṁ ratnadhātamam',
    english: 'I magnify Agni, the cosmic priest, divine minister of the sacred sacrifice, the bestower of radiant wealth.',
    theme: 'Agni Invocation',
    esotericInsight: 'Agni is the inner conscious flame of aspiration within every human heart that transmutes base thoughts into gold.'
  }
];

const Home = ({ addRp, setVedaBg, heal }) => {
  const navigate = useNavigate();
  const relics = useGameStore(state => state.relics);
  const streak = useGameStore(state => state.streak);
  const restorePrana = useGameStore(state => state.restorePrana);
  
  const [homaSparks, setHomaSparks] = useState(0);
  const [activeBlessing, setActiveBlessing] = useState(null);
  const [revealedInsight, setRevealedInsight] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const daily = DAILY_CARDS[0];

  // Interactive 3D tilt tracking for Daily Shloka Tarot
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Offering to the Agni Homa Pit
  const handleIgniteHoma = () => {
    sounds.playCombatHit(true);
    setHomaSparks(prev => prev + 1);
    addRp(100);
    heal(20);
    restorePrana(25);
    const randomBlessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setActiveBlessing(randomBlessing);
  };

  const vedaPortals = [
    { id: 'rig', title: 'Rigveda', subtitle: 'Cosmic Chants & Dawn Visions', bg: '/bg-rig.png', count: '1,028 Suktas', element: '🔥 Agni' },
    { id: 'atharva', title: 'Atharvaveda', subtitle: 'Healing, Society & Mysticism', bg: '/bg-atharva.png', count: '730 Suktas', element: '🌿 Prithvi' },
    { id: 'sama', title: 'Samaveda', subtitle: 'Transcendental Harmonic Vibrations', bg: '/bg-sama.png', count: '1,875 Mantras', element: '🌊 Soma' },
    { id: 'yajur', title: 'Yajurveda', subtitle: 'Alchemical Rites of Inner Fire', bg: '/bg-yajur.png', count: '1,975 Shlokas', element: '💨 Vayu' }
  ];

  return (
    <div className="astral-observatory">
      {/* 1. AGNI HOMA SACRED FIRE PIT (Offering Game Mechanic) */}
      <section className="homa-altar-container">
        <div className="homa-fire-ring" />
        <div className="altar-content-split">
          <div>
            <div className="hero-tag">
              <Flame size={15} className="flame-accent" />
              <span>THE ETERNAL AGNI KUND • ALTAR OF TAPASYA</span>
            </div>
            <h1 className="hero-title">The Inner Sanctum</h1>
            <p className="hero-subtitle">
              Kindle the sacred fire with your daily breath. Tap the Agni Kund to transmute worldly tension into pure spiritual Radiance.
            </p>

            {activeBlessing && (
              <div className="combat-log-banner" style={{ marginTop: '12px', borderLeftColor: '#FF5E1E' }}>
                <span>✨ <strong>Agni's Blessing:</strong> {activeBlessing}</span>
              </div>
            )}
          </div>

          <button 
            className="homa-ignite-btn"
            onClick={handleIgniteHoma}
            title="Perform Ahuti (Sacred Offering) to receive +100 RP & Healing"
          >
            <Flame size={44} className="flame-icon" />
            <span className="ignite-label">Ignite Fire</span>
            <span className="ignite-sub">+100 RP ({homaSparks} offered)</span>
          </button>
        </div>
      </section>

      {/* 2. 3D HOLOGRAPHIC SHLOKA TAROT SLATE */}
      <section className="tarot-stage-wrap">
        <div className="section-header">
          <ScrollText size={18} className="gold-accent" />
          <h2>Cosmic Shloka of the Day</h2>
        </div>

        <div 
          className="tarot-card-3d"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
          }}
        >
          <div className="slate-top-meta">
            <span className="veda-source-badge">{daily.theme}</span>
            <span className="verse-coordinate">{daily.veda.toUpperCase()} {daily.book}.{daily.hymn}.{daily.verse}</span>
          </div>

          <div className="sanskrit-chant-box">
            <p className="sanskrit-text">{daily.sanskrit}</p>
            <p className="transliteration-text">{daily.transliteration}</p>
          </div>

          <div className="translation-box">
            <p className="english-text">"{daily.english}"</p>
          </div>

          {revealedInsight ? (
            <div className="combat-log-banner" style={{ marginBottom: '20px' }}>
              <span>🔮 <strong>Esoteric Secret:</strong> {daily.esotericInsight}</span>
            </div>
          ) : (
            <button 
              className="rune-btn" 
              style={{ marginBottom: '20px' }}
              onClick={() => {
                sounds.playUnlockChime();
                setRevealedInsight(true);
                addRp(50);
              }}
            >
              <Eye size={16} />
              <span>Decrypt Esoteric Meaning (+50 RP)</span>
            </button>
          )}

          <div className="slate-footer">
            <button 
              className="primary-cta-btn"
              onClick={() => {
                sounds.playTibetanBowl();
                navigate(`/verse/${daily.book}/${daily.hymn}/${daily.verse}?veda=${daily.veda}`);
              }}
            >
              <span>Examine Deep Breakdown</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FOUR VEDA PORTALS (ELEMENTAL REALMS) */}
      <section className="realms-section">
        <div className="section-header">
          <BookOpen size={18} className="gold-accent" />
          <h2>The Four Elemental Veda Portals</h2>
        </div>

        <div className="realms-grid">
          {vedaPortals.map((portal) => (
            <div 
              key={portal.id} 
              className="realm-card"
              onClick={() => {
                sounds.playTibetanBowl();
                setVedaBg(portal.bg);
                navigate(`/library?veda=${portal.id}`);
              }}
            >
              <div className="realm-card-bg" style={{ backgroundImage: `url(${portal.bg})` }} />
              <div className="realm-card-overlay" />
              <div className="realm-content">
                <span className="realm-metric">{portal.element} • {portal.count}</span>
                <h3 className="realm-title">{portal.title}</h3>
                <p className="realm-sub">{portal.subtitle}</p>
                <div className="realm-enter-link">
                  <span>Enter Realm</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SANCTIFIED RELIC INVENTORY (Interactive Inspection Modal) */}
      <section className="relics-section">
        <div className="section-header">
          <Award size={18} className="gold-accent" />
          <h2>Soul Artifacts & Relics</h2>
        </div>

        <div className="relics-grid">
          {relics.map((relic) => (
            <div 
              key={relic.id} 
              className="relic-item-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sounds.playUnlockChime();
                setSelectedRelic(relic);
              }}
              title="Click to Inspect Ancient Artifact"
            >
              <div className="relic-icon-aura">{relic.icon}</div>
              <div className="relic-info">
                <div className="relic-name-row">
                  <span className="relic-name">{relic.name}</span>
                  <span className={`relic-rarity ${relic.rarity.toLowerCase()}`}>{relic.rarity}</span>
                </div>
                <p className="relic-desc">{relic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Relic Inspect Modal */}
      {selectedRelic && (
        <div className="victory-ceremony" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          zIndex: 200, justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(20, 18, 32, 0.95)', border: '2px solid #FFE259', borderRadius: '24px',
            padding: '40px', maxWidth: '450px', position: 'relative', boxShadow: '0 0 50px rgba(255, 226, 89, 0.4)'
          }}>
            <button 
              onClick={() => setSelectedRelic(null)}
              style={{ position: 'absolute', top: 16, right: 16, color: '#FFF' }}
            >
              <X size={20} />
            </button>

            <div style={{ fontSize: '4.5rem', textAlign: 'center', marginBottom: '16px' }}>
              {selectedRelic.icon}
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#FFF', textAlign: 'center' }}>
              {selectedRelic.name}
            </h2>
            <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
              <span className={`relic-rarity ${selectedRelic.rarity.toLowerCase()}`}>
                {selectedRelic.rarity} Relic
              </span>
            </div>
            <p style={{ color: '#CBD5E1', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' }}>
              {selectedRelic.desc}
            </p>
            <button 
              className="primary-cta-btn" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setSelectedRelic(null)}
            >
              Channel Artifact Power
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
