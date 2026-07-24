// Bomb Diffuse 6-Wire Memory Puzzle Modal

import { events } from '../../utils/events.js';
import { audioManager } from '../../engine/AudioManager.js';

export class BombPuzzleModal {
  constructor() {
    this.container = null;
    this.wires = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    this.targetSequence = [];
    this.playerSequence = [];
    this.timeLeft = 12;
    this.timerInterval = null;
    this.createHTML();
    this.initEvents();
  }

  createHTML() {
    this.container = document.createElement('div');
    this.container.id = 'bombPuzzleModal';
    this.container.className = 'modal-overlay hidden';
    this.container.innerHTML = `
      <div class="modal-card bomb-puzzle-card">
        <h2 class="modal-title">⚠️ DEFUSE BOMB DEVICE</h2>
        <p class="modal-subtitle">MEMORIZE & CLIP THE CORRECT 3 WIRES BEFORE TIMER EXPIRES</p>
        
        <div class="puzzle-timer" id="puzzleTimer">12.0s</div>
        
        <div class="target-sequence-box" id="targetSequenceBox">
          <span>TARGET SEQUENCE:</span>
          <div class="sequence-dots" id="sequenceDots"></div>
        </div>

        <div class="wires-grid" id="wiresGrid"></div>
        
        <div class="puzzle-status" id="puzzleStatus">MEMORIZE THE SEQUENCE!</div>
      </div>
    `;
    document.body.appendChild(this.container);
  }

  initEvents() {
    events.on('puzzle:open', () => this.open());
  }

  open() {
    this.container.classList.remove('hidden');
    this.playerSequence = [];
    this.timeLeft = 12.0;

    // Pick 3 random wire colors for sequence
    const shuffled = [...this.wires].sort(() => 0.5 - Math.random());
    this.targetSequence = shuffled.slice(0, 3);

    this.renderSequenceDots();
    this.renderWires(true); // Hidden wires initially during 2s preview

    const statusEl = document.getElementById('puzzleStatus');
    statusEl.innerText = 'MEMORIZE THE TARGET COLORS!';

    setTimeout(() => {
      if (statusEl) statusEl.innerText = 'NOW CLIP THE 3 WIRES IN ORDER!';
      this.renderWires(false); // Enable wire clicks
      this.startCountdown();
    }, 2000);
  }

  renderSequenceDots() {
    const box = document.getElementById('sequenceDots');
    box.innerHTML = this.targetSequence.map(color => `
      <span class="wire-dot" style="background-color: ${this.getColorHex(color)}"></span>
    `).join('');
  }

  getColorHex(name) {
    const map = { red: '#FF0844', blue: '#00F2FE', green: '#00E676', yellow: '#FFD700', purple: '#B388FF', orange: '#FF9100' };
    return map[name] || '#FFF';
  }

  renderWires(disabled) {
    const grid = document.getElementById('wiresGrid');
    grid.innerHTML = this.wires.map((color) => `
      <button class="wire-button ${disabled ? 'disabled' : ''}" data-color="${color}" style="border-color: ${this.getColorHex(color)}">
        <span class="wire-strand" style="background: ${this.getColorHex(color)}"></span>
        <span class="wire-name">${color.toUpperCase()}</span>
      </button>
    `).join('');

    if (!disabled) {
      grid.querySelectorAll('.wire-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const color = e.currentTarget.getAttribute('data-color');
          this.handleWireClick(color);
        });
      });
    }
  }

  handleWireClick(color) {
    audioManager.playClick();
    this.playerSequence.push(color);

    const expectedColor = this.targetSequence[this.playerSequence.length - 1];

    if (color !== expectedColor) {
      // Wrong wire!
      audioManager.playAlarm();
      events.emit('timer:modify', { delta: -8, source: 'Wrong Wire Cut' });
      this.close();
      return;
    }

    if (this.playerSequence.length === this.targetSequence.length) {
      // Success! Bomb Diffused
      audioManager.playCoin();
      events.emit('bomb:defused_success');
      this.close();
    }
  }

  startCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const timerEl = document.getElementById('puzzleTimer');

    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      if (timerEl) timerEl.innerText = `${Math.max(0, this.timeLeft).toFixed(1)}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        events.emit('timer:modify', { delta: -8, source: 'Bomb Puzzle Timeout' });
        this.close();
      }
    }, 100);
  }

  close() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.container.classList.add('hidden');
  }
}
