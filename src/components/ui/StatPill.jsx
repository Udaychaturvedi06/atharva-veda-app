import React from 'react';

export const StatPill = ({
  icon: Icon,
  label,
  value,
  colorVariant = 'gold', // 'gold', 'saffron', 'cyan'
  className = ''
}) => {
  const iconColor = {
    gold: 'var(--gold-bright)',
    saffron: 'var(--saffron)',
    cyan: 'var(--cyan)'
  }[colorVariant] || 'var(--gold-bright)';

  return (
    <div className={`stat-pill ${className}`}>
      {Icon && <Icon size={14} style={{ color: iconColor }} />}
      {label && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</span>}
      <span style={{ color: '#FFF' }}>{value}</span>
    </div>
  );
};

export default StatPill;
