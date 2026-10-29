import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';
import { CANONICAL_VERSES } from '../../data/canonicalVerses';

const LANES = [
  { id: 'udatta', y: 150, name: 'Udātta (High Accent)', color: '#FFE259' },
  { id: 'svarita', y: 300, name: 'Svarita (Mid Flow)', color: '#00F0FF' },
  { id: 'anudatta', y: 450, name: 'Anudātta (Grounded Low)', color: '#FF7B00' }
];

export const SvaraStrike = () => {
  const canvasRef = useRef(null);
  const { keysRef, pointerRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown'); // 'countdown', 'playing', 'paused', 'gameover'
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [activeLaneIdx, setActiveLaneIdx] = useState(1); // 0=top, 1=mid, 2=bottom

  const gameDataRef = useRef({
    cursorY: 300,
    targetY: 300,
    notes: [],
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    score: 0,
    combo: 1,
    lastSpawn: 0,
    verseIdx: 0
  });

  const verse = CANONICAL_VERSES[0];

  const spawnNote = useCallback((time) => {
    const laneIdx = Math.floor(Math.random() * 3);
    const word = verse.words[Math.floor(Math.random() * verse.words.length)];
    gameDataRef.current.notes.push({
      x: 840,
      y: LANES[laneIdx].y,
      lane: laneIdx,
      syllable: word.text,
      gloss: word.gloss,
      hit: false,
      speed: 280
    });
    gameDataRef.current.lastSpawn = time;
  }, [verse]);

  const onUpdate = useCallback((dt) => {
    if (gameState !== 'playing') return;
    const data = gameDataRef.current;
    const now = performance.now();

    // Spawn notes periodically
    if (now - data.lastSpawn > 1400) {
      spawnNote(now);
    }

    // Input: Arrow keys or Pointer Y
    if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
      setActiveLaneIdx(0);
      data.targetY = LANES[0].y;
    } else if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
      setActiveLaneIdx(2);
      data.targetY = LANES[2].y;
    } else if (keysRef.current['Space'] || keysRef.current['KeyX']) {
      setActiveLaneIdx(1);
      data.targetY = LANES[1].y;
    }

    // Pointer lane selection
    if (pointerRef.current.active) {
      const pY = pointerRef.current.y;
      if (pY < 225) {
        setActiveLaneIdx(0);
        data.targetY = LANES[0].y;
      } else if (pY > 375) {
        setActiveLaneIdx(2);
        data.targetY = LANES[2].y;
      } else {
        setActiveLaneIdx(1);
        data.targetY = LANES[1].y;
      }
    }

    // Lerp cursor toward target lane
    data.cursorY += (data.targetY - data.cursorY) * 14 * dt;

    // Update Notes
    const gateX = 140;
    for (let i = data.notes.length - 1; i >= 0; i--) {
      const note = data.notes[i];
      note.x -= note.speed * dt;

      // Check Gate Alignment & Strike
      if (!note.hit && Math.abs(note.x - gateX) < 35 && Math.abs(data.cursorY - note.y) < 45) {
        note.hit = true;
        sounds.playSuccess();
        data.combo += 1;
        const pts = 100 * data.combo;
        data.score += pts;
        setScore(data.score);
        setCombo(data.combo);

        data.popups.add(gateX, note.y - 20, `+${pts}`, '#FFE259');
        data.particles.explode(gateX, note.y, LANES[note.lane].color, 16);
      }

      // Missed note past gate
      if (note.x < 40 && !note.hit) {
        data.combo = 1;
        setCombo(1);
        sounds.playError();
        data.popups.add(gateX, note.y, 'MISS', '#FF4D6D');
        data.notes.splice(i, 1);
      } else if (note.x < -60) {
        data.notes.splice(i, 1);
      }
    }

    data.particles.update(dt);
    data.popups.update(dt);
  }, [gameState, keysRef, pointerRef, spawnNote]);

  const onRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = gameDataRef.current;

    ctx.fillStyle = '#070710';
    ctx.fillRect(0, 0, 800, 600);

    // Render 3 Sacred Pitch Lanes
    LANES.forEach((lane, i) => {
      ctx.strokeStyle = i === activeLaneIdx ? lane.color : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = i === activeLaneIdx ? 2 : 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, lane.y);
      ctx.lineTo(800, lane.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = lane.color;
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText(lane.name, 20, lane.y - 10);
    });

    // Render Strike Gate Target
    ctx.strokeStyle = 'var(--gold, #D4AF37)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(140, data.cursorY, 26, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred Flame Cursor
    ctx.fillStyle = '#FFE259';
    ctx.shadowColor = '#FF7B00';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(140, data.cursorY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render Syllable Notes
    data.notes.forEach((note) => {
      if (note.hit) return;
      ctx.fillStyle = LANES[note.lane].color;
      ctx.beginPath();
      ctx.arc(note.x, note.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(note.syllable, note.x, note.y);
    });

    data.particles.draw(ctx);
    data.popups.draw(ctx);
  }, [activeLaneIdx]);

  useGameLoop({ onUpdate, onRender, isRunning: gameState === 'playing' });

  useEffect(() => {
    if (canvasRef.current) {
      setupCanvas(canvasRef.current, 800, 600);
    }
  }, []);

  return (
    <ArcadeCabinet
      title="Svara Strike (Rhythm & Pitch)"
      score={score}
      highScore={4500}
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
          style={{ width: '100%', height: '100%', display: 'block', background: '#070710' }}
        />

        {/* Combo HUD Overlay */}
        <div style={{ position: 'absolute', top: 16, right: 24, textAlign: 'right', pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.4rem', color: 'var(--gold-bright)' }}>
            COMBO {combo}x
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
            Use Up/Down Arrow keys or Touch to change Pitch Lane
          </div>
        </div>

        {gameState === 'countdown' && (
          <Countdown onComplete={() => setGameState('playing')} />
        )}

        {gameState === 'paused' && (
          <PauseMenu
            onResume={() => setGameState('playing')}
            onRestart={() => {
              gameDataRef.current.notes = [];
              gameDataRef.current.score = 0;
              setScore(0);
              setCombo(1);
              setGameState('playing');
            }}
            onExit={() => window.location.href = '/arcade'}
          />
        )}

        {gameState === 'gameover' && (
          <GameOver
            score={score}
            onRestart={() => {
              gameDataRef.current.notes = [];
              gameDataRef.current.score = 0;
              setScore(0);
              setCombo(1);
              setGameState('playing');
            }}
            onExit={() => window.location.href = '/arcade'}
          />
        )}
      </div>
    </ArcadeCabinet>
  );
};

export const SvaraStrikeModule = {
  id: 'svara',
  name: 'Svara Strike',
  subtitle: 'Rhythm & Vedic Svara Accents',
  Component: SvaraStrike
};

export default SvaraStrikeModule;
