// Canvas-based Particle System for Visual Effects & Micro-Animations

import { randomRange } from '../utils/math.js';

export class Particle {
  constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.shape = shape;
    this.alpha = 1.0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // mild particle gravity
    this.life -= 1;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'spark') {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size * 2);
    } else {
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count = 10, type = 'stomp', customColor = null) {
    for (let i = 0; i < count; i++) {
      let vx = randomRange(-3, 3);
      let vy = randomRange(-4, 2);
      let color = customColor || '#00F2FE';
      let size = randomRange(2, 5);
      let life = randomRange(15, 30);
      let shape = 'circle';

      if (type === 'stomp') {
        vx = randomRange(-5, 5);
        vy = randomRange(-2, -6);
        color = customColor || '#FFD700';
        size = randomRange(3, 7);
        shape = 'square';
      } else if (type === 'camera') {
        color = '#00F2FE';
        shape = 'spark';
        life = randomRange(20, 40);
      } else if (type === 'pickup') {
        color = '#FFD700';
        vy = randomRange(-3, -1);
      } else if (type === 'explosion') {
        vx = randomRange(-8, 8);
        vy = randomRange(-8, 8);
        color = Math.random() > 0.5 ? '#FF0844' : '#FF9100';
        size = randomRange(4, 9);
      }

      this.particles.push(new Particle(x, y, vx, vy, color, size, life, shape));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
}
