import React from 'react';
import { Users, Globe, Code2, Sparkles } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { GlassCard } from '../components/ui/GlassCard';
import { Chip } from '../components/ui/Chip';

const FOUNDERS_DATA = [
  {
    name: 'Uday Chaturvedi',
    role: 'Lead Architect & Technologist',
    avatarGlyph: '⚡',
    sanskritQuote: 'योगः कर्मसु कौशलम्',
    quoteMeaning: 'Excellence in focused action is yoga.',
    bio: 'Systems engineer and creative developer pioneering the fusion of modern web technologies, 3D graphics, procedural audio, and ancient Sanskrit manuscripts.',
    links: { github: 'https://github.com/Udaychaturvedi06', web: '#' }
  },
  {
    name: 'Vedic Scholars Circle',
    role: 'Philological Advisory & Exegesis',
    avatarGlyph: '📜',
    sanskritQuote: 'विद्ययाऽमृतमश्नुते',
    quoteMeaning: 'Through sacred knowledge, immortality is tasted.',
    bio: 'Consortium of traditional Sanskritists, Vaidyas, and Vedic chanters verifying the phonetic precision of every syllable, meter, and philosophical exegesis.',
    links: { web: '#' }
  },
  {
    name: 'The Global Sangha',
    role: 'Community of Pilgrims',
    avatarGlyph: '🌿',
    sanskritQuote: 'सं गच्छध्वं सं वदध्वम्',
    quoteMeaning: 'Walk together; commune in mutual harmony.',
    bio: 'Hundreds of dedicated practitioners worldwide contributing open-source corrections, translations, and meditative realizations to keep the wisdom alive.',
    links: { web: '#' }
  }
];

export const Founders = () => {
  return (
    <PageShell
      badge="Stewards & Guardians"
      badgeIcon={Users}
      title="Founders & Tradition Keepers"
      subtitle="The technologists, linguists, and contemplatives united in reverence to preserve humanity's primordial heritage."
    >
      <div className="founders-grid">
        {FOUNDERS_DATA.map((founder, idx) => (
          <GlassCard key={idx} tilt spotlight className="founder-card">
            <div className="founder-avatar">
              <span>{founder.avatarGlyph}</span>
            </div>

            <h3 className="founder-name">{founder.name}</h3>
            <span className="founder-role">{founder.role}</span>

            <div className="founder-sanskrit-quote">
              "{founder.sanskritQuote}"
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                — {founder.quoteMeaning}
              </div>
            </div>

            <p className="founder-bio">{founder.bio}</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              {founder.links.github && (
                <a
                  href={founder.links.github}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--gold-bright)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', textDecoration: 'none' }}
                >
                  <Code2 size={15} /> GitHub
                </a>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
};

export default Founders;
