import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Users, Database, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-chamber">
      <button className="back-nav-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> <span>Back to Sanctum</span>
      </button>

      <div className="admin-header">
        <ShieldAlert size={24} className="gold-accent" />
        <h1>Sanctum Oversight (Admin Portal)</h1>
      </div>

      <div className="admin-metrics-grid">
        <div className="metric-box">
          <Users size={20} />
          <span className="metric-num">Registered Seekers</span>
          <span className="metric-val">4 Active Profiles</span>
        </div>

        <div className="metric-box">
          <Database size={20} />
          <span className="metric-num">Cached Translations</span>
          <span className="metric-val">3 Verified Shlokas</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
