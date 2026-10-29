import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from '../engine/useGameLoop';
import { useInput } from '../engine/useInput';
import { setupCanvas, ScorePopups, ParticleSystem } from '../engine/canvasUtils';
import { sounds } from '../../utils/soundEngine';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import Countdown from '../ui/Countdown';
import GameOver from '../ui/GameOver';
import PauseMenu from '../ui/PauseMenu';

const COMPOUNDS = [
  { compound: 'देवेन्द्रः', p1: 'देव', p2: 'इन्द्रः', splitRatio: 0.45 },
  { compound: 'सूर्योदयः', p1: 'सूर्य', p2: 'उदयः', splitRatio: 0.5 },
  { compound: 'हिमालयः', p1: 'हिम', p2: 'आलयः', splitRatio: 0.4 },
  { compound: 'वाचस्पतिः', p1: 'वाचः', p2: 'पतिः', splitRatio: 0.52 },
  { compound: 'सत्याग्रहः', p1: 'सत्य', p2: 'आग्रहः', splitRatio: 0.48 }
];

export const SandhiSmash = () => {
  const canvasRef = useRef(null);
  const { pointerRef, handlePointerMove, handlePointerDown, handlePointerUp } = useInput(canvasRef);

  const [gameState, setGameState] = useState('countdown');
  const [score, setScore] = useState(0);

  const gameDataRef = useRef({
    words: [],
    particles: new ParticleSystem(),
    popups: new ScorePopups(),
    score: 0,
    lastSpawn: 0,
    sliceTrail: []
  });

  const spawnCompound = useCallback((time) => {
    const item = COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)];
    gameDataRef.current.words.push({
      x: 100 + Math.random() * 600,
      y: -40,
      vy: 110 + Math.random() * 60,
      text: item.compound,
      item,
      sliced: false,
      radius: 44
    });
    gameDataRef.current.lastSpawn = time;
  }, []);

  const onUpdate = useCallback((dt) => {
    if (gameState !== 'playing') return;
    const data = gameDataRef.current;
    const now = performance.now();

    if (now - data.lastSpawn > 1800) {
      spawnCompound(now);
    }

    // Slice trail update
    if (pointerRef.current.active) {
      data.sliceTrail.push({ x: pointerRef.current.x, y: pointerRef.current.y, time: now });
      if (data.sliceTrail.length > 12) data.sliceTrail.shift();
    } else {
      data.sliceTrail = [];
    }

    // Update falling compounds
    for (let i = data.words.length - 1; i >= 0; i--) {
      const w = data.words[i];
      w.y += w.vy * dt;

      // Check collision with slice trail
      if (!w.sliced && pointerRef.current.active) {
        const dx = pointerRef.current.x - w.x;
        const dy = pointerRef.current.y - w.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < w.radius) {
          w.sliced = true;
          sounds.playSuccess();
          data.score += 150;
          setScore(data.score);
          data.popups.add(w.x, w.y, `${w.item.p1} + ${w.item.p2}!`, '#FFE259');
          data.particles.explode(w.x, w.y, '#00F0FF', 24);
        }
      }

      // Past bottom
      if (w.y > 640) {
        if (!w.sliced) {
          sounds.playError();
        }
        data.words.splice(i, 1);
      }
    }

    data.particles.update(dt);
    data.popups.update(dt);
  }, [gameState, pointerRef, spawnCompound]);

  const onRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = gameDataRef.current;

    ctx.fillStyle = '#090814';
    ctx.fillRect(0, 0, 800, 600);

    // Falling words
    data.words.forEach((w) => {
      if (w.sliced) return;
      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.strokeStyle = 'var(--gold, #D4AF37)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 16px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(w.text, w.x, w.y);
    });

    // Render Slice Trail
    if (data.sliceTrail.length > 1) {
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(data.sliceTrail[0].x, data.sliceTrail[0].y);
      for (let i = 1; i < data.sliceTrail.length; i++) {
        ctx.lineTo(data.sliceTrail[i].x, data.sliceTrail[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    data.particles.draw(ctx);
    data.popups.draw(ctx);
  }, []);

  useGameLoop({ onUpdate, onRender, isRunning: gameState === 'playing' });

  useEffect(() => {
    if (canvasRef.current) setupCanvas(canvasRef.current, 800, 600);
  }, []);

  return (
    <ArcadeCabinet
      title="Sandhi Smash (Grammar Compounds)"
      score={score}
      highScore={3200}
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
          style={{ width: '100%', height: '100%', display: 'block', background: '#090814' }}
        />

        <div style={{ position: 'absolute', top: 16, right: 24, textAlign: 'right', pointerEvents: 'none' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--cyan)' }}>
            Swipe across falling words to split them at the Sandhi junction!
          </div>
        </div>

        {gameState === 'countdown' && (
          <Countdown onComplete={() => setGameState('playing')} />
        )}

        {gameState === 'paused' && (
          <PauseMenu
            onResume={() => setGameState('playing')}
            onRestart={() => {
              gameDataRef.current.words = [];
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
              gameDataRef.current.words = [];
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

export const SandhiSmashModule = {
  id: 'sandhi',
  name: 'Sandhi Smash',
  subtitle: 'Compound Slicing & Word Roots',
  Component: SandhiSmash
};

export default SandhiSmashModule;
