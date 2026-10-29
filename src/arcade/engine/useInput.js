import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useInput: Multi-modal keyboard, mouse pointer, and touch controls
 */
export const useInput = (canvasRef) => {
  const keysRef = useRef({});
  const pointerRef = useRef({ x: 0, y: 0, isDown: false, clickEvent: false });
  const directionQueueRef = useRef([]);

  const [activeDirection, setActiveDirection] = useState({ x: 0, y: 0 });

  // Handle keydown / keyup
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent scrolling on arrows & space when playing
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keysRef.current[e.code] = true;
      keysRef.current[e.key] = true;

      // Queue directions for grid movement
      if (['ArrowUp', 'KeyW'].includes(e.code)) directionQueueRef.current.push('UP');
      if (['ArrowDown', 'KeyS'].includes(e.code)) directionQueueRef.current.push('DOWN');
      if (['ArrowLeft', 'KeyA'].includes(e.code)) directionQueueRef.current.push('LEFT');
      if (['ArrowRight', 'KeyD'].includes(e.code)) directionQueueRef.current.push('RIGHT');
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer / Mouse / Touch coordinate tracker relative to canvas
  const handlePointerMove = useCallback((e) => {
    if (!canvasRef?.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    pointerRef.current.x = (clientX - rect.left) * scaleX;
    pointerRef.current.y = (clientY - rect.top) * scaleY;
  }, [canvasRef]);

  const handlePointerDown = useCallback((e) => {
    pointerRef.current.isDown = true;
    pointerRef.current.clickEvent = true;
    handlePointerMove(e);
  }, [handlePointerMove]);

  const handlePointerUp = useCallback(() => {
    pointerRef.current.isDown = false;
  }, []);

  return {
    keysRef,
    pointerRef,
    directionQueueRef,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    activeDirection,
    setActiveDirection
  };
};

export default useInput;
