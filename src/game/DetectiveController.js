// Detective (VALE) Character Controller — Human Studio Artwork Edition

import { DETECTIVE_SPEED, DETECTIVE_JUMP_FORCE, DETECTIVE_GRAPPLE_SPEED, DETECTIVE_MAX_HP, FLOOR_HEIGHT, TOTAL_FLOORS, BUILDING_WIDTH } from '../utils/constants.js';

export class DetectiveController {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = BUILDING_WIDTH / 2 - 16;
    this.y = (TOTAL_FLOORS - 1) * FLOOR_HEIGHT + 40;
    this.width = 30;
    this.height = 48;
    this.vx = 0;
    this.vy = 0;

    this.hp = DETECTIVE_MAX_HP;
    this.chips = 0;
    this.isGrounded = false;
    this.isGrappling = false;
    this.facing = 'RIGHT';
    this.currentFloorIndex = 1;
    this.active = true;
    this.bombDiffused = false;
  }

  update(inputs) {
    if (inputs.left) {
      this.vx = -DETECTIVE_SPEED;
      this.facing = 'LEFT';
    } else if (inputs.right) {
      this.vx = DETECTIVE_SPEED;
      this.facing = 'RIGHT';
    } else {
      this.vx *= 0.7;
    }

    if (inputs.jump) {
      if (this.isGrounded) {
        this.vy = DETECTIVE_JUMP_FORCE;
        this.isGrounded = false;
      } else if (!this.isGrappling && this.vy < 2) {
        this.isGrappling = true;
        this.vy = DETECTIVE_GRAPPLE_SPEED;
      }
    } else {
      this.isGrappling = false;
    }
  }

  draw(ctx) {
    ctx.save();

    const px = this.x;
    const py = this.y;

    // Tailored Trench Coat (Deep Umber Charcoal)
    ctx.fillStyle = '#26231E';
    ctx.fillRect(px + 4, py + 14, 22, 28);

    // Champagne Gold Tie / Badge Trim
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(px + 13, py + 16, 4, 16);

    // Inspector Fedora Hat
    ctx.fillStyle = '#1A1815';
    ctx.fillRect(px + 3, py + 2, 24, 10);
    // Hat Brim
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(px - 1, py + 11, 32, 2);

    // Motorized Cable Line (Refined Hairline Wire)
    if (this.isGrappling) {
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 15, py);
      ctx.lineTo(px + 15, py - 60);
      ctx.stroke();
    }

    ctx.restore();
  }
}
