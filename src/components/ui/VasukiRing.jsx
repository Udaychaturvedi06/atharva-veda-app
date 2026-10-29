import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../utils/soundEngine';

/**
 * <VasukiRing />
 * The Sacred Cosmic Serpent Vasuki (Samudra Manthana Ouroboros)
 * Envelops the Daily 5 Yajna Lamps with Sapta-Phana (7 Hoods),
 * Moonlit Silver scales (#E2E8F0), Amber Glow eyes (#FFB020),
 * and Amrita-burst particles upon completion.
 */
export const VasukiRing = ({
  completedCount = 0,
  isChurning = false,
  onChurn,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [internalRipple, setInternalRipple] = useState(false);

  // Trigger ripple wave on churn prop
  useEffect(() => {
    if (isChurning) {
      setInternalRipple(true);
      const timer = setTimeout(() => setInternalRipple(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [isChurning]);

  const handleRingClick = () => {
    sounds.playTibetanBowl();
    setInternalRipple(true);
    if (onChurn) onChurn();
    setTimeout(() => setInternalRipple(false), 1200);
  };

  // 7 Hoods (Sapta-Phana) positions across the top crown (-45deg to +45deg)
  const hoods = [
    { id: 1, angle: -42, height: 28, width: 14 },
    { id: 2, angle: -28, height: 34, width: 16 },
    { id: 3, angle: -14, height: 42, width: 18 },
    { id: 4, angle: 0, height: 50, width: 22 }, // Central King Hood
    { id: 5, angle: 14, height: 42, width: 18 },
    { id: 6, angle: 28, height: 34, width: 16 },
    { id: 7, angle: 42, height: 28, width: 14 }
  ];

  // Hood illumination threshold based on 5 lamps completed (1..5)
  // 0 lamps: center hood faint; 1: 1-3; 2: 2-4; 3: 1-5; 4: 1-6; 5: all 7 radiant
  const getHoodActive = (hoodIdx) => {
    if (completedCount >= 5) return true;
    if (completedCount === 4) return hoodIdx >= 1 && hoodIdx <= 5;
    if (completedCount === 3) return hoodIdx >= 2 && hoodIdx <= 4;
    if (completedCount === 2) return hoodIdx >= 2 && hoodIdx <= 4;
    if (completedCount === 1) return hoodIdx === 3;
    return false;
  };

  const isAllComplete = completedCount >= 5;

  return (
    <div
      className="vasuki-ouroboros-container"
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        padding: '38px 18px 24px',
        borderRadius: 'var(--radius-xl, 20px)',
        background: 'radial-gradient(ellipse at 50% 15%, rgba(226, 232, 240, 0.06) 0%, rgba(11, 12, 14, 0.92) 75%)',
        border: isHovered ? '1px solid rgba(226, 232, 240, 0.32)' : '1px solid rgba(226, 232, 240, 0.16)',
        boxShadow: isAllComplete
          ? '0 0 40px rgba(255, 176, 32, 0.22), inset 0 0 30px rgba(226, 232, 240, 0.05)'
          : isHovered
            ? '0 16px 36px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(226, 232, 240, 0.2)'
            : '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(226, 232, 240, 0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        overflow: 'visible'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        sounds.playTap();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRingClick}
    >
      {/* ===================================================================
          1. SAPTA-PHANA: THE 7 CROWNING HOODS OF VASUKI
          =================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: -26,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 6,
          zIndex: 4,
          pointerEvents: 'none'
        }}
      >
        {hoods.map((hood, idx) => {
          const active = getHoodActive(idx);
          const isCenter = idx === 3;

          return (
            <motion.div
              key={hood.id}
              animate={{
                scale: active ? [1, 1.06, 1] : 1,
                y: active ? -2 : 0
              }}
              transition={{
                duration: 2.4,
                repeat: active ? Infinity : 0,
                ease: 'easeInOut',
                delay: idx * 0.12
              }}
              style={{
                width: hood.width,
                height: hood.height,
                borderTopLeftRadius: '50%',
                borderTopRightRadius: '50%',
                borderBottomLeftRadius: '30%',
                borderBottomRightRadius: '30%',
                background: active
                  ? 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 40%, rgba(0, 240, 255, 0.3) 100%)'
                  : 'linear-gradient(180deg, rgba(226, 232, 240, 0.3) 0%, rgba(26, 28, 34, 0.8) 100%)',
                border: active
                  ? '1.5px solid #E2E8F0'
                  : '1px solid rgba(226, 232, 240, 0.2)',
                boxShadow: active
                  ? '0 0 16px rgba(0, 240, 255, 0.6), 0 -2px 10px rgba(226, 232, 240, 0.8)'
                  : 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s ease'
              }}
            >
              {/* Central Naga-Mani Crest Gem on the King Hood */}
              {isCenter && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    transform: 'rotate(45deg)',
                    background: isAllComplete ? '#FFB020' : '#E2E8F0',
                    boxShadow: isAllComplete
                      ? '0 0 10px #FFB020, 0 0 20px #FFE082'
                      : '0 0 6px rgba(226, 232, 240, 0.8)',
                    borderRadius: 1
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ===================================================================
          2. VASUKI HEAD CREST WITH AMBER GLOW EYES
          =================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          zIndex: 3,
          pointerEvents: 'none'
        }}
      >
        {/* Serpent Eyes Pair */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 5,
              height: 7,
              borderRadius: '50%',
              background: '#FFB020',
              boxShadow: '0 0 8px #FFB020, 0 0 14px rgba(255, 176, 32, 0.6)',
              transform: 'rotate(-15deg) scale(calc(0.85 + 0.3 * var(--breath, 0.5)))',
              transition: 'transform 0.15s ease'
            }}
          />
          <div
            style={{
              width: 5,
              height: 7,
              borderRadius: '50%',
              background: '#FFB020',
              boxShadow: '0 0 8px #FFB020, 0 0 14px rgba(255, 176, 32, 0.6)',
              transform: 'rotate(15deg) scale(calc(0.85 + 0.3 * var(--breath, 0.5)))',
              transition: 'transform 0.15s ease'
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-hud, Orbitron)',
            letterSpacing: '0.15em',
            color: 'var(--silver-moon, #E2E8F0)',
            opacity: 0.75,
            marginTop: 2
          }}
        >
          VASUKI &bull; SAMUDRA MANTHANA
        </span>
      </div>

      {/* ===================================================================
          3. SINE-WAVE SCALE SHEEN OVERLAY (Churning Ripple on Interaction)
          =================================================================== */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          borderRadius: 'var(--radius-xl, 20px)',
          overflow: 'hidden'
        }}
      >
        <defs>
          <linearGradient id="vasuki-scale-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00F0FF" stopOpacity={internalRipple ? 0.7 : 0.15} />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Serpent Perimeter Scale Pattern */}
        <rect
          x="1.5"
          y="1.5"
          width="calc(100% - 3px)"
          height="calc(100% - 3px)"
          rx="19"
          fill="none"
          stroke="url(#vasuki-scale-grad)"
          strokeWidth={internalRipple ? '2.5' : '1.5'}
          strokeDasharray="8 6"
          style={{
            strokeDashoffset: internalRipple ? -120 : 0,
            transition: internalRipple ? 'stroke-dashoffset 1.2s ease-out' : 'all 0.3s ease'
          }}
        />
      </svg>

      {/* ===================================================================
          4. AMRITA BURST PARTICLES (On 5/5 Lamps Consecration)
          =================================================================== */}
      <AnimatePresence>
        {isAllComplete && (
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: 0,
              right: 0,
              height: 60,
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 10,
                  x: `${30 + (i * 40) % 45}%`,
                  scale: 0.5
                }}
                animate={{
                  opacity: [0, 0.9, 0],
                  y: -65 - (i * 6),
                  x: `${28 + (i * 45) % 48 + (Math.sin(i) * 16)}%`,
                  scale: [0.5, 1.2, 0.4]
                }}
                transition={{
                  duration: 2.2 + (i % 3) * 0.4,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#FFB020',
                  boxShadow: '0 0 10px #FFB020, 0 0 18px #FFE082'
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Children (5 Lamps Bento Content) */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 18 }}>
        {children}
      </div>
    </div>
  );
};

/**
 * <VasukiPoisonWard />
 * Coiled Defensive Ward for Step 4 Inner Enemy (Arishadvarga) Duel.
 * Pulses in Signal Red (Kalakuta Venom) when undefeated,
 * Cools into Sage Green (Oshadhi Amrita) once transmuted/vanquished.
 */
export const VasukiPoisonWard = ({
  isDefeated = false,
  asuraGlyph = 'काम',
  asuraName = 'Kāma (Untamed Craving)'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        background: isDefeated
          ? 'rgba(118, 158, 132, 0.12)'
          : 'rgba(239, 68, 68, 0.08)',
        border: isDefeated
          ? '1.5px solid #769E84'
          : '1.5px solid rgba(239, 68, 68, 0.45)',
        boxShadow: isDefeated
          ? '0 0 20px rgba(118, 158, 132, 0.25)'
          : '0 0 20px rgba(239, 68, 68, 0.25)',
        transition: 'all 0.5s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Coiled Serpent Ring Badge */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: isDefeated
            ? 'radial-gradient(circle, rgba(118, 158, 132, 0.3) 0%, rgba(20, 30, 24, 0.9) 80%)'
            : 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(35, 12, 16, 0.9) 80%)',
          border: isDefeated ? '2px solid #769E84' : '2px solid #EF4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDefeated ? '#769E84' : '#EF4444',
          fontFamily: 'var(--font-sanskrit)',
          fontSize: '1.4rem',
          fontWeight: 700,
          boxShadow: isDefeated
            ? '0 0 14px rgba(118, 158, 132, 0.6)'
            : '0 0 14px rgba(239, 68, 68, 0.6)',
          animation: !isDefeated ? 'pulse 2s infinite ease-in-out' : 'none'
        }}
      >
        {asuraGlyph}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isDefeated ? '#E2E8F0' : '#FFFFFF'
            }}
          >
            {asuraName}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 6,
              background: isDefeated ? 'rgba(118, 158, 132, 0.25)' : 'rgba(239, 68, 68, 0.2)',
              color: isDefeated ? '#769E84' : '#EF4444',
              fontWeight: 600
            }}
          >
            {isDefeated ? 'Kalakuta Transmuted ✓' : 'Kalakuta Venom Active'}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--silver-muted, #94A3B8)', marginTop: 4 }}>
          {isDefeated
            ? 'Vasuki’s throat has cooled into Oshadhi nectar (+200 RP Consecrated).'
            : 'Boss HP: 150 &bull; Vasuki holds the poison ward. Strike with Atharva clarity.'}
        </div>
      </div>
    </div>
  );
};

export default VasukiRing;
