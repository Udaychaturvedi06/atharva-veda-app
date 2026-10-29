import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ content, children, side = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const sideStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }
  }[side] || { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              zIndex: 1000,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              background: 'rgba(10, 10, 18, 0.95)',
              border: '1px solid var(--glass-border-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--gold-bright)',
              boxShadow: 'var(--glow-gold)',
              ...sideStyles
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
