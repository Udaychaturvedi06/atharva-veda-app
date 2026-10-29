/**
 * FSRS-Inspired Spaced Repetition Scheduling Engine for Vedic Shlokas & Words
 * Tracks Stability (days until R=90%), Difficulty (1-10), and Retrievability
 */

// Initial stability by rating: [Forgot, Hard, Good, Mastered]
const INITIAL_STABILITY = [0.5, 1.2, 3.2, 7.5];

export const createCard = (id, metadata = {}) => ({
  id,
  stability: 1.0,
  difficulty: 5.0,
  reps: 0,
  lapses: 0,
  state: 'new', // 'new', 'learning', 'review'
  lastReviewed: null,
  due: Date.now(),
  metadata
});

/**
 * Calculates current retrievability R(t) = (1 + 0.19 * t / S)^(-0.5)
 */
export const calculateRetrievability = (card, now = Date.now()) => {
  if (!card.lastReviewed) return 1.0;
  const elapsedDays = Math.max(0, (now - card.lastReviewed) / (1000 * 60 * 60 * 24));
  const r = Math.pow(1 + (0.19 * elapsedDays) / Math.max(0.1, card.stability), -0.5);
  return Math.max(0, Math.min(1, r));
};

/**
 * Schedules next repetition based on performance rating (1..4)
 * 1: Again / Forgot (Lapse)
 * 2: Hard
 * 3: Good
 * 4: Easy / Perfect Pitch
 */
export const schedule = (card, rating, now = Date.now()) => {
  const reps = card.reps + 1;
  let lapses = card.lapses;
  let stability = card.stability;
  let difficulty = card.difficulty;

  if (rating === 1) {
    lapses += 1;
    stability = Math.max(0.5, stability * 0.35);
    difficulty = Math.min(10, difficulty + 0.6);
  } else if (card.state === 'new') {
    stability = INITIAL_STABILITY[rating - 1] || 1.0;
    difficulty = Math.max(1, Math.min(10, 5.0 - (rating - 3) * 0.5));
  } else {
    // Review card stability progression
    const factor = rating === 2 ? 1.2 : rating === 3 ? 2.1 : 3.4;
    stability = stability * (1 + (11 - difficulty) * 0.1 * factor);
    difficulty = Math.max(1, Math.min(10, difficulty - (rating - 3) * 0.25));
  }

  // Next due interval in milliseconds
  const intervalDays = Math.max(0.25, stability);
  const due = now + intervalDays * 24 * 60 * 60 * 1000;

  return {
    ...card,
    stability,
    difficulty,
    reps,
    lapses,
    state: 'review',
    lastReviewed: now,
    due
  };
};

export const getDueCards = (cards, now = Date.now()) => {
  return cards.filter((c) => c.due <= now);
};

export const getWeakWords = (wordCards, limit = 5) => {
  return [...wordCards]
    .sort((a, b) => (a.stability || 1) - (b.stability || 1))
    .slice(0, limit);
};
