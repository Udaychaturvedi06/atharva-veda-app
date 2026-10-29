import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { setupCanvas, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import GAYATRI_CHART from '../charts/gayatri.json';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

const LANES = [
  { key: 'KeyD', label: 'D', x: 220, color: '#FF7B00' },
  { key: 'KeyF', label: 'F', x: 340, color: '#FFE259' },
  { key: 'KeyJ', label: 'J', x: 460, color: '#00F0FF' },
  { key: 'KeyK', label: 'K', x: 580, color: '#9F7AEA' }
];

const HIT_Y = 500;
const SPEED = 320; // pixels per second

export const OmBeat = () => {
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('countdown');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(100);

  const gameDataRef = useRef({
    startTime: 0,
    notes: [],
    popups: new ScorePopups(),
    particles: new ParticleSystem(),
    combo: 0,
    score: 0,
    health: 100,
    activeLanes: [false, false, false, false]
  });

  const initSong = useCallback(() => {
    gameDataRef.current.startTime = performance.now();
    gameDataRef.current.notes = GAYATRI_CHART.notes.map((n, idx) => ({
      ...n,
      id: idx,
      hit: false,
      missed: false
    }));
    gameDataRef.current.score = 0;
    gameDataRef.current.combo = 0;
    gameDataRef.current.health = 100;
    setScore(0);
    setCombo(0);
    setHealth(100);
  }, []);

  const handleRestart = useCallback(() => {
    initSong();
    setGameState('playing');
  }, [initSong]);

  // Handle Lane Press
  const handleLaneHit = useCallback((laneIdx) => {
    const g = gameDataRef.current;
    const nowSec = (performance.now() - g.startTime) / 1000;

    // Find closest unhit note in lane
    const candidate = g.notes.find(
      (n) => n.lane === laneIdx && !n.hit && !n.missed && Math.abs(n.time - nowSec) < 0.2
    );

    if (candidate) {
      const diffMs = Math.abs(candidate.time - nowSec) * 1000;
      candidate.hit = true;

      let pts = 100;
      let text = 'GOOD';
      let col = '#00F0FF';

      if (diffMs <= 50) {
        pts = 300;
        text = 'PERFECT!';
        col = '#FFE259';
      } else if (diffMs <= 100) {
        pts = 200;
        text = 'GREAT!';
        col = '#4FD1C5';
      }

      g.combo++;
      g.score += pts * g.combo;
      g.health = Math.min(100, g.health + 4);
      setScore(g.score);
      setCombo(g.combo);
      setHealth(g.health);

      sounds.playCombo(g.combo);
      g.popups.add(LANES[laneIdx].x, HIT_Y - 20, text, col);
      g.particles.spawn(LANES[laneIdx].x, HIT_Y, 14, [col]);
    }
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const laneIdx = LANES.findIndex((l) => l.key === e.code);
      if (laneIdx !== -1) {
        gameDataRef.current.activeLanes[laneIdx] = true;
        handleLaneHit(laneIdx);
      }
    };

    const handleKeyUp = (e) => {
      const laneIdx = LANES.findIndex((l) => l.key === e.code);
      if (laneIdx !== -1) {
        gameDataRef.current.activeLanes[laneIdx] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLaneHit]);

  // Update Game
  const handleUpdate = useCallback(() => {
    if (gameState !== 'playing') return;
    const g = gameDataRef.current;
    const nowSec = (performance.now() - g.startTime) / 1000;

    let allCompleted = true;

    // Check misses
    for (const n of g.notes) {
      if (!n.hit && !n.missed) {
        allCompleted = false;
        if (nowSec - n.time > 0.2) {
          n.missed = true;
          g.combo = 0;
          g.health = Math.max(0, g.health - 12);
          setCombo(0);
          setHealth(g.health);
          g.popups.add(LANES[n.lane].x, HIT_Y, 'MISS', '#FF4D6D');

          if (g.health <= 0) {
            setGameState('gameover');
            return;
          }
        }
      }
    }

    if (allCompleted) {
      sounds.playUnlockChime();
      setGameState('gameover');
    }
  }, [gameState]);

  // Render Canvas
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { ctx } = setupCanvas(canvas, 800, 600);
    if (!ctx) return;
    const g = gameDataRef.current;
    const nowSec = (performance.now() - g.startTime) / 1000;

    // Background
    ctx.fillStyle = '#06060D';
    ctx.fillRect(0, 0, 800, 600);

    // Draw Lanes
    LANES.forEach((l, idx) => {
      ctx.fillStyle = g.activeLanes[idx] ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(l.x - 50, 0, 100, 600);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(l.x - 50, 0, 100, 600);

      // Hit Target Area
      ctx.fillStyle = l.color;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(l.x, HIT_Y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Key Label
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 16px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(l.label, l.x, HIT_Y + 45);
    });

    // Draw Falling Notes
    for (const n of g.notes) {
      if (n.hit || n.missed) continue;
      const timeDiff = n.time - nowSec;
      const y = HIT_Y - timeDiff * SPEED;

      if (y >= -30 && y <= 620) {
        const lane = LANES[n.lane];
        ctx.fillStyle = lane.color;
        ctx.shadowColor = lane.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(lane.x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#07070D';
        ctx.font = 'bold 12px "Noto Sans Devanagari"';
        ctx.textAlign = 'center';
        ctx.fillText(n.sanskrit, lane.x, y + 4);
      }
    }
    ctx.shadowBlur = 0;

    // Popups & Particles
    g.particles.updateAndDraw(ctx);
    g.popups.updateAndDraw(ctx);
  }, []);

  useGameLoop({
    onUpdate: handleUpdate,
    onRender: handleRender,
    isRunning: gameState === 'playing'
  });

  return (
    <ArcadeCabinet
      title="Om Beat"
      glyph="🥁"
      isPaused={gameState === 'paused'}
      onTogglePause={() => setGameState((s) => (s === 'playing' ? 'paused' : 'playing'))}
      onRestart={handleRestart}
    >
      <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, display: 'flex', gap: '16px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold-bright)' }}>SCORE: {score.toLocaleString()}</span>
        <span style={{ color: 'var(--cyan)' }}>COMBO: {combo}x</span>
        <span style={{ color: health > 30 ? 'var(--success)' : 'var(--danger)' }}>PRANA: {health}%</span>
      </div>

      <canvas
        ref={canvasRef}
        className="arcade-canvas-display"
        onClick={(e) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const clickX = ((e.clientX - rect.left) / rect.width) * 800;
          const closestIdx = LANES.reduce((closest, l, idx) => {
            const dist = Math.abs(l.x - clickX);
            return dist < Math.abs(LANES[closest].x - clickX) ? idx : closest;
          }, 0);
          handleLaneHit(closestIdx);
        }}
      />

      {gameState === 'countdown' && (
        <Countdown onComplete={() => { initSong(); setGameState('playing'); }} />
      )}

      {gameState === 'paused' && (
        <PauseMenu onResume={() => setGameState('playing')} onRestart={handleRestart} />
      )}

      {gameState === 'gameover' && (
        <GameOver gameId="om-beat" score={score} onRestart={handleRestart} />
      )}
    </ArcadeCabinet>
  );
};

export default {
  id: 'om-beat',
  title: 'Om Beat',
  glyph: '🥁',
  controls: 'Keys D, F, J, K or Tap lanes when notes cross the glowing bindu',
  Component: OmBeat
};
