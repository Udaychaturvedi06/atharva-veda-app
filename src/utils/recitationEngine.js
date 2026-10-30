/**
 * Authentic Vedic Recitation Engine & Acoustic Resonance System
 * 
 * Provides:
 * 1. Chromium/Safari-resilient Web Speech API synthesis with async cancel flushing.
 * 2. Active Utterance memory retention to defeat V8 Garbage Collection bug.
 * 3. Chrome 14-second watchdog timer to prevent audio freeze.
 * 4. Dual script support: Devanagari for Indic voices; phonetic IAST for universal OS fallbacks.
 * 5. Real-time word boundary synchronization for visual syllable tracking.
 * 6. Harmonic Tanpura acoustic drone (Sa = 146.83 Hz / Pa = 220.25 Hz).
 * 7. Real-time WebAudio microphone resonance analyzer.
 */

// Memory root to prevent V8/WebKit garbage-collecting utterances while in-flight
const activeUtterances = new Set();

class RecitationEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
    this.watchdogTimer = null;
    this.cachedVoices = [];

    // Tanpura Drone Nodes
    this.droneAudioCtx = null;
    this.droneNodes = [];

    // Microphone Nodes
    this.micAudioCtx = null;
    this.micStream = null;
    this.micAnalyser = null;
    this.micRafId = null;

    if (this.synth) {
      this.cachedVoices = this.synth.getVoices() || [];
      if (typeof window !== 'undefined' && 'onvoiceschanged' in this.synth) {
        this.synth.onvoiceschanged = () => {
          this.cachedVoices = this.synth.getVoices() || [];
        };
      }
    }
  }

  isSupported() {
    return Boolean(this.synth);
  }

  /**
   * Find best suitable voice:
   * 1. Sanskrit (sa)
   * 2. Hindi (hi-IN, hi)
   * 3. Marathi (mr-IN, mr)
   * 4. Multilingual Indian English (-IN)
   * 5. OS Default
   */
  getBestVoice() {
    if (!this.synth) return null;
    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : (this.synth.getVoices() || []);
    if (!voices || voices.length === 0) return null;

    const saVoice = voices.find(v => v.lang === 'sa' || v.lang.startsWith('sa-') || v.lang.startsWith('sa_'));
    if (saVoice) return saVoice;

    const hiINVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN');
    if (hiINVoice) return hiINVoice;

    const hiVoice = voices.find(v => v.lang.startsWith('hi'));
    if (hiVoice) return hiVoice;

    const mrVoice = voices.find(v => v.lang.startsWith('mr'));
    if (mrVoice) return mrVoice;

    const inVoice = voices.find(v => v.lang.endsWith('-IN') || v.lang.endsWith('_IN'));
    if (inVoice) return inVoice;

    const def = voices.find(v => v.default);
    return def || voices[0];
  }

  /**
   * Start keep-alive watchdog to defeat Chromium 14-second silent pause bug
   */
  startWatchdog() {
    this.stopWatchdog();
    this.watchdogTimer = setInterval(() => {
      if (this.synth && this.synth.speaking && !this.isPaused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  stopWatchdog() {
    if (this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Recite Vedic text with bulletproof browser IPC queue flushing
   */
  recite(devanagariText, options = {}) {
    if (!this.synth) {
      if (options.onError) options.onError(new Error('Web Speech Synthesis is not supported in this browser.'));
      return;
    }

    // Flush any pending/paused speech in Chromium audio queue
    try {
      this.synth.cancel();
      if (this.synth.paused) {
        this.synth.resume();
      }
    } catch {
      // ignore
    }
    this.stopWatchdog();

    // Clean Devanagari text (strip danda bars and svara accent marks for phonetic clarity)
    const cleanDevanagari = (devanagariText || '')
      .replace(/[॥।_|]/g, ' ')
      .replace(/\u0951/g, '')
      .replace(/\u0952/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Clean IAST transliteration fallback for systems lacking Indic TTS fonts
    const cleanIast = (options.phoneticFallback || '')
      .replace(/[॥।_|]/g, ' ')
      .replace(/\|/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const voice = this.getBestVoice();
    const isIndicVoice = voice && (
      voice.lang.startsWith('hi') ||
      voice.lang.startsWith('sa') ||
      voice.lang.startsWith('mr')
    );

    // If the browser only has Western voices installed, use phonetic IAST so it actually speaks!
    const textToRecite = isIndicVoice || !cleanIast ? cleanDevanagari : cleanIast;

    if (!textToRecite) {
      if (options.onError) options.onError(new Error('No readable text provided for recitation.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRecite);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 0.95;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    // Attach to GC retention root
    activeUtterances.add(utterance);

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.startWatchdog();
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.stopWatchdog();
      activeUtterances.delete(utterance);
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.isPlaying = false;
      this.isPaused = false;
      this.stopWatchdog();
      activeUtterances.delete(utterance);
      this.currentUtterance = null;

      // 'canceled' or 'interrupted' is normal when user taps Stop/Play again
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e.error);
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

    // CRITICAL: 60ms async tick ensures Chromium/Safari finish IPC cancel before speak
    setTimeout(() => {
      if (!this.synth) return;
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch (err) {
        console.warn('Synth speak error:', err);
        activeUtterances.delete(utterance);
        if (options.onError) options.onError(err);
      }
    }, 60);
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      try {
        this.synth.pause();
        this.isPaused = true;
        this.stopWatchdog();
      } catch (err) {
        console.warn('Pause error:', err);
      }
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
        this.startWatchdog();
      } catch (err) {
        console.warn('Resume error:', err);
      }
    }
  }

  stop() {
    this.stopWatchdog();
    if (this.synth) {
      try {
        this.synth.cancel();
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch {
        // ignore
      }
    }
    this.isPlaying = false;
    this.isPaused = false;
    activeUtterances.clear();
    this.currentUtterance = null;
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

      const filter = this.droneAudioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.connect(masterGain);

      // Tanpura strings: Pa (1.5x), Sa (2.0x), Sa (2.002x), Kharaj Sa (1.0x)
      const freqs = [rootFreq * 1.5, rootFreq * 2.0, rootFreq * 2.002, rootFreq];

      freqs.forEach((freq, idx) => {
        const osc = this.droneAudioCtx.createOscillator();
        const gain = this.droneAudioCtx.createGain();

        osc.type = idx === 3 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
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
          this.droneMasterGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        }
        setTimeout(() => {
          this.droneNodes.forEach(node => {
            try {
              node.osc.stop();
              node.osc.disconnect();
            } catch {
              // ignore
            }
          });
          this.droneNodes = [];
          if (this.droneAudioCtx && this.droneAudioCtx.state !== 'closed') {
            this.droneAudioCtx.close();
          }
          this.droneAudioCtx = null;
        }, 350);
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
