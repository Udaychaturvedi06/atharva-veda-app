import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEngine';
import { Sparkles, Swords, BookOpen, BrainCircuit, ArrowRight, Flame, Shield, Volume2 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [soundPlayed, setSoundPlayed] = useState(false);

  const triggerGong = () => {
    sounds.playTibetanBowl();
    setSoundPlayed(true);
  };

  return (
    <div className="landing-experience">
      {/* Sound Chime Welcome */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          className="rune-btn" 
          onClick={triggerGong}
          style={{ display: 'inline-flex', padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <Volume2 size={15} />
          <span>{soundPlayed ? 'Sacred Bowl Resonating (432Hz)' : 'Strike Tibetan Singing Bowl'}</span>
        </button>
      </div>

      {/* Cinematic Hero */}
      <section className="landing-hero-block" style={{ position: 'relative' }}>
        <div className="landing-glow-orb" />
        <div className="landing-badge">
          <Sparkles size={14} className="gold-accent" />
          <span>CYBER-VEDIC SACRED ODYSSEY</span>
        </div>
        <h1 className="landing-headline">
          Awaken the Primordial Light of the <span className="gold-text">Vedas</span>
        </h1>
        <p className="landing-lead">
          Decode verbatim Sanskrit hymns, explore the four ancient Samhitas, and defeat the 6 inner demons of the mind through gamified spiritual trials.
        </p>

        <div className="landing-cta-cluster">
          <button 
            className="primary-cta-btn landing-main-cta"
            onClick={() => {
              sounds.playUnlockChime();
              navigate('/login');
            }}
          >
            <span>Enter the Sanctum</span>
            <ArrowRight size={18} />
          </button>

          <button 
            className="secondary-cta-btn"
            onClick={() => {
              sounds.playTibetanBowl();
              navigate('/about');
            }}
          >
            <span>The Ancient Mission</span>
          </button>
        </div>

        {/* Global Live Statistics Ticker */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px',
          marginTop: '40px', padding: '20px', background: 'rgba(18, 16, 28, 0.7)', borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <div>
            <div style={{ color: '#FFE259', fontSize: '1.4rem', fontFamily: 'Orbitron, monospace', fontWeight: 800 }}>4</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>Cosmic Vedas</div>
          </div>
          <div>
            <div style={{ color: '#FFE259', fontSize: '1.4rem', fontFamily: 'Orbitron, monospace', fontWeight: 800 }}>20,380+</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>Preserved Shlokas</div>
          </div>
          <div>
            <div style={{ color: '#FF5E1E', fontSize: '1.4rem', fontFamily: 'Orbitron, monospace', fontWeight: 800 }}>6</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>Inner Demon Trials</div>
          </div>
          <div>
            <div style={{ color: '#00F0FF', fontSize: '1.4rem', fontFamily: 'Orbitron, monospace', fontWeight: 800 }}>432 Hz</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600 }}>Acoustic Harmonics</div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Trio */}
      <section className="landing-pillars-section">
        <div className="pillar-card">
          <div className="pillar-icon"><BookOpen size={24} /></div>
          <h3>The Four Samhitas</h3>
          <p>Verbatim access to Rigveda, Atharvaveda, Samaveda, and Yajurveda with multi-layered exegesis in English and Hindi.</p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon"><Swords size={24} /></div>
          <h3>Arishadvarga Combat</h3>
          <p>Engage in philosophical warfare against Kāma, Krodha, Moha, and ego. Rise across the 7 Lokas of Mount Meru.</p>
        </div>

        <div className="pillar-card">
          <div className="pillar-icon"><BrainCircuit size={24} /></div>
          <h3>The Rishi Oracle</h3>
          <p>Contemplative spiritual AI trained on ancient Vedic hymns to resolve modern existential anxieties.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
