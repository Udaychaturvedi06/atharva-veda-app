import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_VERSES, findCanonicalVerse } from '../src/data/canonicalVerses.js';

test('Living Archive Canonical Verses & Reader Data Integrity', async (t) => {
  await t.test('contains all cornerstone Atharvaveda suktas with verified provenance', () => {
    assert.ok(CANONICAL_VERSES.length >= 5, 'Must contain at least 5 cornerstone verses');

    const prithviSukta = findCanonicalVerse('12.1.1');
    assert.ok(prithviSukta, 'Prithvi Sukta (12.1.1) must exist');
    assert.strictEqual(prithviSukta.provenance, 'verified');
    assert.strictEqual(prithviSukta.recension, 'Śaunaka Śākhā');
    assert.ok(prithviSukta.words.length > 5, 'Must have word-by-word anatomy');

    const medhaSukta = findCanonicalVerse('1.1.1');
    assert.ok(medhaSukta, 'Medha Sukta (1.1.1) must exist');
    assert.strictEqual(medhaSukta.provenance, 'verified');

    const shantiSukta = findCanonicalVerse('19.9.1');
    assert.ok(shantiSukta, 'Shanti Sukta (19.9.1) must exist');
    assert.strictEqual(shantiSukta.provenance, 'verified');
  });

  await t.test('findCanonicalVerse handles various formatting styles without false fallbacks', () => {
    assert.strictEqual(findCanonicalVerse('12.1.1')?.ref, '12.1.1');
    assert.strictEqual(findCanonicalVerse('av-12-1-1')?.ref, '12.1.1');
    assert.strictEqual(findCanonicalVerse('12-1-1')?.ref, '12.1.1');
    // Non-existent verses must return null rather than silently faking 1.1.1
    assert.strictEqual(findCanonicalVerse('99.99.99'), null);
    assert.strictEqual(findCanonicalVerse(''), null);
    assert.strictEqual(findCanonicalVerse(null), null);
  });

  await t.test('every canonical word token possesses root, gloss, and svara accent classification', () => {
    for (const v of CANONICAL_VERSES) {
      assert.ok(v.words && v.words.length > 0, `Verse ${v.ref} must have words`);
      for (const w of v.words) {
        assert.ok(w.text, `Word in ${v.ref} must have text`);
        assert.ok(w.root, `Word ${w.text} in ${v.ref} must have root (dhatu)`);
        assert.ok(w.gloss, `Word ${w.text} in ${v.ref} must have gloss`);
        assert.ok(Array.isArray(w.swara), `Word ${w.text} in ${v.ref} must have swara array`);
      }
    }
  });
});
