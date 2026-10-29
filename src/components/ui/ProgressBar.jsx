import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({
  value = 0,
  max = 100,
  className = '',
  trackStyle = {},
  fillStyle = {},
  colorVariant = 'gold' // 'gold', 'hp', 'prana'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  const variantGradients = {
    gold: 'linear-gradient(90deg, var(--gold-bright), var(--saffron))',
    hp: 'linear-gradient(90deg, #FF4500, #FF8C00)',
    prana: 'linear-gradient(90deg, #00C6FF, #0072FF)'
  };

  return (
    <div className={`progress-bar-track ${className}`} style={trackStyle}>
      <motion.div
        className="progress-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: variantGradients[colorVariant] || variantGradients.gold,
          ...fillStyle
        }}
      />
    </div>
  );
};

export default ProgressBar;
