import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../api/index.js';
import { dataAccess } from '../src/services/dataAccess.js';
import { findCanonicalVerse } from '../src/data/canonicalVerses.js';

describe('Adversarial QA, Security Red-Teaming & Stress Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // --- 1. Injection & Malformed Payload Stress ---

  it('rejects SQL injection and XSS patterns in auth inputs with 400 Bad Request', async () => {
    const maliciousUsernames = [
      "admin' OR '1'='1",
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert(1)>",
      "'; DROP TABLE users; --",
      "../../etc/passwd",
      "${7*7}",
      "{{7*7}}"
    ];

    for (const username of maliciousUsernames) {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password: 'validPassword123'
        })
      });

      assert.equal(res.status, 400, `Payload ${username} must be rejected with 400`);
      const data = await res.json();
      assert.ok(data.error, 'Must provide an explicit validation error');
    }
  });

  it('rejects oversized boundary payloads (>30 chars username) safely without memory exhaustion', async () => {
    const hugeUsername = 'a'.repeat(50000);
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: hugeUsername,
        password: 'validPassword123'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /characters/i);
  });

  it('returns clean JSON 404 on undefined API routes without leaking server details', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-archival-endpoint`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.ok(body.error, 'Must return JSON error object');
    assert.match(body.error, /not found/i);
  });

  // --- 2. Token Integrity & Cryptographic Boundaries ---

  it('rejects tokens signed with a forged or different secret with 401 Unauthorized', async () => {
    const forgedToken = jwt.sign(
      { id: 'hacker-seeker', username: 'adversary', role: 'admin' },
      'completely-different-signing-secret'
    );

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /invalid or expired session token/i);
  });

  it('rejects expired JWT tokens with 401 Unauthorized', async () => {
    // Generate token that expired 1 hour ago using test secret
    const expiredToken = jwt.sign(
      { id: 'expired-seeker', username: 'ancient_soul', role: 'seeker', exp: Math.floor(Date.now() / 1000) - 3600 },
      'test-jwt-secret-for-automated-suites-min32'
    );

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /invalid or expired session token/i);
  });

  // --- 3. Script Rendering, Ligatures & High-Complexity Unicode Stress ---

  it('handles complex Devanagari ligatures, virama conjuncts, and Vedic accents without crash', () => {
    const complexSanskritTokens = [
      'त्र्य॑म्बकं यजामहे सु॒गन्धिं॑ पुष्टि॒वर्ध॑नम्',
      'क्ष्मा॑',
      'ज्ये॒ष्ठा॑य च कनिष्ठाय॑ च',
      'ॐ भूर्भुवः॒ स्वः॑'
    ];

    for (const text of complexSanskritTokens) {
      const results = dataAccess.searchManuscripts(text);
      assert.ok(Array.isArray(results), 'Must return an array safely');

      const highlighted = dataAccess.highlightDevanagariMatch(text, 'त्र्य');
      assert.ok(typeof highlighted === 'string');
    }
  });

  it('safely handles extreme regex injection characters in search queries', () => {
    const regexExploits = [
      '.*',
      '(.*)',
      '++??',
      '[[[',
      '\\\\',
      '${undefined}',
      '__proto__',
      'constructor'
    ];

    for (const exploit of regexExploits) {
      assert.doesNotThrow(() => {
        const results = dataAccess.searchManuscripts(exploit);
        assert.ok(Array.isArray(results));

        const highlighted = dataAccess.highlightDevanagariMatch('सत्यं बृहत्', exploit);
        assert.ok(typeof highlighted === 'string');
      }, `Search must not throw on regex exploit: ${exploit}`);
    }
  });

  it('safely handles non-existent or corrupted verse coordinates without crashing', () => {
    const corruptedRefs = [
      '99999.99999.99999',
      '-1.-1.-1',
      'NaN.null.undefined',
      '',
      null,
      undefined
    ];

    for (const ref of corruptedRefs) {
      const verse = findCanonicalVerse(ref);
      assert.strictEqual(verse, null, `Corrupted ref ${ref} must safely resolve to null`);
    }
  });
});
