import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const RevealText = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  mode = 'word' // 'word' or 'letter'
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  const items = mode === 'letter' ? text.split('') : text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay
      }
    }
  };

  const child = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: mode === 'word' ? '0.25em' : '0' }}
    >
      {items.map((item, index) => (
        <motion.span key={index} variants={child} style={{ display: 'inline-block' }}>
          {item}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default RevealText;
