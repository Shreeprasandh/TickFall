// Entry Point Bootstrap Module for TickFall

import { GameEngine } from './engine/GameEngine.js';
import { audioManager } from './engine/AudioManager.js';
import { ClockDisplay } from './ui/components/ClockDisplay.js';
import { BombPuzzleModal } from './ui/components/BombPuzzleModal.js';
import { FenceShopModal } from './ui/components/FenceShopModal.js';
import { MobileControls } from './ui/components/MobileControls.js';
import { LobbyBackground } from './ui/LobbyBackground.js';
import { UIManager } from './ui/UIManager.js';

const initApp = () => {
  const leftCanvas = document.getElementById('leftCanvas');
  const rightCanvas = document.getElementById('rightCanvas');

  // Initialize Living Lobby Background & Dynamic Cursor Trail
  const lobbyBg = new LobbyBackground();
  window.lobbyBg = lobbyBg;

  // Initialize Core UI & Modals
  const clockDisplay = new ClockDisplay('clockContainer');
  const bombPuzzleModal = new BombPuzzleModal();
  const fenceShopModal = new FenceShopModal();
  const mobileControls = new MobileControls('mobileOverlay');
  const uiManager = new UIManager();

  // Initialize Main Game Engine Loop
  const gameEngine = new GameEngine(leftCanvas, rightCanvas);
  window.gameEngine = gameEngine;

  // Unlock Web Audio & Start Ambient Thriller Music Notes in Lobby on First Interaction
  const unlockLobbyAudio = () => {
    audioManager.startMusic();
    window.removeEventListener('click', unlockLobbyAudio);
    window.removeEventListener('keydown', unlockLobbyAudio);
    window.removeEventListener('pointerdown', unlockLobbyAudio);
  };
  window.addEventListener('click', unlockLobbyAudio);
  window.addEventListener('keydown', unlockLobbyAudio);
  window.addEventListener('pointerdown', unlockLobbyAudio);

  console.log('⏱️ TickFall — Living Engine & Audio Initialized Successfully!');
};

// Robust Module Bootstrap (Immediate execution if DOM already parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
