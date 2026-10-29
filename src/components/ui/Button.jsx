import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'ghost', 'danger', 'combat', 'healing', 'cyber'
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary-gold',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    combat: 'btn-combat',
    healing: 'btn-healing',
    cyber: 'btn-cyber'
  }[variant] || 'btn-primary-gold';

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
      {Icon && <Icon size={18} className="btn-icon" />}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
