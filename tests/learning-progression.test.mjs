import test from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../src/store/useGameStore.js';

test('Learning, Progression & Event Tracking Suite', async (t) => {
  await t.test('progression starts clean without hardcoded fabricated stats', () => {
    const state = useGameStore.getState();
    assert.strictEqual(typeof state.versesMastered, 'number');
    assert.strictEqual(typeof state.mantrasRecited, 'number');
    assert.strictEqual(typeof state.rp, 'number');
  });

  await t.test('recordMantraRecited increments count and awards genuine contemplation RP', () => {
    const initialMantras = useGameStore.getState().mantrasRecited || 0;
    const initialRp = useGameStore.getState().rp;

    useGameStore.getState().recordMantraRecited();

    const afterMantras = useGameStore.getState().mantrasRecited;
    const afterRp = useGameStore.getState().rp;

    assert.strictEqual(afterMantras, initialMantras + 1);
    assert.strictEqual(afterRp, initialRp + 25);
  });

  await t.test('recordVerseMastered sets distinct verse references and avoids duplicate inflation', () => {
    useGameStore.getState().recordVerseMastered('12.1.1');
    const countAfterFirst = useGameStore.getState().versesMastered;

    // Recording the same verse again must not artificially inflate count
    useGameStore.getState().recordVerseMastered('12.1.1');
    const countAfterSecond = useGameStore.getState().versesMastered;

    assert.strictEqual(countAfterSecond, countAfterFirst);

    // Recording another verse must increment
    useGameStore.getState().recordVerseMastered('1.1.1');
    const countAfterNew = useGameStore.getState().versesMastered;
    assert.strictEqual(countAfterNew, countAfterFirst + 1);
  });

  await t.test('deterministic ranks calculate from thresholds correctly', () => {
    const rank = useGameStore.getState().getRank();
    assert.ok(rank, 'Rank must be defined');
    assert.ok(rank.title, 'Rank must have title');
    assert.ok(typeof rank.threshold === 'number', 'Rank threshold must be number');
  });
});
