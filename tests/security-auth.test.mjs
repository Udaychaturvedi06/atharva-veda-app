import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../api/index.js';

describe('Authentication & Security Baseline Suite', () => {
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

  it('honestly reports invalid credentials with 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nonexistent_seeker',
        password: 'incorrectPassword123'
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /invalid username or password/i);
  });

  it('rejects registration with invalid username characters with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'user@with-illegal!chars',
        password: 'validPassword123'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /alphanumeric/i);
  });

  it('prohibits password under 6 characters with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'valid_user',
        password: '123'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /at least 6 characters/i);
  });

  it('issues an explicit guest token marked role: guest', async () => {
    const res = await fetch(`${baseUrl}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'Expected guest token');
    assert.equal(body.user.role, 'guest');
    assert.equal(body.user.isGuest, true);
  });

  it('fails safely when verifying invalid or forged tokens', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer fake.invalid.jwt_token'
      }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /invalid or expired/i);
  });
});
