import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, BookOpen, Compass } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> <span>Back</span>
      </button>

      <div className="info-card-slate">
        <div className="info-badge">
          <Compass size={16} className="gold-accent" />
          <span>ORIGINS & PHILOSOPHY</span>
        </div>
        <h1>About Sutra: The Vedic Journey</h1>
        <p className="lead-text">
          Sutra was conceived to bridge the gap between thousands of years of oral Vedic scholarship and contemporary interactive technologies.
        </p>

        <div className="info-text-body">
          <h3>The Four Pillars</h3>
          <p>
            The Vedas represent humankind's earliest poetic and philosophical revelations. While traditional scholarship has often been locked behind dense academic walls, Sutra delivers interactive exegesis, root word breakdowns, and gamified contemplations to make ancient insights practical for modern life.
          </p>

          <h3>Authenticity First</h3>
          <p>
            Every hymn is preserved in its authentic Devanagari Sanskrit notation with metered transliteration. Explanations cross-reference classical commentators (Sayana, Aurobindo, Dayananda) with modern philosophical clarity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
