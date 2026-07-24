// Web Audio API Synthesizer & Procedural E-Minor Pentatonic Music Engine

import { clamp } from '../utils/math.js';

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
    this.isMuted = true; // Default to muted on initial application load
    this.track = 'LOBBY'; // 'LOBBY' or 'INGAME'

    // D Minor Ambient Pentatonic Scale (Lobby)
    this.lobbyScale = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 440.00];

    // F# Heist Action Scale (In-Game High Tension)
    this.ingameScale = [185.00, 220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 554.37, 659.25];

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

    // Default master gain value is 0.0 (Muted on load until user explicitly unmutes)
    this.masterGain.gain.value = this.isMuted ? 0.0 : 1.0;
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

  startLobbyMusic() {
    this.track = 'LOBBY';
    this.startMusic();
  }

  startInGameMusic() {
    this.track = 'INGAME';
    this.startMusic();
  }

  startMusic() {
    this.ensureAudioContext();
    if (this.isPlayingMusic) {
      if (this.musicInterval) clearTimeout(this.musicInterval);
    }
    this.isPlayingMusic = true;
    this.stepIndex = 0;

    const tick = () => {
      if (!this.isPlayingMusic) return;
      if (this.track === 'LOBBY') {
        this.playLobbyProceduralNote();
      } else {
        this.playInGameProceduralNote();
      }

      // Dynamic BPM per track
      const baseBpm = this.track === 'LOBBY' ? 78 : 124;
      const currentBpm = baseBpm + (this.track === 'INGAME' ? this.intensity * 46 : 0);
      const intervalMs = (60 / currentBpm) * 250; // 16th notes
      this.musicInterval = setTimeout(tick, intervalMs);
    };

    tick();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) clearTimeout(this.musicInterval);
  }

  playVictoryFanfare(winner = 'THIEF') {
    this.ensureAudioContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Arpeggiated Victory Chords
    const chord = winner === 'THIEF' 
      ? [293.66, 369.99, 440.00, 587.33, 739.99] // D major triumph
      : [220.00, 277.18, 329.63, 440.00, 554.37]; // A major triumph

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.3 * this.musicVolume, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.25);
    });
  }

  setIntensity(percentRemaining) {
    // percentRemaining: 1.0 (start) down to 0 (critical)
    this.intensity = clamp(1.0 - percentRemaining, 0, 1);
  }

  playLobbyProceduralNote() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Atmospheric low pulse every 16 steps
    if (this.stepIndex % 16 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(73.42, now); // D2

      bassGain.gain.setValueAtTime(0.2 * this.musicVolume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 1.25);
    }

    // Soft Ambient Mystery Chime
    if (this.stepIndex % 4 === 0 && Math.random() < 0.6) {
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();

      const scaleIdx = Math.floor(Math.random() * this.lobbyScale.length);
      const freq = this.lobbyScale[scaleIdx] || 220;

      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(freq, now);

      melGain.gain.setValueAtTime(0.12 * this.musicVolume, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      melOsc.connect(melGain);
      melGain.connect(this.musicGain);

      melOsc.start(now);
      melOsc.stop(now + 0.65);
    }

    this.stepIndex = (this.stepIndex + 1) % 32;
  }

  playInGameProceduralNote() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // High-Tension Bass Pulse every 8 steps
    if (this.stepIndex % 8 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      const bassFreq = this.intensity > 0.6 ? 92.50 : 46.25; // F#2 or F#1
      bassOsc.type = this.intensity > 0.4 ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.35 * this.musicVolume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.4);
    }

    // Rapid Heist Arpeggiated Melody
    if (this.stepIndex % 2 === 0 || Math.random() < 0.4 + this.intensity * 0.4) {
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();

      const scaleIdx = Math.floor(Math.random() * (4 + Math.floor(this.intensity * 6)));
      const freq = this.ingameScale[scaleIdx] || 369.99;

      melOsc.type = this.intensity > 0.5 ? 'triangle' : 'sine';
      melOsc.frequency.setValueAtTime(freq, now);

      melGain.gain.setValueAtTime(0.18 * this.musicVolume, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      melOsc.connect(melGain);
      melGain.connect(this.musicGain);

      melOsc.start(now);
      melOsc.stop(now + 0.2);
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
