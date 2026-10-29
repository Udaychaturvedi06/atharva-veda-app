import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/soundEngine';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Flame,
  ChevronDown,
  Gamepad2,
  Scroll,
  MessageSquare,
  Swords,
  Layers,
  Compass,
  Radio,
  Eye,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Magnetic } from '../components/ui/Magnetic';
import { RevealText } from '../components/ui/RevealText';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Chip } from '../components/ui/Chip';

// Four Canonical Samhitas Data
const VEDA_SAMHITAS = [
  {
    title: 'Rigveda',
    sanskrit: 'ऋग्वेद',
    meter: 'Gayatri (24 Syllables)',
    quote: 'एकं सद्विप्रा बहुधा वदन्ति',
    meaning: 'Truth is One, the wise speak of it by many names.',
    desc: 'Hymns of divine illumination, cosmic order (Ṛta), and elemental deities.',
    accent: 'var(--gold)',
    colorRgb: '212, 175, 55'
  },
  {
    title: 'Yajurveda',
    sanskrit: 'यजुर्वेद',
    meter: 'Trishtubh (44 Syllables)',
    quote: 'तन्मे मनः शिवसङ्कल्पमस्तु',
    meaning: 'May my mind dwell upon benevolent and auspicious resolves.',
    desc: 'The science of inner and outer sacred rituals, sacrificial focus, and direct action.',
    accent: 'var(--saffron)',
    colorRgb: '255, 123, 0'
  },
  {
    title: 'Samaveda',
    sanskrit: 'सामवेद',
    meter: 'Jagati (48 Syllables)',
    quote: 'सामानि यो वेत्ति स वेद तत्त्वम्',
    meaning: 'He who knows the musical chants truly understands the essence.',
    desc: 'Ecstatic musical mantras and sonic frequencies designed to dissolve mortal ego.',
    accent: 'var(--soma)',
    colorRgb: '99, 179, 237'
  },
  {
    title: 'Atharvaveda',
    sanskrit: 'अथर्ववेद',
    meter: 'Anushtubh (32 Syllables)',
    quote: 'माता भूमिः पुत्रो अहं पृथिव्याः',
    meaning: 'Earth is my mother, and I am the child of this sacred soil.',
    desc: 'Spells of healing, protection from discord, esoteric science, and domestic alchemy.',
    accent: 'var(--agni)',
    colorRgb: '255, 94, 30'
  }
];

// Arishadvargas (The Six Primal Inner Enemies)
const ARISHADVARGAS = [
  {
    id: 'kama',
    name: 'Kāma',
    sanskrit: 'काम',
    meaning: 'Unrestrained Desire & Attachment',
    counterTitle: 'Viveka (Discernment)',
    counterDesc: 'Direct the restless fire of desire toward the Supreme Truth rather than fleeting sensory illusions.',
    quote: 'कामाद्भवति संमोहः',
    angle: 0
  },
  {
    id: 'krodha',
    name: 'Krodha',
    sanskrit: 'क्रोध',
    meaning: 'Destructive Wrath & Anger',
    counterTitle: 'Shama & Karuṇā (Equanimity)',
    counterDesc: 'Cool the boiling blood with mindful breath and perceive the divine spark within all beings.',
    quote: 'क्रोधाद्भवति संमोहः',
    angle: 60
  },
  {
    id: 'lobha',
    name: 'Lobha',
    sanskrit: 'लोभ',
    meaning: 'Insatiable Greed & Covetousness',
    counterTitle: 'Santoṣa (Contentment)',
    counterDesc: 'Recognize that true abundance arises from inner stillness and spiritual self-sufficiency.',
    quote: 'लोभः पापस्य कारणम्',
    angle: 120
  },
  {
    id: 'moha',
    name: 'Moha',
    sanskrit: 'मोह',
    meaning: 'Delusion & Mental Clouding',
    counterTitle: 'Bodha (Spiritual Awakening)',
    counterDesc: 'Dispel the veil of Maya through steady contemplation of the unchanging witness consciousness.',
    quote: 'मोहात्प्रणश्यति',
    angle: 180
  },
  {
    id: 'mada',
    name: 'Mada',
    sanskrit: 'मद',
    meaning: 'Arrogance, Vanity & Hubris',
    counterTitle: 'Vinaya & Namratā (Humility)',
    counterDesc: 'Bow before the infinite cosmos and acknowledge the transient nature of personal ego and titles.',
    quote: 'अहंकारं बलं दर्पम्',
    angle: 240
  },
  {
    id: 'matsarya',
    name: 'Mātsarya',
    sanskrit: 'मात्सर्य',
    meaning: 'Envy, Jealousy & Malice',
    counterTitle: 'Muditā (Sympathetic Joy)',
    counterDesc: 'Rejoice wholeheartedly in the spiritual triumph and prosperity of your fellow seekers.',
    quote: 'अद्वेष्टा सर्वभूतानाम्',
    angle: 300
  }
];

// Vedic Arcade Games Suite Preview
const ARCADE_GAMES = [
  {
    id: 'agni-strike',
    title: 'Agni Strike',
    genre: 'Celestial Shmup',
    desc: 'Harness blazing fire-mantras to purify descending asuric shadows and cleanse the atmosphere.',
    icon: Flame,
    color: '#FF5E1E'
  },
  {
    id: 'mantra-runner',
    title: 'Mantra Runner',
    genre: 'Cosmic Rhythm Runner',
    desc: 'Sprint through the 7 celestial Lokas collecting Sanskrit syllables in rhythmic alignment.',
    icon: Zap,
    color: '#00F0FF'
  },
  {
    id: 'chakra-breaker',
    title: 'Chakra Breaker',
    genre: 'Pranic Breakout',
    desc: 'Bounce sacred resonance spheres to shatter karmic blockages across the seven energy centers.',
    icon: Shield,
    color: '#D4AF37'
  },
  {
    id: 'naga-coil',
    title: 'Naga Coil',
    genre: 'Kundalini Serpentine',
    desc: 'Guide the primordial serpent of wisdom through the subtle Sushumna channels without collision.',
    icon: Compass,
    color: '#4FD1C5'
  },
  {
    id: 'om-beat',
    title: 'Om Beat',
    genre: 'Nada Yoga Rhythm',
    desc: 'Tap with microsecond precision to sync brainwaves with cosmic 432Hz Om vibrations.',
    icon: Radio,
    color: '#63B3ED'
  },
  {
    id: 'memory-mandala',
    title: 'Memory Mandala',
    genre: 'Yantric Pattern Match',
    desc: 'Memorize and reconstruct complex Sri Yantra sacred geometry before the timer runs out.',
    icon: Eye,
    color: '#9F7AEA'
  }
];

// Ascension Ladder Tiers
const ASCENSION_TIERS = [
  { rank: 'Jijnasu', title: 'The Curious Seeker', threshold: '0 RP', privilege: 'Unlock Sanctuary & Daily Verse Recitation' },
  { rank: 'Brahmachari', title: 'Dedicated Student', threshold: '250 RP', privilege: 'Access Agni Shala Altar & Basic Trials' },
  { rank: 'Sadhaka', title: 'Spiritual Practitioner', threshold: '750 RP', privilege: 'Unlock Complete 6-Trial Arishadvarga Campaign' },
  { rank: 'Upadhyaya', title: 'Vedic Scholar', threshold: '1,800 RP', privilege: 'Decryption Speed Trials & Audio Chanting Analysis' },
  { rank: 'Rishi', title: 'Seer of Mantras', threshold: '3,500 RP', privilege: 'Direct Oracle Communion with Ancient Rishi AI' },
  { rank: 'Maharshi', title: 'Cosmic Sage', threshold: '7,000 RP', privilege: 'Global Leaderboard Elite Crest & Golden Relic Shelf' },
  { rank: 'Brahmarshi', title: 'Awakened Light', threshold: '15,000 RP', privilege: 'Eternal Inscription in the Hall of Immortals' }
];

// Sample Rishi Queries for Interactive Mock
const SAMPLE_RISHI_QUERIES = [
  {
    q: 'How do I conquer anxiety and mental restlessness in modern life?',
    a: 'O Seeker, in Atharvaveda 6.44, the sage commands the restless winds of Chitta: "Stay steady, O mind! Just as the mountains do not tremble before hurricanes, fix your attention upon the immortal witness within." Daily pranayama and chanting of the Gayatri mantra harmonize the frantic nervous system.'
  },
  {
    q: 'What is the true esoteric meaning of Agni in Vedic thought?',
    a: 'Agni is not merely physical combustion. As revealed in the first verse of Rigveda ("अग्निमीळे पुरोहितम्"), Agni is the cosmic priest of consciousness—the divine will and inner digestive fire (Jatharagni) that purifies ignorance and converts mortal experience into spiritual wisdom.'
  },
  {
    q: 'How can anger (Krodha) be transmuted into spiritual strength?',
    a: 'Anger is obstructed creative energy. Atharva seers teach us never to suppress it with guilt, nor let it incinerate others. Turn the blazing thermal charge inwards into Tapasya—intense disciplined study, meditation, and physical resolve. Thus fire becomes a guiding lamp.'
  }
];

export const Landing = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Pointer position for reactive Hero 3D Mandala
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [activeEnemy, setActiveEnemy] = useState(ARISHADVARGAS[0]);
  const [isLoggingInGuest, setIsLoggingInGuest] = useState(false);

  // Rishi mock chat interaction state
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Parallax scroll effects
  const containerRef = useRef(null);
  useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Pointer tracking for Hero
  const handleHeroMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const x = ((clientX - centerX) / centerX) * 22;
    const y = ((clientY - centerY) / centerY) * 22;
    setPointerOffset({ x, y });
  };

  // Guest login handler
  const handleGuestEntry = async () => {
    setIsLoggingInGuest(true);
    sounds.playUnlockChime();
    try {
      const res = await loginAsGuest();
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Guest access error:', err);
    } finally {
      setIsLoggingInGuest(false);
    }
  };

  // Typewriter effect for Rishi AI mock
  useEffect(() => {
    setIsTyping(true);
    setDisplayedAnswer('');
    const fullText = SAMPLE_RISHI_QUERIES[activeQueryIndex].a;
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < fullText.length) {
        setDisplayedAnswer(fullText.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [activeQueryIndex]);

  return (
    <div ref={containerRef} className="landing-container" onMouseMove={handleHeroMouseMove}>
      <div className="landing-grain" />

      {/* ===================================================================
          HERO SECTION — Full Viewport, 3D Mandala, Sacred Geometry
          =================================================================== */}
      <section className="landing-hero">
        {/* Rotating 3D Mandala wireframe reacting to pointer */}
        <div
          className="landing-hero-mandala-bg"
          style={{
            transform: `translate(calc(-50% + ${pointerOffset.x}px), calc(-50% + ${pointerOffset.y}px))`
          }}
        >
          <svg className="landing-hero-mandala-svg" viewBox="0 0 500 500" fill="none" stroke="currentColor">
            <circle cx="250" cy="250" r="230" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />
            <circle cx="250" cy="250" r="180" stroke="#FF7B00" strokeWidth="1.2" opacity="0.6" />
            <circle cx="250" cy="250" r="120" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="250" cy="250" r="70" stroke="#00F0FF" strokeWidth="1" strokeDasharray="3 6" />
            {/* Interlocking Triangles (Sri Yantra motif) */}
            <polygon points="250,50 420,380 80,380" stroke="#D4AF37" strokeWidth="1.2" opacity="0.75" />
            <polygon points="250,450 420,120 80,120" stroke="#FF7B00" strokeWidth="1.2" opacity="0.75" />
            <polygon points="250,90 390,360 110,360" stroke="#FFE259" strokeWidth="1" opacity="0.5" />
            <polygon points="250,410 390,140 110,140" stroke="#00F0FF" strokeWidth="1" opacity="0.5" />
            {/* Pulsing Bindu with Breath Sync */}
            <circle
              cx="250"
              cy="250"
              r="10"
              fill="#FFE259"
              style={{
                filter: 'drop-shadow(0 0 12px #FFE259)',
                transformOrigin: '250px 250px',
                transform: 'scale(calc(0.85 + 0.3 * var(--breath, 0.5)))'
              }}
            />
          </svg>
        </div>

        {/* Platform Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="landing-hero-badge"
        >
          <Sparkles size={14} />
          <span>Vedic Consciousness Platform</span>
        </motion.div>

        {/* Main Title with Staggered Reveal */}
        <h1 className="landing-hero-title">
          <RevealText text="Atharva Veda" mode="letter" delay={0.1} />
        </h1>

        {/* Devanagari Sacred Inscription */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="landing-hero-devanagari"
        >
          अथर्ववेद संहिता
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="landing-hero-subtitle"
        >
          Enter a gamified sanctum of primordial knowledge. Decipher verbatim Sanskrit hymns, conquer the inner
          enemies (Arishadvarga), and awaken your spiritual intellect through ancient exegesis and arcade rituals.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="landing-hero-actions"
        >
          <Magnetic strength={0.3}>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/login');
              }}
            >
              Begin the Journey
            </Button>
          </Magnetic>

          <Magnetic strength={0.2}>
            <Button
              variant="cyber"
              disabled={isLoggingInGuest}
              icon={isLoggingInGuest ? Loader2 : Compass}
              onClick={handleGuestEntry}
            >
              {isLoggingInGuest ? 'Awakening Guest...' : 'Continue as Guest'}
            </Button>
          </Magnetic>
        </motion.div>

        {/* Floating Scroll Indicator */}
        <div className="landing-scroll-indicator">
          <span>Scroll to Explore</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ===================================================================
          SECTION 1 — "READ THE VEDAS" (Floating Samhita Cards)
          =================================================================== */}
      <section className="landing-section">
        <div className="landing-section-intro">
          <SectionHeading
            title="The Four Sacred Samhitas"
            subtitle="Direct transmission of verbatim Sanskrit wisdom from the dawn of human contemplation."
            icon={Scroll}
          />
        </div>

        <div className="veda-cards-grid">
          {VEDA_SAMHITAS.map((veda) => (
            <GlassCard key={veda.title} tilt spotlight className="veda-card">
              <div
                className="veda-card-accent-bar"
                style={{
                  background: `linear-gradient(90deg, ${veda.accent}, transparent)`
                }}
              />
              <div className="veda-card-glyph" style={{ color: veda.accent }}>
                {veda.sanskrit}
              </div>
              <h3 className="veda-card-title">{veda.title}</h3>
              <div className="veda-card-subtitle" style={{ color: veda.accent }}>
                {veda.meter}
              </div>
              <blockquote className="veda-card-verse">
                "{veda.quote}"
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {veda.meaning}
                </div>
              </blockquote>
              <p className="veda-card-desc">{veda.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ===================================================================
          SECTION 2 — "FACE THE INNER ENEMIES" (Arishadvarga Orbit)
          =================================================================== */}
      <section className="landing-section">
        <div className="landing-section-intro">
          <SectionHeading
            title="Face the Arishadvarga"
            subtitle="Confront the six primal afflictions of mortal mind using rigorous philosophical counters."
            icon={Swords}
          />
        </div>

        <div className="arishadvarga-stage">
          {/* Interactive Circular Orbit Arena */}
          <div className="arishadvarga-orbit-arena">
            <div className="orbit-ring orbit-ring-outer" />
            <div className="orbit-ring orbit-ring-inner" />

            {/* Central Atman Core */}
            <div className="orbit-center-core">
              <span className="orbit-center-sanskrit">आत्मन्</span>
              <span className="orbit-center-label">PURE ATMAN</span>
            </div>

            {/* Orbiting Enemy Nodes */}
            {ARISHADVARGAS.map((enemy) => {
              const rad = (enemy.angle * Math.PI) / 180;
              const radiusPercent = 42;
              const left = 50 + radiusPercent * Math.cos(rad);
              const top = 50 + radiusPercent * Math.sin(rad);

              const isActive = activeEnemy.id === enemy.id;

              return (
                <div
                  key={enemy.id}
                  className={`orbit-node ${isActive ? 'active' : ''}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  onClick={() => {
                    sounds.playTibetanBowl();
                    setActiveEnemy(enemy);
                  }}
                >
                  <span className="orbit-node-glyph">{enemy.sanskrit}</span>
                  <span className="orbit-node-label">{enemy.name}</span>
                </div>
              );
            })}
          </div>

          {/* Active Enemy Tactical Detail Card */}
          <GlassCard spotlight className="arishadvarga-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '2rem', color: 'var(--saffron)' }}>
                  {activeEnemy.sanskrit}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#FFF', margin: '4px 0 0' }}>
                  {activeEnemy.name}
                </h3>
              </div>
              <Chip variant="danger" icon={Flame}>
                Inner Trial
              </Chip>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              {activeEnemy.meaning}
            </p>

            <div className="arishadvarga-counter-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)', fontWeight: 600, marginBottom: '6px' }}>
                <Shield size={16} />
                <span>Philosophical Counter: {activeEnemy.counterTitle}</span>
              </div>
              <p style={{ color: '#FDFBEE', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                {activeEnemy.counterDesc}
              </p>
            </div>

            <Button
              variant="primary"
              icon={Swords}
              onClick={() => {
                sounds.playUnlockChime();
                navigate('/campaign');
              }}
            >
              Confront in Inner Trials
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* ===================================================================
          SECTION 3 — "PLAY THE ARCADE" (Vedic Arcade Suite Showcase)
          =================================================================== */}
      <section className="landing-section">
        <div className="landing-section-intro">
          <SectionHeading
            title="The Vedic Arcade"
            subtitle="Fast-paced spiritual rituals engineered with retro mechanics, sacred audio, and cosmic physics."
            icon={Gamepad2}
          />
        </div>

        <div className="arcade-showcase-grid">
          {ARCADE_GAMES.map((game) => {
            const IconComponent = game.icon;
            return (
              <GlassCard
                key={game.id}
                tilt
                spotlight
                className="arcade-card"
                onClick={() => {
                  sounds.playUnlockChime();
                  navigate('/arcade');
                }}
              >
                <div>
                  <div className="arcade-card-header">
                    <div className="arcade-card-icon" style={{ color: game.color, background: `${game.color}18` }}>
                      <IconComponent size={22} />
                    </div>
                    <Chip variant="gold">{game.genre}</Chip>
                  </div>

                  <h3 className="arcade-card-title">{game.title}</h3>
                  <p className="arcade-card-desc">{game.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)' }}>
                    60 FPS ARCADE
                  </span>
                  <span style={{ color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    Play Game <ArrowRight size={14} />
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
          SECTION 4 — "ASK THE RISHI" (Interactive Mock Oracle)
          =================================================================== */}
      <section className="landing-section">
        <div className="landing-section-intro">
          <SectionHeading
            title="Ask the Rishi AI"
            subtitle="Engage in discourse with an ancient seer synthesized through context-aware artificial intelligence."
            icon={MessageSquare}
          />
        </div>

        <GlassCard spotlight className="rishi-mock-chat">
          {/* Seeker Query Bubble */}
          <div className="rishi-chat-msg seeker">
            <div className="rishi-avatar seeker">
              <Compass size={20} />
            </div>
            <div className="rishi-bubble seeker">
              "{SAMPLE_RISHI_QUERIES[activeQueryIndex].q}"
            </div>
          </div>

          {/* Rishi Response Bubble with Typewriter Simulation */}
          <div className="rishi-chat-msg rishi">
            <div className="rishi-avatar rishi">
              <Flame size={20} />
            </div>
            <div className="rishi-bubble rishi">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 600 }}>
                  Rishi Angiras
                </span>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold-bright)' }}>
                  Atharva Sage
                </span>
              </div>
              <p style={{ margin: 0, minHeight: '60px' }}>
                {displayedAnswer}
                {isTyping && <span style={{ color: 'var(--gold)', animation: 'pulse 1s infinite' }}>▊</span>}
              </p>
            </div>
          </div>

          {/* Prompt Selector Pills */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Select a philosophical inquiry to consult:
            </span>
            <div className="rishi-sample-queries">
              {SAMPLE_RISHI_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`rishi-query-pill ${activeQueryIndex === idx ? 'active' : ''}`}
                  onClick={() => {
                    sounds.playTibetanBowl();
                    setActiveQueryIndex(idx);
                  }}
                >
                  {item.q.slice(0, 36)}...
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Button
              variant="primary"
              icon={MessageSquare}
              onClick={() => {
                sounds.playUnlockChime();
                navigate('/chat');
              }}
            >
              Consult Rishi Oracle Full Engine
            </Button>
          </div>
        </GlassCard>
      </section>

      {/* ===================================================================
          SECTION 5 — "ASCENSION LADDER" (Jijnasu → Brahmarshi Path)
          =================================================================== */}
      <section className="landing-section">
        <div className="landing-section-intro">
          <SectionHeading
            title="The Path of Ascension"
            subtitle="Ascend from a curious seeker to an enlightened Brahmarshi through sacred trials and study."
            icon={Layers}
          />
        </div>

        <div className="rank-ladder-container">
          {/* Vertical Glowing Energy Beam */}
          <div className="rank-ladder-line" />

          {ASCENSION_TIERS.map((tier, idx) => (
            <div key={tier.rank} className="rank-ladder-item">
              <div className="rank-node-circle" />
              <GlassCard spotlight className="rank-item-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                    {idx + 1}. {tier.rank}
                  </span>
                  <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.78rem', color: 'var(--cyan)' }}>
                    {tier.threshold}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 500, marginBottom: '4px' }}>
                  {tier.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {tier.privilege}
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          FINAL CALL TO ACTION
          =================================================================== */}
      <section className="landing-final-cta">
        <GlassCard spotlight className="landing-final-cta-card">
          <div style={{ color: 'var(--gold)', marginBottom: '16px' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: '#FFF', margin: '0 0 16px' }}>
            Awaken Your Inner Rishi
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Step across the golden threshold. The ancient rishis have preserved the hymns of cosmic illumination
            for thousands of years—awaiting your consciousness.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Magnetic strength={0.3}>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => {
                  sounds.playUnlockChime();
                  navigate('/login');
                }}
              >
                Enter the Sanctum
              </Button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Button
                variant="cyber"
                icon={Compass}
                onClick={handleGuestEntry}
              >
                Enter as Guest Seeker
              </Button>
            </Magnetic>
          </div>
        </GlassCard>
      </section>

      {/* ===================================================================
          GLASS FOOTER
          =================================================================== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-top">
            <div className="landing-footer-brand">
              <span className="landing-footer-logo">ATHARVA VEDA</span>
              <span className="landing-footer-mantra">ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।</span>
            </div>

            <div className="landing-footer-links">
              <Link to="/about" className="landing-footer-link">About</Link>
              <Link to="/founders" className="landing-footer-link">Founders</Link>
              <Link to="/contact" className="landing-footer-link">Contact</Link>
              <Link to="/legal" className="landing-footer-link">Legal & Privacy</Link>
              <Link to="/sanctum" className="landing-footer-link">Sanctum Settings</Link>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>© {new Date().getFullYear()} Atharva Veda Consciousness Platform. All Vedic verses preserved in reverence.</span>
            <span>Made with Sacred Geometries & Procedural Harmony</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
