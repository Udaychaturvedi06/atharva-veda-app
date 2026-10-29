import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScreenShake, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

const GRID_COLS = 24;
const GRID_ROWS = 18;
const CELL_SIZE = 32;

export const NagaCoil = () => {
  const canvasRef = useRef(null);
  const { directionQueueRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown'); // 'countdown', 'playing', 'paused', 'gameover'
  const [score, setScore] = useState(0);
  const [snakeLength, setSnakeLength] = useState(3);

  const gameDataRef = useRef({
    snake: [
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 8, y: 9 }
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 16, y: 9, type: 'bhog' },
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    shake: new ScreenShake(),
    score: 0,
    speedTick: 120, // ms per grid tick
    lastTick: 0
  });

  // Spawn Food
  const spawnFood = useCallback(() => {
    const x = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
    const y = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
    const isAmrit = Math.random() < 0.25;
    gameDataRef.current.food = {
      x,
      y,
      type: isAmrit ? 'amrit' : 'bhog'
    };
  }, []);

  const handleRestart = useCallback(() => {
    gameDataRef.current.snake = [
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 8, y: 9 }
    ];
    gameDataRef.current.direction = 'RIGHT';
    gameDataRef.current.nextDirection = 'RIGHT';
    gameDataRef.current.score = 0;
    setScore(0);
    setSnakeLength(3);
    spawnFood();
    setGameState('playing');
  }, [spawnFood]);

  useEffect(() => {
    spawnFood();
  }, [spawnFood]);

  // Handle directional input with anti-self-collision queue
  const handleUpdate = useCallback(() => {
    if (gameState !== 'playing') return;
    const g = gameDataRef.current;
    const queue = directionQueueRef.current;

    if (queue.length > 0) {
      const nextDir = queue.shift();
      if (nextDir === 'UP' && g.direction !== 'DOWN') g.nextDirection = 'UP';
      if (nextDir === 'DOWN' && g.direction !== 'UP') g.nextDirection = 'DOWN';
      if (nextDir === 'LEFT' && g.direction !== 'RIGHT') g.nextDirection = 'LEFT';
      if (nextDir === 'RIGHT' && g.direction !== 'LEFT') g.nextDirection = 'RIGHT';
    }

    const now = performance.now();
    if (now - g.lastTick < g.speedTick) return;
    g.lastTick = now;

    g.direction = g.nextDirection;
    const head = { ...g.snake[0] };

    if (g.direction === 'UP') head.y -= 1;
    if (g.direction === 'DOWN') head.y += 1;
    if (g.direction === 'LEFT') head.x -= 1;
    if (g.direction === 'RIGHT') head.x += 1;

    // Wall collision
    if (head.x < 0 || head.x >= GRID_COLS || head.y < 0 || head.y >= GRID_ROWS) {
      g.shake.trigger(12);
      sounds.playCombatHit(true);
      setGameState('gameover');
      return;
    }

    // Self collision
    for (const segment of g.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        g.shake.trigger(12);
        sounds.playCombatHit(true);
        setGameState('gameover');
        return;
      }
    }

    g.snake.unshift(head);

    // Food collision
    if (head.x === g.food.x && head.y === g.food.y) {
      const isAmrit = g.food.type === 'amrit';
      const pts = isAmrit ? 250 : 100;
      g.score += pts;
      setScore(g.score);
      setSnakeLength(g.snake.length);

      sounds.playPickup();
      g.particles.spawn(head.x * CELL_SIZE + 16, head.y * CELL_SIZE + 16, 12, ['#FFE259', '#FF7B00']);
      g.popups.add(head.x * CELL_SIZE + 16, head.y * CELL_SIZE, `+${pts}`, isAmrit ? '#FFE259' : '#00F0FF');

      spawnFood();
    } else {
      g.snake.pop();
    }
  }, [gameState, directionQueueRef, spawnFood]);

  // Render Canvas
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = setupCanvas(canvas, 800, 600);
    if (!ctx) return;
    const g = gameDataRef.current;

    ctx.save();
    g.shake.apply(ctx);

    // Dark sacred ground
    ctx.fillStyle = '#07070F';
    ctx.fillRect(0, 0, 800, 600);

    // Subtle Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, 600);
      ctx.stroke();
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(800, r * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food
    const fx = g.food.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = g.food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.fillStyle = g.food.type === 'amrit' ? '#FFE259' : '#00F0FF';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake Body
    for (let i = g.snake.length - 1; i >= 0; i--) {
      const seg = g.snake[i];
      const sx = seg.x * CELL_SIZE + CELL_SIZE / 2;
      const sy = seg.y * CELL_SIZE + CELL_SIZE / 2;

      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#FFE259' : `rgba(255, 123, 0, ${1 - (i / g.snake.length) * 0.5})`;
      ctx.shadowColor = '#FF7B00';
      ctx.shadowBlur = isHead ? 14 : 6;

      ctx.beginPath();
      ctx.arc(sx, sy, isHead ? 11 : 9, 0, Math.PI * 2);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#07070D';
        ctx.beginPath();
        ctx.arc(sx - 3, sy - 3, 2, 0, Math.PI * 2);
        ctx.arc(sx + 3, sy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
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
      title="Naga Coil"
      glyph="🐍"
      isPaused={gameState === 'paused'}
      onTogglePause={() => setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))}
      onRestart={handleRestart}
    >
      <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, display: 'flex', gap: '16px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold-bright)' }}>SCORE: {score.toLocaleString()}</span>
        <span style={{ color: 'var(--cyan)' }}>COIL LENGTH: {snakeLength}</span>
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
        <GameOver gameId="naga-coil" score={score} onRestart={handleRestart} />
      )}
    </ArcadeCabinet>
  );
};

export default {
  id: 'naga-coil',
  title: 'Naga Coil',
  glyph: '🐍',
  controls: 'Arrow Keys / WASD to steer sacred Kundalini serpent • Devour amrit without colliding',
  Component: NagaCoil
};
