// Thief (CIPHER) Character Controller — Boutique Vector Artwork Edition

import { THIEF_SPEED, THIEF_JUMP_FORCE, STOMP_SPEED, THIEF_MAX_HP, BUILDING_WIDTH } from '../utils/constants.js';

export class ThiefController {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 220;
    this.y = 40; // Starts at Top Floor +100 (Index 0)
    this.width = 28;
    this.height = 46;
    this.vx = 0;
    this.vy = 0;

    this.hp = THIEF_MAX_HP;
    this.chips = 0;
    this.isGrounded = false;
    this.stomping = false;
    this.isStunned = false;
    this.stunTimer = 0;
    this.facing = 'RIGHT';
    this.currentFloorIndex = 100; // Floor +100
    this.active = true;
    this.hasDiamond = true;
    this.stealthTimer = 0;
    this.abilityCooldown = 0;
  }

  update(inputs) {
    if (this.abilityCooldown > 0) this.abilityCooldown -= 1 / 60;
    if (this.stealthTimer > 0) this.stealthTimer -= 1 / 60;

    if (inputs.ability && this.abilityCooldown <= 0) {
      this.stealthTimer = 3.5;
      this.abilityCooldown = 8.0;
    }

    const currentSpeed = this.stealthTimer > 0 ? THIEF_SPEED * 1.5 : THIEF_SPEED;

    if (this.isStunned) {
      this.stunTimer -= 1 / 60;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
      }
      this.vx = 0;
      return;
    }

    if (inputs.left) {
      this.vx = -currentSpeed;
      this.facing = 'LEFT';
    } else if (inputs.right) {
      this.vx = currentSpeed;
      this.facing = 'RIGHT';
    } else {
      this.vx *= 0.7;
    }

    if (inputs.jump && this.isGrounded) {
      this.vy = THIEF_JUMP_FORCE;
      this.isGrounded = false;
    }

    if (inputs.stomp && !this.isGrounded && !this.stomping) {
      this.stomping = true;
      this.vy = STOMP_SPEED;
    }
  }

  stun(durationSeconds = 3.0) {
    this.isStunned = true;
    this.stunTimer = durationSeconds;
  }

  draw(ctx) {
    ctx.save();

    if (this.isStunned && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    } else if (this.stealthTimer > 0) {
      ctx.globalAlpha = 0.45;
    } else {
      ctx.globalAlpha = 0.95;
    }

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + 3;
    const scaleX = this.facing === 'LEFT' ? -1 : 1;

    ctx.translate(centerX, centerY);
    ctx.scale(scaleX * 0.85, 0.85);

    // 1. Dual Jetpack Thruster Backpack (Champagne Gold)
    ctx.fillStyle = '#C5A059';
    ctx.beginPath();
    ctx.roundRect(-22, -16, 12, 22, 3);
    ctx.fill();

    // Twin Thruster Nozzles
    ctx.fillStyle = '#141720';
    ctx.fillRect(-20, 6, 4, 6);
    ctx.fillRect(-14, 6, 4, 6);

    // Dynamic Thruster Flame Spark (When moving or stomping)
    if (Math.abs(this.vx) > 0.5 || this.stomping || !this.isGrounded) {
      ctx.fillStyle = '#E5DEC9';
      ctx.beginPath();
      ctx.arc(-17, 14 + (Math.random() * 4), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. High-Tech Aerodynamic Tailored Coat (Flowing in wind)
    ctx.fillStyle = '#E5DEC9'; // Platinum Ivory Coat
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(12, -18);
    ctx.lineTo(16, 8);
    // Flared Coat Tails
    const walkSwing = Math.sin(Date.now() * 0.015) * 4;
    ctx.quadraticCurveTo(-5, 24 + walkSwing, -26, 18);
    ctx.quadraticCurveTo(-14, 4, -10, -18);
    ctx.closePath();
    ctx.fill();

    // Harness Straps & Chest Plate Detail
    ctx.fillStyle = '#141720';
    ctx.fillRect(-4, -16, 14, 4);
    ctx.fillRect(0, -12, 10, 14);

    // 3. Operative Head & Hood
    ctx.fillStyle = '#141720'; // Obsidian Mask & Hood
    ctx.beginPath();
    ctx.arc(2, -23, 9, 0, Math.PI * 2);
    ctx.fill();

    // Golden Visor Strip (Glowing Highlight)
    ctx.fillStyle = '#C5A059';
    ctx.beginPath();
    ctx.roundRect(4, -25, 8, 3.5, 1.5);
    ctx.fill();

    // Visor Inner Glare Accent
    ctx.fillStyle = '#FFF5D6';
    ctx.fillRect(7, -25, 3, 1.5);

    // Stomp Impact Effect
    if (this.stomping) {
      ctx.fillStyle = 'rgba(197, 160, 89, 0.4)';
      ctx.fillRect(-25, 26, 50, 4);
    }

    ctx.restore();
  }
}
