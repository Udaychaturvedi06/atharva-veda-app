/**
 * Audio Generation Service & JIT Orchestrator
 * 
 * Features:
 * 1. Single-Flight Concurrency Lock (prevents duplicate generation of the same cache key).
 * 2. Background Asynchronous Preparation (triggered as soon as a verse opens).
 * 3. Cache-First Resolution with < 10ms lookup.
 * 4. Multi-Provider Fallback Cascade.
 * 5. Performance Metrics & Instrumentation Logging.
 */

import { providerRegistry } from './ttsProviderAdapter.js';
import { audioCacheStorage } from './audioCacheStorage.js';

class AudioGenerationService {
  constructor() {
    this.storage = audioCacheStorage;
    this.registry = providerRegistry;
    this.pendingJobs = new Map(); // cacheKey -> Promise<{ ...metadata }>
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0,
      generationTimesMs: [],
      duplicatePreventedCount: 0
    };
  }

  getMetrics() {
    const times = this.metrics.generationTimesMs;
    const avgGenTime = times.length > 0 
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) 
      : 0;
    const p95GenTime = times.length > 0
      ? [...times].sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
      : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      hitRatePercent: this.metrics.totalRequests > 0 
        ? Math.round((this.metrics.cacheHits / this.metrics.totalRequests) * 100) 
        : 0,
      duplicatePreventedCount: this.metrics.duplicatePreventedCount,
      avgGenerationTimeMs: avgGenTime,
      p95GenerationTimeMs: p95GenTime
    };
  }

  /**
   * Check cache or prepare verse in background.
   */
  async prepareVerse(payload, options = {}) {
    this.metrics.totalRequests++;
    const provider = this.registry.getPrimary();
    const cacheKey = this.storage.computeCacheKey({
      verseId: payload.verseId || `${payload.book}.${payload.hymn}.${payload.verse || 1}`,
      devanagari: payload.devanagari,
      textVersion: payload.textVersion || 'v1',
      engine: provider.name,
      modelVersion: provider.version,
      voiceId: options.voiceId || 'default'
    });

    // 1. Check persistent cache (Hit)
    const cached = this.storage.get(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return {
        status: 'ready',
        isCached: true,
        cacheKey,
        audioUrl: cached.audioUrl,
        durationMs: cached.durationMs,
        alignmentTimestamps: cached.alignmentTimestamps,
        engine: cached.provider,
        modelVersion: cached.modelVersion
      };
    }

    this.metrics.cacheMisses++;

    // 2. Check if a generation job is already in flight for this exact cache key (Single-flight lock)
    if (this.pendingJobs.has(cacheKey)) {
      this.metrics.duplicatePreventedCount++;
      if (options.priority === 'high') {
        // User tapped Recite: await the shared generation job
        const result = await this.pendingJobs.get(cacheKey);
        return {
          status: 'ready',
          isCached: false,
          ...result
        };
      }
      return {
        status: 'preparing',
        isCached: false,
        cacheKey
      };
    }

    // 3. Launch generation job
    const jobPromise = this.executeGeneration(cacheKey, provider, payload, options);
    this.pendingJobs.set(cacheKey, jobPromise);

    if (options.priority === 'high') {
      const result = await jobPromise;
      return {
        status: 'ready',
        isCached: false,
        ...result
      };
    }

    // Background preparation: return immediately so UI is not blocked
    return {
      status: 'preparing',
      isCached: false,
      cacheKey
    };
  }

  /**
   * Internal execution pipeline with timing and storage
   */
  async executeGeneration(cacheKey, provider, payload, options) {
    const startTime = Date.now();
    let activeProvider = provider;
    let synthResult;

    try {
      try {
        synthResult = await activeProvider.synthesize({
          verseId: payload.verseId || `${payload.book}.${payload.hymn}.${payload.verse || 1}`,
          devanagari: payload.devanagari,
          iast: payload.iast,
          words: payload.words,
          meter: payload.meter,
          options
        });
      } catch (primaryErr) {
        console.warn(`[AudioGenerationService] Provider ${activeProvider.name} failed (${primaryErr.message}). Initiating fallback cascade...`);
        const fallbackProvider = this.registry.get('local-acoustic-vedic');
        if (fallbackProvider && fallbackProvider !== activeProvider) {
          activeProvider = fallbackProvider;
          synthResult = await fallbackProvider.synthesize({
            verseId: payload.verseId || `${payload.book}.${payload.hymn}.${payload.verse || 1}`,
            devanagari: payload.devanagari,
            iast: payload.iast,
            words: payload.words,
            meter: payload.meter,
            options
          });
        } else {
          throw primaryErr;
        }
      }

      const genDuration = Date.now() - startTime;
      this.metrics.generationTimesMs.push(genDuration);

      // Save to persistent cache
      const stored = await this.storage.put(cacheKey, {
        audioBuffer: synthResult.audioBuffer,
        format: synthResult.contentType || 'audio/wav',
        durationMs: synthResult.durationMs,
        alignmentTimestamps: synthResult.alignmentTimestamps,
        provider: activeProvider.name,
        modelVersion: activeProvider.version,
        verseId: payload.verseId,
        textVersion: payload.textVersion || 'v1'
      });

      return {
        cacheKey,
        audioUrl: stored.audioUrl,
        durationMs: stored.durationMs,
        alignmentTimestamps: stored.alignmentTimestamps,
        engine: activeProvider.name,
        modelVersion: activeProvider.version,
        generationTimeMs: genDuration
      };
    } finally {
      // Clear from pending map
      this.pendingJobs.delete(cacheKey);
    }
  }

  /**
   * Direct on-demand synthesis request
   */
  async synthesizeVerse(payload, options = {}) {
    return this.prepareVerse(payload, { ...options, priority: 'high' });
  }

  /**
   * Check status of audio generation
   */
  getStatus(cacheKey) {
    const cached = this.storage.get(cacheKey);
    if (cached) {
      return {
        status: 'ready',
        cacheKey,
        audioUrl: cached.audioUrl,
        durationMs: cached.durationMs,
        alignmentTimestamps: cached.alignmentTimestamps
      };
    }
    if (this.pendingJobs.has(cacheKey)) {
      return { status: 'preparing', cacheKey };
    }
    return { status: 'not_found', cacheKey };
  }
}

export const audioGenerationService = new AudioGenerationService();
export default audioGenerationService;
