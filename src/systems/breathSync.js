/**
 * Global Breath Sync Clock (Pranayama Cycle)
 * 4s Inhale / 4s Exhale (8s total cycle)
 * Updates CSS variable `--breath` (0..1) on document root at 30Hz via single rAF
 */

let rAFId = null;
let lastUpdate = 0;
let isRunning = false;
let startTime = 0;

export const initBreathSync = () => {
  if (typeof window === 'undefined' || isRunning) return;

  // Check reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.documentElement.style.setProperty('--breath', '0.5');
    return;
  }

  isRunning = true;
  startTime = performance.now();

  const tick = (now) => {
    if (!isRunning) return;

    // Throttle to 30Hz (every ~33ms) to save CPU/battery
    if (now - lastUpdate >= 33) {
      lastUpdate = now;
      const elapsed = (now - startTime) % 8000; // 8s cycle
      // Smooth sinusoidal breath curve from 0.0 to 1.0
      const breath = 0.5 - 0.5 * Math.cos((elapsed / 4000) * Math.PI);
      document.documentElement.style.setProperty('--breath', breath.toFixed(3));
    }

    rAFId = requestAnimationFrame(tick);
  };

  rAFId = requestAnimationFrame(tick);
};

export const stopBreathSync = () => {
  isRunning = false;
  if (rAFId) {
    cancelAnimationFrame(rAFId);
    rAFId = null;
  }
};
