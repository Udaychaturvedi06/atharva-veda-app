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
 * The persistent golden thread connecting page anchors across routes
 */
export const SutraThread = ({ anchors }) => {
  const location = useLocation();
  const hp = useGameStore((s) => s.hp);
  const prana = useGameStore((s) => s.prana);
  const streak = useGameStore((s) => s.streak);

  const [pathData, setPathData] = useState('');
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef(null);

  // Calculate curve connecting anchors
  useEffect(() => {
    const updatePath = () => {
      const elements = Object.values(anchors).filter((el) => el && el.getBoundingClientRect);
      if (elements.length === 0) {
        // Fallback subtle spine down the viewport
        const w = window.innerWidth;
        const h = window.innerHeight;
        setPathData(`M ${w * 0.5} 0 C ${w * 0.48} ${h * 0.3}, ${w * 0.52} ${h * 0.7}, ${w * 0.5} ${h}`);
        return;
      }

      // Sort elements by their vertical top position
      const sorted = elements
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        })
        .sort((a, b) => a.y - b.y);

      if (sorted.length === 1) {
        const p = sorted[0];
        setPathData(`M ${p.x} 0 L ${p.x} ${p.y} L ${p.x} ${window.innerHeight}`);
        return;
      }

      // Build smooth cubic bezier spline through sorted anchor points
      let d = `M ${sorted[0].x} ${sorted[0].y}`;
      for (let i = 0; i < sorted.length - 1; i++) {
        const p0 = sorted[i];
        const p1 = sorted[i + 1];
        const midY = (p0.y + p1.y) / 2;
        d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
      }

      setPathData(d);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    window.addEventListener('scroll', updatePath, true);

    const timer = setTimeout(updatePath, 200); // Allow route components to settle
    return () => {
      window.removeEventListener('resize', updatePath);
      window.removeEventListener('scroll', updatePath, true);
      clearTimeout(timer);
    };
  }, [anchors, location.pathname]);

  // Update total path length for stroke-dashoffset animation
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
    }
  }, [pathData]);

  // State-reactive thread parameters
  const isLowHp = hp < 25;
  const isHighPrana = prana >= 80;
  const strokeColor = isLowHp ? '#FF4D6D' : isHighPrana ? '#00F0FF' : '#D4AF37';
  const strokeWidth = isHighPrana ? 2.5 : 1.5;
  const glowBlur = isHighPrana ? 8 : (streak >= 7 ? 6 : 4);

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

      {/* The Luminous Sutra Thread */}
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
          <filter id="sutra-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={glowBlur} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {pathData && (
          <path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={pathLength}
            strokeDashoffset={0}
            filter="url(#sutra-glow)"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
              opacity: isLowHp ? 0.7 : 0.9,
              mixBlendMode: 'screen'
            }}
          />
        )}
      </svg>
    </>
  );
};
