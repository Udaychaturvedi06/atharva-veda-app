import React, { useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScreenShake, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

const GLYPH_ENEMIES = [
  { char: 'काम', name: 'Kāma', color: '#FF4D6D', speed: 1.2, hp: 1 },
  { char: 'क्रोध', name: 'Krodha', color: '#FF7B00', speed: 1.5, hp: 1 },
  { char: 'लोभ', name: 'Lobha', color: '#FFE259', speed: 1.0, hp: 2 },
  { char: 'मोह', name: 'Moha', color: '#63B3ED', speed: 0.9, hp: 2 },
  { char: 'मद', name: 'Mada', color: '#9F7AEA', speed: 1.3, hp: 1 },
  { char: 'मात्सर्य', name: 'Mātsarya', color: '#00F0FF', speed: 1.4, hp: 1 }
];

const INITIAL_STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.5) % 780) + 10,
  y: ((i * 97.3) % 580) + 10,
  size: (i % 3) * 0.7 + 1,
  speed: (i % 4) * 0.4 + 0.6
}));

export const AgniStrike = () => {
  const canvasRef = useRef(null);
  const { keysRef, pointerRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown'); // 'countdown', 'playing', 'paused', 'gameover'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);

  // Entities Ref
  const gameDataRef = useRef({
    player: { x: 400, y: 530, radius: 22, speed: 6 },
    bullets: [],
    enemies: [],
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    shake: new ScreenShake(),
    stars: INITIAL_STARS.map((s) => ({ ...s })),
    lastShot: 0,
    combo: 1,
    wave: 1,
    score: 0,
    lives: 3
  });

  // Spawn enemy wave
  const spawnWave = useCallback((currentWave) => {
    const enemies = [];
    const count = 6 + currentWave * 2;
    for (let i = 0; i < count; i++) {
      const type = GLYPH_ENEMIES[i % GLYPH_ENEMIES.length];
      enemies.push({
        x: 80 + (i % 6) * 110,
        y: -40 - Math.floor(i / 6) * 70,
        baseX: 80 + (i % 6) * 110,
        char: type.char,
        name: type.name,
        color: type.color,
        speed: type.speed * (1 + currentWave * 0.1),
        hp: type.hp,
        radius: 20,
        angle: Math.random() * Math.PI
      });
    }
    gameDataRef.current.enemies = enemies;
  }, []);

  // Restart
  const handleRestart = useCallback(() => {
    gameDataRef.current.player = { x: 400, y: 530, radius: 22, speed: 6 };
    gameDataRef.current.bullets = [];
    gameDataRef.current.score = 0;
    gameDataRef.current.lives = 3;
    gameDataRef.current.wave = 1;
    gameDataRef.current.combo = 1;
    setScore(0);
    setLives(3);
    setWave(1);
    spawnWave(1);
    setGameState('playing');
  }, [spawnWave]);

  // Update Game Logic at 60Hz
  const handleUpdate = useCallback(() => {
    if (gameState !== 'playing') return;
    const g = gameDataRef.current;
    const keys = keysRef.current;
    const pointer = pointerRef.current;

    // Move player with Keyboard or Mouse/Touch
    if (pointer.isDown && pointer.x > 0) {
      g.player.x += (pointer.x - g.player.x) * 0.15;
    } else {
      if (keys.ArrowLeft || keys.KeyA) g.player.x -= g.player.speed;
      if (keys.ArrowRight || keys.KeyD) g.player.x += g.player.speed;
    }
    g.player.x = Math.max(30, Math.min(770, g.player.x));

    // Auto-fire bullets
    const now = performance.now();
    if (now - g.lastShot > 140) {
      g.bullets.push({
        x: g.player.x,
        y: g.player.y - 20,
        radius: 5,
        speed: 12
      });
      sounds.playShoot();
      g.lastShot = now;
    }

    // Move Stars
    for (const s of g.stars) {
      s.y += s.speed;
      if (s.y > 600) s.y = 0;
    }

    // Move Bullets
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i];
      b.y -= b.speed;
      if (b.y < -10) g.bullets.splice(i, 1);
    }

    // Move Enemies
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      e.y += e.speed;
      e.x = e.baseX + Math.sin(e.y * 0.04) * 30;

      // Check collision with Player
      const distToPlayer = Math.hypot(e.x - g.player.x, e.y - g.player.y);
      if (distToPlayer < e.radius + g.player.radius) {
        g.particles.spawn(g.player.x, g.player.y, 25, ['#FF4D6D', '#FF7B00']);
        g.shake.trigger(12);
        sounds.playCombatHit(true);
        g.lives--;
        setLives(g.lives);
        g.enemies.splice(i, 1);

        if (g.lives <= 0) {
          setGameState('gameover');
          return;
        }
        continue;
      }

      // Check collision with Bullets
      for (let j = g.bullets.length - 1; j >= 0; j--) {
        const b = g.bullets[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + b.radius) {
          g.bullets.splice(j, 1);
          e.hp--;

          if (e.hp <= 0) {
            g.particles.spawn(e.x, e.y, 16, [e.color, '#FFE259']);
            g.shake.trigger(4);
            sounds.playPickup();

            const pts = 100 * g.combo;
            g.score += pts;
            setScore(g.score);
            g.popups.add(e.x, e.y, `+${pts}`);
            g.enemies.splice(i, 1);
            break;
          }
        }
      }

      // Reached bottom
      if (e.y > 620) {
        g.enemies.splice(i, 1);
      }
    }

    // Advance wave if empty
    if (g.enemies.length === 0) {
      g.wave++;
      setWave(g.wave);
      sounds.playUnlockChime();
      spawnWave(g.wave);
    }
  }, [gameState, keysRef, pointerRef, spawnWave]);

  // Render Canvas
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = setupCanvas(canvas, 800, 600);
    if (!ctx) return;
    const g = gameDataRef.current;

    ctx.save();
    g.shake.apply(ctx);

    // Background: Dark Indigo Space
    ctx.fillStyle = '#07070D';
    ctx.fillRect(0, 0, 800, 600);

    // Starfield Embers
    for (const s of g.stars) {
      ctx.fillStyle = 'rgba(255, 226, 89, 0.45)';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Draw Bullets (Glowing Agni Sparks)
    for (const b of g.bullets) {
      ctx.fillStyle = '#FFE259';
      ctx.shadowColor = '#FF7B00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Draw Enemies (Arishadvarga Glyphs)
    for (const e of g.enemies) {
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;
      ctx.font = 'bold 22px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.char, e.x, e.y);
    }
    ctx.shadowBlur = 0;

    // Draw Player: Golden Agni Diya
    ctx.fillStyle = '#FFE259';
    ctx.shadowColor = '#FF7B00';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(g.player.x, g.player.y, 16, 0, Math.PI);
    ctx.fill();

    // Diya Flame Tip
    ctx.beginPath();
    ctx.moveTo(g.player.x - 8, g.player.y);
    ctx.quadraticCurveTo(g.player.x, g.player.y - 24, g.player.x + 8, g.player.y);
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD overlay
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
      title="Agni Strike"
      glyph="🔥"
      isPaused={gameState === 'paused'}
      onTogglePause={() => setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))}
      onRestart={handleRestart}
    >
      <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, display: 'flex', gap: '16px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold-bright)' }}>SCORE: {score.toLocaleString()}</span>
        <span style={{ color: 'var(--cyan)' }}>WAVE: {wave}</span>
        <span style={{ color: 'var(--saffron)' }}>LIVES: {'🪔'.repeat(Math.max(0, lives))}</span>
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
        <Countdown onComplete={() => { spawnWave(1); setGameState('playing'); }} />
      )}

      {gameState === 'paused' && (
        <PauseMenu onResume={() => setGameState('playing')} onRestart={handleRestart} />
      )}

      {gameState === 'gameover' && (
        <GameOver gameId="agni-strike" score={score} onRestart={handleRestart} />
      )}
    </ArcadeCabinet>
  );
};

export default {
  id: 'agni-strike',
  title: 'Agni Strike',
  glyph: '🔥',
  controls: 'Arrow Keys / A-D / Touch Drag to Move • Auto Fire Mantra Beams',
  Component: AgniStrike
};
