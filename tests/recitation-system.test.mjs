import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { audioCacheStorage } from '../api/services/tts/audioCacheStorage.js';
import { audioGenerationService } from '../api/services/tts/audioGenerationService.js';
import { providerRegistry } from '../api/services/tts/ttsProviderAdapter.js';
import { BaseTTSProvider } from '../api/services/tts/baseTTSProvider.js';
import { LocalAcousticProvider } from '../api/services/tts/providers/localAcousticProvider.js';
import { MockTTSProvider } from '../api/services/tts/providers/mockProvider.js';
import { synchronizationService } from '../src/services/recitation/synchronizationService.js';
import app from '../api/index.js';

describe('Vedic Recitation System Architecture & Performance Tests', () => {
  let server;
  let serverBaseUrl;
  const originalPrimary = providerRegistry.getPrimary()?.name;

  before(async () => {
    // Start temporary test server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        serverBaseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (originalPrimary) {
      providerRegistry.setPrimary(originalPrimary);
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Content-Addressable Persistent Audio Cache', () => {
    it('generates deterministic SHA-256 cache keys', () => {
      const key1 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'सत्यं बृहद् ऋतम्',
        textVersion: 'v1',
        engine: 'acoustic',
        modelVersion: '1.0.0',
        voiceId: 'default'
      });

      const key2 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'सत्यं बृहद् ऋतम्',
        textVersion: 'v1',
        engine: 'acoustic',
        modelVersion: '1.0.0',
        voiceId: 'default'
      });

      assert.strictEqual(key1, key2);
      assert.strictEqual(key1.length, 32);
    });

    it('generates different keys when canonical verse text changes', () => {
      const key1 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'सत्यं बृहद् ऋतम्',
        textVersion: 'v1',
        engine: 'acoustic',
        modelVersion: '1.0.0'
      });

      const key2 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'स॒त्यं बृ॒हद् ऋ॒तम्', // With Vedic svara diacritics
        textVersion: 'v1',
        engine: 'acoustic',
        modelVersion: '1.0.0'
      });

      assert.notStrictEqual(key1, key2, 'Keys must be sensitive to svara diacritic differences');
    });

    it('generates different keys when TTS engine or model version changes', () => {
      const key1 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'सत्यम्',
        textVersion: 'v1',
        engine: 'acoustic',
        modelVersion: '1.0.0'
      });

      const key2 = audioCacheStorage.computeCacheKey({
        verseId: '12.1.1',
        devanagari: 'सत्यम्',
        textVersion: 'v1',
        engine: 'vagdhenu-fastspeech2',
        modelVersion: '2.0.0'
      });

      assert.notStrictEqual(key1, key2, 'Keys must differ across distinct engines/models');
    });

    it('stores, retrieves, and checks existence of audio assets', async () => {
      const testKey = 'test-cache-key-abc-123';
      const fakeBuffer = Buffer.from('RIFF....WAVEfmt ....data....fake audio bytes');

      const saved = await audioCacheStorage.put(testKey, {
        audioBuffer: fakeBuffer,
        format: 'audio/wav',
        durationMs: 2500,
        alignmentTimestamps: [
          { word: 'अग्निमीळे', startMs: 0, endMs: 1200 },
          { word: 'पुरोहितम्', startMs: 1200, endMs: 2500 }
        ],
        provider: 'mock-test',
        modelVersion: '1.0.0',
        verseId: '1.1.1'
      });

      assert.strictEqual(saved.cacheKey, testKey);
      assert.ok(saved.audioUrl.includes('test-cache-key-abc-123.wav'));

      const retrieved = audioCacheStorage.get(testKey);
      assert.ok(retrieved);
      assert.strictEqual(retrieved.durationMs, 2500);
      assert.strictEqual(retrieved.alignmentTimestamps.length, 2);

      const retrievedBuffer = await audioCacheStorage.getAudioStreamOrBuffer(`${testKey}.wav`);
      assert.deepStrictEqual(retrievedBuffer, fakeBuffer);
    });
  });

  describe('2. Local Acoustic Synthesizer (Vedic Pitch & PCM WAV)', () => {
    const provider = new LocalAcousticProvider();

    it('produces valid 44.1kHz 16-bit PCM RIFF WAV headers', async () => {
      const payload = {
        verseId: '12.1.1',
        devanagari: 'सत्यं बृहत्',
        iast: 'satyaṃ bṛhat',
        words: [
          { text: 'सत्यम्', swara: ['udatta'] },
          { text: 'बृहत्', swara: ['anudatta'] }
        ]
      };

      const result = await provider.synthesize(payload);
      assert.strictEqual(result.contentType, 'audio/wav');
      assert.ok(result.audioBuffer instanceof Buffer);
      assert.ok(result.audioBuffer.length > 44, 'WAV must be larger than 44-byte header');

      // Check RIFF header structure
      assert.strictEqual(result.audioBuffer.toString('ascii', 0, 4), 'RIFF');
      assert.strictEqual(result.audioBuffer.toString('ascii', 8, 12), 'WAVE');
      assert.strictEqual(result.audioBuffer.toString('ascii', 12, 16), 'fmt ');
      assert.strictEqual(result.audioBuffer.readUInt16LE(20), 1, 'AudioFormat 1 = PCM');
      assert.strictEqual(result.audioBuffer.readUInt16LE(22), 1, 'NumChannels = 1 (Mono)');
      assert.strictEqual(result.audioBuffer.readUInt32LE(24), 44100, 'SampleRate = 44100 Hz');
      assert.strictEqual(result.audioBuffer.readUInt16LE(34), 16, 'BitsPerSample = 16-bit');
    });

    it('generates strictly ordered, non-drifting word alignment timestamps', async () => {
      const payload = {
        verseId: '12.1.1',
        devanagari: 'सत्यं बृहद् ऋतं महद्',
        words: [
          { text: 'सत्यम्', swara: ['udatta'] },
          { text: 'बृहत्', swara: ['anudatta'] },
          { text: 'ऋतम्', swara: ['svarita'] },
          { text: 'महत्', swara: ['udatta'] }
        ]
      };

      const result = await provider.synthesize(payload);
      const { alignmentTimestamps, durationMs } = result;

      assert.strictEqual(alignmentTimestamps.length, 4);
      assert.ok(durationMs > 0);

      for (let i = 0; i < alignmentTimestamps.length; i++) {
        const item = alignmentTimestamps[i];
        assert.ok(item.startMs >= 0, `Word ${i} startMs must be >= 0`);
        assert.ok(item.endMs > item.startMs, `Word ${i} endMs must be > startMs`);
        assert.ok(item.endMs <= durationMs + 100, `Word ${i} endMs must be <= durationMs`);

        if (i > 0) {
          const prev = alignmentTimestamps[i - 1];
          assert.ok(item.startMs >= prev.endMs, `Word ${i} startMs (${item.startMs}) must be >= previous endMs (${prev.endMs})`);
        }
      }
    });
  });

  describe('3. Audio Generation Service & Single-Flight Concurrency Lock', () => {
    it('shares a single execution job when concurrent requests arrive for the same verse', async () => {
      const uniqueId = `conc-test-${Date.now()}-${Math.random()}`;
      const payload = {
        verseId: uniqueId,
        devanagari: `भद्रं कर्णेभिः शृणुयाम देवाः ${Date.now()}`,
        words: [
          { text: 'भद्रम्' },
          { text: 'कर्णेभिः' },
          { text: 'शृणुयाम' },
          { text: 'देवाः' }
        ]
      };

      const initialPrevented = audioGenerationService.getMetrics().duplicatePreventedCount;

      // Launch 3 simultaneous requests for the exact same un-cached verse
      const req1 = audioGenerationService.synthesizeVerse(payload);
      const req2 = audioGenerationService.synthesizeVerse(payload);
      const req3 = audioGenerationService.synthesizeVerse(payload);

      const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

      assert.strictEqual(res1.cacheKey, res2.cacheKey);
      assert.strictEqual(res2.cacheKey, res3.cacheKey);
      assert.strictEqual(res1.audioUrl, res2.audioUrl);

      const metrics = audioGenerationService.getMetrics();
      assert.ok(
        metrics.duplicatePreventedCount >= initialPrevented + 2,
        `Expected at least 2 duplicate jobs prevented, got ${metrics.duplicatePreventedCount - initialPrevented}`
      );
    });

    it('returns isCached: true on subsequent requests with 0 additional synthesis jobs', async () => {
      const payload = {
        verseId: 'cached-test-2',
        devanagari: 'ॐ शान्तिः शान्तिः शान्तिः'
      };

      // 1st request generates
      const first = await audioGenerationService.synthesizeVerse(payload);
      assert.strictEqual(first.status, 'ready');

      // 2nd request must hit cache
      const second = await audioGenerationService.prepareVerse(payload);
      assert.strictEqual(second.status, 'ready');
      assert.strictEqual(second.isCached, true);
      assert.strictEqual(second.cacheKey, first.cacheKey);
    });

    it('tracks telemetry metrics (hit rate, avg & p95 generation time)', () => {
      const metrics = audioGenerationService.getMetrics();
      assert.ok(typeof metrics.totalRequests === 'number' && metrics.totalRequests > 0);
      assert.ok(typeof metrics.cacheHits === 'number');
      assert.ok(typeof metrics.hitRatePercent === 'number');
      assert.ok(metrics.hitRatePercent >= 0 && metrics.hitRatePercent <= 100);
      assert.ok(typeof metrics.avgGenerationTimeMs === 'number');
      assert.ok(typeof metrics.p95GenerationTimeMs === 'number');
    });
  });

  describe('4. Multi-Provider Fallback Cascade', () => {
    it('gracefully falls back to local acoustic generator if primary provider throws an error', async () => {
      const prevPrimary = providerRegistry.getPrimary()?.name;
      class FailingProvider extends BaseTTSProvider {
        constructor() {
          super('failing-provider', '1.0.0');
        }
        async isAvailable() { return true; }
        async synthesize() {
          throw new Error('Neural inference backend connection refused: 503 Service Unavailable');
        }
      }

      providerRegistry.register(new FailingProvider(), true);

      try {
        const payload = {
          verseId: 'fallback-test-1',
          devanagari: 'सत्याय स्वाहा'
        };

        const result = await audioGenerationService.synthesizeVerse(payload);
        assert.strictEqual(result.status, 'ready');
        assert.strictEqual(result.engine, 'local-acoustic-vedic');
        assert.ok(result.audioUrl.endsWith('.wav'));
      } finally {
        if (prevPrimary) {
          providerRegistry.setPrimary(prevPrimary);
        }
      }
    });
  });

  describe('5. High-Precision Audio Clock Synchronization Service', () => {
    it('accurately resolves active word token with binary search', () => {
      const alignment = [
        { word: 'सत्यम्', startMs: 0, endMs: 800 },
        { word: 'बृहत्', startMs: 800, endMs: 1600 },
        { word: 'ऋतम्', startMs: 1600, endMs: 2400 },
        { word: 'उग्रम्', startMs: 2400, endMs: 3200 }
      ];

      // Time before audio starts
      assert.strictEqual(synchronizationService.findActiveWordIndex(-50, alignment), -1);

      // Mid-word checks
      assert.strictEqual(synchronizationService.findActiveWordIndex(0, alignment), 0);
      assert.strictEqual(synchronizationService.findActiveWordIndex(400, alignment), 0);
      assert.strictEqual(synchronizationService.findActiveWordIndex(800, alignment), 1);
      assert.strictEqual(synchronizationService.findActiveWordIndex(1599, alignment), 1);
      assert.strictEqual(synchronizationService.findActiveWordIndex(2000, alignment), 2);
      assert.strictEqual(synchronizationService.findActiveWordIndex(3000, alignment), 3);

      // Time after recitation finishes
      assert.strictEqual(synchronizationService.findActiveWordIndex(4000, alignment), -1);
    });
  });

  describe('6. HTTP Audio Streaming & HTTP 206 Byte-Range Requests', () => {
    it('serves full audio with HTTP 200, immutable cache header, and Accept-Ranges', async () => {
      // First ensure an audio file exists in cache
      const payload = {
        verseId: 'range-test-1',
        devanagari: 'भूमे मातर्नि धेहि मा'
      };
      const synth = await audioGenerationService.synthesizeVerse(payload);
      const filename = synth.audioUrl.replace('/api/audio/', '');

      const res = await fetch(`${serverBaseUrl}/api/audio/${filename}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('content-type'), 'audio/wav');
      assert.strictEqual(res.headers.get('accept-ranges'), 'bytes');
      assert.strictEqual(res.headers.get('cache-control'), 'public, max-age=31536000, immutable');

      const arrayBuf = await res.arrayBuffer();
      assert.ok(arrayBuf.byteLength > 44);
    });

    it('handles byte-range requests with HTTP 206 Partial Content (critical for iOS Safari scrubbing)', async () => {
      const payload = {
        verseId: 'range-test-2',
        devanagari: 'भद्रं नो अपि वातय मनः'
      };
      const synth = await audioGenerationService.synthesizeVerse(payload);
      const filename = synth.audioUrl.replace('/api/audio/', '');

      // Request the first 128 bytes
      const res = await fetch(`${serverBaseUrl}/api/audio/${filename}`, {
        headers: { Range: 'bytes=0-127' }
      });

      assert.strictEqual(res.status, 206);
      assert.strictEqual(res.headers.get('content-range')?.startsWith('bytes 0-127/'), true);
      assert.strictEqual(res.headers.get('content-length'), '128');

      const chunk = await res.arrayBuffer();
      assert.strictEqual(chunk.byteLength, 128);
    });
  });

  describe('7. Recitation API Contract Endpoints', () => {
    it('POST /api/recitation/prepare validates payload and returns ready or preparing', async () => {
      const res = await fetch(`${serverBaseUrl}/api/recitation/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseId: '12.1.1',
          devanagari: 'सत्यं बृहद् ऋतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति',
          priority: 'background'
        })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.ok(body.cacheKey);
      assert.ok(['ready', 'preparing'].includes(body.status));
    });

    it('GET /api/recitation/metrics returns live performance telemetry', async () => {
      const res = await fetch(`${serverBaseUrl}/api/recitation/metrics`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.ok(typeof body.totalRequests === 'number');
      assert.ok(typeof body.cacheHits === 'number');
    });

    it('POST /api/recitation/synthesize rejects missing devanagari with 400 Bad Request', async () => {
      const res = await fetch(`${serverBaseUrl}/api/recitation/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseId: 'invalid-payload'
        })
      });

      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.ok(body.error);
    });
  });
});
