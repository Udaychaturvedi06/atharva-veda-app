import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

const SutraContext = createContext({
  registerAnchor: () => {},
  unregisterAnchor: () => {},
  anchors: {}
});

export const SutraProvider = ({ children }) => {
  const [anchors, setAnchors] = useState({});

  const registerAnchor = useCallback((id, el) => {
    if (!el) return;
    setAnchors((prev) => ({ ...prev, [id]: el }));
  }, []);

  const unregisterAnchor = useCallback((id) => {
    setAnchors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  return (
    <SutraContext.Provider value={{ registerAnchor, unregisterAnchor, anchors }}>
      {children}
      <SutraThread anchors={anchors} />
    </SutraContext.Provider>
  );
};

export const useSutraAnchor = (id, ref) => {
  const { registerAnchor, unregisterAnchor } = useContext(SutraContext);

  useEffect(() => {
    if (ref?.current) {
      registerAnchor(id, ref.current);
    }
    return () => {
      unregisterAnchor(id);
    };
  }, [id, ref, registerAnchor, unregisterAnchor]);
};

/**
 * <SutraThread />
 * Ethereal, faded, and continuously animated golden thread connecting page anchors
 */
export const SutraThread = ({ anchors }) => {
  const location = useLocation();
  const hp = useGameStore((s) => s.hp);
  const prana = useGameStore((s) => s.prana);
  const streak = useGameStore((s) => s.streak);

  const [pathData, setPathData] = useState('');
  const [pathLength, setPathLength] = useState(0);
  const [isDrawing, setIsDrawing] = useState(true);
  const pathRef = useRef(null);

  // Calculate smooth Bezier curve connecting anchors
  useEffect(() => {
    const updatePath = () => {
      const elements = Object.values(anchors).filter((el) => el && el.getBoundingClientRect);
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (elements.length === 0) {
        // Fallback gentle wave spine down the viewport
        setPathData(`M ${w * 0.5} 0 C ${w * 0.46} ${h * 0.3}, ${w * 0.54} ${h * 0.7}, ${w * 0.5} ${h}`);
        return;
      }

      // Sort elements by vertical position
      const sorted = elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        })
        .sort((a, b) => a.y - b.y);

      // Extend to top and bottom of viewport for seamless flow
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      let d = `M ${first.x} 0 C ${first.x} ${first.y * 0.4}, ${first.x} ${first.y * 0.7}, ${first.x} ${first.y}`;

      for (let i = 0; i < sorted.length - 1; i++) {
        const p0 = sorted[i];
        const p1 = sorted[i + 1];
        const midY = (p0.y + p1.y) / 2;
        d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
      }

      d += ` C ${last.x} ${(last.y + h) / 2}, ${last.x} ${h * 0.9}, ${last.x} ${h}`;
      setPathData(d);
    };

    updatePath();
    setIsDrawing(true);
    const drawTimer = setTimeout(() => setIsDrawing(false), 900);

    window.addEventListener('resize', updatePath);
    window.addEventListener('scroll', updatePath, true);

    const timer = setTimeout(updatePath, 200);
    return () => {
      window.removeEventListener('resize', updatePath);
      window.removeEventListener('scroll', updatePath, true);
      clearTimeout(timer);
      clearTimeout(drawTimer);
    };
  }, [anchors, location.pathname]);

  // Update total path length for stroke dash animation
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
    }
  }, [pathData]);

  // State-reactive parameters
  const isLowHp = hp < 25;
  const isHighPrana = prana >= 80;

  const coreColor = isLowHp ? '#FF4D6D' : isHighPrana ? '#00F0FF' : '#D4AF37';
  const glowColor = isLowHp ? '#FF5E1E' : isHighPrana ? '#63B3ED' : '#FFE259';
  const flowDuration = isHighPrana ? '6s' : '10s';
  const sparkDuration = isHighPrana ? '8s' : '14s';

  return (
    <>
      {/* State-reactive vignette on Low HP */}
      {isLowHp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9998,
            boxShadow: 'inset 0 0 100px rgba(255, 77, 109, 0.4)',
            animation: 'pulse 1s infinite alternate'
          }}
        />
      )}

      {/* The Luminous Faded & Animated Sutra Thread */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'visible'
        }}
      >
        <defs>
          <style>{`
            @keyframes sutraStreamFlow {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -160; }
            }
            @keyframes sutraFlicker {
              0%, 100% { opacity: 0.25; }
              20% { opacity: 0.55; }
              40% { opacity: 0.15; }
              60% { opacity: 0.45; }
              80% { opacity: 0.2; }
            }
          `}</style>

          {/* Soft Ethereal Glow Filter */}
          <filter id="sutra-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={isHighPrana ? 8 : (streak >= 7 ? 6 : 4)} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Spark Glow Filter */}
          <filter id="sutra-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Faded Gradient along the thread height */}
          <linearGradient id="sutra-fade-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0" />
            <stop offset="10%" stopColor={coreColor} stopOpacity="0.35" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.65" />
            <stop offset="90%" stopColor={coreColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </linearGradient>

          {/* Pranic Stream Dash Gradient */}
          <linearGradient id="sutra-stream-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {pathData && (
          <g
            style={{
              opacity: isLowHp ? undefined : 'calc(0.35 + 0.22 * var(--breath, 0.5))',
              animation: isLowHp ? 'sutraFlicker 0.4s infinite alternate' : undefined,
              transition: 'opacity 0.4s ease'
            }}
          >
            {/* Layer 1: Faded Ethereal Under-Glow Aura */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#sutra-fade-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#sutra-soft-glow)"
              style={{
                opacity: 0.4,
                mixBlendMode: 'screen'
              }}
            />

            {/* Layer 2: Main Delicate Golden Thread Line with Draw-In */}
            <path
              ref={pathRef}
              d={pathData}
              fill="none"
              stroke="url(#sutra-fade-grad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray={pathLength || 1000}
              strokeDashoffset={isDrawing ? (pathLength || 1000) * 0.3 : 0}
              style={{
                transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: 0.65
              }}
            />

            {/* Layer 3: Continuous Animated Pranic Flow (Dashed Stream) */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#sutra-stream-grad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="12 36"
              style={{
                animation: `sutraStreamFlow ${flowDuration} linear infinite`,
                opacity: 0.6,
                mixBlendMode: 'screen'
              }}
            />

            {/* Layer 4: Living Bindu (Traveling Golden Spark with Trailing Halo) */}
            <g>
              {/* Outer soft glowing aura */}
              <circle
                r="7"
                fill={isHighPrana ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 226, 89, 0.3)'}
                filter="url(#sutra-spark-glow)"
              />
              {/* Core radiant light bead */}
              <circle
                r="2.5"
                fill={isHighPrana ? '#00F0FF' : '#FFE259'}
              />
              <animateMotion
                path={pathData}
                dur={sparkDuration}
                repeatCount="indefinite"
                rotate="auto"
              />
            </g>
          </g>
        )}
      </svg>
    </>
  );
};
