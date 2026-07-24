// Two-Canvas Dual Renderer Orchestrator — Minimalist Architectural Edition

import { CANVAS_WIDTH, CANVAS_HEIGHT, FLOOR_HEIGHT, BUILDING_WIDTH, WALL_THICKNESS, COLORS } from '../utils/constants.js';
import { OBJECT_DEFINITIONS } from '../data/objects.js';

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
          this.renderObject(ctx, obj);
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

  renderObject(ctx, obj) {
    const spec = OBJECT_DEFINITIONS[obj.type] || { color: '#C5A059', width: 30, height: 30, name: obj.type };
    ctx.save();

    ctx.fillStyle = spec.color;
    ctx.fillRect(obj.x, obj.y, spec.width, spec.height);

    // Fine Object Hairline Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(obj.x, obj.y, spec.width, spec.height);

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(spec.name.toUpperCase(), obj.x + spec.width / 2, obj.y - 5);

    ctx.restore();
  }

  renderBoth(leftCamera, rightCamera, buildingFloors, thief, detective, leftParticles, rightParticles) {
    this.updateFloatingTexts();

    // Render Left Screen (Thief View)
    this.renderPanel(this.leftCtx, leftCamera, buildingFloors, thief, detective, leftParticles, true);

    // Render Right Screen (Detective View)
    this.renderPanel(this.rightCtx, rightCamera, buildingFloors, detective, thief, rightParticles, false);
  }
}
