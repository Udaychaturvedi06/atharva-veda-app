import React, { useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { useSutraAnchor } from '../systems/sutraContext';
import {
  Volume2,
  Mic,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  Award,
  Zap,
  Star,
  Activity,
  Layers,
  Edit3
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { CANONICAL_VERSES } from '../data/canonicalVerses';

const MASTERY_LEVELS = ['Seen', 'Read', 'Recited', 'Chanted on Pitch', 'Memorized'];

export const VerseDetail = () => {
  const { book = '12', hymn = '1', verse = '1' } = useParams();
  const [searchParams] = useSearchParams();
  const veda = searchParams.get('veda') || 'Atharvaveda';
  const navigate = useNavigate();

  const scrollRef = useRef(null);
  useSutraAnchor('verse-detail-scroll', scrollRef);

  const { addRp, restorePrana } = useGameStore();

  const [activeTab, setActiveTab] = useState('meaning'); // 'meaning', 'anatomy', 'context', 'reflect', 'practice'
  const [isPlaying, setIsPlaying] = useState(false);
  const [singAlongActive, setSingAlongActive] = useState(false);
  const [pitchScore, setPitchScore] = useState(88);
  const [selectedWord, setSelectedWord] = useState(null);
  const [colorSwara, setColorSwara] = useState(true);
  const [masteryLevel, setMasteryLevel] = useState(2);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [studentNote, setStudentNote] = useState(() => {
    return localStorage.getItem(`sutra_notes_${book}_${hymn}_${verse}`) || '';
  });

  // Find canonical verse or default
  const canonicalVerse = CANONICAL_VERSES.find((v) => v.ref === `${book}.${hymn}.${verse}`) || CANONICAL_VERSES[0];

  // Save student note locally
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setStudentNote(val);
    localStorage.setItem(`sutra_notes_${book}_${hymn}_${verse}`, val);
  };

  const handlePlayToggle = () => {
    sounds.playTap();
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      sounds.playSuccess();
    }
  };

  const handleSingAlong = () => {
    sounds.playTap();
    setSingAlongActive(!singAlongActive);
    if (!singAlongActive) {
      sounds.playSuccess();
      setPitchScore(Math.floor(82 + Math.random() * 15));
    }
  };

  const advanceMastery = () => {
    sounds.playLevelUp();
    const next = Math.min(MASTERY_LEVELS.length - 1, masteryLevel + 1);
    setMasteryLevel(next);
    addRp(100);
    restorePrana(20);
  };

  return (
    <div style={{ padding: '24px 20px 120px', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* Top Breadcrumb & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Button size="sm" variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate('/library')}>
          Back to Manuscripts
        </Button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Chip label={`${veda} ${book}.${hymn}.${verse}`} variant="gold" />
          <Chip label={MASTERY_LEVELS[masteryLevel]} variant="cyan" icon={<Star size={12} />} />
        </div>
      </div>

      {/* CENTER STAGE: LUMINOUS SCROLL */}
      <div ref={scrollRef} style={{ marginBottom: 28 }}>
        <GlassCard elevation={3} style={{ padding: '36px 28px', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Chandas: {canonicalVerse.meter}</span>
            <button
              onClick={() => setColorSwara(!colorSwara)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                color: colorSwara ? 'var(--gold-bright)' : 'var(--text-2)',
                fontSize: '0.75rem',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              {colorSwara ? 'Swara Accent Colors: ON' : 'Swara Colors: OFF'}
            </button>
          </div>

          {/* Interactive Word Tokens */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', margin: '20px 0' }}>
            {canonicalVerse.words.map((w, idx) => {
              const swaraType = w.swara?.[0] || 'udatta';
              const swaraColor = colorSwara
                ? swaraType === 'udatta'
                  ? 'var(--gold-bright)'
                  : swaraType === 'svarita'
                  ? 'var(--cyan)'
                  : 'var(--text-1)'
                : 'var(--text-0)';

              return (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedWord(w);
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  style={{
                    fontFamily: 'var(--font-sanskrit)',
                    fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)',
                    color: swaraColor,
                    background: selectedWord?.text === w.text ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                    border: 'none',
                    borderBottom: selectedWord?.text === w.text ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {w.text}
                </button>
              );
            })}
          </div>

          {/* IAST Transliteration */}
          <div style={{ fontSize: '1rem', color: 'var(--text-1)', fontStyle: 'italic', marginBottom: 16 }}>
            {canonicalVerse.iast}
          </div>

          {/* PITCH RIBBON VISUALIZER */}
          <div style={{ margin: '24px 0 16px', padding: 16, background: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} /> Sacred Svara Pitch Contour (Sa - Ga - Pa)
              </span>
              <Button size="sm" variant={singAlongActive ? 'primary' : 'ghost'} icon={<Mic size={14} />} onClick={handleSingAlong}>
                {singAlongActive ? `Pitch Score: ${pitchScore}%` : 'Sing Along (Mic)'}
              </Button>
            </div>

            {/* Pitch Wave Canvas representation */}
            <div style={{ height: 48, position: 'relative', overflow: 'hidden', background: 'rgba(10, 10, 20, 0.6)', borderRadius: 8 }}>
              {/* Target Contour Line */}
              <svg viewBox="0 0 800 48" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <path
                  d="M 0 24 Q 100 8, 200 24 T 400 24 T 600 8 T 800 24"
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                {singAlongActive && (
                  <path
                    d="M 0 24 Q 100 12, 200 22 T 400 26 T 600 10 T 800 22"
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }}
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Selected Word Popover Panel */}
          {selectedWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--gold)',
                borderRadius: 8,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '1.2rem', color: 'var(--gold-bright)', marginRight: 10 }}>
                  {selectedWord.text}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                  Dhatu (Root): <strong>{selectedWord.root}</strong> &bull; Meaning: <strong>{selectedWord.gloss}</strong>
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedWord(null)}>
                Dismiss
              </Button>
            </motion.div>
          )}
        </GlassCard>
      </div>

      {/* TABS VIEWPORT */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 10, marginBottom: 16 }}>
          {[
            { id: 'meaning', label: 'Meaning & Insight', icon: BookOpen },
            { id: 'anatomy', label: 'Meter Anatomy', icon: Layers },
            { id: 'context', label: 'Context & Deity', icon: Sparkles },
            { id: 'reflect', label: 'Seeker Notes', icon: Edit3 }
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
                  background: isTabActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                  border: isTabActive ? '1px solid var(--gold)' : '1px solid transparent',
                  borderRadius: 6,
                  color: isTabActive ? 'var(--gold-bright)' : 'var(--text-2)',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Meaning */}
        {activeTab === 'meaning' && (
          <GlassCard elevation={1} style={{ padding: 24 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
              Canonical Translation
            </h4>
            <p style={{ fontSize: '1rem', color: 'var(--text-0)', lineHeight: 1.6, marginBottom: 16 }}>
              &ldquo;{canonicalVerse.translation}&rdquo;
            </p>
            <h5 style={{ color: 'var(--cyan)', margin: '0 0 6px' }}>Esoteric Realization</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
              {canonicalVerse.esotericInsight}
            </p>
          </GlassCard>
        )}

        {/* Tab 2: Anatomy */}
        {activeTab === 'anatomy' && (
          <GlassCard elevation={1} style={{ padding: 24 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 12px' }}>
              Chandas (Meter) Architecture: {canonicalVerse.meter}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-1)', marginBottom: 16 }}>
              In the Atharvaveda, the meter acts as the protective sonic armor of the mind. Each syllable is weighed as Laghu (light, 1 matra) or Guru (heavy, 2 matras).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {['Pada 1 (8 Syllables)', 'Pada 2 (8 Syllables)', 'Pada 3 (8 Syllables)', 'Pada 4 (8 Syllables)'].map((p, i) => (
                <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{p}</div>
                  <div style={{ letterSpacing: '4px', fontSize: '1.2rem', color: 'var(--cyan)', marginTop: 4 }}>
                    • — • —
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Tab 3: Context */}
        {activeTab === 'context' && (
          <GlassCard elevation={1} style={{ padding: 24 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
              Scriptural Context
            </h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
              {canonicalVerse.themes.map((th) => (
                <Chip key={th} label={`Theme: ${th}`} variant="gold" />
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-1)', lineHeight: 1.5 }}>
              Transmitted through the Shaunaka recension of the Atharvaveda. Preserved through unbroken oral memorization by the Rishis of ancient Aryavarta.
            </p>
          </GlassCard>
        )}

        {/* Tab 4: Reflect */}
        {activeTab === 'reflect' && (
          <GlassCard elevation={1} style={{ padding: 24 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-bright)', margin: '0 0 8px' }}>
              Personal Sadhana Notes
            </h4>
            <textarea
              value={studentNote}
              onChange={handleNoteChange}
              placeholder="Record your contemplations, insights, and queries on this hymn..."
              rows={5}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                marginBottom: 12
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<MessageSquare size={14} />}
              onClick={() => navigate('/chat')}
            >
              Consult Rishi AI on this Verse
            </Button>
          </GlassCard>
        )}
      </div>

      {/* STICKY BOTTOM CONTROLS */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 18, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '12px 24px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button size="sm" variant="primary" icon={<Volume2 size={16} />} onClick={handlePlayToggle}>
            {isPlaying ? 'Pause Chanting' : 'Listen Recitation'}
          </Button>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
            Speed:
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              style={{
                background: 'transparent',
                color: 'var(--gold)',
                border: 'none',
                marginLeft: 4,
                cursor: 'pointer'
              }}
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
            </select>
          </div>
        </div>

        <Button size="sm" variant="gold" icon={<Award size={16} />} onClick={advanceMastery}>
          Elevate Mastery (Next Tier)
        </Button>
      </div>
    </div>
  );
};

export default VerseDetail;
