// Two-Canvas Dual Renderer Orchestrator — Minimalist Architectural Edition

import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOOR_HEIGHT, BUILDING_WIDTH, WALL_THICKNESS, COLORS } from '../utils/constants.js';
import { OBJECT_DEFINITIONS } from '../data/objects.js';
import { events } from '../utils/events.js';

export class Renderer {
  constructor(leftCanvas, rightCanvas) {
    this.leftCanvas = leftCanvas;
    this.rightCanvas = rightCanvas;
    this.leftCtx = leftCanvas.getContext('2d');
    this.rightCtx = rightCanvas.getContext('2d');

    this.floatingTexts = [];
  }

  addFloatingText(text, x, y, color = '#E2D9C8', panel = 'both') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1.0,
      vy: -1.2,
      life: 45,
      panel
    });
  }

  updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 1;
      ft.alpha = Math.max(0, ft.life / 45);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  renderPanel(ctx, camera, buildingFloors, player, opponent, particleSystem, isLeftThief = true) {
    // 1. Clear & Background Fill
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply Camera Transform
    camera.applyTransform(ctx);

    // Get Range of visible floors for performance optimization
    const { startFloor, endFloor } = camera.getVisibleFloorRange();

    // 2. Render Visible Building Floors & Objects
    for (let i = startFloor; i <= endFloor; i++) {
      const floor = buildingFloors[i];
      if (!floor) continue;

      const floorY = floor.y;
      const theme = floor.theme;

      // Floor room wall background
      ctx.fillStyle = theme.wallColor;
      ctx.fillRect(WALL_THICKNESS, floorY, BUILDING_WIDTH - WALL_THICKNESS * 2, FLOOR_HEIGHT);

      // Left & Right Building Exterior Walls
      ctx.fillStyle = COLORS.panelBorder;
      ctx.fillRect(0, floorY, WALL_THICKNESS, FLOOR_HEIGHT);
      ctx.fillRect(BUILDING_WIDTH - WALL_THICKNESS, floorY, WALL_THICKNESS, FLOOR_HEIGHT);

      // Floor Platform (Surface player walks on)
      const platformY = floorY + FLOOR_HEIGHT - 10;
      ctx.fillStyle = theme.floorColor;

      // Render floor platform with gap for holes
      if (floor.holes && floor.holes.length > 0) {
        const hole = floor.holes[0];
        ctx.fillRect(WALL_THICKNESS, platformY, hole.x - WALL_THICKNESS, 10);
        const rightSegX = hole.x + hole.width;
        ctx.fillRect(rightSegX, platformY, BUILDING_WIDTH - WALL_THICKNESS - rightSegX, 10);
      } else {
        ctx.fillRect(WALL_THICKNESS, platformY, BUILDING_WIDTH - WALL_THICKNESS * 2, 10);
      }

      // Floor number watermark badge on wall (Refined serif typography)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.font = '600 24px Cinzel, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`FL ${floor.floorNumber}`, BUILDING_WIDTH - WALL_THICKNESS - 15, floorY + 32);

      // Render Interactive Objects on floor
      if (floor.objects) {
        floor.objects.forEach(obj => {
          if (!obj.active) return;
          this.renderObject(ctx, obj, player);
        });
      }
    }

    // 3. Render Opponent Mirror Indicator (Refined Hairline Outline)
    if (opponent && Math.abs(opponent.currentFloorIndex - player.currentFloorIndex) <= 3) {
      ctx.save();
      ctx.strokeStyle = isLeftThief ? COLORS.detectivePrimary : COLORS.thiefPrimary;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(opponent.x, opponent.y, opponent.width, opponent.height);
      ctx.restore();
    }

    // 4. Render Main Character
    player.draw(ctx);

    // 5. Render Particle System Effects
    particleSystem.draw(ctx);

    // 6. Render Floating Time Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // Restore Camera Transform
    camera.restoreTransform(ctx);
  }

  renderObject(ctx, obj, player) {
    ctx.save();

    const ox = obj.x;
    const oy = obj.y;

    if (obj.type === 'security_camera') {
      // 📹 Security Camera vector graphics
      ctx.fillStyle = '#1A1D24';
      ctx.fillRect(ox + 4, oy, 24, 12);
      ctx.fillStyle = '#2A2E3D';
      ctx.fillRect(ox + 8, oy + 12, 16, 16);

      // Red Flashing Sensor Lens
      const pulse = Math.floor(Date.now() / 250) % 2 === 0;
      ctx.fillStyle = pulse ? '#FF0844' : '#700018';
      ctx.beginPath();
      ctx.arc(ox + 16, oy + 20, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sweeping Laser Cone Animation
      const sweep = Math.sin(Date.now() / 450) * 32;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.fillStyle = 'rgba(0, 242, 254, 0.09)';
      ctx.beginPath();
      ctx.moveTo(ox + 16, oy + 20);
      ctx.lineTo(ox - 30 + sweep, oy + 110);
      ctx.lineTo(ox + 62 + sweep, oy + 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Check if Player is inside camera laser detection beam
      if (player && obj.active && Math.abs((ox + 16 + sweep) - (player.x + player.width / 2)) < 30 && Math.abs((oy + 60) - (player.y + player.height / 2)) < 50) {
        if (!player.isCameraSpotted) {
          player.isCameraSpotted = true;
          events.emit('timer:modify', { delta: 5, source: 'Spotted by Camera (+5s)' });
          setTimeout(() => { if (player) player.isCameraSpotted = false; }, 2000);
        }
      }

    } else if (obj.type === 'safe_vault') {
      // 🔒 Steel Safe Vault
      ctx.fillStyle = '#232733';
      ctx.fillRect(ox, oy, 32, 36);
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + 3, oy + 3, 26, 30);

      // Gold Rotary Combination Keypad
      ctx.fillStyle = '#C5A059';
      ctx.beginPath();
      ctx.arc(ox + 16, oy + 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#101217';
      ctx.beginPath();
      ctx.arc(ox + 16, oy + 18, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (obj.type === 'radio_station') {
      // 📻 Radio Station Console
      ctx.fillStyle = '#1E241E';
      ctx.fillRect(ox, oy + 8, 34, 28);

      // Antennas
      ctx.strokeStyle = '#A5C5A0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ox + 8, oy + 8);
      ctx.lineTo(ox + 2, oy - 8);
      ctx.moveTo(ox + 26, oy + 8);
      ctx.lineTo(ox + 32, oy - 8);
      ctx.stroke();

      // Pulsating Frequency Wave LED
      ctx.fillStyle = '#00E676';
      ctx.fillRect(ox + 6, oy + 14, 22, 6);

    } else if (obj.type === 'bomb_device') {
      // 💣 Bomb Explosive Charge (Floor 1)
      ctx.fillStyle = '#3A1414';
      ctx.fillRect(ox, oy + 8, 36, 28);

      // 3 Colored Wires
      ctx.strokeStyle = '#FF0844';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ox + 4, oy + 8); ctx.lineTo(ox + 4, oy + 34); ctx.stroke();
      ctx.strokeStyle = '#00F2FE';
      ctx.beginPath(); ctx.moveTo(ox + 10, oy + 8); ctx.lineTo(ox + 10, oy + 34); ctx.stroke();
      ctx.strokeStyle = '#00E676';
      ctx.beginPath(); ctx.moveTo(ox + 16, oy + 8); ctx.lineTo(ox + 16, oy + 34); ctx.stroke();

      // Digital Timer Display
      ctx.fillStyle = '#000';
      ctx.fillRect(ox + 20, oy + 12, 14, 12);
      ctx.fillStyle = '#FF0844';
      ctx.font = '700 8px monospace';
      ctx.fillText('0:00', ox + 21, oy + 21);

    } else if (obj.type === 'the_fence') {
      // 🕵️ Black Market Supply Chest
      ctx.fillStyle = '#2A2118';
      ctx.fillRect(ox, oy + 6, 36, 28);
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy + 6, 36, 28);

      // Gold Lock Icon Trim
      ctx.fillStyle = '#C5A059';
      ctx.fillRect(ox + 14, oy + 14, 8, 10);
    }

    // Check Proximity Interaction Prompt
    if (player && Math.abs(player.x - obj.x) < 45 && Math.abs(player.y - obj.y) < 30) {
      const promptLabel = obj.type === 'security_camera' ? '[E] SMASH (-3s)'
        : obj.type === 'safe_vault' ? '[E] CRACK SAFE'
        : obj.type === 'radio_station' ? '[E] REPORT RADIO (+6s)'
        : obj.type === 'bomb_device' ? '[E] DEFUSE BOMB (+45s)'
        : '[E] FENCE SHOP';

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(obj.x - 30, obj.y - 24, 96, 18);
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1;
      ctx.strokeRect(obj.x - 30, obj.y - 24, 96, 18);

      ctx.fillStyle = '#FFF';
      ctx.font = '700 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(promptLabel, obj.x + 18, obj.y - 12);
    }

    ctx.restore();
  }

  renderBoth(leftCamera, rightCamera, buildingFloors, thief, detective, leftParticles, rightParticles) {
    this.updateFloatingTexts();

    // Render Left Screen (Thief View)
    this.renderPanel(this.leftCtx, leftCamera, buildingFloors, thief, detective, leftParticles, true);

    // Render Right Screen (Detective View)
    this.renderPanel(this.rightCtx, rightCamera, buildingFloors, detective, thief, rightParticles, false);
  }

  renderCutsceneOverlays(cutsceneData, progress) {
    if (!cutsceneData) return;
    [this.leftCtx, this.rightCtx].forEach(ctx => {
      if (!ctx) return;
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;

      // 1. Full-Screen Volumetric Rolling Smoke Fog
      const smokeAlpha = Math.sin(progress * Math.PI) * 0.55; // Fade in & out smoothly
      const numPuffs = 10;
      for (let i = 0; i < numPuffs; i++) {
        const smokeX = ((i * 55 + progress * 140) % (width + 120)) - 60;
        const smokeY = (height * 0.1 * i + Math.sin(progress * 4 + i) * 45) % (height + 80) - 40;
        const radius = 100 + Math.cos(i * 2 + progress * 3) * 35;

        const smokeGrad = ctx.createRadialGradient(smokeX, smokeY, 8, smokeX, smokeY, radius);
        if (cutsceneData.winner === 'THIEF') {
          smokeGrad.addColorStop(0, `rgba(28, 24, 18, ${smokeAlpha})`);
          smokeGrad.addColorStop(0.5, `rgba(197, 160, 89, ${smokeAlpha * 0.45})`);
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          smokeGrad.addColorStop(0, `rgba(14, 26, 36, ${smokeAlpha})`);
          smokeGrad.addColorStop(0.5, `rgba(0, 242, 254, ${smokeAlpha * 0.45})`);
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Cinematic Letterbox Black Bars
      const barHeight = Math.min(55, progress * 160);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, barHeight);
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // 3. Police Siren / Searchlight Spotlight Beam
      ctx.save();
      const spotlightX = width / 2 + Math.sin(progress * Math.PI * 6) * 110;
      const grad = ctx.createRadialGradient(spotlightX, height / 2, 10, spotlightX, height / 2, 220);
      if (cutsceneData.winner === 'THIEF') {
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 4. Cinematic Banner Overlay
      if (progress > 0.08) {
        const alpha = Math.min(1, (progress - 0.08) * 4);
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = 'rgba(10, 12, 16, 0.88)';
        ctx.fillRect(0, height / 2 - 38, width, 76);
        ctx.strokeStyle = cutsceneData.winner === 'THIEF' ? '#C5A059' : '#00F2FE';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, height / 2 - 38, width, 76);

        ctx.fillStyle = '#FFF';
        ctx.font = '700 16px Cinzel, serif';
        ctx.textAlign = 'center';

        const mainTitle = cutsceneData.winner === 'THIEF'
          ? 'HEIST COMPLETED — CIPHER ESCAPES!'
          : 'OPERATION SECURED — INSPECTOR VALE WINS!';

        ctx.fillText(mainTitle, width / 2, height / 2 - 6);

        ctx.fillStyle = cutsceneData.winner === 'THIEF' ? '#C5A059' : '#00F2FE';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText('MISSION CONCLUDED — PREPARING AFTER-ACTION REPORT...', width / 2, height / 2 + 18);

        ctx.restore();
      }
    });
  }
}
