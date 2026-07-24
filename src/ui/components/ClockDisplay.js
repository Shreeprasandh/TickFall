// Central Countdown Chronometer Component — Luxury Swiss Minimalist Edition

import { events } from '../../utils/events.js';

export class ClockDisplay {
  constructor(elementId = 'clockContainer') {
    this.container = document.getElementById(elementId);
    this.timeText = null;
    this.progressBar = null;
    this.statusText = null;
    this.renderHTML();
    this.initEvents();
  }

  renderHTML() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="clock-card" id="clockCard">
        <div class="clock-header">
          <span class="clock-label" id="clockLabel">CHRONOMETER</span>
        </div>
        <div class="clock-time" id="clockTime">03:30</div>
        <div class="clock-progress-track">
          <div class="clock-progress-fill" id="clockProgressFill" style="width: 100%;"></div>
        </div>
        <div class="clock-subtext" id="clockSubtext">CIPHER VS VALE</div>
      </div>
    `;

    this.timeText = document.getElementById('clockTime');
    this.progressBar = document.getElementById('clockProgressFill');
    this.card = document.getElementById('clockCard');
  }

  initEvents() {
    events.on('timer:update', (data) => {
      if (!this.timeText) return;

      const mins = Math.floor(data.remaining / 60);
      const secs = Math.floor(data.remaining % 60);
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      this.timeText.innerText = formatted;

      if (this.progressBar) {
        this.progressBar.style.width = `${Math.max(0, data.percent * 100)}%`;
      }

      if (data.isBombDiffused) {
        this.card.className = 'clock-card state-diffused';
      } else if (data.percent < 0.15) {
        this.card.className = 'clock-card state-critical';
      } else if (data.percent < 0.4) {
        this.card.className = 'clock-card state-warning';
      } else {
        this.card.className = 'clock-card state-normal';
      }
    });

    events.on('timer:sudden_death', () => {
      if (this.card) this.card.classList.add('state-sudden-death');
    });
  }
}
