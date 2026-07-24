// Masterpiece Boutique Thriller Lobby Background & Dynamic Trajectory Engine

export class LobbyBackground {
  constructor() {
    let canvas = document.getElementById('lobbyBgCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'lobbyBgCanvas';
      const homeScreen = document.getElementById('homeScreen') || document.body;
      homeScreen.insertBefore(canvas, homeScreen.firstChild);
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.background = 'transparent';
    this.canvas.style.zIndex = '1';

    this.resize();

    // 1. Ambient Layer: Fine Ivory & Gold Dust Motes
    this.particles = [];
    this.initParticles();

    // 2. Light, Delicate, Low-Opacity Cursor Trail (Original Beloved Style)
    this.trail = [];
    this.mouse = { x: -100, y: -100 };
    this.active = true;

    // 3. Time-Delta Frame Pacing
    this.lastTime = performance.now();

    // 4. Randomized Narrative Timeline
    this.animState = 'THIEF_FLY';
    this.stateTimer = 0;

    // Generate First Randomized Flight Route & Searchlight Pattern
    this.generateRandomRoute();

    // Thruster Spark Effects
    this.effects = [];

    this.bindEvents();
    this.animate();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = (window.innerWidth || 1280) * dpr;
    this.height = (window.innerHeight || 720) * dpr;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  generateRandomRoute() {
    // 1. Cipher's Randomized Flight Trajectory
    this.thiefY = (0.22 + Math.random() * 0.18) * this.height; // 22% to 40% height
    this.thiefPauseX = (0.35 + Math.random() * 0.25) * this.width; // 35% to 60% width
    this.thiefPos = { x: -140, y: this.thiefY };
    this.thiefFacing = 'RIGHT';
    this.thiefState = 'ENTERING';
    this.thiefHoverBob = 0;

    // 2. Inspector Vale's Pursuit Trajectory (Tracks Cipher's Path at lower level)
    this.detY = Math.min(this.height * 0.72, this.thiefY + this.height * 0.34);
    this.detPauseX = this.thiefPauseX + (Math.random() - 0.5) * (this.width * 0.12);
    this.detPos = { x: -140, y: this.detY };
    this.detFacing = 'RIGHT';
    this.detState = 'ENTERING';
    this.detFlashlightAngle = 0;

    // 3. FIXED Searchlight Bases (Origins stay fixed at 18% & 82% tower rooftops; angles randomize)
    this.searchlights = [
      {
        x: this.width * 0.18, // Fixed Left Rooftop Origin
        angle: -0.25 - Math.random() * 0.20,
        speed: 0.005 + Math.random() * 0.005,
        maxAngle: 0.45 + Math.random() * 0.15,
        active: false
      },
      {
        x: this.width * 0.82, // Fixed Right Rooftop Origin
        angle: 0.25 + Math.random() * 0.20,
        speed: -(0.005 + Math.random() * 0.005),
        maxAngle: 0.45 + Math.random() * 0.15,
        active: false
      }
    ];
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1.5,
        color: Math.random() > 0.5 ? '229, 222, 201' : '197, 160, 89',
        opacity: Math.random() * 0.5 + 0.2,
        vy: -Math.random() * 0.35 - 0.1,
        vx: (Math.random() - 0.5) * 0.15,
        pulseSpeed: Math.random() * 0.025 + 0.008
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    const addTrailPoint = (clientX, clientY) => {
      if (!this.active) return;
      const dpr = window.devicePixelRatio || 1;
      const canvasX = clientX * dpr;
      const canvasY = clientY * dpr;

      this.trail.push({
        x: canvasX,
        y: canvasY,
        size: (Math.random() * 5 + 2.5) * dpr,
        color: Math.random() > 0.5 ? '229, 222, 201' : '197, 160, 89',
        opacity: 0.65,
        life: 24
      });
    };

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      addTrailPoint(e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      addTrailPoint(e.clientX, e.clientY);
    });
  }

  setActive(state) {
    this.active = state;
    this.canvas.style.display = state ? 'block' : 'none';
  }

  updateCinematic(dt) {
    this.stateTimer += dt;

    if (this.animState === 'THIEF_FLY') {
      this.updateThiefSequence(dt);
    } else if (this.animState === 'PAUSE_AFTER_THIEF') {
      if (this.stateTimer > 3.5) {
        this.animState = 'SEARCHLIGHTS';
        this.stateTimer = 0;
        this.searchlights.forEach(s => s.active = true);
      }
    } else if (this.animState === 'SEARCHLIGHTS') {
      this.updateSearchlightsSequence(dt);
    } else if (this.animState === 'PAUSE_AFTER_LIGHTS') {
      if (this.stateTimer > 4.0) {
        this.animState = 'DETECTIVE_PURSUIT';
        this.stateTimer = 0;
      }
    } else if (this.animState === 'DETECTIVE_PURSUIT') {
      this.updateDetectiveSequence(dt);
    } else if (this.animState === 'IDLE') {
      if (this.stateTimer > 10.0) { // Spacious 10.0s ambient stillness between full cycles
        this.resetCinematic();
      }
    }
  }

  resetCinematic() {
    this.animState = 'THIEF_FLY';
    this.stateTimer = 0;
    this.generateRandomRoute();
  }

  updateThiefSequence(dt) {
    this.thiefHoverBob = Math.sin(Date.now() * 0.0035) * 7;

    if (this.thiefState === 'ENTERING') {
      const dx = this.thiefPauseX - this.thiefPos.x;
      this.thiefPos.x += dx * (dt * 2.5);

      if (Math.random() < 0.75) {
        this.effects.push({
          x: this.thiefPos.x - 22,
          y: this.thiefPos.y + this.thiefHoverBob + 18,
          vx: -Math.random() * 3 - 1.5,
          vy: Math.random() * 2 - 1,
          color: '229, 222, 201',
          size: Math.random() * 4 + 2,
          opacity: 0.8,
          life: 20
        });
      }

      if (dx < 16) {
        this.thiefState = 'PAUSED';
        this.stateTimer = 0;
      }
    } else if (this.thiefState === 'PAUSED') {
      if (this.stateTimer > 0.5) {
        this.thiefFacing = 'LEFT';
      }

      if (this.stateTimer > 1.8) {
        this.thiefFacing = 'RIGHT';
        this.thiefState = 'ESCAPING';
      }
    } else if (this.thiefState === 'ESCAPING') {
      this.thiefPos.x += 750 * dt;

      for (let i = 0; i < 2; i++) {
        this.effects.push({
          x: this.thiefPos.x - 25,
          y: this.thiefPos.y + this.thiefHoverBob + 18,
          vx: -Math.random() * 5 - 2,
          vy: Math.random() * 3 - 1.5,
          color: '197, 160, 89',
          size: Math.random() * 5 + 2.5,
          opacity: 0.85,
          life: 22
        });
      }

      if (this.thiefPos.x > this.width + 160) {
        this.animState = 'PAUSE_AFTER_THIEF';
        this.stateTimer = 0;
      }
    }
  }

  updateSearchlightsSequence(dt) {
    this.searchlights.forEach(s => {
      s.angle += s.speed;
      if (s.angle > s.maxAngle || s.angle < -s.maxAngle) {
        s.speed *= -1;
      }
    });

    if (this.stateTimer > 4.5) {
      this.searchlights.forEach(s => s.active = false);
      this.animState = 'PAUSE_AFTER_LIGHTS';
      this.stateTimer = 0;
    }
  }

  updateDetectiveSequence(dt) {
    this.detFlashlightAngle = Math.sin(Date.now() * 0.003) * 0.18;

    if (this.detState === 'ENTERING') {
      const dx = this.detPauseX - this.detPos.x;
      this.detPos.x += dx * (dt * 2.6);

      if (dx < 16) {
        this.detState = 'SCANNING';
        this.stateTimer = 0;
      }
    } else if (this.detState === 'SCANNING') {
      if (this.stateTimer > 0.5) {
        this.detFacing = 'LEFT';
      }

      if (this.stateTimer > 1.8) {
        this.detFacing = 'RIGHT';
        this.detState = 'PURSUING';
      }
    } else if (this.detState === 'PURSUING') {
      this.detPos.x += 650 * dt;

      if (this.detPos.x > this.width + 160) {
        this.animState = 'IDLE';
        this.stateTimer = 0;
      }
    }
  }

  animate() {
    if (!this.active) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.ctx.clearRect(0, 0, this.width, this.height);
    const ctx = this.ctx;

    // 1. Subtle, Low-Opacity Dark Charcoal Base Gradient (#0D0F14 to #07080B)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#0D0F14');
    bgGrad.addColorStop(1, '#07080B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle, Elegant Warm Gold Highlight behind Title
    const titleGlow = ctx.createRadialGradient(
      this.width / 2, this.height * 0.32, 10,
      this.width / 2, this.height * 0.32, this.width * 0.4
    );
    titleGlow.addColorStop(0, 'rgba(197, 160, 89, 0.12)');
    titleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = titleGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    this.updateCinematic(dt);

    // 2. Draw Subtle, Delicate Dust Motes
    this.particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }

      ctx.save();
      const alpha = Math.max(0.18, Math.min(0.65, p.opacity));
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Draw Low-Opacity Sweeping Searchlights (Fixed Origins at 18% & 82%)
    this.searchlights.forEach(s => {
      if (!s.active) return;
      ctx.save();
      ctx.translate(s.x, this.height);
      ctx.rotate(s.angle);
      ctx.fillStyle = 'rgba(229, 222, 201, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-180, -this.height * 1.4);
      ctx.lineTo(180, -this.height * 1.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 4. Draw Thruster Flame Sparks
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const ef = this.effects[i];
      ef.x += ef.vx;
      ef.y += ef.vy;
      ef.life -= 1;
      ef.opacity = (ef.life / 22) * 0.85;

      if (ef.life <= 0) {
        this.effects.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(${ef.color}, ${ef.opacity})`;
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, ef.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Masterpiece Cipher Silhouette
    if (this.animState === 'THIEF_FLY') {
      this.drawThiefSilhouette(ctx, this.thiefPos.x, this.thiefPos.y + this.thiefHoverBob, this.thiefFacing);
    }

    // 6. Draw Masterpiece Inspector Vale Silhouette
    if (this.animState === 'DETECTIVE_PURSUIT') {
      this.drawDetectiveSilhouette(ctx, this.detPos.x, this.detPos.y, this.detFacing);
    }

    // 7. Draw Original Light, Delicate, Low-Opacity Cursor Trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const pt = this.trail[i];
      pt.life -= 1;
      pt.opacity = (pt.life / 24) * 0.7;
      pt.size *= 0.94;

      if (pt.life <= 0) {
        this.trail.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(${pt.color}, ${pt.opacity})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }

  drawThiefSilhouette(ctx, x, y, facing) {
    ctx.save();
    ctx.globalAlpha = 0.92;

    const scaleX = facing === 'LEFT' ? -1 : 1;
    ctx.translate(x, y);
    ctx.scale(scaleX * 2.2, 2.2);

    // 1. Dual Jetpack Thruster Backpack
    ctx.fillStyle = '#C5A059'; // Champagne Gold Hardware
    ctx.beginPath();
    ctx.roundRect(-22, -16, 12, 22, 3);
    ctx.fill();

    // Twin Thruster Nozzles
    ctx.fillStyle = '#141720';
    ctx.fillRect(-20, 6, 4, 6);
    ctx.fillRect(-14, 6, 4, 6);

    // 2. High-Tech Aerodynamic Tailored Coat (Flowing in wind)
    ctx.fillStyle = '#E5DEC9'; // Platinum Ivory Coat
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(12, -18);
    ctx.lineTo(16, 8);
    // Flared Coat Tails
    ctx.quadraticCurveTo(-5, 24, -26, 18);
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

    ctx.restore();
  }

  drawDetectiveSilhouette(ctx, x, y, facing) {
    ctx.save();
    ctx.globalAlpha = 0.94;

    const scaleX = facing === 'LEFT' ? -1 : 1;
    ctx.translate(x, y);
    ctx.scale(scaleX * 2.2, 2.2);

    // 1. Running Legs & Stride Mechanics
    ctx.fillStyle = '#141720'; // Obsidian Trousers
    // Rear Leg (Extending Back)
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(-18, 28);
    ctx.lineTo(-14, 30);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();

    // Front Leg (Forward Stride)
    ctx.beginPath();
    ctx.moveTo(2, 14);
    ctx.lineTo(14, 28);
    ctx.lineTo(18, 27);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();

    // Leather Shoes
    ctx.fillStyle = '#1A1815';
    ctx.fillRect(-22, 28, 8, 3.5);
    ctx.fillRect(14, 27, 8, 3.5);

    // 2. Noir Double-Breasted Trench Coat
    ctx.fillStyle = '#C5A059'; // Champagne Gold Trench Coat
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(18, 14);
    // Dynamic Flared Coat Tail Blowing in Wind
    ctx.quadraticCurveTo(-4, 30, -28, 24);
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

    // Classic Fedora Crown (Creased top shape)
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
    ctx.fillStyle = '#E5DEC9'; // Platinum Metal Finish
    ctx.fillRect(18, -8, 10, 4.5);

    // Dual-Stage Volumetric Flashlight Light Cone Beam
    // Outer Soft Ambient Light Glow
    ctx.fillStyle = 'rgba(229, 222, 201, 0.16)';
    ctx.beginPath();
    ctx.moveTo(28, -6);
    ctx.lineTo(210, -65 + this.detFlashlightAngle * 45);
    ctx.lineTo(210, 52 + this.detFlashlightAngle * 45);
    ctx.closePath();
    ctx.fill();

    // Inner Concentrated High-Intensity Core Spotlight
    ctx.fillStyle = 'rgba(255, 245, 210, 0.32)';
    ctx.beginPath();
    ctx.moveTo(28, -6);
    ctx.lineTo(210, -32 + this.detFlashlightAngle * 45);
    ctx.lineTo(210, 20 + this.detFlashlightAngle * 45);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
