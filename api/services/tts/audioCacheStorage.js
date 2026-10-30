/**
 * Persistent Audio Cache & Storage Service
 * 
 * Manages durable audio file persistence and metadata indexing.
 * Generates content-addressed cache keys:
 *   hash(verseId + devanagari + textVersion + engine + modelVersion + voiceId)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class AudioCacheStorage {
  constructor(storageDir) {
    if (storageDir) {
      this.storageDir = storageDir;
    } else if (process.env.NODE_ENV === 'production') {
      this.storageDir = '/tmp/sutra_audio_cache';
    } else {
      this.storageDir = path.join(__dirname, '..', '..', '..', 'public', 'audio_cache');
    }

    this.ensureStorageDir();
    this.memoryIndex = new Map();
    this.loadIndex();
  }

  ensureStorageDir() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
    } catch (err) {
      console.warn(`[AudioCacheStorage] Failed to create storage dir ${this.storageDir}:`, err.message);
    }
  }

  loadIndex() {
    try {
      const indexPath = path.join(this.storageDir, 'index.json');
      if (fs.existsSync(indexPath)) {
        const raw = fs.readFileSync(indexPath, 'utf8');
        const data = JSON.parse(raw);
        for (const [key, val] of Object.entries(data)) {
          this.memoryIndex.set(key, val);
        }
      }
    } catch {
      // fresh index
    }
  }

  saveIndex() {
    try {
      const indexPath = path.join(this.storageDir, 'index.json');
      const obj = Object.fromEntries(this.memoryIndex);
      fs.writeFileSync(indexPath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('[AudioCacheStorage] Failed to write index:', err.message);
    }
  }

  /**
   * Content-addressed cache key derivation
   */
  computeCacheKey({ verseId, devanagari, textVersion = 'v1', engine = 'local-acoustic', modelVersion = '1.0', voiceId = 'default' }) {
    const canonicalString = `${verseId}::${(devanagari || '').trim()}::${textVersion}::${engine}::${modelVersion}::${voiceId}`;
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex').substring(0, 32);
  }

  /**
   * Check if cache entry exists and is ready
   */
  get(cacheKey) {
    if (this.memoryIndex.has(cacheKey)) {
      const meta = this.memoryIndex.get(cacheKey);
      const audioPath = path.join(this.storageDir, `${cacheKey}.${meta.extension || 'wav'}`);
      if (fs.existsSync(audioPath)) {
        return {
          ...meta,
          audioPath,
          audioUrl: `/api/audio/${cacheKey}.${meta.extension || 'wav'}`
        };
      }
    }
    return null;
  }

  /**
   * Save generated audio asset and metadata
   */
  async put(cacheKey, { audioBuffer, format = 'audio/wav', durationMs = 0, alignmentTimestamps = [], provider, modelVersion, verseId, textVersion = 'v1' }) {
    this.ensureStorageDir();
    const extension = format.includes('mp3') ? 'mp3' : 'wav';
    const filename = `${cacheKey}.${extension}`;
    const audioPath = path.join(this.storageDir, filename);

    // Write audio file to disk
    await fs.promises.writeFile(audioPath, audioBuffer);

    // Save metadata
    const metadata = {
      cacheKey,
      verseId,
      filename,
      extension,
      format,
      durationMs,
      alignmentTimestamps,
      provider: provider || 'unknown',
      modelVersion: modelVersion || '1.0',
      textVersion,
      createdAt: new Date().toISOString(),
      sizeBytes: audioBuffer.length
    };

    this.memoryIndex.set(cacheKey, metadata);
    this.saveIndex();

    return {
      ...metadata,
      audioPath,
      audioUrl: `/api/audio/${filename}`
    };
  }

  /**
   * Read raw audio buffer from cache
   */
  async getAudioStreamOrBuffer(filename) {
    const filePath = path.join(this.storageDir, filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.promises.readFile(filePath);
  }

  /**
   * Invalidate cache entry
   */
  invalidate(cacheKey) {
    if (this.memoryIndex.has(cacheKey)) {
      const meta = this.memoryIndex.get(cacheKey);
      const audioPath = path.join(this.storageDir, `${cacheKey}.${meta.extension || 'wav'}`);
      try {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      } catch {
        // ignore
      }
      this.memoryIndex.delete(cacheKey);
      this.saveIndex();
      return true;
    }
    return false;
  }

  /**
   * Clear all cached files (for tests or manual cache purge)
   */
  clear() {
    this.memoryIndex.clear();
    try {
      const files = fs.readdirSync(this.storageDir);
      for (const f of files) {
        fs.unlinkSync(path.join(this.storageDir, f));
      }
    } catch {
      // ignore
    }
  }
}

export const audioCacheStorage = new AudioCacheStorage();
export default audioCacheStorage;
