import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const PageShell = ({
  badge = 'Sanctum Archive',
  badgeIcon = Sparkles,
  title,
  subtitle,
  children
}) => {
  const navigate = useNavigate();
  const IconComponent = badgeIcon || Sparkles;

  return (
    <div className="page-shell-container">
      {/* Back Button */}
      <button
        type="button"
        className="page-shell-back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span>Return to Sanctuary</span>
      </button>

      {/* Main Glass Panel */}
      <GlassCard spotlight className="page-shell-card">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold-bright)', marginBottom: '8px' }}>
          <IconComponent size={16} />
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {badge}
          </span>
        </div>

        {title && <h1 className="page-shell-title">{title}</h1>}
        {subtitle && <p className="page-shell-lead">{subtitle}</p>}

        {children}
      </GlassCard>
    </div>
  );
};

export default PageShell;
