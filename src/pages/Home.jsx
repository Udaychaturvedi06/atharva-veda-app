import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/soundEngine';
import { useSutraAnchor } from '../systems/sutraContext';
import {
  Sparkles,
  Flame,
  Swords,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  Award,
  Zap,
  Volume2,
  Share2,
  Shield,
  Hourglass,
  Heart
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Modal } from '../components/ui/Modal';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import LessonPlayer from '../learning/LessonPlayer';
import { buildSession } from '../learning/sessionBuilder';
import { VasukiRing, VasukiPoisonWard } from '../components/ui/VasukiRing';

// Canonical Daily Hymn (Prithvi Sukta)
const DAILY_HYMN = {
  veda: 'Atharvaveda',
  book: 12,
  hymn: 1,
  verse: 12,
  sanskrit: 'मा॒ता भूमिः॑ पु॒त्रो अ॒हं पृ॑थि॒व्याः । पर्ज॑न्यः पि॒ता स उ॑ नः पिपर्तु ॥', // VERIFY
  transliteration: 'mātā bhūmiḥ putro ahaṃ pṛthivyāḥ | parjanyaḥ pitā sa u naḥ pipartu ||', // VERIFY
  english: 'The Earth is my Mother; I am the child of this sacred soil. Parjanya (the rain-cloud) is the nourishing Father—may he sustain our breath.', // VERIFY
  insight: 'The primordial ecological covenant of the Atharvaveda: humanity and nature are mutually consecrated living kin.' // VERIFY
};

const SANKALPAS = [
  { id: 'focus', title: 'Ekagrata (Focus)', desc: '+15% Radiance gain from study', buff: 'Focus +15%', icon: '🎯' },
  { id: 'calm', title: 'Shanti (Calm)', desc: '-20% Prana cost on all invocations', buff: 'Prana Shield', icon: '🕊️' },
  { id: 'courage', title: 'Abhaya (Courage)', desc: '+25% Damage in inner enemy trials', buff: 'Abhaya Might', icon: '⚡' },
  { id: 'gratitude', title: 'Kritajnata (Gratitude)', desc: '+20% Tapasya resonance bonus', buff: 'Grace Resonator', icon: '🙏' }
];

export const Home = () => {
  const navigate = useNavigate();

  // Anchors for Sutra Thread
  const anchorYajnaRef = useRef(null);
  const anchorHomaRef = useRef(null);
  useSutraAnchor('home-yajna', anchorYajnaRef);
  useSutraAnchor('home-homa', anchorHomaRef);

  // Store state
  const {
    addRp,
    heal,
    restorePrana,
    streak: rawStreak,
    graceDays: rawGraceDays,
    relics: rawRelics,
    sankalpa,
    setSankalpa,
    completeDailyYajna
  } = useGameStore();

  const streak = typeof rawStreak === 'number' ? rawStreak : 1;
  const graceDays = typeof rawGraceDays === 'number' ? rawGraceDays : 2;
  const relics = Array.isArray(rawRelics) && rawRelics.length > 0 ? rawRelics : [
    { id: 'rudraksha', name: 'Gauri Shankar Rudraksha', desc: '+15% Tapasya resonance on meditation', rarity: 'Legendary', icon: '📿', count: 1 },
    { id: 'conch', name: 'Panchajanya Conch Shell', desc: 'Emits a sound wave that dispels doubts', rarity: 'Epic', icon: '🐚', count: 1 },
    { id: 'palm_leaf', name: 'Ancient Birch Bark Folio', desc: 'Contains fragments of Atharva healing hymns', rarity: 'Rare', icon: '📜', count: 2 }
  ];

  // 5 Lamps Daily Progress
  const [completedLamps, setCompletedLamps] = useState({
    sankalpa: Boolean(sankalpa),
    shloka: false,
    homa: false,
    trial: false,
    review: false
  });

  // Shloka Card 3D Flip
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedRelic, setSelectedRelic] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  // Homa Fire interaction
  const [isFeedingGhee, setIsFeedingGhee] = useState(false);
  const [homaSeconds, setHomaSeconds] = useState(60);
  const [homaActive, setHomaActive] = useState(false);
  const [yajnaCompleteModal, setYajnaCompleteModal] = useState(false);

  // Time-aware greeting
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 3.5 && hour < 6) setGreeting('Brahma Muhurta, Sacred Seeker');
    else if (hour >= 6 && hour < 12) setGreeting('Shubha Prabhat (Auspicious Morning), Seeker');
    else if (hour >= 12 && hour < 17) setGreeting('Madhyahna Radiance, Seeker');
    else if (hour >= 17 && hour < 20) setGreeting('Sandhya Twilight, Seeker');
    else setGreeting('Shubha Ratri (Cosmic Night), Seeker');
  }, []);

  // Check 5 lamps completion
  useEffect(() => {
    const allDone = Object.values(completedLamps).every(Boolean);
    if (allDone && !yajnaCompleteModal) {
      const awarded = completeDailyYajna();
      if (awarded) {
        sounds.playLevelUp();
        setYajnaCompleteModal(true);
      }
    }
  }, [completedLamps, completeDailyYajna, yajnaCompleteModal]);

  // Homa Timer
  useEffect(() => {
    if (!homaActive || homaSeconds <= 0) return;
    const interval = setInterval(() => {
      setHomaSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHomaActive(false);
          sounds.playSuccess();
          restorePrana(25);
          heal(25);
          addRp(100);
          setCompletedLamps((l) => ({ ...l, homa: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [homaActive, homaSeconds, restorePrana, heal, addRp]);

  const handleSelectSankalpa = (s) => {
    sounds.playTap();
    setSankalpa(s.id);
    setCompletedLamps((l) => ({ ...l, sankalpa: true }));
  };

  const handleChantShloka = () => {
    sounds.playSuccess();
    setCompletedLamps((l) => ({ ...l, shloka: true }));
    const session = buildSession({ minutes: 3 });
    setActiveLesson(session);
  };

  const handleStartReview = () => {
    sounds.playSuccess();
    setCompletedLamps((l) => ({ ...l, review: true }));
    const session = buildSession({ minutes: 3 });
    setActiveLesson(session);
  };

  const handleFeedGhee = () => {
    sounds.playTap();
    setIsFeedingGhee(true);
    setHomaActive(true);
    setTimeout(() => setIsFeedingGhee(false), 800);
  };

  const completedCount = Object.values(completedLamps).filter(Boolean).length;

  return (
    <div className="home-dashboard" style={{ padding: '24px 20px 100px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* 0. GREETING BAND */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Chip label="Daily Sadhana" variant="gold" icon={<Sparkles size={14} />} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Tithi: Shukla Paksha Trayodashi &bull; Nakshatra: Rohini</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'var(--gold-bright)', margin: 0 }}>
          {greeting}
        </h1>
        <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', margin: '6px 0 0' }}>
          Step forth into the 5-fold Yajna of the day to maintain cosmic order (Rta).
        </p>
      </div>

      {/* VASUKI OUROBOROS 5 LAMPS SAMUDRA MANTHANA DIAL */}
      <div ref={anchorYajnaRef} style={{ marginBottom: 38 }}>
        <VasukiRing
          completedCount={completedCount}
          isChurning={homaActive || isFeedingGhee}
          onChurn={() => sounds.playTibetanBowl()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--silver-moon, #E2E8F0)', fontWeight: 600, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="var(--amber-glow, #FFB020)" /> The 5 Sacred Yajna Lamps
            </span>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', color: 'var(--amber-glow, #FFB020)' }}>
              {completedCount} / 5 LAMPS ILLUMINATED &bull; {completedCount >= 5 ? 'SAPTA-PHANA AWAKENED' : 'CHURNING IN PROGRESS'}
            </span>
          </div>

          {/* 5 Lamps Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            {['1. Sankalpa', '2. Shloka', '3. Homa', '4. Duel', '5. Rekindle'].map((stepName, i) => {
              const keys = ['sankalpa', 'shloka', 'homa', 'trial', 'review'];
              const isDone = completedLamps[keys[i]];
              return (
                <div
                  key={stepName}
                  style={{
                    padding: '12px 10px',
                    textAlign: 'center',
                    borderRadius: 10,
                    background: isDone ? 'rgba(255, 176, 32, 0.16)' : 'rgba(226, 232, 240, 0.04)',
                    border: isDone ? '1px solid #FFB020' : '1px solid rgba(226, 232, 240, 0.1)',
                    color: isDone ? '#FFB020' : 'var(--silver-muted, #94A3B8)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    boxShadow: isDone ? '0 0 14px rgba(255, 176, 32, 0.25)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isDone ? '✓ ' : ''}{stepName}
                </div>
              );
            })}
          </div>
        </VasukiRing>
      </div>

      {/* BENTO GRID OF 5 SACRED RITUALS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>
        {/* STEP 1: SANKALPA (INTENTION) */}
        <GlassCard elevation={2} style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Chip label="Step 1" variant={completedLamps.sankalpa ? 'gold' : 'neutral'} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>Daily Sankalpa</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 12px' }}>
            Choose Your Sacred Intention
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SANKALPAS.map((s) => {
              const isChosen = sankalpa === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSankalpa(s)}
                  style={{
                    padding: '12px 10px',
                    background: isChosen ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)',
                    border: isChosen ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isChosen ? 'var(--gold-bright)' : 'var(--text-0)' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: 2 }}>
                    {s.buff}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* STEP 2: DAILY SHLOKA (3D FLIP) */}
        <GlassCard elevation={2} style={{ padding: 24, perspective: 1000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Chip label="Step 2" variant={completedLamps.shloka ? 'gold' : 'neutral'} />
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={() => setIsFlipped(!isFlipped)}>
              {isFlipped ? 'Show Hymn' : 'Esoteric Insight'}
            </Button>
          </div>

          <div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!isFlipped ? (
              <div>
                <div style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '1.4rem', color: 'var(--gold-bright)', lineHeight: 1.6, marginBottom: 8 }}>
                  {DAILY_HYMN.sanskrit}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontStyle: 'italic', marginBottom: 12 }}>
                  &ldquo;{DAILY_HYMN.english}&rdquo;
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--cyan)', marginBottom: 6 }}>Esoteric Realization</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
                  {DAILY_HYMN.insight}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                  Atharvaveda Kandam 12 &bull; Suktam 1 &bull; Shloka 12
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button size="sm" variant="primary" icon={<Zap size={14} />} onClick={handleChantShloka}>
              Chant on Pitch
            </Button>
            <Button size="sm" variant="ghost" icon={<Share2 size={14} />} onClick={() => sounds.playSuccess()}>
              Share Canvas
            </Button>
          </div>
        </GlassCard>

        {/* STEP 3: HOMA FOCUS FIRE */}
        <div ref={anchorHomaRef}>
          <GlassCard elevation={2} style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Chip label="Step 3" variant={completedLamps.homa ? 'gold' : 'neutral'} />
              <span style={{ fontSize: '0.85rem', color: 'var(--saffron)' }}>Homa Flame</span>
            </div>

            {/* Pulsing Sacred Flame */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 123, 0, 0.5) 0%, transparent 70%)',
                border: '2px solid var(--saffron)',
                margin: '12px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(255, 123, 0, 0.6)',
                transform: isFeedingGhee
                  ? 'scale(1.3)'
                  : 'scale(calc(0.9 + 0.2 * var(--breath, 0.5)))',
                transition: 'transform 0.2s ease'
              }}
            >
              <Flame size={36} color="var(--gold-bright)" />
            </div>

            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 6px' }}>
              {homaActive ? `Focusing: ${homaSeconds}s Remaining` : 'Offer Ghee to the Sacred Fire'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-1)', marginBottom: 16 }}>
              Restores 25 Prana and reinforces Fortitude through guided breath.
            </p>

            <Button
              variant="primary"
              disabled={homaActive}
              icon={<Flame size={16} />}
              onClick={handleFeedGhee}
            >
              {homaActive ? 'Chanting in Stillness...' : 'Feed Ghee (1 Min Ritual)'}
            </Button>
          </GlassCard>
        </div>

        {/* STEP 4: TRIAL OF THE DAY & VASUKI POISON WARD */}
        <GlassCard elevation={2} style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Chip label="Step 4" variant={completedLamps.trial ? 'cyan' : 'danger'} />
            <span style={{ fontSize: '0.85rem', color: completedLamps.trial ? '#769E84' : '#EF4444', fontWeight: 600 }}>
              {completedLamps.trial ? 'Kalakuta Transmuted' : 'Inner Enemy Duel'}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--silver-moon, #E2E8F0)', margin: '0 0 8px' }}>
            Duel of Kāma (Untamed Craving)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-1)', marginBottom: 16 }}>
            The Asura of fleeting cravings challenges your discernment. Vasuki holds the poison boundary.
          </p>

          <div style={{ marginBottom: 20 }}>
            <VasukiPoisonWard
              isDefeated={completedLamps.trial}
              asuraGlyph="काम"
              asuraName="Kāma &bull; Primordial Urge"
            />
          </div>

          <Button
            variant={completedLamps.trial ? 'ghost' : 'danger'}
            icon={<Swords size={16} />}
            onClick={() => {
              setCompletedLamps((l) => ({ ...l, trial: true }));
              sounds.playSuccess();
              navigate('/campaign');
            }}
          >
            {completedLamps.trial ? 'Revisit Conquest (/campaign)' : 'Engage Asura (/campaign)'}
          </Button>
        </GlassCard>

        {/* STEP 5: REVIEW QUEUE (SRS REKINDLE) */}
        <GlassCard elevation={2} style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Chip label="Step 5" variant={completedLamps.review ? 'gold' : 'neutral'} />
            <span style={{ fontSize: '0.85rem', color: 'var(--soma)' }}>Memory Rekindle</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
            7 Sacred Verses are Fading
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-1)', marginBottom: 16 }}>
            Spaced repetition curves indicate retrievability has fallen below 80% on 7 verses.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Hourglass size={32} color="var(--soma)" />
            <div>
              <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Adaptive 3-Minute Rekindle</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>Preserves your Tapasya mastery</div>
            </div>
          </div>

          <Button variant="primary" icon={<RotateCcw size={16} />} onClick={handleStartReview}>
            Rekindle Verses
          </Button>
        </GlassCard>
      </div>

      {/* BELOW THE FOLD: RELIC SHELF & WEEKLY STREAK */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Weekly Streak Ring & Grace Days */}
        <GlassCard elevation={1} style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="var(--saffron)" /> Tapasya Flame & Grace Days
            </h4>
            <Chip label={`${graceDays} Grace Days Banked`} variant="cyan" icon={<Shield size={12} />} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const isLit = idx < streak;
              return (
                <div key={day} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: isLit ? 'rgba(255, 123, 0, 0.25)' : 'rgba(255,255,255,0.04)',
                      border: isLit ? '1.5px solid var(--saffron)' : '1px solid rgba(255,255,255,0.1)',
                      color: isLit ? 'var(--gold-bright)' : 'var(--text-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 6px'
                    }}
                  >
                    <Flame size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: isLit ? '#fff' : 'var(--text-2)' }}>{day}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', margin: 0 }}>
            Streak is never broken with guilt: Grace days auto-shield missed sessions so your thread never dims.
          </p>
        </GlassCard>

        {/* Relic Shelf: Walnut Wood texture backing with carved golden-amber sockets */}
        <GlassCard
          elevation={1}
          style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(46, 33, 24, 0.85) 0%, rgba(20, 15, 11, 0.95) 100%)',
            border: '1.5px solid var(--wood-border, rgba(139, 90, 43, 0.35))',
            boxShadow: '0 12px 32px rgba(20, 14, 10, 0.7)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--amber-radiance, #FFE082)', margin: 0 }}>
              Sacred Relics Shelf
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', fontStyle: 'italic' }}>
              Walnut Altar Inlay
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {relics.map((relic) => {
              if (!relic || !relic.id) return null;
              const shortName = (relic.name || 'Sacred Relic').split(' ')[0];
              return (
                <div
                  key={relic.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedRelic(relic);
                  }}
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 14,
                    background: 'radial-gradient(circle at 50% 30%, rgba(255, 176, 32, 0.15) 0%, rgba(30, 20, 14, 0.9) 100%)',
                    border: '1px solid rgba(255, 176, 32, 0.35)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 4px 12px rgba(20, 14, 10, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.8rem', marginBottom: 4 }}>{relic.icon || '📜'}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--amber-glow, #FFB020)', fontWeight: 600 }}>{shortName}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Relic Inspect Modal */}
      {selectedRelic && (
        <Modal isOpen={Boolean(selectedRelic)} onClose={() => setSelectedRelic(null)} title={selectedRelic.name}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{selectedRelic.icon}</div>
            <Chip label={selectedRelic.rarity} variant="gold" />
            <p style={{ marginTop: 16, color: 'var(--text-1)', fontSize: '0.95rem' }}>
              {selectedRelic.desc}
            </p>
          </div>
        </Modal>
      )}

      {/* Yajna Complete Modal */}
      {yajnaCompleteModal && (
        <Modal isOpen={yajnaCompleteModal} onClose={() => setYajnaCompleteModal(false)} title="Daily Yajna Consecrated">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Award size={64} color="var(--gold-bright)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', fontSize: '1.6rem', margin: '0 0 8px' }}>
              All 5 Lamps Illuminated
            </h3>
            <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', marginBottom: 20 }}>
              The Sutra thread has expanded throughout your Sanctum. +250 Radiance Points and Tapasya streak preserved!
            </p>
            <Button variant="primary" onClick={() => setYajnaCompleteModal(false)}>
              Rejoice in Truth
            </Button>
          </div>
        </Modal>
      )}

      {/* Active Lesson Modal */}
      {activeLesson && (
        <LessonPlayer
          session={activeLesson}
          onClose={() => setActiveLesson(null)}
          onComplete={() => setActiveLesson(null)}
        />
      )}
    </div>
  );
};

export default Home;
