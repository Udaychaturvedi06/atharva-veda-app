/**
 * Mock TTS Provider for Hermetic, Deterministic Automated Testing
 */

import { BaseTTSProvider } from '../baseTTSProvider.js';

export class MockTTSProvider extends BaseTTSProvider {
  constructor() {
    super('mock-tts-provider', '1.0.0');
  }

  async isAvailable() {
    return true;
  }

  async synthesize({ verseId = 'mock-1-1-1', devanagari = 'ॐ', words = [] }) {
    // Return a minimal valid 44-byte silent RIFF WAV buffer
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(44100, 24);
    header.writeUInt32LE(88200, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(0, 40);

    const tokens = words && words.length > 0 ? words : [{ text: devanagari }];
    const alignmentTimestamps = tokens.map((w, idx) => ({
      word: w.text || w,
      startMs: idx * 300,
      endMs: (idx + 1) * 300 - 50,
      svara: w.swara?.[0] || 'udatta'
    }));

    return {
      provider: this.name,
      verseId,
      format: 'audio/wav',
      contentType: 'audio/wav',
      durationMs: tokens.length * 300,
      audioBuffer: header,
      alignmentTimestamps
    };
  }
}

export const mockTTSProvider = new MockTTSProvider();
export default mockTTSProvider;
