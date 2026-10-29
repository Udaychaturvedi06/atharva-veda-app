import React from 'react';
import { Sparkles } from 'lucide-react';

export const SectionHeading = ({
  title,
  subtitle,
  icon: Icon = Sparkles,
  className = ''
}) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Comp = Icon;
      return <Comp size={20} />;
    }
    return null;
  };

  return (
    <div className={`section-heading-wrap ${className}`}>
      <div className="section-mandala-icon">
        {renderIcon()}
      </div>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.4vw, 1.8rem)', color: '#FFF', margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="section-heading-divider" />
    </div>
  );
};

export default SectionHeading;
