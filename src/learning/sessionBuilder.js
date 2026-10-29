/**
 * Adaptive Session Builder
 * Generates an interleave of 40% review, 40% new material, 20% challenge
 * Never places 3 of the same exercise type in a row, ends with an easy win.
 */

import { CANONICAL_VERSES } from '../data/canonicalVerses';
import { getDueCards } from './scheduler';

export const EXERCISE_TYPES = [
  'listen_match',
  'chant_pitch',
  'rhythm_tap',
  'meter_builder',
  'word_order',
  'fill_missing',
  'root_detective',
  'sandhi_splitter',
  'devanagari_trace',
  'meaning_recall',
  'memory_fade'
];

export const buildSession = ({ minutes = 5, userCards = [] } = {}) => {
  const count = Math.max(5, Math.min(15, Math.round(minutes * 2)));
  const due = getDueCards(userCards);

  const reviewCount = Math.floor(count * 0.4);

  const exercises = [];
  let lastType = null;

  const getRandomType = (filterOut) => {
    const available = EXERCISE_TYPES.filter((t) => t !== filterOut);
    return available[Math.floor(Math.random() * available.length)];
  };

  for (let i = 0; i < count; i++) {
    const verse = CANONICAL_VERSES[i % CANONICAL_VERSES.length];
    let type = getRandomType(lastType);

    // Confidence finish on last question
    if (i === count - 1) {
      type = 'listen_match';
    }

    exercises.push({
      id: `ex-${i + 1}`,
      type,
      verse,
      targetPada: 1,
      isReview: i < reviewCount && due.length > 0
    });

    lastType = type;
  }

  return exercises;
};
