import React from 'react';
import { Compass, BookOpen, Scroll, Flame, Shield, Sparkles } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { GlassCard } from '../components/ui/GlassCard';
import { Chip } from '../components/ui/Chip';

const VEDIC_TIMELINE = [
  {
    era: 'c. 1500 – 1100 BCE',
    title: 'Oral Revelation & The Shruti Era',
    desc: 'The seven primal Rishis (Saptarshis) perceive cosmic frequencies in deep meditation along the banks of the Saraswati. Chants are memorized via rigorous mathematical mnemonic systems (Pada-patha, Krama-patha, Ghana-patha) preventing a single syllable from corrupting across millennia.'
  },
  {
    era: 'c. 1000 – 600 BCE',
    title: 'The Great Codification (Krishna Dvaipayana Vyasa)',
    desc: 'Maharshi Veda Vyasa compiles and organizes the vast cosmic mantras into the canonical fourfold corpus: Rigveda (hymns), Yajurveda (rituals), Samaveda (melodies), and Atharvaveda (healing, society, and esoteric sciences).'
  },
  {
    era: 'c. 500 BCE – 1400 CE',
    title: 'Classical Commentaries & Upanishadic Blossoming',
    desc: 'Sages like Sayana, Shankara, and Yaska author exhaustive grammatical and metaphysical exegeses (Bhashyas), revealing the inner spiritual psychology encoded behind outward elemental metaphors.'
  },
  {
    era: 'Modern Era – 2026+',
    title: 'Digital Resurrection & Gamified Consciousness',
    desc: 'Sutra and the Atharva Veda Platform combine modern spatial computing, interactive 3D sacred geometry, audio harmonics, and artificial intelligence to bring living Vedic contemplation to global seekers.'
  }
];

const MISSION_PILLARS = [
  {
    icon: Scroll,
    title: 'Verbatim Integrity',
    desc: 'Preserving authentic Devanagari Sanskrit accents and metered recitation without dogma or alteration.'
  },
  {
    icon: Flame,
    title: 'Living Tapasya',
    desc: 'Transforming ancient wisdom from abstract academic theory into daily mindful contemplation and ethical action.'
  },
  {
    icon: Shield,
    title: 'Inner Warfare',
    desc: 'Empowering seekers to identify and conquer the 6 Arishadvargas through disciplined philosophical discernment.'
  },
  {
    icon: BookOpen,
    title: 'Universal Access',
    desc: 'Open-access public domain heritage freely illuminated for all earnest human consciousness.'
  }
];

export const About = () => {
  return (
    <PageShell
      badge="Origins & Cosmology"
      badgeIcon={Compass}
      title="The Living Transmission of the Vedas"
      subtitle="From Bronze Age oral sonic resonance to digital spatial sanctums: bridging millennia of spiritual intellect."
    >
      {/* Introduction */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 32px' }}>
        The Vedas represent humankind's earliest documented spiritual and poetic revelation. Rather than dogmatic commandments,
        they are meditative laboratory records—explorations into the fabric of cosmic order (Ṛta), universal life breath (Prāna),
        and the indivisible non-dual witness consciousness (Ātman).
      </p>

      {/* Timeline Section */}
      <div style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sparkles size={20} style={{ color: 'var(--gold-bright)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#FFF', margin: 0 }}>
            Chronology of the Sacred Word
          </h2>
        </div>

        <div className="timeline-wrap">
          <div className="timeline-line" />
          {VEDIC_TIMELINE.map((item, idx) => (
            <div key={idx} className="timeline-step">
              <div className="timeline-dot" />
              <div className="timeline-era">{item.era}</div>
              <h3 className="timeline-heading">{item.title}</h3>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Pillars Grid */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#FFF', margin: '0 0 20px' }}>
          Our Four Foundational Pillars
        </h2>

        <div className="about-pillars-grid">
          {MISSION_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <GlassCard key={idx} tilt spotlight style={{ padding: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-bright)', marginBottom: '14px' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#FFF', margin: '0 0 8px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {p.desc}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default About;
