import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield } from 'lucide-react';

const Founders = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> <span>Back</span>
      </button>

      <div className="info-card-slate">
        <div className="info-badge">
          <Users size={16} className="gold-accent" />
          <span>STEWARDS OF THE TRADITION</span>
        </div>
        <h1>Founders & Stewards</h1>
        <p className="lead-text">
          Dedicated technologists, Sanskrit scholars, and meditation practitioners united to preserve sacred wisdom.
        </p>
        <p>
          Founded to build an open-access, gamified, and spiritually respectful learning environment for seekers worldwide.
        </p>
      </div>
    </div>
  );
};

export default Founders;
