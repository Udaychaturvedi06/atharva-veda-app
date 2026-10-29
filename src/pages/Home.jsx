import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import {
  Sparkles,
  Flame,
  Swords,
  BookOpen,
  MessageSquare,
  Gamepad2,
  ArrowRight,
  RotateCcw,
  Check,
  Compass,
  Award,
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Modal } from '../components/ui/Modal';
import { cardRise, staggerContainer } from '../motion/variants';

// Canonical Daily Hymn Data
const DAILY_HYMN = {
  veda: 'atharva',
  book: 12,
  hymn: 1,
  verse: 12,
  sanskrit: 'माता भूमिः पुत्रो अहं पृथिव्याः | पर्जन्यः पिता स उ नः पिपर्तु ||',
  transliteration: 'mātā bhūmiḥ putro ahaṁ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu',
  english: 'The Earth is my mother, and I am the child of this sacred soil. The celestial rain-cloud is my father—may he nourish us all.',
  theme: 'Prithvi Sukta (Ode to Mother Earth)',
  insight: 'An eternal ecological covenant: Humanity and soil are bound as mother and child. To exploit nature is to sever the primal lifeline of existence.'
};

// Rotating Daily Blessings
const ROTATING_BLESSINGS = [
  {
    text: 'May Savitr inspire our intellect and guide us along the path of righteous illumination.',
    source: 'Rigveda 3.62.10 (Gayatri)'
  },
  {
    text: 'Fearlessness from friends, fearlessness from enemies, fearlessness from the known and the unknown.',
    source: 'Atharvaveda 19.15.6 (Abhaya Sukta)'
  },
  {
    text: 'May the healing waters wash away our inner sorrow, discord, and unexpressed grief.',
    source: 'Atharvaveda 1.6.1'
  },
  {
    text: 'May all directions of the cosmos be auspicious and shelter your consciousness in peace.',
    source: 'Yajurveda 36.17 (Shanti Mantra)'
  }
];

// Veda Background Choices
const VEDA_BACKGROUNDS = [
  { id: 'rig', name: 'Rigveda', url: '/bg-rig.png', color: '#FFE259' },
  { id: 'yajur', name: 'Yajurveda', url: '/bg-yajur.png', color: '#FF7B00' },
  { id: 'sama', name: 'Samaveda', url: '/bg-sama.png', color: '#63B3ED' },
  { id: 'atharva', name: 'Atharvaveda', url: '/bg-atharva.png', color: '#FF5E1E' }
];

export const Home = ({
  addRp: propAddRp,
  setVedaBg: propSetVedaBg,
  heal: propHeal
}) => {
  const navigate = useNavigate();

  // Zustand Store Integration
  const storeAddRp = useGameStore((state) => state.addRp);
  const storeHeal = useGameStore((state) => state.heal);
  const storeRestorePrana = useGameStore((state) => state.restorePrana);
  const relics = useGameStore((state) => state.relics);
  const streak = useGameStore((state) => state.streak);
  const vedaBg = useGameStore((state) => state.vedaBg);
  const storeSetVedaBg = useGameStore((state) => state.setVedaBg);

  const addRp = propAddRp || storeAddRp;
  const heal = propHeal || storeHeal;
  const restorePrana = storeRestorePrana;
  const setVedaBg = propSetVedaBg || storeSetVedaBg;

  // Tile 1: 3D Flip Verse
  const [isVerseFlipped, setIsVerseFlipped] = useState(false);

  // Tile 2: Homa Fire Interaction & Cooldown
  const [homaSparksCount, setHomaSparksCount] = useState(0);
  const [homaCooldown, setHomaCooldown] = useState(0); // 0 to 100 percentage
  const [isFeedingFlame, setIsFeedingFlame] = useState(false);

  // Tile 3: Rotating Blessings
  const [blessingIndex, setBlessingIndex] = useState(0);

  // Tile 4: Relic Details Modal
  const [selectedRelic, setSelectedRelic] = useState(null);

  // Blessing rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setBlessingIndex((prev) => (prev + 1) % ROTATING_BLESSINGS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Homa Fire cooldown timer
  useEffect(() => {
    if (homaCooldown > 0) {
      const interval = setInterval(() => {
        setHomaCooldown((prev) => Math.max(0, prev - 2));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [homaCooldown]);

  // Feed Homa Fire Altar
  const handleFeedFlame = () => {
    if (homaCooldown > 0) return;

    sounds.playFireCrackle();
    setIsFeedingFlame(true);
    setHomaSparksCount((c) => c + 1);

    // Spiritual rejuvenation benefits
    heal(12);
    restorePrana(15);
    addRp(30);

    setTimeout(() => setIsFeedingFlame(false), 300);
    setHomaCooldown(100);
  };

  const currentBlessing = ROTATING_BLESSINGS[blessingIndex];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="sanctuary-container"
    >
      {/* ===================================================================
          SANCTUARY HERO BANNER
          =================================================================== */}
      <motion.section variants={cardRise}>
        <GlassCard spotlight className="sanctuary-banner">
          <div className="sanctuary-banner-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)', marginBottom: '8px' }}>
              <Sparkles size={16} />
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Sanctuary of Consciousness • Day {streak} Tapasya
              </span>
            </div>

            <h1 className="sanctuary-banner-title">The Inner Sanctuary</h1>
            <p className="sanctuary-banner-desc">
              Welcome, Seeker. Contemplate primordial Sanskrit hymns, feed the sacred Agni fire,
              and conquer the six inner adversaries of the mind.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              icon={Swords}
              onClick={() => {
                sounds.playUnlockChime();
                navigate('/campaign');
              }}
            >
              Enter Inner Trials
            </Button>
            <Button
              variant="cyber"
              icon={Gamepad2}
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/arcade');
              }}
            >
              Vedic Arcade
            </Button>
          </div>
        </GlassCard>
      </motion.section>

      {/* ===================================================================
          BENTO-GRID DASHBOARD TILES
          =================================================================== */}
      <div className="bento-grid">
        {/* ---------------------------------------------------------------
            TILE 1: 3D FLIP DAILY VERSE (Span 8)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-8">
          <div className="verse-flip-container">
            <div className={`verse-flip-inner ${isVerseFlipped ? 'is-flipped' : ''}`}>
              {/* Front of Card: Sanskrit Shloka */}
              <GlassCard spotlight className="verse-card-front">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip variant="gold" icon={Sparkles}>
                      Daily Sacred Hymn
                    </Chip>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      ATHARVAVEDA {DAILY_HYMN.book}.{DAILY_HYMN.hymn}.{DAILY_HYMN.verse}
                    </span>
                  </div>

                  <p className="verse-sanskrit-hymn">
                    {DAILY_HYMN.sanskrit}
                  </p>

                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    "{DAILY_HYMN.theme}"
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <Button
                    variant="cyber"
                    icon={RotateCcw}
                    onClick={() => {
                      sounds.playTibetanBowl();
                      setIsVerseFlipped(true);
                    }}
                  >
                    Flip for Exegesis & Insight
                  </Button>

                  <Button
                    variant="ghost"
                    icon={ArrowRight}
                    onClick={() => {
                      sounds.playUnlockChime();
                      navigate(`/verse/${DAILY_HYMN.book}/${DAILY_HYMN.hymn}/${DAILY_HYMN.verse}?veda=${DAILY_HYMN.veda}`);
                    }}
                  >
                    Deep Breakdown
                  </Button>
                </div>
              </GlassCard>

              {/* Back of Card: Transliteration, English Translation, Insight */}
              <GlassCard spotlight className="verse-card-back">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip variant="cyber" icon={BookOpen}>
                      Hymn Exegesis
                    </Chip>
                    <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      English Translation
                    </span>
                  </div>

                  <div style={{ color: 'var(--soma)', fontSize: '0.92rem', margin: '14px 0 8px', fontStyle: 'italic' }}>
                    {DAILY_HYMN.transliteration}
                  </div>

                  <p style={{ color: '#FFFFFF', fontSize: '1rem', lineHeight: 1.6, margin: '8px 0 12px' }}>
                    "{DAILY_HYMN.english}"
                  </p>

                  <div className="verse-esoteric-box">
                    <strong>💡 Esoteric Insight:</strong> {DAILY_HYMN.insight}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <Button
                    variant="cyber"
                    icon={RotateCcw}
                    onClick={() => {
                      sounds.playTibetanBowl();
                      setIsVerseFlipped(false);
                    }}
                  >
                    Flip to Sanskrit Shloka
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------
            TILE 2: HOMA FIRE ALTAR (Span 4)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-4">
          <GlassCard spotlight className="homa-fire-tile">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip variant="danger" icon={Flame}>
                Agni Shala
              </Chip>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)' }}>
                {homaSparksCount} Offerings Made
              </span>
            </div>

            {/* Interactive Flame with Cooldown Ring */}
            <div
              className="homa-altar-stage"
              onClick={handleFeedFlame}
              title={homaCooldown > 0 ? 'Agni Absorbing Offering...' : 'Tap to Feed Sparks to Agni (+HP, +Prana, +RP)'}
            >
              {/* Cooldown Ring */}
              <svg className="homa-cooldown-svg" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="var(--gold-bright)"
                  strokeWidth="4"
                  strokeDasharray="276"
                  strokeDashoffset={(homaCooldown / 100) * 276}
                  style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                />
              </svg>

              {/* Flame Center Core */}
              <div className={`homa-flame-core ${isFeedingFlame ? 'charging' : ''}`}>
                <Flame size={38} />
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.1rem', marginBottom: '4px' }}>
                Sacred Homa Fire
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
                {homaCooldown > 0
                  ? 'Agni assimilates offering. Radiance infusing aura...'
                  : 'Tap the altar flame to offer ghee sparks & restore vital prana.'}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* ---------------------------------------------------------------
            TILE 3: DAILY BLESSING & STREAK (Span 6)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-6">
          <GlassCard spotlight className="blessing-tile">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip variant="gold" icon={Sparkles}>
                  Rishi Blessing
                </Chip>
                <span className="blessing-source">{currentBlessing.source}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={blessingIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="blessing-quote"
                >
                  "{currentBlessing.text}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* 7-Day Flame Streak Calendar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase' }}>
                  7-Day Tapasya Discipline
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold-bright)', fontWeight: 600 }}>
                  {streak} Days Active
                </span>
              </div>

              <div className="streak-row">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const isCompleted = dayNum < streak;
                  const isActive = dayNum === streak;
                  return (
                    <div
                      key={dayNum}
                      className={`streak-day-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <Flame size={16} />
                      <span>D{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ---------------------------------------------------------------
            TILE 4: BACKGROUND THEME SWITCHER (Span 6)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-6">
          <GlassCard spotlight style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip variant="cyber" icon={Compass}>
                  Sanctum Ambience
                </Chip>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sacred Samhita Resonator
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '12px 0 16px', lineHeight: 1.5 }}>
                Shift the cosmic visual tapestry of the sanctum between the four elemental Vedas.
              </p>
            </div>

            <div className="bg-switcher-wrap">
              {VEDA_BACKGROUNDS.map((bg) => {
                const isActive = vedaBg === bg.url;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    className={`bg-switcher-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      sounds.playTibetanBowl();
                      setVedaBg(bg.url);
                    }}
                  >
                    {bg.name}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* ---------------------------------------------------------------
            TILE 5: RELIC SHELF (Span 12)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-12">
          <GlassCard spotlight style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} style={{ color: 'var(--gold-bright)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#FFF', margin: 0 }}>
                  Consecrated Soul Relics
                </h3>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {relics.length} Sacred Relics in Inventory
              </span>
            </div>

            <div className="relics-shelf-grid">
              {relics.map((relic) => (
                <GlassCard
                  key={relic.id}
                  tilt
                  spotlight
                  className="relic-item-card"
                  onClick={() => {
                    sounds.playUnlockChime();
                    setSelectedRelic(relic);
                  }}
                >
                  <div className="relic-icon-wrap">
                    {relic.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#FFF', fontSize: '0.95rem' }}>{relic.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {relic.rarity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {relic.desc}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* ---------------------------------------------------------------
            TILE 6: QUICK ACTIONS LAUNCHER (Span 12)
            --------------------------------------------------------------- */}
        <motion.div variants={cardRise} className="bento-span-12">
          <div className="quick-actions-row">
            <div
              className="quick-action-btn"
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/campaign');
              }}
            >
              <div className="quick-action-icon">
                <Swords size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Continue Trial</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Arishadvarga Warfare</span>
              </div>
            </div>

            <div
              className="quick-action-btn"
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/arcade');
              }}
            >
              <div className="quick-action-icon">
                <Gamepad2 size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Play Arcade</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>60 FPS Vedic Mini-Games</span>
              </div>
            </div>

            <div
              className="quick-action-btn"
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/chat');
              }}
            >
              <div className="quick-action-icon">
                <MessageSquare size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Ask Rishi AI</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Philosophical Oracle</span>
              </div>
            </div>

            <div
              className="quick-action-btn"
              onClick={() => {
                sounds.playTibetanBowl();
                navigate('/library');
              }}
            >
              <div className="quick-action-icon">
                <BookOpen size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>Read Vedas</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verbatim Sanskrit Archive</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===================================================================
          RELIC DETAILS MODAL
          =================================================================== */}
      <Modal
        isOpen={!!selectedRelic}
        onClose={() => setSelectedRelic(null)}
        title={selectedRelic?.name || 'Soul Artifact'}
      >
        {selectedRelic && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
              {selectedRelic.icon}
            </div>

            <Chip variant="gold" icon={Sparkles}>
              {selectedRelic.rarity} Relic
            </Chip>

            <p style={{ color: '#FDFBEE', fontSize: '1rem', lineHeight: 1.6, margin: '20px 0' }}>
              {selectedRelic.desc}
            </p>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', fontSize: '0.85rem', color: 'var(--gold-bright)' }}>
              ⚡ Passive Tapasya Resonance: Active in all meditation sessions & combats.
            </div>

            <div style={{ marginTop: '24px' }}>
              <Button
                variant="primary"
                icon={Check}
                onClick={() => setSelectedRelic(null)}
              >
                Close Sanctuary Inspect
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Home;
