// Mobile Virtual Touch D-Pad & Action Controls Component

import { inputManager } from '../../engine/InputManager.js';

export class MobileControls {
  constructor(containerId = 'mobileOverlay') {
    this.container = document.getElementById(containerId);
    this.renderHTML();
    this.bindTouchEvents();
  }

  renderHTML() {
    if (!this.container) return;
    this.container.innerHTML = `
      <!-- Left Panel Touch Controls (Thief) -->
      <div class="touch-panel left-touch-panel">
        <div class="dpad">
          <button class="dpad-btn dpad-left" id="thiefLeft">◀</button>
          <button class="dpad-btn dpad-right" id="thiefRight">▶</button>
        </div>
        <div class="action-buttons">
          <button class="action-btn btn-jump" id="thiefJump">JUMP</button>
          <button class="action-btn btn-stomp" id="thiefStomp">STOMP</button>
          <button class="action-btn btn-interact" id="thiefInteract">ACTION</button>
        </div>
      </div>

      <!-- Right Panel Touch Controls (Detective) -->
      <div class="touch-panel right-touch-panel">
        <div class="dpad">
          <button class="dpad-btn dpad-left" id="detLeft">◀</button>
          <button class="dpad-btn dpad-right" id="detRight">▶</button>
        </div>
        <div class="action-buttons">
          <button class="action-btn btn-jump" id="detJump">GRAPPLE</button>
          <button class="action-btn btn-slide" id="detSlide">SLIDE</button>
          <button class="action-btn btn-interact" id="detInteract">ACTION</button>
        </div>
      </div>
    `;
  }

  bindTouchEvents() {
    const bindBtn = (id, role, action) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        inputManager.setTouchInput(role, action, true);
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        inputManager.setTouchInput(role, action, false);
      });
    };

    bindBtn('thiefLeft', 'THIEF', 'left');
    bindBtn('thiefRight', 'THIEF', 'right');
    bindBtn('thiefJump', 'THIEF', 'jump');
    bindBtn('thiefStomp', 'THIEF', 'stomp');
    bindBtn('thiefInteract', 'THIEF', 'interact');

    bindBtn('detLeft', 'DETECTIVE', 'left');
    bindBtn('detRight', 'DETECTIVE', 'right');
    bindBtn('detJump', 'DETECTIVE', 'jump');
    bindBtn('detSlide', 'DETECTIVE', 'slide');
    bindBtn('detInteract', 'DETECTIVE', 'interact');
  }
}
