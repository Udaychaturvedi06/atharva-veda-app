import React, { useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScreenShake, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import { PUZZLES } from '../../data/puzzles';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

export const MantraRunner = () => {
  const canvasRef = useRef(null);
  const { keysRef, pointerRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown'); // 'countdown', 'playing', 'paused', 'trivia', 'gameover'
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [triviaPuzzle, setTriviaPuzzle] = useState(null);

  const gameDataRef = useRef({
    player: {
      x: 120,
      y: 440,
      baseY: 440,
      vy: 0,
      isGrounded: true,
      jumps: 0,
      isSliding: false,
      slideTimer: 0,
      height: 48,
      width: 28
    },
    obstacles: [],
    coins: [],
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    shake: new ScreenShake(),
    distance: 0,
    speed: 5.5,
    score: 0,
    lives: 3,
    multiplier: 1,
    multiplierTimer: 0,
    lastObstacleX: 800,
    nextTriviaDist: 1000,
    bgOffset1: 0,
    bgOffset2: 0,
    bgOffset3: 0
  });

  const handleRestart = useCallback(() => {
    gameDataRef.current = {
      player: {
        x: 120,
        y: 440,
        baseY: 440,
        vy: 0,
        isGrounded: true,
        jumps: 0,
        isSliding: false,
        slideTimer: 0,
        height: 48,
        width: 28
      },
      obstacles: [],
      coins: [],
      particles: new ParticleSystem(),
      popups: new ScorePopups(),
      shake: new ScreenShake(),
      distance: 0,
      speed: 5.5,
      score: 0,
      lives: 3,
      multiplier: 1,
      multiplierTimer: 0,
      lastObstacleX: 800,
      nextTriviaDist: 1000,
      bgOffset1: 0,
      bgOffset2: 0,
      bgOffset3: 0
    };
    setScore(0);
    setDistance(0);
    setLives(3);
    setTriviaPuzzle(null);
    setGameState('playing');
  }, []);

  const handleUpdate = useCallback(() => {
    if (gameState !== 'playing') return;
    const g = gameDataRef.current;
    const p = g.player;
    const keys = keysRef.current;
    const pointer = pointerRef.current;

    // Handle Jump (Space / ArrowUp / Tap upper half)
    const wantsJump = keys.Space || keys.ArrowUp || keys.KeyW || (pointer.isDown && pointer.y < 350);
    if (wantsJump) {
      if (p.isGrounded) {
        p.vy = -13;
        p.isGrounded = false;
        p.jumps = 1;
        sounds.playShoot();
      } else if (p.jumps === 1 && p.vy > -4) {
        // Double jump
        p.vy = -11;
        p.jumps = 2;
        sounds.playShoot();
        g.particles.spawn(p.x, p.y + p.height, 10, ['#FFE259']);
      }
      keys.Space = false;
      keys.ArrowUp = false;
      keys.KeyW = false;
    }

    // Handle Slide (ArrowDown / KeyS / Tap lower half)
    const wantsSlide = keys.ArrowDown || keys.KeyS || (pointer.isDown && pointer.y >= 350);
    if (wantsSlide && p.isGrounded && !p.isSliding) {
      p.isSliding = true;
      p.slideTimer = 25;
      p.height = 24;
      p.y = p.baseY + 24;
    }

    if (p.isSliding) {
      p.slideTimer--;
      if (p.slideTimer <= 0) {
        p.isSliding = false;
        p.height = 48;
        p.y = p.baseY;
      }
    }

    // Apply Gravity
    if (!p.isGrounded) {
      p.vy += 0.65;
      p.y += p.vy;

      if (p.y >= p.baseY) {
        p.y = p.baseY;
        p.vy = 0;
        p.isGrounded = true;
        p.jumps = 0;
      }
    }

    // Progress distance & speed ramp
    g.distance += Math.floor(g.speed);
    setDistance(g.distance);
    g.speed = 5.5 + Math.floor(g.distance / 500) * 0.5;

    // Multiplier timer
    if (g.multiplierTimer > 0) {
      g.multiplierTimer--;
      if (g.multiplierTimer <= 0) g.multiplier = 1;
    }

    // Trivia Gate trigger at every 1000m
    if (g.distance >= g.nextTriviaDist) {
      g.nextTriviaDist += 1000;
      const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
      setTriviaPuzzle(randomPuzzle);
      setGameState('trivia');
      sounds.playUnlockChime();
      return;
    }

    // Parallax background scrolls
    g.bgOffset1 = (g.bgOffset1 + g.speed * 0.2) % 800;
    g.bgOffset2 = (g.bgOffset2 + g.speed * 0.5) % 800;
    g.bgOffset3 = (g.bgOffset3 + g.speed * 1.0) % 800;

    // Spawn Obstacles (Pillars, Fire Pits)
    if (800 - g.lastObstacleX < -260) {
      const isLow = Math.random() > 0.4;
      g.obstacles.push({
        x: 820,
        y: isLow ? 440 : 380,
        width: 30,
        height: isLow ? 48 : 30,
        type: isLow ? 'pillar' : 'firepit'
      });
      g.lastObstacleX = 820;

      // Spawn Coins above obstacle
      for (let c = 0; c < 3; c++) {
        g.coins.push({
          x: 840 + c * 35,
          y: isLow ? 370 : 330,
          radius: 8,
          isRudraksha: Math.random() < 0.2
        });
      }
    } else {
      g.lastObstacleX -= g.speed;
    }

    // Move & collide Obstacles
    for (let i = g.obstacles.length - 1; i >= 0; i--) {
      const o = g.obstacles[i];
      o.x -= g.speed;

      // Collision box check
      if (
        p.x + p.width > o.x &&
        p.x < o.x + o.width &&
        p.y + p.height > o.y &&
        p.y < o.y + o.height
      ) {
        g.shake.trigger(10);
        g.particles.spawn(p.x, p.y, 20, ['#FF4D6D', '#FF7B00']);
        sounds.playCombatHit(true);
        g.lives--;
        setLives(g.lives);
        g.obstacles.splice(i, 1);

        if (g.lives <= 0) {
          setGameState('gameover');
          return;
        }
        continue;
      }

      if (o.x < -40) g.obstacles.splice(i, 1);
    }

    // Move & collect Coins
    for (let i = g.coins.length - 1; i >= 0; i--) {
      const c = g.coins[i];
      c.x -= g.speed;

      if (Math.hypot(p.x - c.x, p.y - c.y) < p.width + c.radius) {
        if (c.isRudraksha) {
          g.multiplier = 2;
          g.multiplierTimer = 480; // 8 seconds
          sounds.playCombo(2);
          g.popups.add(c.x, c.y, '2X CHANT BOOST!', '#FFE259');
        } else {
          sounds.playPickup();
          const pts = 50 * g.multiplier;
          g.score += pts;
          setScore(g.score);
          g.popups.add(c.x, c.y, `+${pts}`);
        }
        g.particles.spawn(c.x, c.y, 8, ['#FFE259']);
        g.coins.splice(i, 1);
        continue;
      }

      if (c.x < -20) g.coins.splice(i, 1);
    }
  }, [gameState, keysRef, pointerRef]);

  // Handle Trivia Answer
  const handleTriviaAnswer = (isCorrect) => {
    const g = gameDataRef.current;
    if (isCorrect) {
      sounds.playUnlockChime();
      g.score += 500;
      setScore(g.score);
      g.popups.add(400, 250, '+500 TRIVIA BONUS!', '#4FD1C5');
    } else {
      sounds.playCombatHit(false);
      g.lives--;
      setLives(g.lives);
      if (g.lives <= 0) {
        setGameState('gameover');
        return;
      }
    }
    setTriviaPuzzle(null);
    setGameState('playing');
  };

  // Render Canvas
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = setupCanvas(canvas, 800, 600);
    if (!ctx) return;
    const g = gameDataRef.current;
    const p = g.player;

    ctx.save();
    g.shake.apply(ctx);

    // Dynamic Parallax Sky (Biome based on distance)
    ctx.fillStyle = g.distance < 1500 ? '#070712' : g.distance < 3000 ? '#120A1A' : '#040B14';
    ctx.fillRect(0, 0, 800, 600);

    // Ground Plane
    ctx.fillStyle = '#1A162B';
    ctx.fillRect(0, 488, 800, 112);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 488);
    ctx.lineTo(800, 488);
    ctx.stroke();

    // Draw Obstacles
    for (const o of g.obstacles) {
      if (o.type === 'pillar') {
        ctx.fillStyle = '#FF5E1E';
        ctx.shadowColor = '#FF5E1E';
        ctx.shadowBlur = 10;
        ctx.fillRect(o.x, o.y, o.width, o.height);
      } else {
        ctx.fillStyle = '#FF7B00';
        ctx.beginPath();
        ctx.arc(o.x + o.width / 2, o.y + o.height / 2, o.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // Draw Coins
    for (const c of g.coins) {
      ctx.fillStyle = c.isRudraksha ? '#FF7B00' : '#FFE259';
      ctx.shadowColor = c.isRudraksha ? '#FF7B00' : '#FFE259';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Draw Player Seeker
    ctx.fillStyle = '#FFE259';
    ctx.shadowColor = '#FF7B00';
    ctx.shadowBlur = 14;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Seeker Head / Crown
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y - 8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    g.particles.updateAndDraw(ctx);
    g.popups.updateAndDraw(ctx);
    ctx.restore();
  }, []);

  useGameLoop({
    onUpdate: handleUpdate,
    onRender: handleRender,
    isRunning: gameState === 'playing'
  });

  return (
    <ArcadeCabinet
      title="Mantra Runner"
      glyph="🏃"
      isPaused={gameState === 'paused'}
      onTogglePause={() => setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))}
      onRestart={handleRestart}
    >
      <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, display: 'flex', gap: '16px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold-bright)' }}>SCORE: {score.toLocaleString()}</span>
        <span style={{ color: 'var(--cyan)' }}>DISTANCE: {distance}m</span>
        <span style={{ color: 'var(--saffron)' }}>LIVES: {'🪷'.repeat(Math.max(0, lives))}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="arcade-canvas-display"
        onMouseMove={handlePointerMove}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      />

      {gameState === 'countdown' && (
        <Countdown onComplete={() => setGameState('playing')} />
      )}

      {gameState === 'paused' && (
        <PauseMenu onResume={() => setGameState('playing')} onRestart={handleRestart} />
      )}

      {/* Trivia Gate Modal at every 1000m */}
      {gameState === 'trivia' && triviaPuzzle && (
        <div className="countdown-overlay">
          <div style={{ maxWidth: '440px', padding: '28px', background: 'rgba(10, 10, 18, 0.96)', border: '2px solid var(--gold)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-sanskrit)', fontSize: '2rem', color: 'var(--gold-bright)' }}>
              {triviaPuzzle.rune}
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#FFF', fontSize: '1.2rem', margin: '8px 0 16px' }}>
              Vedic Trivia Gate
            </h3>
            <p style={{ color: '#FDFBEE', fontSize: '0.95rem', marginBottom: '20px' }}>
              {triviaPuzzle.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {triviaPuzzle.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '10px 14px', fontSize: '0.85rem', textAlign: 'left', borderRadius: '6px' }}
                  onClick={() => handleTriviaAnswer(i === triviaPuzzle.correct)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <GameOver gameId="mantra-runner" score={score} onRestart={handleRestart} />
      )}
    </ArcadeCabinet>
  );
};

export default {
  id: 'mantra-runner',
  title: 'Mantra Runner',
  glyph: '🏃',
  controls: 'Space / Up to Jump (Double Jump supported) • Down / S to Slide • Tap screen on mobile',
  Component: MantraRunner
};
