/**
 * Playback Synchronization Service
 * 
 * Synchronizes displayed Sanskrit word tokens and verse text
 * directly against the HTMLAudioElement clock (not a disconnected timer).
 * 
 * Features:
 * - Binary search lookup for active word token in O(log N).
 * - Drift-free tracking through seek, replay, and speed changes (0.75x, 1.25x).
 * - High-cadence rAF ticker during active playback for fluid progress scrubbers.
 */

export class SynchronizationService {
  constructor() {
    this.audio = null;
    this.alignmentTimestamps = [];
    this.listeners = new Set();
    this.rafId = null;
    this.activeWordIndex = -1;
  }

  attach(audioElement, alignmentTimestamps = []) {
    this.detach();
    this.audio = audioElement;
    this.alignmentTimestamps = Array.isArray(alignmentTimestamps) ? alignmentTimestamps : [];
    this.activeWordIndex = -1;

    if (!this.audio) return;

    this.onTimeUpdate = () => this.tick();
    this.onSeeked = () => this.tick();
    this.onPlay = () => this.startTicker();
    this.onPause = () => this.stopTicker();
    this.onEnded = () => {
      this.stopTicker();
      this.activeWordIndex = -1;
      this.notify({ activeWordIndex: -1, currentMs: 0, progressPercent: 100 });
    };

    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
    this.audio.addEventListener('seeked', this.onSeeked);
    this.audio.addEventListener('play', this.onPlay);
    this.audio.addEventListener('pause', this.onPause);
    this.audio.addEventListener('ended', this.onEnded);

    if (!this.audio.paused) {
      this.startTicker();
    }
  }

  detach() {
    this.stopTicker();
    if (this.audio) {
      this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
      this.audio.removeEventListener('seeked', this.onSeeked);
      this.audio.removeEventListener('play', this.onPlay);
      this.audio.removeEventListener('pause', this.onPause);
      this.audio.removeEventListener('ended', this.onEnded);
      this.audio = null;
    }
    this.alignmentTimestamps = [];
    this.activeWordIndex = -1;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(data) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.warn('[SyncService] Listener error:', err);
      }
    }
  }

  startTicker() {
    this.stopTicker();
    const loop = () => {
      this.tick();
      if (this.audio && !this.audio.paused && !this.audio.ended) {
        this.rafId = requestAnimationFrame(loop);
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stopTicker() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick() {
    if (!this.audio) return;

    const currentMs = Math.round(this.audio.currentTime * 1000);
    const totalMs = Math.round((this.audio.duration || 0) * 1000);
    const progressPercent = totalMs > 0 ? Math.min(100, (currentMs / totalMs) * 100) : 0;

    // Binary search over alignment timestamps
    const wordIdx = this.findActiveWordIndex(currentMs);
    if (wordIdx !== this.activeWordIndex) {
      this.activeWordIndex = wordIdx;
    }

    this.notify({
      currentMs,
      totalMs,
      progressPercent,
      activeWordIndex: this.activeWordIndex,
      activeWord: this.alignmentTimestamps[this.activeWordIndex] || null
    });
  }

  /**
   * O(log N) binary search for active word by millisecond offset
   */
  findActiveWordIndex(currentMs, list = this.alignmentTimestamps) {
    if (!list || list.length === 0) return -1;

    let low = 0;
    let high = list.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const item = list[mid];

      if (currentMs >= item.startMs && currentMs <= item.endMs) {
        return mid;
      } else if (currentMs < item.startMs) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return -1;
  }
}

export const synchronizationService = new SynchronizationService();
export default synchronizationService;
