// Query prefers-reduced-motion once for fallback resolution
const isReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

export const pageVariants = isReducedMotion
  ? {
      initial: { opacity: 0 },
      in: { opacity: 1, transition: { duration: 0.15 } },
      out: { opacity: 0, transition: { duration: 0.1 } }
    }
  : {
      initial: {
        opacity: 0,
        y: 10,
        filter: 'blur(4px)'
      },
      in: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      out: {
        opacity: 0,
        y: -6,
        filter: 'blur(2px)',
        transition: {
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    };

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.05) => ({
  initial: {},
  in: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren
    }
  }
});

export const cardRise = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const popIn = {
  initial: { opacity: 0, scale: 0.85 },
  in: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

export const glowPulse = {
  initial: { opacity: 0.8, filter: 'drop-shadow(0 0 10px rgba(255, 226, 89, 0.4))' },
  animate: {
    opacity: 1,
    filter: 'drop-shadow(0 0 24px rgba(255, 226, 89, 0.85))',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 2.2,
      ease: 'easeInOut'
    }
  }
};

export const float = {
  initial: { y: 0 },
  animate: {
    y: -8,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 3,
      ease: 'easeInOut'
    }
  }
};

export const shake = {
  initial: { x: 0 },
  animate: {
    x: [-6, 6, -5, 5, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  }
};
