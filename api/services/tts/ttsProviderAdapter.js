/**
 * TTS Provider Adapter Interface and Registry
 * 
 * Allows the underlying Sanskrit speech/chanting synthesis engine
 * (e.g., Vāgdhenu, Neural Vedic Stream, Local Acoustic Synthesizer, Mock)
 * to be swapped or cascaded without changing frontend or API contracts.
 */

import { BaseTTSProvider } from './baseTTSProvider.js';
export { BaseTTSProvider };

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.primaryProviderName = null;
  }

  register(provider, isPrimary = false) {
    this.providers.set(provider.name, provider);
    if (isPrimary || !this.primaryProviderName) {
      this.primaryProviderName = provider.name;
    }
  }

  get(name) {
    return this.providers.get(name) || null;
  }

  getPrimary() {
    return this.providers.get(this.primaryProviderName) || null;
  }

  getAll() {
    return Array.from(this.providers.values());
  }

  setPrimary(name) {
    if (this.providers.has(name)) {
      this.primaryProviderName = name;
      return true;
    }
    return false;
  }
}

export const providerRegistry = new ProviderRegistry();

// Initialize default providers
import { localAcousticProvider } from './providers/localAcousticProvider.js';
import { vagdhenuProvider } from './providers/vagdhenuProvider.js';
import { mockTTSProvider } from './providers/mockProvider.js';

providerRegistry.register(localAcousticProvider, true);
providerRegistry.register(vagdhenuProvider, false);
providerRegistry.register(mockTTSProvider, false);

export default providerRegistry;
