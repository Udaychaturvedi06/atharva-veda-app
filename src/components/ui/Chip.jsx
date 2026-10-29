import React from 'react';

export const Chip = ({
  children,
  label,
  variant = 'default', // 'default', 'gold', 'saffron', 'cyan', 'danger', 'cyber', 'soma'
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantClass = {
    gold: 'chip-gold',
    saffron: 'chip-saffron',
    cyan: 'chip-cyan',
    danger: 'chip-danger',
    soma: 'chip-cyan',
    cyber: 'chip-gold',
    default: ''
  }[variant] || '';

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Comp = Icon;
      return <Comp size={12} />;
    }
    return null;
  };

  return (
    <span className={`chip ${variantClass} ${className}`} {...props}>
      {renderIcon()}
      <span>{label || children}</span>
    </span>
  );
};

export default Chip;
