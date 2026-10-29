import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScreenShake, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

const CHAKRA_ROWS = [
  { name: 'Sahasrara', color: '#9F7AEA', hp: 2, points: 200 },
  { name: 'Ajna', color: '#63B3ED', hp: 2, points: 150 },
  { name: 'Vishuddha', color: '#00F0FF', hp: 1, points: 120 },
  { name: 'Anahata', color: '#4FD1C5', hp: 1, points: 100 },
  { name: 'Manipura', color: '#FFE259', hp: 1, points: 80 },
  { name: 'Svadhisthana', color: '#FF7B00', hp: 1, points: 60 },
  { name: 'Muladhara', color: '#FF4D6D', hp: 1, points: 50 }
];

export const ChakraBreaker = () => {
  const canvasRef = useRef(null);
  const { keysRef, pointerRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown'); // 'countdown', 'playing', 'paused', 'gameover'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const gameDataRef = useRef({
    paddle: { x: 350, y: 550, width: 110, height: 14, speed: 8 },
    balls: [{ x: 400, y: 530, vx: 4, vy: -5, radius: 7, active: true }],
    bricks: [],
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    shake: new ScreenShake(),
    score: 0,
    lives: 3
  });

  // Build Chakra Brick Rows
  const initBricks = useCallback(() => {
    const bricks = [];
    const cols = 9;
    const brickWidth = 74;
    const brickHeight = 20;
    const padding = 8;
    const startX = 35;
    const startY = 60;

    CHAKRA_ROWS.forEach((row, rowIdx) => {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (brickWidth + padding),
          y: startY + rowIdx * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          color: row.color,
          name: row.name,
          hp: row.hp,
          maxHp: row.hp,
          points: row.points
        });
      }
    });

    gameDataRef.current.bricks = bricks;
  }, []);

  const handleRestart = useCallback(() => {
    gameDataRef.current = {
      paddle: { x: 350, y: 550, width: 110, height: 14, speed: 8 },
      balls: [{ x: 400, y: 530, vx: 4, vy: -5, radius: 7, active: true }],
      bricks: [],
      particles: new ParticleSystem(),
      popups: new ScorePopups(),
      shake: new ScreenShake(),
      score: 0,
      lives: 3
    };
    initBricks();
    setScore(0);
    setLives(3);
    setGameState('playing');
  }, [initBricks]);

  useEffect(() => {
    initBricks();
  }, [initBricks]);

  // 60Hz Update Logic
  const handleUpdate = useCallback(() => {
    if (gameState !== 'playing') return;
    const g = gameDataRef.current;
    const p = g.paddle;
    const keys = keysRef.current;
    const pointer = pointerRef.current;

    // Move paddle with Keyboard or Pointer
    if (pointer.isDown && pointer.x > 0) {
      p.x = pointer.x - p.width / 2;
    } else {
      if (keys.ArrowLeft || keys.KeyA) p.x -= p.speed;
      if (keys.ArrowRight || keys.KeyD) p.x += p.speed;
    }
    p.x = Math.max(10, Math.min(800 - p.width - 10, p.x));

    // Update Balls
    let activeBallCount = 0;

    for (const b of g.balls) {
      if (!b.active) continue;
      activeBallCount++;

      // Sub-stepping to prevent tunneling
      b.x += b.vx;
      b.y += b.vy;

      // Wall reflections
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx = Math.abs(b.vx);
        sounds.playShoot();
      } else if (b.x + b.radius > 800) {
        b.x = 800 - b.radius;
        b.vx = -Math.abs(b.vx);
        sounds.playShoot();
      }

      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy = Math.abs(b.vy);
        sounds.playShoot();
      }

      // Paddle Collision (Angle of reflection based on hit center)
      if (
        b.y + b.radius >= p.y &&
        b.y - b.radius <= p.y + p.height &&
        b.x >= p.x &&
        b.x <= p.x + p.width
      ) {
        b.vy = -Math.abs(b.vy);
        const hitOffset = (b.x - (p.x + p.width / 2)) / (p.width / 2);
        b.vx = hitOffset * 7;
        sounds.playShoot();
        g.particles.spawn(b.x, b.y, 8, ['#FFE259']);
      }

      // Brick Collisions
      for (let i = g.bricks.length - 1; i >= 0; i--) {
        const br = g.bricks[i];
        if (
          b.x + b.radius >= br.x &&
          b.x - b.radius <= br.x + br.width &&
          b.y + b.radius >= br.y &&
          b.y - b.radius <= br.y + br.height
        ) {
          b.vy = -b.vy;
          br.hp--;

          if (br.hp <= 0) {
            g.particles.spawn(br.x + br.width / 2, br.y + br.height / 2, 14, [br.color, '#FFE259']);
            g.shake.trigger(4);
            sounds.playPickup();

            g.score += br.points;
            setScore(g.score);
            g.popups.add(br.x + br.width / 2, br.y, `+${br.points}`, br.color);
            g.bricks.splice(i, 1);
          }
          break;
        }
      }

      // Ball fell out at bottom
      if (b.y - b.radius > 600) {
        b.active = false;
      }
    }

    // Lost ball
    if (activeBallCount === 0) {
      g.lives--;
      setLives(g.lives);
      sounds.playCombatHit(true);
      g.shake.trigger(8);

      if (g.lives <= 0) {
        setGameState('gameover');
      } else {
        // Respawn ball on paddle
        g.balls = [{ x: p.x + p.width / 2, y: p.y - 12, vx: 4, vy: -5, radius: 7, active: true }];
      }
    }

    // Level Cleared
    if (g.bricks.length === 0) {
      sounds.playUnlockChime();
      initBricks();
    }
  }, [gameState, keysRef, pointerRef, initBricks]);

  // Render Canvas
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = setupCanvas(canvas, 800, 600);
    if (!ctx) return;
    const g = gameDataRef.current;
    const p = g.paddle;

    ctx.save();
    g.shake.apply(ctx);

    // Deep cosmic background
    ctx.fillStyle = '#07070F';
    ctx.fillRect(0, 0, 800, 600);

    // Draw Bricks
    for (const br of g.bricks) {
      ctx.fillStyle = br.color;
      ctx.shadowColor = br.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(br.x, br.y, br.width, br.height);

      if (br.hp > 1) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(br.x + 2, br.y + 2, br.width - 4, br.height - 4);
      }
    }
    ctx.shadowBlur = 0;

    // Draw Paddle: Curved Golden Crescent
    ctx.fillStyle = '#FFE259';
    ctx.shadowColor = '#FF7B00';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.width, p.height, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Balls: Glowing Bindus
    for (const b of g.balls) {
      if (!b.active) continue;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
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
      title="Chakra Breaker"
      glyph="🌀"
      isPaused={gameState === 'paused'}
      onTogglePause={() => setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))}
      onRestart={handleRestart}
    >
      <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, display: 'flex', gap: '16px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold-bright)' }}>SCORE: {score.toLocaleString()}</span>
        <span style={{ color: 'var(--saffron)' }}>PETALS: {'🪷'.repeat(Math.max(0, lives))}</span>
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

      {gameState === 'gameover' && (
        <GameOver gameId="chakra-breaker" score={score} onRestart={handleRestart} />
      )}
    </ArcadeCabinet>
  );
};

export default {
  id: 'chakra-breaker',
  title: 'Chakra Breaker',
  glyph: '🌀',
  controls: 'Arrow Keys / A-D / Mouse & Touch to slide paddle • Reflect glowing bindu sphere',
  Component: ChakraBreaker
};
