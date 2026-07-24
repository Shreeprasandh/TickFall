// Thief (CIPHER) Character Controller — Human Studio Artwork Edition

import { THIEF_SPEED, THIEF_JUMP_FORCE, STOMP_SPEED, THIEF_MAX_HP, BUILDING_WIDTH } from '../utils/constants.js';

export class ThiefController {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = BUILDING_WIDTH / 2 - 16;
    this.y = 30;
    this.width = 30;
    this.height = 48;
    this.vx = 0;
    this.vy = 0;

    this.hp = THIEF_MAX_HP;
    this.chips = 0;
    this.isGrounded = false;
    this.stomping = false;
    this.isStunned = false;
    this.stunTimer = 0;
    this.facing = 'RIGHT';
    this.currentFloorIndex = 40;
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
    }

    // Refined Operative Artwork: Tailored Coat & Mask (No Neon Glows)
    const px = this.x;
    const py = this.y;

    // Body Coat (Warm Dark Platinum Charcoal)
    ctx.fillStyle = '#1E222D';
    ctx.fillRect(px + 4, py + 14, 22, 28);

    // Platinum Lapel / Trim
    ctx.fillStyle = '#E2D9C8';
    ctx.fillRect(px + 10, py + 14, 10, 20);

    // Operative Hood / Mask
    ctx.fillStyle = '#141720';
    ctx.beginPath();
    ctx.arc(px + 15, py + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Refined Silver Visor Line
    ctx.fillStyle = '#E2D9C8';
    const vX = this.facing === 'RIGHT' ? px + 15 : px + 7;
    ctx.fillRect(vX, py + 8, 8, 2);

    // Stomp Effect: Subtle Floor Smash Particle Lines (No neon aura)
    if (this.stomping) {
      ctx.fillStyle = 'rgba(226, 217, 200, 0.2)';
      ctx.fillRect(px, py + 42, 30, 6);
    }

    ctx.restore();
  }
}
