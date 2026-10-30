import test from 'node:test';
import assert from 'node:assert/strict';
import { dataAccess, VEDAS_CATALOG } from '../src/services/dataAccess.js';

test('Four Vedas Reader & Data Access Service Suite', async (t) => {
  await t.test('catalog integrity: exposes exact scholarly divisions and metadata', () => {
    assert.strictEqual(VEDAS_CATALOG.length, 4, 'Must catalog all 4 Vedas');
    
    // Rigveda
    const rig = dataAccess.getVeda('rig');
    assert.strictEqual(rig.divisionsCount, 10);
    assert.strictEqual(rig.totalMantras, 10201);
    assert.strictEqual(rig.divisionName, 'Mandala');

    // Atharvaveda
    const atharva = dataAccess.getVeda('atharva');
    assert.strictEqual(atharva.divisionsCount, 20);
    assert.strictEqual(atharva.totalMantras, 6121);
    assert.strictEqual(atharva.divisionName, 'Kāṇḍa');

    // Yajurveda
    const yajur = dataAccess.getVeda('yajur');
    assert.strictEqual(yajur.divisionsCount, 40);
    assert.strictEqual(yajur.totalMantras, 1965);
    assert.strictEqual(yajur.divisionName, 'Adhyāya');

    // Samaveda
    const sama = dataAccess.getVeda('sama');
    assert.strictEqual(sama.divisionsCount, 2);
    assert.strictEqual(sama.totalMantras, 1794);
    assert.strictEqual(sama.divisionName, 'Ārcika');
  });

  await t.test('loadDivision asynchronously retrieves partition data for each Veda', async () => {
    // Load Rigveda Mandala 1
    const rv1 = await dataAccess.loadDivision('rig', 1);
    assert.ok(Array.isArray(rv1), 'Rigveda Mandala 1 must load as an array');
    assert.ok(rv1.length > 0);
    assert.strictEqual(rv1[0].verses[0].id, 'rv-1-1-1');

    // Load Atharvaveda Kanda 1
    const av1 = await dataAccess.loadDivision('atharva', 1);
    assert.ok(Array.isArray(av1), 'Atharvaveda Kanda 1 must load as an array');
    assert.ok(av1.length > 0);
    assert.strictEqual(av1[0].verses[0].id, 'av-1-1-1');

    // Load Yajurveda Adhyaya 1 (part 1)
    const yv1 = await dataAccess.loadDivision('yajur', 1);
    assert.ok(Array.isArray(yv1), 'Yajurveda Adhyaya 1 must load as an array');
    assert.ok(yv1.length > 0);

    // Load Samaveda Arcika 1 (Purvarcika)
    const sv1 = await dataAccess.loadDivision('sama', 1);
    assert.ok(Array.isArray(sv1), 'Samaveda Arcika 1 must load as an array');
    assert.ok(sv1.length > 0);
    assert.strictEqual(sv1[0].id, 'sv-1');
  });

  await t.test('loadDivision handles in-memory cache on subsequent requests', async () => {
    const t0 = performance.now();
    const rv2First = await dataAccess.loadDivision('rig', 2);
    const tFirst = performance.now() - t0;

    const t1 = performance.now();
    const rv2Second = await dataAccess.loadDivision('rig', 2);
    const tSecond = performance.now() - t1;

    assert.strictEqual(rv2First.length, rv2Second.length);
    assert.ok(tSecond <= tFirst || tSecond < 5, 'Cached partition retrieval must be under 5ms');
  });

  await t.test('loadDivision returns empty on invalid division without throwing', async () => {
    const invalid = await dataAccess.loadDivision('rig', 999);
    assert.ok(Array.isArray(invalid), 'Invalid division must return array');
    assert.strictEqual(invalid.length, 0, 'Invalid division must return empty list');
  });
});
