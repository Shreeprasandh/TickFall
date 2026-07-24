// Camera System with lerp smoothing and screen shake

import { lerp, clamp } from '../utils/math.js';
import { CANVAS_HEIGHT, TOTAL_FLOORS, FLOOR_HEIGHT } from '../utils/constants.js';

export class Camera {
  constructor(isThief = true) {
    this.isThief = isThief; // Thief follows downward, Detective follows upward
    this.y = isThief ? TOTAL_FLOORS * FLOOR_HEIGHT : 0;
    this.targetY = this.y;
    this.lerpSpeed = 0.12;

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  update(targetCharY) {
    // Keep character in upper third if going down (Thief), lower third if going up (Detective)
    const targetOffset = this.isThief ? CANVAS_HEIGHT * 0.35 : CANVAS_HEIGHT * 0.65;
    this.targetY = targetCharY - targetOffset;

    // Clamp camera within tower bounds
    const minY = 0;
    const maxY = TOTAL_FLOORS * FLOOR_HEIGHT - CANVAS_HEIGHT;
    this.targetY = clamp(this.targetY, minY, maxY);

    // Smooth lerp movement
    this.y = lerp(this.y, this.targetY, this.lerpSpeed);

    // Handle screen shake
    if (this.shakeIntensity > 0.1) {
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  shake(amount = 8) {
    this.shakeIntensity = Math.max(this.shakeIntensity, amount);
  }

  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.shakeOffsetX, -this.y + this.shakeOffsetY);
  }

  restoreTransform(ctx) {
    ctx.restore();
  }

  // Get range of floor indices visible in camera
  getVisibleFloorRange() {
    const startFloor = Math.max(0, Math.floor(this.y / FLOOR_HEIGHT) - 1);
    const endFloor = Math.min(TOTAL_FLOORS - 1, Math.ceil((this.y + CANVAS_HEIGHT) / FLOOR_HEIGHT) + 1);
    return { startFloor, endFloor };
  }
}
