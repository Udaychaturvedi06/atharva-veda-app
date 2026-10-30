import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Sparkles, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, Type, Palette } from 'lucide-react';

export const DevPlayground = () => {
  const TOKENS = [
    { name: 'Charcoal Void', hex: '#161715', role: 'Primary structural canvas', sampleRole: 'canvas' },
    { name: 'Moonlit Silver', hex: '#D5D3CB', role: 'Primary text & fine rules', sampleRole: 'text' },
    { name: 'Amber', hex: '#C59A56', role: 'Deliberate discovery & focus', sampleRole: 'accent' },
    { name: 'Sage Green', hex: '#87947A', role: 'Verified status & harmony', sampleRole: 'verified' },
    { name: 'Walnut Wood', hex: '#654B3C', role: 'Archival backing surfaces', sampleRole: 'archive' },
    { name: 'Signal Red', hex: '#A83A32', role: 'Rare alert & error mark', sampleRole: 'alert' }
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '40px auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <Chip label="Living Archive · Design System" variant="gold" icon={<Sparkles size={14} />} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: 'var(--text-heading)', margin: '14px 0 8px' }}>
          Visual Identity & Token Atlas
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Evidence-based reference for the 6 mineral roles, typography hierarchy, Devanagari Vedic accent rendering, and WCAG AA contrast compliance.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Section 1: The 6 Mineral Roles */}
        <GlassCard style={{ padding: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette size={20} color="var(--color-amber-bright)" />
            The 6 Organic Mineral & Sacred Elements
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {TOKENS.map((t) => (
              <div
                key={t.name}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(22, 23, 21, 0.75)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-sm)',
                    background: t.hex,
                    border: '1px solid rgba(255,255,255,0.15)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-amber-bright)', fontFamily: 'monospace' }}>{t.hex}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Section 2: Devanagari Sacred Scripture & Accent Shaping */}
        <GlassCard style={{ padding: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Type size={20} color="var(--color-amber-bright)" />
            Sacred Typography: Devanagari Svaras & IAST Diacritics
          </h2>
          <div
            style={{
              padding: 24,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-charcoal-0)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 16
            }}
          >
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.06em', color: 'var(--color-amber-base)', textTransform: 'uppercase', marginBottom: 8 }}>
              Atharvaveda Saunaka · 12.1.1 (Prithvi Sukta) · Metric: Triṣṭubh
            </div>
            <p
              style={{
                fontFamily: 'var(--font-sanskrit)',
                fontSize: '1.6rem',
                lineHeight: 1.9,
                color: 'var(--color-silver-1)',
                margin: '0 0 12px 0'
              }}
            >
              स॒त्यं बृ॒हद् ऋ॒तमु॒ग्रं दी॒क्षा तपो॒ ब्रह्म॑ य॒ज्ञः पृ॑थि॒वीं धा॑रयन्ति ।<br />
              सा नो॑ भू॒तस्य॒ भव्य॑स्य॒ पत्न्यु॒रुं लो॒कं पृ॑थि॒वी नः॑ कृणोतु ॥
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'var(--color-silver-3)',
                fontStyle: 'italic',
                margin: '0 0 14px 0'
              }}
            >
              satyaṃ bṛhad ṛtamugraṃ dīkṣā tapo brahma yajñaḥ pṛthivīṃ dhārayanti |<br />
              sā no bhūtasya bhavyasya patnyuruṃ lokaṃ pṛthivī naḥ kṛṇotu ||
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.98rem',
                lineHeight: 1.7,
                color: 'var(--color-silver-2)',
                margin: 0
              }}
            >
              "Truth, Vast Cosmic Order (Rta), fierce consecration, spiritual ardour, holy prayer, and self-giving sacrifice sustain Mother Earth. Queen of what was and what shall be, may Earth make ample space for our awakening."
            </p>
          </div>
        </GlassCard>

        {/* Section 3: Semantic Status & Restrained Badges */}
        <GlassCard style={{ padding: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-heading)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} color="var(--color-amber-bright)" />
            Editorial Status & Restrained Governance
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <Chip label="Verified Canonical" variant="sage" icon={<CheckCircle2 size={13} />} />
            <Chip label="Scholarly Review Pending" variant="gold" icon={<Sparkles size={13} />} />
            <Chip label="AI-Generated Note" variant="cyan" icon={<BookOpen size={13} />} />
            <Chip label="Source Text Unavailable" variant="red" icon={<AlertTriangle size={13} />} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Action</Button>
            <Button variant="ghost">Secondary Exploration</Button>
            <Button variant="outline">Fine Rule Border</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DevPlayground;
