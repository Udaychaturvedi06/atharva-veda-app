/**
 * Vāgdhenu Sanskrit Chanting TTS Provider Adapter
 * 
 * Communicates with an external high-performance Sanskrit verse synthesis worker
 * (e.g., self-hosted Vāgdhenu / FastSpeech2 Sanskrit instance or managed Bhashini Sanskrit API).
 * 
 * Falls back seamlessly to LocalAcousticProvider if the external service is unconfigured,
 * times out, or encounters a cold-start network failure.
 */

import { BaseTTSProvider } from '../baseTTSProvider.js';
import { localAcousticProvider } from './localAcousticProvider.js';

export class VagdhenuProvider extends BaseTTSProvider {
  constructor() {
    super('vagdhenu-sanskrit-neural', '1.2.0');
    this.apiUrl = process.env.VAGDHENU_API_URL || null;
    this.apiKey = process.env.VAGDHENU_API_KEY || null;
    this.timeoutMs = parseInt(process.env.VAGDHENU_TIMEOUT_MS || '4500', 10);
  }

  async isAvailable() {
    return Boolean(this.apiUrl);
  }

  async synthesize(payload) {
    if (!this.apiUrl) {
      // If external GPU worker is not configured in this environment, fallback to verified local acoustic engine
      return localAcousticProvider.synthesize(payload);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.apiUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          verseId: payload.verseId,
          text: payload.devanagari,
          iast: payload.iast,
          meter: payload.meter,
          words: payload.words
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Vāgdhenu server responded with HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'audio/wav';
      const durationHeader = response.headers.get('x-audio-duration-ms');
      const timingHeader = response.headers.get('x-alignment-timestamps');

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      let alignmentTimestamps = [];
      if (timingHeader) {
        try {
          alignmentTimestamps = JSON.parse(timingHeader);
        } catch {
          // ignore parsing error
        }
      }

      // If remote service does not provide alignment metadata, compute meter-based alignment
      if (alignmentTimestamps.length === 0 && payload.words) {
        const estDurationMs = durationHeader ? parseInt(durationHeader, 10) : 8000;
        const step = Math.floor(estDurationMs / payload.words.length);
        alignmentTimestamps = payload.words.map((w, idx) => ({
          word: w.text,
          startMs: idx * step,
          endMs: (idx + 1) * step - 50,
          svara: w.swara?.[0] || 'udatta'
        }));
      }

      return {
        provider: this.name,
        verseId: payload.verseId,
        format: contentType,
        contentType,
        durationMs: durationHeader ? parseInt(durationHeader, 10) : Math.round(audioBuffer.length / 88.2),
        audioBuffer,
        alignmentTimestamps
      };
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[VāgdhenuProvider] Remote synthesis failed (${err.message}). Activating local acoustic failover.`);
      return localAcousticProvider.synthesize(payload);
    }
  }
}

export const vagdhenuProvider = new VagdhenuProvider();
export default vagdhenuProvider;
