import test from 'node:test';
import assert from 'node:assert/strict';
import { dataAccess, VEDAS_CATALOG } from '../src/services/dataAccess.js';

test('Unified Data Access Layer Suite', async (t) => {
  await t.test('truth in inventory: verifies canonical scope vs archival counts for all 4 Vedas', () => {
    const vedas = dataAccess.getAllVedas();
    assert.strictEqual(vedas.length, 4, 'Must return all 4 Vedas');

    const atharva = dataAccess.getVeda('atharva');
    assert.ok(atharva, 'Atharvaveda must exist');
    assert.strictEqual(atharva.recension, 'Śaunaka Śākhā');
    assert.ok(atharva.canonicalScope.includes('730'), 'Must document traditional scope');
    assert.strictEqual(typeof atharva.archivalCount, 'number');
    assert.ok(atharva.archivalCount >= 5, 'Must have at least 5 transcribed manuscripts');

    const rig = dataAccess.getVeda('rig');
    assert.ok(rig, 'Rigveda must exist');
    assert.strictEqual(rig.recension, 'Śākala Śākhā');
    assert.ok(rig.canonicalScope.includes('1,028'), 'Must document traditional scope');
  });

  await t.test('searchManuscripts handles reference coordinate parsing', () => {
    const match12_1 = dataAccess.searchManuscripts('12.1');
    assert.ok(match12_1.length > 0, 'Must match book 12 hymn 1');
    assert.strictEqual(match12_1[0].book, 12);
    assert.strictEqual(match12_1[0].hymn, 1);

    const match1_1 = dataAccess.searchManuscripts('1.1');
    assert.ok(match1_1.length > 0, 'Must match book 1 hymn 1');
  });

  await t.test('searchManuscripts searches Devanagari text correctly', () => {
    const satyaMatch = dataAccess.searchManuscripts('सत्य');
    assert.ok(satyaMatch.length > 0, 'Must match satya in Sanskrit text');
    assert.ok(satyaMatch.some((m) => m.title.includes('Pṛthivī') || m.sanskrit.includes('स॒त्यं')));

    const shantiMatch = dataAccess.searchManuscripts('शान्त');
    assert.ok(shantiMatch.length > 0, 'Must match shanta in Sanskrit text');
  });

  await t.test('searchManuscripts searches English concepts and IAST diacritics', () => {
    const earthMatch = dataAccess.searchManuscripts('earth');
    assert.ok(earthMatch.length > 0, 'Must match Earth');

    const pranaMatch = dataAccess.searchManuscripts('prāna');
    assert.ok(pranaMatch.length > 0 || dataAccess.searchManuscripts('prana').length > 0, 'Must match Prana');

    const timeMatch = dataAccess.searchManuscripts('time');
    assert.ok(timeMatch.length > 0, 'Must match Time / Kala');
  });

  await t.test('searchManuscripts respects theme and book filters', () => {
    const ecologySuktas = dataAccess.searchManuscripts('', { theme: 'Sacred Soil' });
    assert.ok(ecologySuktas.length > 0, 'Must filter by Sacred Soil');
    assert.ok(ecologySuktas.every((s) => s.tag === 'Sacred Soil'));

    const book12Suktas = dataAccess.searchManuscripts('', { veda: 'atharva', book: '12' });
    assert.ok(book12Suktas.length > 0);
    assert.ok(book12Suktas.every((s) => s.book === 12));
  });

  await t.test('highlightDevanagariMatch safely highlights queries without breaking', () => {
    const highlighted = dataAccess.highlightDevanagariMatch('सत्यं बृहत्', 'सत्य');
    assert.ok(highlighted.includes('<mark class="devanagari-highlight">सत्य</mark>'));

    // Special regex characters must be safely escaped
    const safeRegex = dataAccess.highlightDevanagariMatch('test (text)', '(');
    assert.ok(safeRegex.includes('<mark class="devanagari-highlight">(</mark>'));
  });
});
