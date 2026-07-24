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
      }

      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  update() {
    // Thief Keyboard Mapping (WASD + Q/E + Space)
    const k = this.keys;
    this.thiefInputs.left = k['KeyA'] || false;
    this.thiefInputs.right = k['KeyD'] || false;
    this.thiefInputs.jump = k['KeyW'] || k['Space'] || false;
    this.thiefInputs.stomp = k['KeyS'] || false;
    this.thiefInputs.interact = k['KeyE'] || false;
    this.thiefInputs.ability = k['KeyQ'] || false;

    // Merge Touch for Thief
    if (this.touchState.thief.dx < -0.3) this.thiefInputs.left = true;
    if (this.touchState.thief.dx > 0.3) this.thiefInputs.right = true;
    if (this.touchState.thief.jump) this.thiefInputs.jump = true;
    if (this.touchState.thief.stomp) this.thiefInputs.stomp = true;
    if (this.touchState.thief.interact) this.thiefInputs.interact = true;
    if (this.touchState.thief.ability) this.thiefInputs.ability = true;

    // Detective Keyboard Mapping (Arrow Keys + Shift/Enter//)
    this.detectiveInputs.left = k['ArrowLeft'] || false;
    this.detectiveInputs.right = k['ArrowRight'] || false;
    this.detectiveInputs.jump = k['ArrowUp'] || false;
    this.detectiveInputs.slide = k['ArrowDown'] || false;
    this.detectiveInputs.interact = k['Enter'] || k['Slash'] || false;
    this.detectiveInputs.ability = k['ShiftLeft'] || k['ShiftRight'] || false;

    // Merge Touch for Detective
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
