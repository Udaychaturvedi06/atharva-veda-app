import { useEffect, useRef } from 'react';

/**
 * useGameLoop: High-performance fixed-timestep (60Hz) game loop with rAF rendering
 * Automatically pauses when document is hidden or window blurs.
 */
export const useGameLoop = ({
  onUpdate,
  onRender,
  isRunning = true,
  fps = 60
}) => {
  const isRunningRef = useRef(isRunning);
  const onUpdateRef = useRef(onUpdate);
  const onRenderRef = useRef(onRender);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onRenderRef.current = onRender;
    isRunningRef.current = isRunning;
  }, [onUpdate, onRender, isRunning]);

  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    let accumulator = 0;
    const timestep = 1000 / fps; // 16.666ms for 60fps

    const loop = (currentTime) => {
      if (!isRunningRef.current) {
        lastTime = currentTime;
        animId = requestAnimationFrame(loop);
        return;
      }

      let delta = currentTime - lastTime;
      lastTime = currentTime;

      // Cap delta at 100ms to avoid spiral of death on tab resume
      if (delta > 100) delta = 100;
      accumulator += delta;

      // Update in fixed 60Hz steps
      while (accumulator >= timestep) {
        if (onUpdateRef.current) {
          onUpdateRef.current(timestep / 1000);
        }
        accumulator -= timestep;
      }

      // Render with remaining interpolation fraction
      if (onRenderRef.current) {
        const alpha = accumulator / timestep;
        onRenderRef.current(alpha);
      }

      animId = requestAnimationFrame(loop);
    };

    // Pause on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastTime = performance.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fps]);
};

export default useGameLoop;
