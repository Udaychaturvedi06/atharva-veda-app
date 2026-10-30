/**
 * Authentic Vedic Recitation Engine & Acoustic Resonance System
 * 
 * Provides:
 * 1. Web Speech API synthesis tuned for Vedic Sanskrit / Hindi recitation.
 * 2. Real-time word boundary synchronization for visual syllable tracking.
 * 3. Harmonic Tanpura acoustic drone (Sa = 146.83 Hz / Pa = 220.25 Hz).
 * 4. Real-time WebAudio microphone resonance analyzer (replaces fake pitch scores).
 */

class RecitationEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.droneAudioCtx = null;
    this.droneNodes = [];
    this.micAudioCtx = null;
    this.micStream = null;
    this.micAnalyser = null;
    this.micRafId = null;
  }

  isSupported() {
    return Boolean(this.synth);
  }

  /**
   * Find the best suitable voice for Sanskrit / Vedic chanting.
   * Prioritizes Sanskrit (sa), Hindi (hi-IN), Marathi (mr-IN), or native multilingual Indian voices.
   */
  getBestVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // Preference hierarchy
    const saVoice = voices.find(v => v.lang.startsWith('sa'));
    if (saVoice) return saVoice;

    const hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
    if (hiVoice) return hiVoice;

    const mrVoice = voices.find(v => v.lang.startsWith('mr'));
    if (mrVoice) return mrVoice;

    const inVoice = voices.find(v => v.lang.endsWith('-IN'));
    if (inVoice) return inVoice;

    return voices[0];
  }

  /**
   * Recite Vedic text with optional word boundary synchronization.
   */
  recite(text, options = {}) {
    if (!this.synth) {
      if (options.onError) options.onError(new Error('Web Speech Synthesis is not supported in this browser.'));
      return;
    }

    // Stop any ongoing speech
    this.stop();

    // Clean text for speech synthesis (strip danda bars and accent marks for clear speech phonetics)
    const cleanText = text
      .replace(/[॥।_|]/g, ' ')
      .replace(/\u0951/g, '')
      .replace(/\u0952/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.rate = options.rate || 0.85; // Slow, measured Vedic cadence
    utterance.pitch = options.pitch || 0.95; // Slightly grounded pitch
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      // 'canceled' or 'interrupted' is normal when user hits stop
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Recitation speech error:', e.error);
        if (options.onError) options.onError(e);
      }
    };

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onBoundary({
            charIndex: event.charIndex,
            charLength: event.charLength || 0,
            elapsedTime: event.elapsedTime
          });
        }
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);

    // Chrome bug workaround: speechSynthesis may stall on long texts without periodic resume
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  // --- Harmonic Tanpura Acoustic Drone (Sa-Pa Drone) ---

  startDrone(rootFreq = 146.83) {
    if (typeof window === 'undefined') return;
    this.stopDrone();

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.droneAudioCtx = new AudioCtx();
      const now = this.droneAudioCtx.currentTime;

      const masterGain = this.droneAudioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
      masterGain.connect(this.droneAudioCtx.destination);

      // Filter to simulate hollow gourd tanpura resonance
      const filter = this.droneAudioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.connect(masterGain);

      // Tanpura standard strings: Pa (Fifth, 1.5x), Middle Sa (2.0x), High Sa (2.0x), Low Kharaj Sa (1.0x)
      const freqs = [rootFreq * 1.5, rootFreq * 2.0, rootFreq * 2.002, rootFreq];

      freqs.forEach((freq, idx) => {
        const osc = this.droneAudioCtx.createOscillator();
        const gain = this.droneAudioCtx.createGain();

        osc.type = idx === 3 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle cyclic detuning / beating
        gain.gain.setValueAtTime(0.25, now);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(now);

        this.droneNodes.push({ osc, gain });
      });

      this.droneMasterGain = masterGain;
    } catch (e) {
      console.warn('Failed to start Tanpura drone:', e.message);
    }
  }

  stopDrone() {
    if (this.droneAudioCtx) {
      try {
        const now = this.droneAudioCtx.currentTime;
        if (this.droneMasterGain) {
          this.droneMasterGain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        }
        setTimeout(() => {
          this.droneNodes.forEach(node => {
            try {
              node.osc.stop();
              node.osc.disconnect();
            } catch {
              // ignore cleanup
            }
          });
          this.droneNodes = [];
          if (this.droneAudioCtx && this.droneAudioCtx.state !== 'closed') {
            this.droneAudioCtx.close();
          }
          this.droneAudioCtx = null;
        }, 450);
      } catch {
        this.droneAudioCtx = null;
      }
    }
  }

  // --- Real Acoustic Microphone Resonance Visualizer ---

  async startMicAnalysis(onSample) {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser.');
    }

    this.stopMicAnalysis();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.micAudioCtx = new AudioCtx();
      const source = this.micAudioCtx.createMediaStreamSource(stream);

      const analyser = this.micAudioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      this.micAnalyser = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude (vocal volume / resonance)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedResonance = Math.min(100, Math.round((avg / 128) * 100));

        if (onSample) {
          onSample({
            resonance: normalizedResonance,
            rawBuffer: dataArray
          });
        }

        this.micRafId = requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      this.stopMicAnalysis();
      throw err;
    }
  }

  stopMicAnalysis() {
    if (this.micRafId) {
      cancelAnimationFrame(this.micRafId);
      this.micRafId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micAudioCtx && this.micAudioCtx.state !== 'closed') {
      try {
        this.micAudioCtx.close();
      } catch {
        // ignore
      }
      this.micAudioCtx = null;
    }
    this.micAnalyser = null;
  }
}

export const recitationEngine = new RecitationEngine();
export default recitationEngine;
