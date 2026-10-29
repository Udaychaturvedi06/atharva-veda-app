import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

export const ChandasCraft = () => {
  const canvasRef = useRef(null);
  const { keysRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown');
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);

  const COLS = 8; // 8 syllables = 1 Anuṣṭubh pada
  const ROWS = 12;
  const CELL_SIZE = 38;

  const gameDataRef = useRef({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    currentBlock: { col: 3, row: 0, width: 1 }, // width 1 = Laghu, width 2 = Guru
    lastDrop: 0,
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    score: 0,
    lines: 0
  });

  const onUpdate = useCallback((dt) => {
    if (gameState !== 'playing') return;
    const data = gameDataRef.current;
    const now = performance.now();

    // Input Movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      keysRef.current['ArrowLeft'] = false;
      keysRef.current['KeyA'] = false;
      if (data.currentBlock.col > 0) {
        data.currentBlock.col -= 1;
        sounds.playTap();
      }
    } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      keysRef.current['ArrowRight'] = false;
      keysRef.current['KeyD'] = false;
      if (data.currentBlock.col + data.currentBlock.width < COLS) {
        data.currentBlock.col += 1;
        sounds.playTap();
      }
    }

    // Drop block periodically
    if (now - data.lastDrop > 700) {
      data.lastDrop = now;
      const b = data.currentBlock;

      // Check collision below
      const nextRow = b.row + 1;
      let collides = nextRow >= ROWS;
      if (!collides) {
        for (let c = 0; c < b.width; c++) {
          if (data.grid[nextRow][b.col + c] !== 0) {
            collides = true;
            break;
          }
        }
      }

      if (collides) {
        // Lock block into grid
        for (let c = 0; c < b.width; c++) {
          data.grid[b.row][b.col + c] = b.width === 1 ? 1 : 2;
        }

        sounds.playTap();

        // Check full lines
        for (let r = 0; r < ROWS; r++) {
          if (data.grid[r].every((cell) => cell !== 0)) {
            data.grid.splice(r, 1);
            data.grid.unshift(Array(COLS).fill(0));
            sounds.playSuccess();
            data.score += 200;
            data.lines += 1;
            setScore(data.score);
            setLinesCleared(data.lines);
            data.popups.add(400, 200 + r * CELL_SIZE, 'PADA CONSECRATED! +200', '#FFE259');
            data.particles.explode(400, 150 + r * CELL_SIZE, '#00F0FF', 25);
          }
        }

        // Spawn next block
        const isGuru = Math.random() > 0.5;
        data.currentBlock = { col: 3, row: 0, width: isGuru ? 2 : 1 };

        // Game over check
        if (data.grid[0][3] !== 0) {
          setGameState('gameover');
        }
      } else {
        b.row = nextRow;
      }
    }

    data.particles.update(dt);
    data.popups.update(dt);
  }, [gameState, keysRef]);

  const onRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = gameDataRef.current;

    ctx.fillStyle = '#080812';
    ctx.fillRect(0, 0, 800, 600);

    const startX = (800 - COLS * CELL_SIZE) / 2;
    const startY = 60;

    // Grid Frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.strokeRect(startX - 2, startY - 2, COLS * CELL_SIZE + 4, ROWS * CELL_SIZE + 4);

    // Draw Locked Cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = data.grid[r][c];
        if (val !== 0) {
          ctx.fillStyle = val === 1 ? '#00F0FF' : '#FF7B00';
          ctx.fillRect(startX + c * CELL_SIZE + 2, startY + r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.strokeRect(startX + c * CELL_SIZE, startY + r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw Falling Block
    const b = data.currentBlock;
    ctx.fillStyle = b.width === 1 ? '#00F0FF' : '#FF7B00';
    for (let c = 0; c < b.width; c++) {
      ctx.fillRect(startX + (b.col + c) * CELL_SIZE + 2, startY + b.row * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    }

    data.particles.draw(ctx);
    data.popups.draw(ctx);
  }, [CELL_SIZE]);

  useGameLoop({ onUpdate, onRender, isRunning: gameState === 'playing' });

  useEffect(() => {
    if (canvasRef.current) setupCanvas(canvasRef.current, 800, 600);
  }, []);

  return (
    <ArcadeCabinet
      title="Chandas Craft (Meter Architecture)"
      score={score}
      highScore={2800}
      onPause={() => setGameState('paused')}
    >
      <div style={{ position: 'relative', width: 800, height: 600, margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block', background: '#080812' }}
        />

        <div style={{ position: 'absolute', top: 16, right: 24, textAlign: 'right', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.2rem', color: 'var(--gold-bright)' }}>
            PADAS CLEARED: {linesCleared}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
            Cyan = Laghu (1 Matra) &bull; Orange = Guru (2 Matras)
          </div>
        </div>

        {gameState === 'countdown' && (
          <Countdown onComplete={() => setGameState('playing')} />
        )}

        {gameState === 'paused' && (
          <PauseMenu
            onResume={() => setGameState('playing')}
            onRestart={() => {
              gameDataRef.current.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
              gameDataRef.current.score = 0;
              setScore(0);
              setGameState('playing');
            }}
            onExit={() => window.location.href = '/arcade'}
          />
        )}

        {gameState === 'gameover' && (
          <GameOver
            score={score}
            onRestart={() => {
              gameDataRef.current.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
              gameDataRef.current.score = 0;
              setScore(0);
              setGameState('playing');
            }}
            onExit={() => window.location.href = '/arcade'}
          />
        )}
      </div>
    </ArcadeCabinet>
  );
};

export const ChandasCraftModule = {
  id: 'chandas',
  name: 'Chandas Craft',
  subtitle: 'Tetris-style Metre Building',
  Component: ChandasCraft
};

export default ChandasCraftModule;
