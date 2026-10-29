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

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Comp = Icon;
      return <Comp size={14} style={{ color: iconColor }} />;
    }
    return null;
  };

  return (
    <div className={`stat-pill ${className}`}>
      {renderIcon()}
      {label && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</span>}
      <span style={{ color: '#FFF' }}>{value}</span>
    </div>
  );
};

export default StatPill;
