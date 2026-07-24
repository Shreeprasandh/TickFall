// Screen State Machine & UI Navigation Orchestrator for TickFall

import { GAME_STATES, ROLES, BOT_DIFFICULTIES } from '../utils/constants.js';
import { events } from '../utils/events.js';
import { StorageManager } from '../utils/storage.js';
import { audioManager } from '../engine/AudioManager.js';
import { AIReporterService } from '../services/AIReporterService.js';

const getAIKey = () => localStorage.getItem('TICKFALL_AI_KEY') || '';

export class UIManager {
  constructor() {
    this.currentScreen = GAME_STATES.HOME;
    this.selectedRole = ROLES.THIEF;
    this.selectedDifficulty = BOT_DIFFICULTIES.MEDIUM;
    this.selectedTimeFrame = 'STANDARD';

    this.aiReporter = new AIReporterService(getAIKey());

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.homeScreen = document.getElementById('homeScreen');
    this.soloSetupScreen = document.getElementById('soloSetupScreen');
    this.gameHud = document.getElementById('gameHud');
    this.resultsScreen = document.getElementById('resultsScreen');

    // Modals
    this.infoModal = document.getElementById('infoModal');
    this.storyModal = document.getElementById('storyModal');
    this.feedbackModal = document.getElementById('feedbackModal');
    this.profileModal = document.getElementById('profileModal');
  }

  safePlay(soundFn) {
    try {
      if (typeof soundFn === 'function') soundFn();
    } catch (e) {
      console.warn('Audio call safely bypassed:', e);
    }
  }

  bindEvents() {
    // Audio Mute Toggle Button
    const muteBtn = document.getElementById('btnMuteAudio');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = audioManager.toggleMute();
        muteBtn.classList.toggle('muted', isMuted);
      });
    }

    // Modal Triggers
    document.getElementById('btnOpenInfo')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.safePlay(() => audioManager.playClick());
      this.openModal('infoModal');
    });

    document.getElementById('btnOpenStory')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.safePlay(() => audioManager.playClick());
      this.openModal('storyModal');
    });

    document.getElementById('btnOpenFeedback')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.safePlay(() => audioManager.playClick());
      this.openModal('feedbackModal');
    });

    document.getElementById('btnOpenProfile')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.safePlay(() => audioManager.playClick());
      this.renderProfileValues();
      this.openModal('profileModal');
    });

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        const modalId = e.currentTarget.getAttribute('data-modal');
        if (modalId) this.closeModal(modalId);
      });
    });

    // Feedback Submission
    document.getElementById('btnSubmitFeedback')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.safePlay(() => audioManager.playCoin());
      const input = document.getElementById('feedbackInput');
      if (input) input.value = '';
      alert('Thank you for your feedback! It has been recorded.');
      this.closeModal('feedbackModal');
    });

    // Solo Mode Flow
    document.getElementById('btnSoloMode')?.addEventListener('click', () => {
      this.safePlay(() => audioManager.playClick());
      this.switchScreen(GAME_STATES.SOLO_SETUP);
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.HOME);
      });
    });

    // Option Selectors
    document.querySelectorAll('.role-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.role-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedRole = e.currentTarget.getAttribute('data-role');
      });
    });

    document.querySelectorAll('.diff-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.diff-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedDifficulty = e.currentTarget.getAttribute('data-diff');
      });
    });

    document.querySelectorAll('.time-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.time-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedTimeFrame = e.currentTarget.getAttribute('data-frame');
      });
    });

    // Start Solo Game
    document.getElementById('btnStartSoloGame')?.addEventListener('click', () => {
      this.safePlay(() => audioManager.playClick());
      this.switchScreen(GAME_STATES.PLAYING);
      if (window.gameEngine) {
        window.gameEngine.startSoloGame(this.selectedRole, this.selectedDifficulty, this.selectedTimeFrame);
      }
    });

    // Results Play Again
    document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
      this.safePlay(() => audioManager.playClick());
      this.switchScreen(GAME_STATES.PLAYING);
      if (window.gameEngine) {
        window.gameEngine.startSoloGame(this.selectedRole, this.selectedDifficulty, this.selectedTimeFrame);
      }
    });

    events.on('game:over', (data) => {
      this.renderResults(data);
      this.switchScreen(GAME_STATES.RESULTS);
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  switchScreen(screenState) {
    this.currentScreen = screenState;

    [this.homeScreen, this.soloSetupScreen, this.gameHud, this.resultsScreen].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    switch (screenState) {
      case GAME_STATES.HOME:
        this.homeScreen?.classList.remove('hidden');
        break;
      case GAME_STATES.SOLO_SETUP:
        this.soloSetupScreen?.classList.remove('hidden');
        break;
      case GAME_STATES.PLAYING:
        this.gameHud?.classList.remove('hidden');
        break;
      case GAME_STATES.RESULTS:
        this.resultsScreen?.classList.remove('hidden');
        break;
    }
  }

  async renderResults(data) {
    const titleEl = document.getElementById('resultsHeadline');
    const descEl = document.getElementById('resultsSubhead');
    const winnerRoleEl = document.getElementById('resultsWinnerRole');

    if (winnerRoleEl) winnerRoleEl.innerText = data.winner === 'THIEF' ? 'CIPHER (THIEF) VICTORY' : 'VALE (DETECTIVE) VICTORY';

    if (data.winner === 'THIEF') {
      if (titleEl) titleEl.innerText = 'AZURE DIAMOND VANISHES — BLAST ROCKS CASTELLAN TOWER!';
      if (descEl) descEl.innerText = data.reason || 'Cipher descended all 40 floors and escaped into the night with the diamond.';
    } else {
      if (titleEl) titleEl.innerText = 'CIPHER IN CUSTODY — INSPECTOR VALE SAVES THE TOWER!';
      if (descEl) descEl.innerText = data.reason || 'Vale intercepted the thief and brought them to justice before time expired.';
    }

    const aiStory = await this.aiReporter.generateMatchReport(data);
    if (aiStory) {
      if (titleEl && aiStory.headline) titleEl.innerText = aiStory.headline;
      if (descEl && (aiStory.lead || aiStory.story)) {
        descEl.innerHTML = `<strong>${aiStory.lead || ''}</strong><br><br>${aiStory.story || ''}`;
      }
    }
  }

  renderProfileValues() {
    const save = StorageManager.load();
    const statGames = document.getElementById('statGamesPlayed');
    const statThief = document.getElementById('statThiefWins');
    const statDet = document.getElementById('statDetectiveWins');
    const statVault = document.getElementById('statVaultCoins');

    if (statGames) statGames.innerText = save.stats.gamesPlayed;
    if (statThief) statThief.innerText = save.stats.thiefWins;
    if (statDet) statDet.innerText = save.stats.detectiveWins;
    if (statVault) statVault.innerText = save.vaultCoins;

    const soundSlider = document.getElementById('soundSlider');
    const musicSlider = document.getElementById('musicSlider');

    if (soundSlider) soundSlider.value = save.settings.soundVolume * 100;
    if (musicSlider) musicSlider.value = save.settings.musicVolume * 100;

    soundSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      audioManager.setVolumes(val, save.settings.musicVolume);
      StorageManager.saveSettings({ soundVolume: val });
    });

    musicSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      audioManager.setVolumes(save.settings.soundVolume, val);
      StorageManager.saveSettings({ musicVolume: val });
    });
  }
}
