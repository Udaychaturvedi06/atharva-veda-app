import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../../utils/soundEngine';
import { SANSKRIT_TERMS } from '../../data/terms';
import ArcadeCabinet from '../ui/ArcadeCabinet';
import GameOver from '../ui/GameOver';
import { Sparkles, Clock, Eye } from 'lucide-react';
import { Chip } from '../../components/ui/Chip';

// Fisher-Yates Shuffle
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const MemoryMandala = () => {
  const [gridSize, setGridSize] = useState(8); // 8 pairs = 16 cards (4x4)
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize deck of paired cards
  const initGame = useCallback((pairCount = 8) => {
    const selectedTerms = shuffleArray(SANSKRIT_TERMS).slice(0, pairCount);
    const cardDeck = [];

    selectedTerms.forEach((t) => {
      // Sanskrit card
      cardDeck.push({
        id: `${t.id}-sanskrit`,
        pairId: t.id,
        content: t.sanskrit,
        sub: t.glyph,
        isSanskrit: true
      });
      // Meaning card
      cardDeck.push({
        id: `${t.id}-meaning`,
        pairId: t.id,
        content: t.meaning,
        sub: 'Meaning',
        isSanskrit: false
      });
    });

    setCards(shuffleArray(cardDeck));
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setTimerSeconds(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame(gridSize);
  }, [gridSize, initGame]);

  // Timer loop
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimerSeconds((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Handle Card Click
  const handleCardClick = (idx) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(idx)) return;
    const clickedCard = cards[idx];
    if (matchedPairs.includes(clickedCard.pairId)) return;

    sounds.playShoot();
    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.pairId === card2.pairId) {
        // Matched!
        sounds.playUnlockChime();
        setMatchedPairs((prev) => {
          const next = [...prev, card1.pairId];
          if (next.length === gridSize) {
            setIsGameOver(true);
          }
          return next;
        });
        setFlippedCards([]);
      } else {
        // Mismatch: flip back after 700ms
        sounds.playCombatHit(false);
        setTimeout(() => {
          setFlippedCards([]);
        }, 700);
      }
    }
  };

  const calculatedScore = Math.max(
    100,
    Math.floor((gridSize * 500) - (moves * 25) - (timerSeconds * 5))
  );

  return (
    <ArcadeCabinet
      title="Memory Mandala"
      glyph="🃏"
      onRestart={() => initGame(gridSize)}
    >
      <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
        {/* HUD Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--gold-bright)' }}>MOVES: {moves}</span>
            <span style={{ color: 'var(--cyan)' }}>TIME: {timerSeconds}s</span>
            <span style={{ color: 'var(--soma)' }}>PAIRS: {matchedPairs.length} / {gridSize}</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[6, 8, 12].map((size) => (
              <button
                key={size}
                type="button"
                className={`settings-segmented-btn ${gridSize === size ? 'active' : ''}`}
                onClick={() => setGridSize(size)}
              >
                {size} Pairs
              </button>
            ))}
          </div>
        </div>

        {/* 3D Flip Card Grid */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize === 12 ? 6 : 4}, 1fr)`,
            gap: '10px',
            margin: '14px 0',
            perspective: '1000px'
          }}
        >
          {cards.map((card, idx) => {
            const isFlipped = flippedCards.includes(idx) || matchedPairs.includes(card.pairId);
            const isMatched = matchedPairs.includes(card.pairId);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: '70px',
                  cursor: isMatched ? 'default' : 'pointer',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Back (Cover) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    borderRadius: '8px',
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(19, 17, 28, 0.95) 80%)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-bright)',
                    fontSize: '1.4rem'
                  }}
                >
                  ॐ
                </div>

                {/* Front (Content) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '8px',
                    background: isMatched ? 'rgba(79, 209, 197, 0.15)' : 'rgba(26, 22, 38, 0.95)',
                    border: `1px solid ${isMatched ? 'var(--success)' : 'var(--gold)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    textAlign: 'center',
                    boxShadow: isMatched ? '0 0 16px rgba(79, 209, 197, 0.4)' : 'none'
                  }}
                >
                  <span
                    style={{
                      fontFamily: card.isSanskrit ? 'var(--font-sanskrit)' : 'var(--font-ui)',
                      fontSize: card.isSanskrit ? '1.25rem' : '0.78rem',
                      color: card.isSanskrit ? 'var(--gold-bright)' : '#FFF',
                      fontWeight: 600
                    }}
                  >
                    {card.content}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {card.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {isGameOver && (
          <GameOver
            gameId="memory-mandala"
            score={calculatedScore}
            onRestart={() => initGame(gridSize)}
          />
        )}
      </div>
    </ArcadeCabinet>
  );
};

export default {
  id: 'memory-mandala',
  title: 'Memory Mandala',
  glyph: '🃏',
  controls: 'Click/tap cards to flip in 3D and match Sanskrit term with English meaning',
  Component: MemoryMandala
};
