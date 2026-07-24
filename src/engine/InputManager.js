// Unified Input Manager for Keyboard, Touch Controls & Virtual Gamepad

import { events } from '../utils/events.js';
import { ROLES } from '../utils/constants.js';

export class InputManager {
  constructor() {
    this.keys = {};
    this.thiefInputs = { left: false, right: false, jump: false, stomp: false, interact: false, ability: false };
    this.detectiveInputs = { left: false, right: false, jump: false, slide: false, interact: false, ability: false };

    this.touchState = {
      thief: { dx: 0, dy: 0, jump: false, stomp: false, interact: false, ability: false },
      detective: { dx: 0, dy: 0, jump: false, slide: false, interact: false, ability: false }
    };

    this.initKeyboard();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Avoid duplicate triggers on key repeat
      if (e.repeat) return;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        events.emit('input:pause', { role: ROLES.THIEF });
      } else if (e.code === 'KeyO' || e.code === 'Numpad0') {
        events.emit('input:pause', { role: ROLES.DETECTIVE });
      } else if (e.code === 'KeyM') {
        events.emit('input:mute');
      }

      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  update(playerRole = 'THIEF', mode = 'SOLO') {
    const k = this.keys;

    const leftPressed = k['KeyA'] || k['ArrowLeft'] || false;
    const rightPressed = k['KeyD'] || k['ArrowRight'] || false;
    const jumpPressed = k['KeyW'] || k['Space'] || k['ArrowUp'] || false;
    const downPressed = k['KeyS'] || k['ArrowDown'] || false;
    const interactPressed = k['KeyE'] || k['Enter'] || k['Slash'] || false;
    const abilityPressed = k['KeyQ'] || k['ShiftLeft'] || k['ShiftRight'] || false;

    if (mode === 'SOLO') {
      if (playerRole === 'THIEF') {
        this.thiefInputs.left = leftPressed;
        this.thiefInputs.right = rightPressed;
        this.thiefInputs.jump = jumpPressed;
        this.thiefInputs.stomp = downPressed;
        this.thiefInputs.interact = interactPressed;
        this.thiefInputs.ability = abilityPressed;
      } else {
        this.detectiveInputs.left = leftPressed;
        this.detectiveInputs.right = rightPressed;
        this.detectiveInputs.jump = jumpPressed;
        this.detectiveInputs.slide = downPressed;
        this.detectiveInputs.interact = interactPressed;
        this.detectiveInputs.ability = abilityPressed;
      }
    } else {
      // 1v1 Split Screen Multiplayer Mode (P1 Left WASD vs P2 Right Arrows)
      this.thiefInputs.left = k['KeyA'] || false;
      this.thiefInputs.right = k['KeyD'] || false;
      this.thiefInputs.jump = k['KeyW'] || k['Space'] || false;
      this.thiefInputs.stomp = k['KeyS'] || false;
      this.thiefInputs.interact = k['KeyE'] || false;
      this.thiefInputs.ability = k['KeyQ'] || false;

      this.detectiveInputs.left = k['ArrowLeft'] || false;
      this.detectiveInputs.right = k['ArrowRight'] || false;
      this.detectiveInputs.jump = k['ArrowUp'] || false;
      this.detectiveInputs.slide = k['ArrowDown'] || false;
      this.detectiveInputs.interact = k['Enter'] || k['Slash'] || false;
      this.detectiveInputs.ability = k['ShiftLeft'] || k['ShiftRight'] || false;
    }

    // Merge Touch Inputs
    if (this.touchState.thief.dx < -0.3) this.thiefInputs.left = true;
    if (this.touchState.thief.dx > 0.3) this.thiefInputs.right = true;
    if (this.touchState.thief.jump) this.thiefInputs.jump = true;
    if (this.touchState.thief.stomp) this.thiefInputs.stomp = true;
    if (this.touchState.thief.interact) this.thiefInputs.interact = true;
    if (this.touchState.thief.ability) this.thiefInputs.ability = true;

    if (this.touchState.detective.dx < -0.3) this.detectiveInputs.left = true;
    if (this.touchState.detective.dx > 0.3) this.detectiveInputs.right = true;
    if (this.touchState.detective.jump) this.detectiveInputs.jump = true;
    if (this.touchState.detective.slide) this.detectiveInputs.slide = true;
    if (this.touchState.detective.interact) this.detectiveInputs.interact = true;
    if (this.touchState.detective.ability) this.detectiveInputs.ability = true;
  }

  setTouchInput(role, action, value) {
    const key = role.toLowerCase();
    if (this.touchState[key]) {
      this.touchState[key][action] = value;
    }
  }
}

export const inputManager = new InputManager();
