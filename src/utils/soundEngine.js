/**
 * Advanced Sound-First WebAudio Synth for Vedic Cyber-Audio Experience
 * Everything tuned to a selectable root note (Sa = 146.83 Hz default).
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.rootSa = 146.83; // D3 root note (Vedic standard)
    this.masterVolume = 0.8;

    // Bus volumes
    this.busVolumes = {
      ui: 0.7,
      chants: 0.8,
      ambience: 0.5
    };

    this.buses = {};
    this.tanpuraOscs = [];
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Create Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Create Buses
        ['ui', 'chants', 'ambience'].forEach((busName) => {
          const bus = this.ctx.createGain();
          bus.gain.setValueAtTime(this.busVolumes[busName], this.ctx.currentTime);
          bus.connect(this.masterGain);
          this.buses[busName] = bus;
        });
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setRootSa(freq) {
    if (freq >= 110 && freq <= 220) {
      this.rootSa = freq;
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setBusVolume(bus, val) {
    const clamped = Math.max(0, Math.min(1, val));
    this.busVolumes[bus] = clamped;
    if (this.buses[bus] && this.ctx) {
      this.buses[bus].gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  vibrate(pattern = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic errors on unsupported hardware
      }
    }
  }

  // --- Signature Tuned Interactions ---

  // 1. Hover: Soft bell partial tuned to Sa harmonic
  playHover() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // 3rd harmonic of Sa with subtle high shimmer
    osc.frequency.setValueAtTime(this.rootSa * 3, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.buses.ui || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 2. Tap: Wood-block click transient + resonant shruti drone note
  playTap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(12);

    const now = this.ctx.currentTime;

    // Transient click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    clickGain.gain.setValueAtTime(0.12, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(this.buses.ui || this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Warm Shruti body
    const droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(this.rootSa, now);

    droneGain.gain.setValueAtTime(0.08, now);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    droneOsc.connect(droneGain);
    droneGain.connect(this.buses.ui || this.masterGain);
    droneOsc.start(now);
    droneOsc.stop(now + 0.4);
  }

  // 3. Success: Ascending Sa-Ga-Pa chord (pure just-intonation Vedic triad)
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([20, 40, 25]);

    const now = this.ctx.currentTime;
    // Ratios: Sa (1/1), Shuddha Gandhara Ga (5/4 = 1.25), Panchama Pa (3/2 = 1.5), Tar Sa (2/1 = 2.0)
    const notes = [
      this.rootSa * 2,       // Sa (octave)
      this.rootSa * 2 * 1.25, // Ga
      this.rootSa * 2 * 1.5,  // Pa
      this.rootSa * 4        // High Sa
    ];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

      osc.connect(gain);
      gain.connect(this.buses.ui || this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.95);
    });
  }

  // 4. Error: Low muted gong
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([40, 30, 40]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(this.rootSa * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(this.rootSa * 0.5, now + 0.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.buses.ui || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // 5. Level-up: Full Tanpura swell with resonant 4-string drone
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate([30, 50, 40, 60, 50]);

    const now = this.ctx.currentTime;
    // Classical Tanpura tuning: Pa (3/4 of Sa or 3/2), Sa, Sa, Sa (lower octave)
    const strings = [
      this.rootSa * 1.5,
      this.rootSa * 2,
      this.rootSa * 2,
      this.rootSa
    ];

    strings.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.22;

      osc.type = i === 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);

      osc.connect(gain);
      gain.connect(this.buses.ui || this.masterGain);

      osc.start(start);
      osc.stop(start + 2.5);
    });
  }

  // Legacy mappings for backwards-compatibility with V1 games
  playUnlockChime() {
    this.playSuccess();
  }

  playCombatHit(isCritical = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.vibrate(isCritical ? [30, 20, 30] : 18);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isCritical ? 220 : 130, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.buses.ui || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playShoot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.rootSa * 4, now);
    osc.frequency.exponentialRampToValueAtTime(this.rootSa * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.buses.ui || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playExplosion() {
    this.playError();
  }

  playPowerup() {
    this.playSuccess();
  }

  playPaddleHit() {
    this.playTap();
  }

  playBrickDestroy(pitchOffset = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.rootSa * 2 + pitchOffset, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.buses.ui || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playCoin() {
    this.playSuccess();
  }

  playTibetanBowl() {
    this.playLevelUp();
  }
}

export const sounds = new SoundEngine();
export default sounds;
