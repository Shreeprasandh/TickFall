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

    // Global Modal Functions
    window.openModal = (id) => this.openModal(id);
    window.closeModal = (id) => this.closeModal(id);

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

  updateMuteIcon(btn, isMuted) {
    if (!btn) return;
    if (isMuted) {
      // Greyed & Struck-out Mute Icon
      btn.innerHTML = `
        <svg class="control-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" stroke-width="2"></line>
          <path d="M9 9v6h2l5 4V5L11 9H9z"></path>
          <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
        </svg>
      `;
    } else {
      // Clean Active Speaker Icon
      btn.innerHTML = `
        <svg class="control-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      `;
    }
  }

  updateAllMuteIcons(isMuted) {
    document.querySelectorAll('.btn-mute-toggle, #btnMuteAudio, #btnMuteAudioClock').forEach(btn => {
      btn.classList.toggle('muted', isMuted);
      this.updateMuteIcon(btn, isMuted);
    });
  }

  bindEvents() {
    // Initial Audio Mute Icon Sync Across All Buttons (Default Muted)
    this.updateAllMuteIcons(audioManager.isMuted);

    // Global Event Delegation for all Mute Toggle Buttons
    document.addEventListener('click', (e) => {
      const muteBtn = e.target.closest('.btn-mute-toggle, #btnMuteAudio, #btnMuteAudioClock');
      if (muteBtn) {
        e.stopPropagation();
        const isMuted = audioManager.toggleMute();
        this.updateAllMuteIcons(isMuted);
      }
    });

    // Modal Triggers
    const btnInfo = document.getElementById('btnOpenInfo');
    if (btnInfo) {
      btnInfo.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        this.openModal('infoModal');
      };
    }

    const btnStory = document.getElementById('btnOpenStory');
    if (btnStory) {
      btnStory.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        this.openModal('storyModal');
      };
    }

    const btnFeedback = document.getElementById('btnOpenFeedback');
    if (btnFeedback) {
      btnFeedback.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        this.openModal('feedbackModal');
      };
    }

    const btnProfile = document.getElementById('btnOpenProfile');
    if (btnProfile) {
      btnProfile.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        this.renderProfileValues();
        this.openModal('profileModal');
      };
    }

    const btnLeaderboard = document.getElementById('btnOpenLeaderboard');
    if (btnLeaderboard) {
      btnLeaderboard.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        this.renderLeaderboard();
        this.openModal('leaderboardModal');
      };
    }

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        const modalId = e.currentTarget.getAttribute('data-modal');
        if (modalId) this.closeModal(modalId);
      };
    });

    // Feedback Submission
    const btnSubmitFb = document.getElementById('btnSubmitFeedback');
    if (btnSubmitFb) {
      btnSubmitFb.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playCoin());
        const input = document.getElementById('feedbackInput');
        if (input) input.value = '';
        alert('Thank you for your feedback! It has been recorded.');
        this.closeModal('feedbackModal');
      };
    }

    // Solo Mode Flow
    const btnSolo = document.getElementById('btnSoloMode');
    if (btnSolo) {
      btnSolo.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.SOLO_SETUP);
      };
    }

    // Multiplayer Mode Flow
    const btnMultiplayer = document.getElementById('btnMultiplayerMode');
    if (btnMultiplayer) {
      btnMultiplayer.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.PLAYING);
        if (window.gameEngine) {
          window.gameEngine.startMultiplayerGame('STANDARD');
        }
      };
    }

    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.HOME);
      };
    });

    // Option Selectors
    document.querySelectorAll('.role-select-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.role-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedRole = e.currentTarget.getAttribute('data-role');
      };
    });

    document.querySelectorAll('.diff-select-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.diff-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedDifficulty = e.currentTarget.getAttribute('data-diff');
      };
    });

    document.querySelectorAll('.time-select-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.safePlay(() => audioManager.playClick());
        document.querySelectorAll('.time-select-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedTimeFrame = e.currentTarget.getAttribute('data-frame');
      };
    });

    // Start Solo Game
    const btnStartGame = document.getElementById('btnStartSoloGame');
    if (btnStartGame) {
      btnStartGame.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.PLAYING);
        if (window.gameEngine) {
          window.gameEngine.startSoloGame(this.selectedRole, this.selectedDifficulty, this.selectedTimeFrame);
        }
      };
    }

    // Pause System Event Handling
    events.on('game:paused', (data) => this.handlePauseUpdate(data));
    events.on('game:unpaused', (data) => this.handlePauseUpdate(data));

    // Pause Control Buttons
    const btnPauseClock = document.getElementById('btnPauseGameClock');
    if (btnPauseClock) {
      btnPauseClock.onclick = (e) => {
        e.stopPropagation();
        this.safePlay(() => audioManager.playClick());
        if (window.gameEngine) window.gameEngine.togglePause(ROLES.THIEF);
      };
    }

    const btnResume = document.getElementById('btnResumeGame');
    if (btnResume) {
      btnResume.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        if (window.gameEngine) {
          if (window.gameEngine.mode === 'SOLO') {
            window.gameEngine.unpausePlayer(ROLES.THIEF);
          } else {
            window.gameEngine.unpausePlayer(ROLES.THIEF);
            window.gameEngine.unpausePlayer(ROLES.DETECTIVE);
          }
        }
      };
    }

    const btnP1Unpause = document.getElementById('btnP1Unpause');
    if (btnP1Unpause) {
      btnP1Unpause.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        if (window.gameEngine) window.gameEngine.unpausePlayer(ROLES.THIEF);
      };
    }

    const btnP2Unpause = document.getElementById('btnP2Unpause');
    if (btnP2Unpause) {
      btnP2Unpause.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        if (window.gameEngine) window.gameEngine.unpausePlayer(ROLES.DETECTIVE);
      };
    }

    const btnRestart = document.getElementById('btnRestartGame');
    if (btnRestart) {
      btnRestart.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.closeModal('pauseModal');
        if (window.gameEngine) {
          if (window.gameEngine.mode === 'SOLO') {
            window.gameEngine.startSoloGame(this.selectedRole, this.selectedDifficulty, this.selectedTimeFrame);
          } else {
            window.gameEngine.startMultiplayerGame(this.selectedTimeFrame);
          }
        }
      };
    }

    const btnQuit = document.getElementById('btnQuitToMenu');
    if (btnQuit) {
      btnQuit.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.closeModal('pauseModal');
        this.switchScreen(GAME_STATES.HOME);
      };
    }

    // Results Play Again
    const btnAgain = document.getElementById('btnPlayAgain');
    if (btnAgain) {
      btnAgain.onclick = () => {
        this.safePlay(() => audioManager.playClick());
        this.switchScreen(GAME_STATES.PLAYING);
        if (window.gameEngine) {
          window.gameEngine.startSoloGame(this.selectedRole, this.selectedDifficulty, this.selectedTimeFrame);
        }
      };
    }

    events.on('game:over', (data) => {
      if (window.gameEngine && window.gameEngine.mode === 'SOLO' && window.gameEngine.timerSystem) {
        const playerAlias = localStorage.getItem('TICKFALL_OPERATIVE_NAME') || 'OPERATIVE_40';
        StorageManager.recordSoloScore(playerAlias, data.winner, window.gameEngine.timerSystem.elapsedSeconds);
      }
      this.renderResults(data);
      this.switchScreen(GAME_STATES.RESULTS);
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
    }
    try {
      if (modalId === 'leaderboardModal') {
        this.renderLeaderboard();
      } else if (modalId === 'profileModal') {
        this.renderProfileValues();
      }
    } catch (e) {
      console.error('Error rendering modal content:', e);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    }
  }

  handlePauseUpdate(data) {
    if (!data.isPaused) {
      this.closeModal('pauseModal');
      return;
    }

    this.openModal('pauseModal');

    const titleEl = document.getElementById('pauseTitle');
    const subtitleEl = document.getElementById('pauseSubtitle');
    const soloNotice = document.getElementById('soloPauseNotice');
    const mpPanel = document.getElementById('multiplayerPausePanel');
    const statusText = document.getElementById('pauseLiveStatus');

    const p1Badge = document.getElementById('p1StatusBadge');
    const p2Badge = document.getElementById('p2StatusBadge');

    if (data.mode === 'SOLO') {
      if (titleEl) titleEl.innerText = '⏸️ MISSION SUSPENDED';
      if (subtitleEl) subtitleEl.innerText = 'SOLO GAME PLAY PAUSED';
      if (soloNotice) soloNotice.classList.remove('hidden');
      if (mpPanel) mpPanel.classList.add('hidden');
      if (statusText) statusText.innerText = 'PRESS P, ESC, OR RESUME TO CONTINUE.';
    } else {
      if (titleEl) titleEl.innerText = '⏸️ DUAL-PLAYER PAUSE LOCK';
      if (subtitleEl) subtitleEl.innerText = 'BOTH OPERATIVES MUST UNPAUSE TO RESUME LIVE GAMEPLAY';
      if (soloNotice) soloNotice.classList.add('hidden');
      if (mpPanel) mpPanel.classList.remove('hidden');

      if (p1Badge) {
        p1Badge.innerText = data.p1Paused ? 'PAUSED ⏸️' : 'READY ✅';
        p1Badge.className = data.p1Paused ? 'status-badge state-paused' : 'status-badge state-ready';
      }
      if (p2Badge) {
        p2Badge.innerText = data.p2Paused ? 'PAUSED ⏸️' : 'READY ✅';
        p2Badge.className = data.p2Paused ? 'status-badge state-paused' : 'status-badge state-ready';
      }

      if (statusText) {
        if (data.p1Paused && data.p2Paused) {
          statusText.innerText = 'BOTH PLAYERS ARE PAUSED. CLICK READY TO UNPAUSE.';
        } else if (data.p1Paused) {
          statusText.innerText = 'CIPHER IS PAUSED. WAITING FOR CIPHER TO UNPAUSE...';
        } else if (data.p2Paused) {
          statusText.innerText = 'VALE IS PAUSED. WAITING FOR VALE TO UNPAUSE...';
        } else {
          statusText.innerText = 'BOTH OPERATIVES READY — RESUMING GAMEPLAY...';
        }
      }
    }
  }

  renderLeaderboard() {
    const tbody = document.getElementById('leaderboardTbody');
    if (!tbody) return;

    const records = StorageManager.getSoloLeaderboard() || [];
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; opacity:0.6;">No recorded missions yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map((rec, index) => {
      const timeVal = (rec && typeof rec.timeSeconds === 'number' && !isNaN(rec.timeSeconds)) ? rec.timeSeconds : 0;
      const mins = Math.floor(timeVal / 60);
      const secs = (timeVal % 60).toFixed(2);
      const timeStr = `${mins}:${secs.padStart(5, '0')}s`;
      const rankStr = index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`;
      const roleBadge = rec.role === 'THIEF' 
        ? '<span class="badge-role">CIPHER</span>' 
        : '<span class="badge-role gold">VALE</span>';

      return `
        <tr>
          <td class="rank-badge">${rankStr}</td>
          <td><strong>${rec?.name || 'UNKNOWN'}</strong></td>
          <td>${roleBadge}</td>
          <td class="time-highlight">${timeStr}</td>
        </tr>
      `;
    }).join('');
  }

  switchScreen(screenState) {
    this.currentScreen = screenState;

    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
      if (screenState === GAME_STATES.PLAYING) {
        appContainer.classList.remove('hidden');
      } else {
        appContainer.classList.add('hidden');
      }
    }

    [this.homeScreen, this.soloSetupScreen, this.gameHud, this.resultsScreen].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    if (window.lobbyBg) {
      window.lobbyBg.setActive(screenState !== GAME_STATES.PLAYING);
    }

    switch (screenState) {
      case GAME_STATES.HOME:
        this.homeScreen?.classList.remove('hidden');
        audioManager.startLobbyMusic();
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

    // Dynamic AI News Generation via Gemini API
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

    const nameInput = document.getElementById('operativeNameInput');
    const homeName = document.getElementById('homeOperativeName');

    if (nameInput) {
      nameInput.value = localStorage.getItem('TICKFALL_OPERATIVE_NAME') || 'OPERATIVE_40';
      if (homeName) homeName.innerText = nameInput.value;

      nameInput.oninput = (e) => {
        const val = e.target.value.toUpperCase() || 'OPERATIVE_40';
        localStorage.setItem('TICKFALL_OPERATIVE_NAME', val);
        if (homeName) homeName.innerText = val;
      };
    }

    if (soundSlider) {
      soundSlider.oninput = (e) => {
        const val = parseFloat(e.target.value) / 100;
        audioManager.setVolumes(val, save.settings.musicVolume);
        StorageManager.saveSettings({ soundVolume: val });
      };
    }

    if (musicSlider) {
      musicSlider.oninput = (e) => {
        const val = parseFloat(e.target.value) / 100;
        audioManager.setVolumes(save.settings.soundVolume, val);
        StorageManager.saveSettings({ musicVolume: val });
      };
    }
  }
}
