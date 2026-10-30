/**
 * Base TTS Provider Abstract Interface
 */

export class BaseTTSProvider {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
  }

  async isAvailable() {
    return true;
  }

  /**
   * Synthesize Sanskrit verse text into an audio buffer and word-level alignment timestamps.
   * @param {Object} payload
   * @param {string} payload.verseId
   * @param {string} payload.devanagari
   * @param {string} payload.iast
   * @param {Array<{ text: string, root?: string, gloss?: string, swara?: string[] }>} payload.words
   * @param {string} payload.meter
   * @param {Object} [payload.options]
   * @returns {Promise<{ audioBuffer: Buffer, contentType: string, durationMs: number, alignmentTimestamps: Array<{ word: string, startMs: number, endMs: number, svara?: string }> }>}
   */
  async synthesize(_payload) {
    throw new Error(`synthesize() not implemented in provider ${this.name}`);
  }
}

export default BaseTTSProvider;
