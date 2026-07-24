// The Fence In-Run Shop Modal

import { events } from '../../utils/events.js';
import { audioManager } from '../../engine/AudioManager.js';

export class FenceShopModal {
  constructor() {
    this.container = null;
    this.currentRole = 'THIEF';
    this.items = [
      { id: 'jammer', name: 'Signal Jammer', cost: 8, icon: '📡', desc: 'Disables cameras & cuts -8s from clock' },
      { id: 'crowbar', name: 'Crowbar Dash', cost: 10, icon: '🛠️', desc: 'Break through solid floor platforms instantly' },
      { id: 'smoke', name: 'Smoke Bomb', cost: 12, icon: '💨', desc: 'Become completely invisible to radar for 5 seconds' },
      { id: 'heal', name: 'First Aid Kit', cost: 6, icon: '🩹', desc: 'Restore +1 HP instantly' }
    ];
    this.isOpen = false;
    this.keyListener = (e) => {
      if (!this.isOpen) return;
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        this.buyItem('jammer', 8);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        this.buyItem('crowbar', 10);
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        this.buyItem('smoke', 12);
      } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
        this.buyItem('heal', 6);
      } else if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'KeyQ') {
        this.close();
      }
    };
    this.createHTML();
    this.initEvents();
  }

  createHTML() {
    this.container = document.createElement('div');
    this.container.id = 'fenceShopModal';
    this.container.className = 'modal-overlay hidden';
    this.container.innerHTML = `
      <div class="modal-card shop-card">
        <div class="modal-header">
          <h2>🕵️ THE FENCE — BLACK MARKET</h2>
          <button class="close-btn" id="closeShopBtn">✕ [ESC]</button>
        </div>
        <p class="modal-subtitle">EXCHANGE HEIST CHIPS FOR SURVIVAL GEAR — PRESS [1], [2], [3], [4] TO BUY</p>
        
        <div class="shop-items-grid" id="shopItemsGrid"></div>
        
        <div class="shop-footer">
          <span>YOUR CHIPS: <strong id="shopChipCount">0</strong> 🪙</span>
          <span class="shop-hotkey-hint">PRESS <strong>1-4</strong> TO BUY | <strong>ESC</strong> TO EXIT</span>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
  }

  initEvents() {
    events.on('shop:open', (data) => {
      this.currentRole = data.role || 'THIEF';
      this.open();
    });

    document.getElementById('closeShopBtn').addEventListener('click', () => this.close());
    window.addEventListener('keydown', this.keyListener);
  }

  open() {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.container.classList.remove('hidden');
    this.renderItems();
  }

  renderItems() {
    const grid = document.getElementById('shopItemsGrid');
    const chipCountEl = document.getElementById('shopChipCount');
    if (chipCountEl) chipCountEl.innerText = window.gameEngine ? window.gameEngine.thief.chips : 0;

    grid.innerHTML = this.items.map((item, idx) => `
      <div class="shop-item-card">
        <div class="item-icon">${item.icon}</div>
        <div class="item-info">
          <h4><span class="key-badge">[${idx + 1}]</span> ${item.name}</h4>
          <p>${item.desc}</p>
        </div>
        <button class="buy-btn" data-id="${item.id}" data-cost="${item.cost}">
          BUY [${idx + 1}] (${item.cost} 🪙)
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cost = parseInt(e.currentTarget.getAttribute('data-cost'));
        const itemId = e.currentTarget.getAttribute('data-id');
        this.buyItem(itemId, cost);
      });
    });
  }

  buyItem(itemId, cost) {
    if (!window.gameEngine) return;
    const player = this.currentRole === 'THIEF' ? window.gameEngine.thief : window.gameEngine.detective;

    if (player.chips >= cost) {
      player.chips -= cost;
      audioManager.playCoin();

      if (itemId === 'jammer') {
        events.emit('timer:modify', { delta: -8, source: 'Signal Jammer' });
      } else if (itemId === 'heal') {
        player.hp = Math.min(3, player.hp + 1);
      }

      this.renderItems();
    } else {
      audioManager.playAlarm();
    }
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.container.classList.add('hidden');
  }
}
