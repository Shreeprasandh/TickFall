// Detective (VALE) Character Controller — Boutique Vector Artwork Edition

import { DETECTIVE_SPEED, DETECTIVE_JUMP_FORCE, DETECTIVE_GRAPPLE_SPEED, DETECTIVE_MAX_HP, FLOOR_HEIGHT, TOTAL_FLOORS, BUILDING_WIDTH } from '../utils/constants.js';

export class DetectiveController {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 220;
    this.y = 199 * 160 + 40; // Starts at Sub-Basement Floor -100 (Index 199)
    this.width = 30;
    this.height = 48;
    this.vx = 0;
    this.vy = 0;

    this.hp = DETECTIVE_MAX_HP;
    this.chips = 0;
    this.isGrounded = false;
    this.isGrappling = false;
    this.facing = 'RIGHT';
    this.currentFloorIndex = -100; // Floor -100
    this.active = true;
    this.bombDiffused = false;
    this.radarPulseTimer = 0;
    this.abilityCooldown = 0;
  }

  update(inputs) {
    if (this.abilityCooldown > 0) this.abilityCooldown -= 1 / 60;
    if (this.radarPulseTimer > 0) this.radarPulseTimer -= 1 / 60;

    if (inputs.ability && this.abilityCooldown <= 0) {
      this.radarPulseTimer = 2.5;
      this.abilityCooldown = 8.0;
    }

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
    ctx.globalAlpha = 0.95;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const scaleX = this.facing === 'LEFT' ? -1 : 1;

    // Grapple Cable
    if (this.isGrappling) {
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, this.y);
      ctx.lineTo(centerX, this.y - 65);
      ctx.stroke();
    }

    ctx.translate(centerX, centerY);
    ctx.scale(scaleX * 0.85, 0.85);

    // Dynamic Walking Stride leg swing
    const stride = Math.abs(this.vx) > 0.5 ? Math.sin(Date.now() * 0.018) * 8 : 0;

    // 1. Running Legs & Stride Mechanics
    ctx.fillStyle = '#141720'; // Obsidian Trousers
    // Rear Leg
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(-18 - stride, 28);
    ctx.lineTo(-14 - stride, 30);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();

    // Front Leg
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(14 + stride, 28);
    ctx.lineTo(18 + stride, 27);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();

    // Leather Shoes
    ctx.fillStyle = '#1A1815';
    ctx.fillRect(-22 - stride, 28, 8, 3.5);
    ctx.fillRect(14 + stride, 27, 8, 3.5);

    // 2. Noir Double-Breasted Trench Coat
    ctx.fillStyle = '#C5A059'; // Champagne Gold Trench Coat
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(18, 14);
    // Dynamic Flared Coat Tail Blowing in Wind
    ctx.quadraticCurveTo(-4, 30, -28 - (stride * 0.5), 24);
    ctx.quadraticCurveTo(-12, 6, -10, -18);
    ctx.closePath();
    ctx.fill();

    // Trench Lapels & High Collar
    ctx.fillStyle = '#141720';
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(8, -8);
    ctx.lineTo(-2, -4);
    ctx.closePath();
    ctx.fill();

    // Double-Breasted Buttons & Belt Detail
    ctx.fillStyle = '#E5DEC9';
    ctx.fillRect(4, -10, 2.5, 2.5);
    ctx.fillRect(4, -4, 2.5, 2.5);
    ctx.fillRect(4, 2, 2.5, 2.5);
    ctx.fillRect(1, 6, 6, 4.5); // Belt Buckle

    // 3. Head & Classic Fedora Hat
    ctx.fillStyle = '#141720'; // Head Profile Shadow
    ctx.beginPath();
    ctx.arc(2, -22, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Classic Fedora Crown
    ctx.fillStyle = '#1A1815';
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.quadraticCurveTo(1, -36, 10, -26);
    ctx.lineTo(-8, -26);
    ctx.closePath();
    ctx.fill();

    // Gold Fedora Ribbon Band
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(-8, -27.5, 18, 2.5);

    // Fedora Broad Angled Brim (Shadow Over Eyes)
    ctx.fillStyle = '#1A1815';
    ctx.beginPath();
    ctx.ellipse(1, -24, 16, 3.5, -0.12, 0, Math.PI * 2);
    ctx.fill();

    // 4. Extended Arm Holding Heavy Metallic Flashlight
    ctx.fillStyle = '#C5A059'; // Arm Sleeve
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(20, -6);
    ctx.lineTo(18, -2);
    ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();

    // Metal Heavy Flashlight Cylinder
    ctx.fillStyle = '#E5DEC9';
    ctx.fillRect(18, -8, 10, 4.5);

    // Flashlight Light Beam Cone (Oriented toward facing direction)
    const flashAngle = Math.sin(Date.now() * 0.003) * 0.12;
    ctx.fillStyle = 'rgba(229, 222, 201, 0.14)';
    ctx.beginPath();
    ctx.moveTo(28, -6);
    ctx.lineTo(180, -45 + flashAngle * 30);
    ctx.lineTo(180, 40 + flashAngle * 30);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
