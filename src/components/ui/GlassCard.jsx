import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const GlassCard = ({
  children,
  className = '',
  variant = 'default', // 'default', 'naga', 'bhurjapatra'
  tilt = false,
  spotlight = true,
  onClick,
  style = {},
  ...props
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const shouldReduceMotion = useReducedMotion();

  const variantClass = variant === 'naga'
    ? 'glass-panel--naga'
    : variant === 'bhurjapatra'
      ? 'bhurjapatra-card'
      : '';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (spotlight) {
      setSpotlightPos({ x, y });
    }

    if (tilt && !shouldReduceMotion) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -7;
      const rotY = ((x - centerX) / centerX) * 7;
      setRotateX(rotX);
      setRotateY(rotY);
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glass-panel ${variantClass} ${tilt ? 'card-tilt-stage' : ''} ${className}`}
      style={{
        transform: tilt && !shouldReduceMotion ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined,
        transition: 'transform 0.15s ease-out',
        ...style
      }}
      {...props}
    >
      {spotlight && (
        <div
          className="card-spotlight-layer"
          style={{
            '--mouse-x': `${spotlightPos.x}px`,
            '--mouse-y': `${spotlightPos.y}px`
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
