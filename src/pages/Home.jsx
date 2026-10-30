import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import {
  BookOpen,
  Search,
  ArrowRight,
  Compass,
  Sparkles,
  Gamepad2,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

// Curated Available Traditions and Collections
const CURATED_COLLECTIONS = [
  {
    id: 'atharva',
    title: 'Atharvaveda Saunaka',
    devanagari: 'अथर्ववेद शौनक संहिता',
    leadHymn: 'Kanda 12 · Prithvi Sukta',
    desc: 'The primordial ecological hymn: Mother Earth sustained by truth, cosmic order, and consecrated vigilance.',
    route: '/verse/12/1/1',
    ref: 'AVŚ 12.1.1',
    accent: 'var(--color-amber-bright)',
    tag: 'Ecological Covenant'
  },
  {
    id: 'rig',
    title: 'Rigveda Samhita',
    devanagari: 'ऋग्वेद संहिता',
    leadHymn: 'Mandala 1 · Agni Sukta',
    desc: 'The primordial revelation of cosmic aspiration, divine illumination, and the sacrificial flame.',
    route: '/library?veda=rig',
    ref: 'RV 1.1.1',
    accent: 'var(--color-silver-1)',
    tag: 'Cosmic Chants'
  },
  {
    id: 'sama',
    title: 'Samaveda Archika',
    devanagari: 'सामवेद आर्चिक',
    leadHymn: 'Purvarchika · Melodies of Agni',
    desc: 'Metrical chants and sonic frequencies designed for contemplative dissolution of the ego.',
    route: '/library?veda=sama',
    ref: 'SV 1.1.1',
    accent: 'var(--color-sage-text)',
    tag: 'Sacred Frequencies'
  },
  {
    id: 'yajur',
    title: 'Yajurveda (Vajasaneyi)',
    devanagari: 'शुक्ल यजुर्वेद वाजसनेयि',
    leadHymn: 'Isha Adhyaya · Non-Duality',
    desc: 'Sacred action, inner renunciation, and the celebrated revelation of divine all-pervasiveness.',
    route: '/library?veda=yajur',
    ref: 'YV 40.1.1',
    accent: 'var(--color-silver-2)',
    tag: 'Inner Alchemy'
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Time-aware greeting grounded in Vedic diurnal phases
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 3.5 && hour < 6) setGreeting('Brahma Muhurta (Pre-Dawn Stillness)');
    else if (hour >= 6 && hour < 12) setGreeting('Shubha Prabhat (Morning Radiance)');
    else if (hour >= 12 && hour < 17) setGreeting('Madhyahna (Solar Zenith)');
    else if (hour >= 17 && hour < 20) setGreeting('Sandhya (Twilight Contemplation)');
    else setGreeting('Shubha Ratri (Cosmic Night)');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sounds.playTap();

    // Check for direct reference patterns like "12.1.1" or "1.1"
    const refMatch = searchQuery.trim().match(/^(\d+)[.\s]+(\d+)(?:[.\s]+(\d+))?$/);
    if (refMatch) {
      const book = refMatch[1];
      const hymn = refMatch[2];
      const verse = refMatch[3] || '1';
      navigate(`/verse/${book}/${hymn}/${verse}`);
    } else {
      navigate(`/library?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '36px 20px 80px', position: 'relative', zIndex: 10 }}>
      {/* 1. IMMEDIATE ORIENTATION & EDITORIAL HEADER */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Chip label="Digital Archive" variant="gold" icon={<Compass size={14} />} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            {greeting} &bull; Open Academic Edition
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            color: 'var(--text-heading)',
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            margin: '0 0 16px 0'
          }}
        >
          The Living Archive of Vedic Wisdom
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '1.1rem',
            lineHeight: 1.65,
            color: 'var(--text-primary)',
            maxWidth: 720,
            margin: 0
          }}
        >
          An authored, scholarly digital environment for exploring the four Vedas with authentic Devanagari 
          accent notation, word-level etymological breakdown, verified translations, and structured learning.
        </p>
      </section>

      {/* 2. SIGNATURE INTERACTION: DIRECT ARCHIVE SEARCH & VERSE JUMP */}
      <section style={{ marginBottom: 48 }}>
        <GlassCard style={{ padding: '24px 28px', border: '1px solid var(--border-subtle)', background: 'rgba(26, 27, 24, 0.85)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260, background: 'var(--color-charcoal-0)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)' }}>
              <Search size={20} color="var(--color-amber-bright)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword (e.g. 'Truth', 'Earth') or jump by reference (e.g. '12.1.1')..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-ui)',
                  width: '100%'
                }}
              />
            </div>
            <Button type="submit" variant="primary" icon={<ArrowRight size={18} />}>
              Open in Archive
            </Button>
          </form>

          {/* Quick jump suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick Jump:</span>
            {['12.1.1 (Prithvi Sukta)', '1.1.1 (Invocation to Speech)', '19.9.1 (Shanti Sukta)'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  const ref = s.split(' ')[0];
                  const parts = ref.split('.');
                  navigate(`/verse/${parts[0]}/${parts[1]}/${parts[2]}`);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  color: 'var(--color-silver-3)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-amber-bright)';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-silver-3)';
                  e.currentTarget.style.borderColor = 'var(--border-hairline)';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* 3. RESUME READING & DAILY CONTEMPLATION (TWO-COLUMN ANCHOR) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
        {/* Left Column: Opening Cornerstone Passages */}
        <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Chip label="Archival Cornerstone" variant="gold" />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-amber-bright)', fontFamily: 'monospace' }}>AVŚ 12.1.1</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-heading)', margin: '0 0 10px 0' }}>
              The Earth Hymn (Bhūmi Sūkta)
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-sanskrit)',
                fontSize: '1.25rem',
                lineHeight: 1.8,
                color: 'var(--color-silver-1)',
                marginBottom: 12
              }}
            >
              स॒त्यं बृ॒हद् ऋ॒तमु॒ग्रं दी॒क्षा तपो॒ ब्रह्म॑ य॒ज्ञः पृ॑थि॒वीं धा॑रयन्ति ।
            </p>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              "Truth, Vast Cosmic Order, consecration, spiritual ardour, holy prayer, and self-giving sacrifice sustain Mother Earth."
            </p>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Button
              variant="primary"
              icon={<BookOpen size={16} />}
              onClick={() => {
                sounds.playTap();
                navigate('/verse/12/1/1');
              }}
            >
              Study with Living Margins
            </Button>
          </div>
        </GlassCard>

        {/* Right Column: Daily Contemplation & Audio Recitation */}
        <GlassCard style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Chip label="Daily Contemplation" variant="sage" icon={<CheckCircle2 size={13} />} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-sage-text)' }}>AVŚ 12.1.12</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-heading)', margin: '0 0 10px 0' }}>
              Mātā Bhūmiḥ (The Sacred Mother)
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-sanskrit)',
                fontSize: '1.25rem',
                lineHeight: 1.8,
                color: 'var(--color-silver-1)',
                marginBottom: 12
              }}
            >
              मा॒ता भूमिः॑ पु॒त्रो अ॒हं पृ॑थि॒व्याः । पर्ज॑न्यः पि॒ता स उ॑ नः पिपर्तु ॥
            </p>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
              "The Earth is my Mother; I am the child of this sacred soil. Parjanya (the rain-cloud) is the nourishing Father—may he sustain our breath."
            </p>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button
              variant="outline"
              icon={<ArrowRight size={16} />}
              onClick={() => {
                sounds.playTap();
                navigate('/verse/12/1/12');
              }}
            >
              Read in Context
            </Button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Meter: Anuṣṭubh &bull; Śaunaka Recension
            </span>
          </div>
        </GlassCard>
      </section>

      {/* 4. CURATED COLLECTIONS INDEX (THE FOUR VEDAS) */}
      <section style={{ marginBottom: 52 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text-heading)', margin: '0 0 6px 0' }}>
              Manuscript Traditions & Collections
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              Explore indexed recensions, canonical hymns, and metrical structures.
            </p>
          </div>

          <Button
            variant="ghost"
            icon={<ArrowUpRight size={16} />}
            onClick={() => {
              sounds.playTap();
              navigate('/library');
            }}
          >
            View Full Catalogue
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CURATED_COLLECTIONS.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                sounds.playTap();
                navigate(c.route);
              }}
              style={{
                padding: '24px 22px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(26, 27, 24, 0.75)',
                border: '1px solid var(--border-hairline)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.25s, transform 0.25s, background 0.25s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(34, 35, 31, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hairline)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(26, 27, 24, 0.75)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-amber-bright)', textTransform: 'uppercase' }}>
                    {c.tag}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.ref}</span>
                </div>

                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-heading)', margin: '0 0 4px 0' }}>
                  {c.title}
                </h4>

                <div style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '1.0rem', color: 'var(--color-silver-3)', marginBottom: 10 }}>
                  {c.devanagari}
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                  {c.desc}
                </p>
              </div>

              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-amber-bright)', fontSize: '0.85rem', fontWeight: 600 }}>
                Explore Collection <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECONDARY PATHWAYS: STRUCTURED LEARNING, AI COMPANION & ARCADE */}
      <section style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 36 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: 16 }}>
          Learning, Guided Dialogue & Practice Suites
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {/* Pathway 1: Structured Learning Path */}
          <GlassCard
            style={{ padding: 20, cursor: 'pointer' }}
            onClick={() => {
              sounds.playTap();
              navigate('/path');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-sage-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} color="var(--color-sage-text)" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-heading)', margin: 0, fontSize: '1.05rem' }}>
                The Pada Spiral (Learning Path)
              </h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Master Sanskrit word roots, Sandhi compound formations, and metrical patterns in progressive steps.
            </p>
          </GlassCard>

          {/* Pathway 2: AI Dialogical Companion */}
          <GlassCard
            style={{ padding: 20, cursor: 'pointer' }}
            onClick={() => {
              sounds.playTap();
              navigate('/chat');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="var(--color-amber-bright)" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-heading)', margin: 0, fontSize: '1.05rem' }}>
                Rishi AI Philosophical Inquiries
              </h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Explore philosophical questions and thematic relationships with our Gemini-powered textual companion.
            </p>
          </GlassCard>

          {/* Pathway 3: Vedic Arcade Suite */}
          <GlassCard
            style={{ padding: 20, cursor: 'pointer' }}
            onClick={() => {
              sounds.playTap();
              navigate('/arcade');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(213, 211, 203, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gamepad2 size={18} color="var(--color-silver-1)" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-heading)', margin: 0, fontSize: '1.05rem' }}>
                Vedic Arcade (9 Practice Games)
              </h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Reinforce rhythm, Sandhi rules, and Devanagari speed recognition through interactive retro challenges.
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;
