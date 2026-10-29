import React, { useState } from 'react';
import { Shield, FileText, Lock, Globe, Check } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { GlassCard } from '../components/ui/GlassCard';

const LEGAL_SECTIONS = [
  { id: 'heritage', title: 'Public Domain Vedic Heritage' },
  { id: 'privacy', title: 'Privacy Covenant & Zero-Tracking' },
  { id: 'engagement', title: 'Terms of Spiritual Engagement' },
  { id: 'license', title: 'Open Source Software Licensing' }
];

export const Legal = () => {
  const [activeSection, setActiveSection] = useState('heritage');

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageShell
      badge="Open Knowledge & Covenant"
      badgeIcon={Shield}
      title="Legal, Attribution & Privacy"
      subtitle="The immutable covenants guarding public domain Sanskrit heritage, privacy preservation, and open-source devotion."
    >
      <div className="legal-layout-grid">
        {/* Scrollspy Table of Contents Navigation */}
        <aside className="legal-toc-nav">
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Table of Covenants
          </span>
          {LEGAL_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`legal-toc-item ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollTo(sec.id)}
            >
              {sec.title}
            </button>
          ))}
        </aside>

        {/* Content Sections */}
        <div>
          {/* Section 1 */}
          <div id="heritage" className="legal-section-block">
            <h2 className="legal-section-title">1. Public Domain Vedic Heritage</h2>
            <div className="legal-section-body">
              <p>
                The hymns of the Rigveda, Atharvaveda, Samaveda, and Yajurveda are the ancient cultural and spiritual
                heritage of all humanity. They cannot be copyrighted, commercialized, or monopolized by any organization,
                individual, or estate.
              </p>
              <p>
                All verbatim Sanskrit transcriptions, IAST transliterations, and grammatical analyses provided in this application
                are dedicated in devotion to open education and unrestricted spiritual scholarship.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div id="privacy" className="legal-section-block">
            <h2 className="legal-section-title">2. Privacy Covenant & Zero-Tracking</h2>
            <div className="legal-section-body">
              <p>
                We hold a sacred commitment to seeker privacy. The sanctum collects no third-party marketing telemetry,
                engages in no behavioral profiling, and does not sell or distribute personal information.
              </p>
              <p>
                All Radiance Points (RP), unlocked relics, recitation notes, and campaign trial progression are stored
                exclusively in your local device browser cache (via persistent Zustand / LocalStorage) unless explicit cloud
                synchronization is requested.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div id="engagement" className="legal-section-block">
            <h2 className="legal-section-title">3. Terms of Spiritual Engagement</h2>
            <div className="legal-section-body">
              <p>
                The gamified aspects of the Atharva Veda platform—including the Arishadvarga Inner Trials, Agni Shala,
                and Vedic Arcade—are pedagogical devices engineered to awaken spiritual curiosity, self-discipline, and
                intellectual clarity.
              </p>
              <p>
                They are not a replacement for medical, psychological, or legal counsel. Seekers are encouraged to approach
                all hymns with open discernment (Viveka) and practical ethics (Dharma).
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div id="license" className="legal-section-block">
            <h2 className="legal-section-title">4. Open Source Software Licensing</h2>
            <div className="legal-section-body">
              <p>
                The user interface, procedural Web Audio engine, 3D Sacred Geometry WebGL canvas, and game engines
                are provided under permissive open-source licenses for educational, research, and non-commercial veneration.
              </p>
              <p>
                © {new Date().getFullYear()} Atharva Veda Platform Stewards. Built in reverence for timeless truth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Legal;
