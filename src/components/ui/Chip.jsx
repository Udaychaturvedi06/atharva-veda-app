import React from 'react';

export const Chip = ({
  children,
  variant = 'default', // 'default', 'gold', 'saffron', 'cyan'
  icon: Icon,
  className = '',
  ...props
}) => {
  const variantClass = {
    gold: 'chip-gold',
    saffron: 'chip-saffron',
    cyan: 'chip-cyan',
    default: ''
  }[variant] || '';

  return (
    <span className={`chip ${variantClass} ${className}`} {...props}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
};

export default Chip;
