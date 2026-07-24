// TimerSystem - Central countdown logic, time frame management & win conditions

import { TIME_FRAMES, TIMER_ACTIONS } from '../utils/constants.js';
import { events } from '../utils/events.js';
import { audioManager } from '../engine/AudioManager.js';

export class TimerSystem {
  constructor(timeFrameKey = 'STANDARD') {
    this.config = TIME_FRAMES[timeFrameKey] || TIME_FRAMES.STANDARD;
    this.remainingSeconds = this.config.bombStartTime;
    this.maxTime = this.config.sessionLimit;
    this.elapsedSeconds = 0;
    this.isSuddenDeath = false;
    this.isBombDiffused = false;
    this.isPaused = false;
    this.winner = null; // 'THIEF', 'DETECTIVE', or null
    this.winReason = '';
  }

  reset(timeFrameKey = 'STANDARD') {
    this.config = TIME_FRAMES[timeFrameKey] || TIME_FRAMES.STANDARD;
    this.remainingSeconds = this.config.bombStartTime;
    this.maxTime = this.config.sessionLimit;
    this.elapsedSeconds = 0;
    this.isSuddenDeath = false;
    this.isBombDiffused = false;
    this.isPaused = false;
    this.winner = null;
    this.winReason = '';
  }

  update(dtSeconds) {
    if (this.isPaused || this.winner) return;

    this.elapsedSeconds += dtSeconds;

    // Check Sudden Death trigger
    if (this.elapsedSeconds >= this.config.suddenDeath && !this.isSuddenDeath) {
      this.isSuddenDeath = true;
      events.emit('timer:sudden_death');
    }

    // Countdown tick
    if (!this.isBombDiffused) {
      this.remainingSeconds -= dtSeconds;
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.triggerWin('THIEF', 'BOMB EXPLODED — CIPHER ESCAPES IN THE CHAOS!');
        events.emit('timer:exploded');
        audioManager.playExplosion();
      }
    }

    // Update music intensity based on % remaining
    const percentRemaining = Math.max(0, this.remainingSeconds / this.config.bombStartTime);
    audioManager.setIntensity(percentRemaining);

    events.emit('timer:update', {
      remaining: this.remainingSeconds,
      percent: percentRemaining,
      isSuddenDeath: this.isSuddenDeath,
      isBombDiffused: this.isBombDiffused
    });
  }

  modifyTime(deltaSeconds, sourceName = '') {
    if (this.winner) return;

    // During Sudden Death, detective cannot increase time
    if (this.isSuddenDeath && deltaSeconds > 0) return;

    const prev = this.remainingSeconds;
    this.remainingSeconds = Math.min(this.maxTime, Math.max(0, this.remainingSeconds + deltaSeconds));
    const actualDelta = this.remainingSeconds - prev;

    audioManager.playTimeChange(actualDelta);

    events.emit('timer:changed', {
      delta: actualDelta,
      remaining: this.remainingSeconds,
      source: sourceName
    });

    if (this.remainingSeconds <= 0) {
      this.triggerWin('THIEF', 'BOMB EXPLODED — CIPHER ESCAPES IN THE CHAOS!');
    }
  }

  diffuseBomb() {
    this.isBombDiffused = true;
    this.modifyTime(TIMER_ACTIONS.DIFFUSE_BOMB_SOLVED, 'Bomb Diffused');
    events.emit('timer:diffused');
  }

  triggerWin(role, reason) {
    if (this.winner) return;
    this.winner = role;
    this.winReason = reason;
    events.emit('game:over', { winner: role, reason });
  }

  getFormattedTime() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = Math.floor(this.remainingSeconds % 60);
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    return `${mStr}:${sStr}`;
  }
}
