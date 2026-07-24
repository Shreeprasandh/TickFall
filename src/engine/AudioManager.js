// Web Audio API Synthesizer & Procedural E-Minor Pentatonic Music Engine

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.convolver = null;

    this.isPlayingMusic = false;
    this.musicInterval = null;
    this.musicBpm = 110;
    this.intensity = 0; // 0 to 1 scaling with timer urgency

    this.soundVolume = 0.8;
    this.musicVolume = 0.7;
    this.isMuted = false;

    // E Minor Pentatonic scale frequencies
    // E3, G3, A3, B3, D4, E4, G4, A4, B4, D5
    this.scale = [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33];
    this.stepIndex = 0;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0.0 : 1.0;
    }
    return this.isMuted;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.masterGain.gain.value = 1.0;
    this.musicGain.gain.value = this.musicVolume;
    this.sfxGain.gain.value = this.soundVolume;

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Create algorithmic impulse response for reverb
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.createImpulseResponse(1.5, 2.0);
    this.sfxGain.connect(this.convolver);
    this.convolver.connect(this.masterGain);
  }

  ensureAudioContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolumes(sound, music) {
    this.soundVolume = sound;
    this.musicVolume = music;
    if (this.sfxGain) this.sfxGain.gain.value = sound;
    if (this.musicGain) this.musicGain.gain.value = music;
  }

  createImpulseResponse(duration, decay) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }

  startMusic() {
    this.ensureAudioContext();
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.stepIndex = 0;

    const tick = () => {
      if (!this.isPlayingMusic) return;
      this.playProceduralNote();

      // Dynamic interval according to intensity (BPM 100 -> 160)
      const currentBpm = this.musicBpm + this.intensity * 50;
      const intervalMs = (60 / currentBpm) * 250; // 16th notes
      this.musicInterval = setTimeout(tick, intervalMs);
    };

    tick();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) clearTimeout(this.musicInterval);
  }

  setIntensity(percentRemaining) {
    // percentRemaining: 1.0 (start) down to 0 (critical)
    this.intensity = clamp(1.0 - percentRemaining, 0, 1);
  }

  playProceduralNote() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Bass note every 8 steps
    if (this.stepIndex % 8 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      const bassFreq = this.intensity > 0.6 ? 82.41 : 41.20; // E2 or E1
      bassOsc.type = this.intensity > 0.5 ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.3 * this.musicVolume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.45);
    }

    // Arpeggiated melody note
    if (this.stepIndex % 2 === 0 || Math.random() < 0.3 + this.intensity * 0.4) {
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();

      const scaleIdx = Math.floor(Math.random() * (5 + Math.floor(this.intensity * 5)));
      const freq = this.scale[scaleIdx] || 220;

      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(freq, now);

      melGain.gain.setValueAtTime(0.15 * this.musicVolume, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      melOsc.connect(melGain);
      melGain.connect(this.musicGain);

      melOsc.start(now);
      melOsc.stop(now + 0.25);
    }

    this.stepIndex = (this.stepIndex + 1) % 16;
  }

  // --- SYNTHESIZED SFX GENERATORS ---

  playClick() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playJump() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playStomp() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playGrapple() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playCameraSmash() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;

    // Glass shatter noise + low thud
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
  }

  playTimeChange(seconds) {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const isNegative = seconds < 0;
    osc.type = isNegative ? 'sawtooth' : 'sine';

    const startFreq = isNegative ? 500 : 300;
    const endFreq = isNegative ? 250 : 700;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playAlarm() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playCoin() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  }

  playExplosion() {
    this.ensureAudioContext();
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(80, now + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }
}

export const audioManager = new AudioManager();
