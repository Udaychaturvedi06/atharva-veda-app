/**
 * Frontend Recitation Playback Controller
 * 
 * Production-grade playback orchestrator for Vedic recitation.
 * Manages HTMLAudioElement lifecycle, bounded LRU client cache,
 * JIT background preparation, and drift-free synchronisation.
 * 
 * States:
 *   'idle' -> 'checking-cache' -> 'preparing' -> 'ready' -> 'playing' -> 'paused' -> 'ended' -> 'error'
 */

import { synchronizationService } from './synchronizationService.js';
import { recitationEngine } from '../../utils/recitationEngine.js';

class PlaybackController {
  constructor() {
    this.audio = null;
    this.sync = synchronizationService;
    this.state = 'idle'; // 'idle' | 'checking-cache' | 'preparing' | 'ready' | 'playing' | 'paused' | 'ended' | 'error'
    this.currentVerseId = null;
    this.currentPayload = null;
    this.currentMetadata = null;
    this.autoPlayWhenReady = false;
    this.playbackSpeed = 1.0;
    this.volume = 1.0;
    this.listeners = new Set();
    this.abortController = null;
    this.isClientFallback = false;
    this.clientTimerId = null;

    // Bounded Client Cache (LRU Map, max 15 verses in memory)
    this.clientCache = new Map();
    this.maxCacheSize = 15;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('[PlaybackController] Listener error:', err);
      }
    }
  }

  getSnapshot() {
    return {
      state: this.state,
      verseId: this.currentVerseId,
      metadata: this.currentMetadata,
      autoPlayWhenReady: this.autoPlayWhenReady,
      playbackSpeed: this.playbackSpeed,
      volume: this.volume,
      isPlaying: this.state === 'playing',
      isPaused: this.state === 'paused',
      isReady: this.state === 'ready' || this.state === 'playing' || this.state === 'paused',
      isPreparing: this.state === 'preparing' || this.state === 'checking-cache'
    };
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.notify();
    }
  }

  /**
   * Bounded Client Cache Lookup
   */
  getFromClientCache(cacheKey) {
    if (this.clientCache.has(cacheKey)) {
      // Re-insert to mark as recently used (LRU)
      const val = this.clientCache.get(cacheKey);
      this.clientCache.delete(cacheKey);
      this.clientCache.set(cacheKey, val);
      return val;
    }
    return null;
  }

  saveToClientCache(cacheKey, data) {
    if (this.clientCache.size >= this.maxCacheSize) {
      // Evict oldest entry
      const oldestKey = this.clientCache.keys().next().value;
      this.clientCache.delete(oldestKey);
    }
    this.clientCache.set(cacheKey, data);
  }

  /**
   * Activate Client-Side Speech & Acoustic Fallback
   * Ensures uninterrupted chanting even when offline or backend unreachable
   */
  initClientSpeech(verseData) {
    if (!verseData) return;
    this.isClientFallback = true;
    this.currentPayload = verseData;
    const devText = (verseData.devanagari || verseData.sanskrit || verseData.displayText || '').trim();
    const words = Array.isArray(verseData.words) && verseData.words.length > 0
      ? verseData.words
      : devText.split(/\s+/).map((w) => ({ text: w, gloss: 'Vedic pada', swara: ['udatta'] }));

    this.currentMetadata = {
      provider: 'client-acoustic-vedic',
      durationMs: Math.max(5000, words.length * 900),
      format: 'web-speech-resonance',
      words
    };

    this.setState('ready');

    if (this.autoPlayWhenReady) {
      this.autoPlayWhenReady = false;
      this.play();
    }
  }

  /**
   * JIT Background Preparation
   * Called immediately as soon as a verse opens.
   */
  async prepareVerse(verseData, options = {}) {
    if (!verseData) return;

    const verseId = verseData.ref || verseData.id || `${verseData.book}.${verseData.hymn}.${verseData.verse || 1}`;

    // If already prepared or playing this exact verse, don't restart
    if (this.currentVerseId === verseId && (this.state === 'ready' || this.state === 'playing')) {
      return;
    }

    // Cancel any previous in-flight HTTP request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.currentVerseId = verseId;
    this.currentPayload = verseData;
    this.isClientFallback = false;
    this.setState('checking-cache');

    const devanagari = (verseData.devanagari || verseData.sanskrit || verseData.displayText || '').trim();
    if (!devanagari) {
      this.initClientSpeech(verseData);
      return;
    }

    try {
      const res = await fetch('/api/recitation/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseId,
          devanagari,
          iast: verseData.iast || verseData.displayText,
          words: verseData.words,
          meter: verseData.meter,
          priority: options.priority || 'background'
        }),
        signal: this.abortController.signal
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (this.currentVerseId !== verseId) return; // Discard obsolete response

      if (data.status === 'ready' && data.audioUrl) {
        this.saveToClientCache(data.cacheKey, data);
        await this.loadAudio(data.audioUrl, data.alignmentTimestamps, data);
      } else {
        // Asynchronous preparation underway on server; poll or await
        this.setState('preparing');
        this.pollForReady(data.cacheKey, verseId);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[PlaybackController] Backend recitation unavailable, falling back to client acoustic engine:', err.message);
      this.initClientSpeech(verseData);
    }
  }

  /**
   * Poll generation status with exponential backoff (max 5 attempts before client fallback)
   */
  async pollForReady(cacheKey, verseId, attempts = 0) {
    if (this.currentVerseId !== verseId) return;

    if (attempts >= 10) {
      console.warn('[PlaybackController] Polling timeout, falling back to client acoustic engine.');
      this.initClientSpeech(this.currentPayload);
      return;
    }

    await new Promise((r) => setTimeout(r, Math.min(300 + attempts * 100, 1000)));
    if (this.currentVerseId !== verseId) return;

    try {
      const res = await fetch(`/api/recitation/status/${cacheKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ready' && data.audioUrl) {
          this.saveToClientCache(cacheKey, data);
          await this.loadAudio(data.audioUrl, data.alignmentTimestamps, data);
          return;
        }
      }
    } catch {
      // retry
    }

    this.pollForReady(cacheKey, verseId, attempts + 1);
  }

  /**
   * Load audio element and bind synchronization service
   */
  async loadAudio(audioUrl, alignmentTimestamps, metadata) {
    if (this.audio) {
      this.sync.detach();
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
    }

    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = audioUrl;
    audio.playbackRate = this.playbackSpeed;
    audio.volume = this.volume;

    this.audio = audio;
    this.currentMetadata = metadata;
    this.sync.attach(audio, alignmentTimestamps);

    audio.onended = () => {
      this.setState('ended');
    };

    audio.onerror = (e) => {
      console.warn('[PlaybackController] Audio element error:', e);
      this.setState('error');
    };

    audio.onpause = () => {
      if (this.state === 'playing') {
        this.setState('paused');
      }
    };

    audio.onplay = () => {
      this.setState('playing');
    };

    this.setState('ready');

    // If user tapped Recite while preparation was in-flight, immediately trigger playback!
    if (this.autoPlayWhenReady) {
      this.autoPlayWhenReady = false;
      this.play();
    }
  }

  /**
   * User Action: Play / Recite
   */
  async play() {
    if (this.state === 'playing') return;

    // Client speech synthesis fallback path
    if (this.isClientFallback) {
      const devText = (this.currentPayload?.devanagari || this.currentPayload?.sanskrit || this.currentPayload?.displayText || '').trim();
      const words = this.currentMetadata?.words || devText.split(/\s+/).map((w) => ({ text: w, gloss: 'Vedic pada', swara: ['udatta'] }));
      const durationMs = this.currentMetadata?.durationMs || Math.max(5000, words.length * 900);
      let startTime = Date.now();

      if (this.clientTimerId) {
        clearInterval(this.clientTimerId);
        this.clientTimerId = null;
      }

      recitationEngine.recite(devText, {
        rate: this.playbackSpeed * 0.82,
        volume: this.volume,
        phoneticFallback: this.currentPayload?.iast,
        onStart: () => {
          startTime = Date.now();
          this.setState('playing');
          // Simulated high-frequency audio clock for word token tracking
          this.clientTimerId = setInterval(() => {
            if (this.state !== 'playing') {
              clearInterval(this.clientTimerId);
              return;
            }
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / durationMs);
            const activeIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
            this.sync.notifyTiming({
              currentMs: elapsed,
              totalMs: durationMs,
              progressPercent: progress * 100,
              activeWordIndex: activeIdx,
              activeWord: words[activeIdx] || null
            });
          }, 50);
        },
        onEnd: () => {
          if (this.clientTimerId) clearInterval(this.clientTimerId);
          this.sync.notifyTiming({
            currentMs: durationMs,
            totalMs: durationMs,
            progressPercent: 100,
            activeWordIndex: words.length - 1,
            activeWord: words[words.length - 1] || null
          });
          this.setState('ended');
        },
        onError: (err) => {
          if (this.clientTimerId) clearInterval(this.clientTimerId);
          console.warn('[PlaybackController] Client recitation error:', err);
          this.setState('ready');
        }
      });
      return;
    }

    if (this.state === 'ready' && this.audio) {
      try {
        await this.audio.play();
        this.setState('playing');
      } catch (err) {
        console.warn('[PlaybackController] Autoplay prevented, falling back to client speech:', err.message);
        this.initClientSpeech(this.currentPayload);
      }
      return;
    }

    if (this.state === 'paused' && this.audio) {
      this.resume();
      return;
    }

    if (this.state === 'ended' && this.audio) {
      this.replay();
      return;
    }

    // Audio is still preparing: record intent so it plays immediately upon arrival
    if (this.state === 'preparing' || this.state === 'checking-cache' || this.state === 'idle') {
      this.autoPlayWhenReady = true;
      if (this.currentPayload) {
        this.prepareVerse(this.currentPayload, { priority: 'high' });
      }
      this.notify();
    }
  }

  pause() {
    if (this.isClientFallback) {
      if (this.clientTimerId) clearInterval(this.clientTimerId);
      recitationEngine.pause();
      this.setState('paused');
      return;
    }
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.setState('paused');
    }
  }

  resume() {
    if (this.isClientFallback) {
      recitationEngine.resume();
      this.setState('playing');
      return;
    }
    if (this.audio && this.audio.paused) {
      this.audio.play().then(() => {
        this.setState('playing');
      }).catch((err) => {
        console.warn('Resume error:', err);
      });
    }
  }

  replay() {
    if (this.isClientFallback) {
      if (this.clientTimerId) clearInterval(this.clientTimerId);
      recitationEngine.stop();
      this.setState('ready');
      this.play();
      return;
    }
    if (this.audio) {
      this.audio.currentTime = 0;
      this.play();
    }
  }

  seek(timeSeconds) {
    if (this.audio && Number.isFinite(timeSeconds)) {
      this.audio.currentTime = Math.max(0, Math.min(timeSeconds, this.audio.duration || 0));
    }
  }

  setSpeed(rate) {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.playbackSpeed = clamped;
    if (this.audio) {
      this.audio.playbackRate = clamped;
    }
    this.notify();
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1.0, vol));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
    }
    this.notify();
  }

  /**
   * Cleanup on unmount or navigation
   */
  cleanup() {
    if (this.isClientFallback) {
      if (this.clientTimerId) clearInterval(this.clientTimerId);
      recitationEngine.stop();
      this.isClientFallback = false;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.audio) {
      this.sync.detach();
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.autoPlayWhenReady = false;
    this.currentVerseId = null;
    this.currentPayload = null;
    this.currentMetadata = null;
    this.setState('idle');
  }
}

export const playbackController = new PlaybackController();
export default playbackController;
