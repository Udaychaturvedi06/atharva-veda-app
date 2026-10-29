import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEngine';

export const Countdown = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    sounds.playShoot();
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          sounds.playUnlockChime();
          return 'OM';
        }
        if (prev === 'OM') {
          clearInterval(interval);
          if (onComplete) onComplete();
          return null;
        }
        sounds.playShoot();
        return prev - 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!count) return null;

  return (
    <div className="countdown-overlay">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="countdown-number"
        >
          {count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Countdown;
