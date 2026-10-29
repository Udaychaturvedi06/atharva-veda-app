import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEngine';

export const LiquidOrb = ({
  type = 'hp', // 'hp', 'prana', 'streak'
  current = 100,
  max = 100,
  icon,
  label,
  color = '#FF4D6D',
  secondaryColor = 'rgba(255, 77, 109, 0.25)',
  details = ''
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  // Y-offset: 100% full -> y=0, 0% full -> y=44
  const waveY = 44 - (percentage / 100) * 44;

  const handleClick = (e) => {
    e.stopPropagation();
    sounds.playTap();
    setShowPopover(!showPopover);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          background: 'rgba(10, 10, 18, 0.85)',
          padding: 0,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 12px ${secondaryColor}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={() => sounds.playHover()}
      >
        {/* SVG Liquid wave fill */}
        <svg
          viewBox="0 0 44 44"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <clipPath id={`orb-clip-${type}`}>
            <circle cx="22" cy="22" r="21" />
          </clipPath>
          <g clipPath={`url(#orb-clip-${type})`}>
            {/* Liquid Background */}
            <rect x="0" y="0" width="44" height="44" fill="rgba(255,255,255,0.03)" />
            {/* Animated Liquid Wave */}
            <path
              d={`M -20 ${waveY} Q 0 ${waveY - 4} 20 ${waveY} T 60 ${waveY} L 60 50 L -20 50 Z`}
              fill={color}
              style={{
                opacity: 0.85,
                transition: 'd 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </g>
        </svg>

        {/* Central Icon */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
          }}
        >
          {icon}
        </div>
      </button>

      {/* Popover on tap */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: 200,
              background: 'rgba(15, 13, 24, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${color}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              zIndex: 1000,
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.9rem', color: '#fff' }}>
                {current} / {max}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.4 }}>
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiquidOrb;
