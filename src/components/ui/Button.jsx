import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'ghost', 'danger', 'combat', 'healing', 'cyber', 'gold'
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary-gold',
    gold: 'btn-primary-gold',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    combat: 'btn-combat',
    healing: 'btn-healing',
    cyber: 'btn-cyber'
  }[variant] || 'btn-primary-gold';

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Comp = Icon;
      return <Comp size={18} className="btn-icon" />;
    }
    return null;
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`btn ${variantClass} ${className}`}
      {...props}
    >
      {renderIcon()}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
