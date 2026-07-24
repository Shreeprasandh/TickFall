// Entry Point Bootstrap Module for THE HEIST CLOCK (TickFall)

import { GameEngine } from './engine/GameEngine.js';
import { ClockDisplay } from './ui/components/ClockDisplay.js';
import { BombPuzzleModal } from './ui/components/BombPuzzleModal.js';
import { FenceShopModal } from './ui/components/FenceShopModal.js';
import { MobileControls } from './ui/components/MobileControls.js';
import { UIManager } from './ui/UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const leftCanvas = document.getElementById('leftCanvas');
  const rightCanvas = document.getElementById('rightCanvas');

  // Initialize Core UI & Modals
  const clockDisplay = new ClockDisplay('clockContainer');
  const bombPuzzleModal = new BombPuzzleModal();
  const fenceShopModal = new FenceShopModal();
  const mobileControls = new MobileControls('mobileOverlay');
  const uiManager = new UIManager();

  // Initialize Main Game Engine Loop
  const gameEngine = new GameEngine(leftCanvas, rightCanvas);
  window.gameEngine = gameEngine;

  console.log('⏱️ THE HEIST CLOCK — Engine Initialized Successfully!');
});
