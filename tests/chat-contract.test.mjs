import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../api/index.js';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'test' 
    ? 'test-jwt-secret-for-automated-suites-min32' 
    : 'sutra-dev-secret-key-local-only-not-for-prod'
);

describe('AI Chat Contract & Regression Suite', () => {
  let server;
  let baseUrl;
  let validToken;

  before(async () => {
    validToken = jwt.sign(
      { username: 'test_seeker', role: 'user' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

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

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What is Atharva Veda?' }]
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /authentication token provided/i);
  });

  it('accepts the canonical messages array format ({ messages: [...] }) with 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Explain the opening verse of Atharvaveda.' }
        ]
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body.reply === 'string', 'Expected reply string in response body');
    assert.ok(body.reply.length > 0, 'Reply should not be empty');
  });

  it('accepts legacy/flexible format ({ message, history }) via normalization transformer with 200 OK', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`
      },
      body: JSON.stringify({
        message: '[Persona: Rishi Atharvan] Tell me about Prithvi Sukta',
        history: [
          { role: 'user', text: 'Namaste Rishi' },
          { role: 'assistant', content: 'Blessings, seeker of ancient truth.' }
        ]
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body.reply === 'string', 'Expected reply string in response body');
  });

  it('rejects empty payload ({}) with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`
      },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error, 'Expected error explanation');
  });

  it('rejects messages array containing empty content with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '' }]
      })
    });

    assert.equal(res.status, 400);
  });
});
