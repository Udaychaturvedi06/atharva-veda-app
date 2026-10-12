import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> <span>Back</span>
      </button>

      <div className="info-card-slate">
        <div className="info-badge">
          <Shield size={16} className="gold-accent" />
          <span>OPEN KNOWLEDGE & PRIVACY</span>
        </div>
        <h1>Legal & Attribution</h1>
        <p className="lead-text">
          Vedic texts are public domain heritage of humankind. Datasets and translations are shared in devotion to open spiritual education.
        </p>
        <p>
          We collect minimal telemetry solely to persist local session progress and do not commercialize user data.
        </p>
      </div>
    </div>
  );
};

export default Legal;
