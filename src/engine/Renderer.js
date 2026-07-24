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

      // Render Wall Moulding Trims & Wall Sconces
      this.renderWallArchitecturalDetails(ctx, theme, floorY);

      // Left & Right Building Exterior Walls
      ctx.fillStyle = COLORS.panelBorder;
      ctx.fillRect(0, floorY, WALL_THICKNESS, FLOOR_HEIGHT);
      ctx.fillRect(BUILDING_WIDTH - WALL_THICKNESS, floorY, WALL_THICKNESS, FLOOR_HEIGHT);

      // Floor Platform (Surface player walks on)
      const platformY = floorY + FLOOR_HEIGHT - 10;
      ctx.fillStyle = theme.floorColor;

      // Render floor platform with gap for holes & tile patterns
      if (floor.holes && floor.holes.length > 0) {
        const hole = floor.holes[0];
        ctx.fillRect(WALL_THICKNESS, platformY, hole.x - WALL_THICKNESS, 10);
        const rightSegX = hole.x + hole.width;
        ctx.fillRect(rightSegX, platformY, BUILDING_WIDTH - WALL_THICKNESS - rightSegX, 10);

        this.renderFloorTiles(ctx, theme.name, platformY, WALL_THICKNESS, hole.x - WALL_THICKNESS);
        this.renderFloorTiles(ctx, theme.name, platformY, rightSegX, BUILDING_WIDTH - WALL_THICKNESS - rightSegX);
      } else {
        ctx.fillRect(WALL_THICKNESS, platformY, BUILDING_WIDTH - WALL_THICKNESS * 2, 10);
        this.renderFloorTiles(ctx, theme.name, platformY, WALL_THICKNESS, BUILDING_WIDTH - WALL_THICKNESS * 2);
      }

      // Floor number watermark badge on wall (Refined serif typography with + / - sign)
      const signStr = floor.floorNumber > 0 ? `+${floor.floorNumber}` : `${floor.floorNumber}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.font = '700 24px Cinzel, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`FL ${signStr}`, BUILDING_WIDTH - WALL_THICKNESS - 15, floorY + 32);

      // Render Ambient Background Props
      this.renderFloorBackgroundProps(ctx, floor, floorY);

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

  renderFloorTiles(ctx, themeName, platformY, segX, segWidth) {
    if (segWidth <= 0) return;
    ctx.save();

    if (themeName === 'Penthouse Lounge' || themeName === 'Casino') {
      // Marble Tile Seams (Gold Inlay)
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.25)';
      ctx.lineWidth = 1;
      for (let x = segX; x < segX + segWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, platformY);
        ctx.lineTo(x, platformY + 10);
        ctx.stroke();
      }
    } else if (themeName === 'Server Room' || themeName === 'Sub-Zero Lab') {
      // Metallic Grating Seams
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let x = segX; x < segX + segWidth; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, platformY);
        ctx.lineTo(x, platformY + 10);
        ctx.stroke();
      }
    } else if (themeName === 'Art Gallery' || themeName === 'Library') {
      // Hardwood Plank Seams
      ctx.strokeStyle = 'rgba(216, 154, 80, 0.25)';
      ctx.lineWidth = 1;
      for (let x = segX; x < segX + segWidth; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, platformY);
        ctx.lineTo(x, platformY + 10);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderWallArchitecturalDetails(ctx, theme, floorY) {
    const pattern = theme ? (theme.pattern || theme.name) : 'wood_wainscot';
    ctx.save();

    // 1. Exterior Glass Window Side-Cutaway Frame & Glare Sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    // Vertical Glass Mullions (Window Panes)
    const glassW = (BUILDING_WIDTH - WALL_THICKNESS * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(WALL_THICKNESS + glassW, floorY); ctx.lineTo(WALL_THICKNESS + glassW, floorY + 144);
    ctx.moveTo(WALL_THICKNESS + glassW * 2, floorY); ctx.lineTo(WALL_THICKNESS + glassW * 2, floorY + 144);
    ctx.stroke();

    // Diagonal Exterior Window Glare Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(WALL_THICKNESS + 30, floorY + 10); ctx.lineTo(WALL_THICKNESS + 110, floorY + 130);
    ctx.moveTo(BUILDING_WIDTH - WALL_THICKNESS - 120, floorY + 15); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS - 40, floorY + 135);
    ctx.stroke();

    // 2. Wallpaper & Backwall Architectural Textures (Subtle, smooth low opacity)
    ctx.globalAlpha = 0.18;
    if (pattern === 'subway_tile_white' || pattern === 'subway_brick' || pattern === 'mossy_brick') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = floorY + 10; y < floorY + 140; y += 15) {
        ctx.beginPath(); ctx.moveTo(WALL_THICKNESS, y); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS, y); ctx.stroke();
      }
    } else if (pattern === 'wood_wainscot' || pattern === 'mahogany_panel' || pattern === 'damask_red' || pattern === 'bookshelf_panel') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(WALL_THICKNESS, floorY + 80, BUILDING_WIDTH - WALL_THICKNESS * 2, 64);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = WALL_THICKNESS + 20; x < BUILDING_WIDTH - WALL_THICKNESS - 40; x += 60) {
        ctx.strokeRect(x, floorY + 88, 50, 48);
      }
    } else if (pattern === 'circuit_cyan' || pattern === 'cyber_traces' || pattern === 'ticker_led' || pattern === 'matrix_flow') {
      ctx.strokeStyle = theme.accentColor ? `${theme.accentColor}2A` : 'rgba(74, 95, 120, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS + 40, floorY + 20); ctx.lineTo(WALL_THICKNESS + 120, floorY + 20); ctx.lineTo(WALL_THICKNESS + 160, floorY + 60);
      ctx.moveTo(BUILDING_WIDTH - WALL_THICKNESS - 40, floorY + 30); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS - 140, floorY + 30);
      ctx.stroke();
    } else if (pattern === 'acoustic_hex' || pattern === 'neon_stripe' || pattern === 'bio_hex' || pattern === 'starlight_grid') {
      ctx.strokeStyle = theme.accentColor ? `${theme.accentColor}2A` : 'rgba(106, 76, 110, 0.15)';
      ctx.lineWidth = 1;
      for (let x = WALL_THICKNESS + 30; x < BUILDING_WIDTH - WALL_THICKNESS - 30; x += 40) {
        ctx.strokeRect(x, floorY + 20, 30, 30);
      }
    } else if (pattern === 'steel_rivet' || pattern === 'reinforced_steel' || pattern === 'cctv_grid' || pattern === 'bunker_concrete' || pattern === 'hazard_warning') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = WALL_THICKNESS + 50; x < BUILDING_WIDTH - WALL_THICKNESS - 50; x += 80) {
        ctx.strokeRect(x, floorY + 15, 70, 120);
      }
    } else if (pattern === 'copper_pipes') {
      ctx.strokeStyle = 'rgba(156, 84, 48, 0.25)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(WALL_THICKNESS, floorY + 22); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS, floorY + 22); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(WALL_THICKNESS + 40, floorY + 10, 12, 138);
      ctx.fillRect(BUILDING_WIDTH - WALL_THICKNESS - 52, floorY + 10, 12, 138);
    }

    // 3. Baseboard & Crown Molding Trims
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(WALL_THICKNESS, floorY, BUILDING_WIDTH - WALL_THICKNESS * 2, 5); // Crown molding
    ctx.fillRect(WALL_THICKNESS, floorY + 140, BUILDING_WIDTH - WALL_THICKNESS * 2, 4); // Baseboard

    // 4. Ceiling Light Fixture & Soft Radial Light Cone
    const ceilX = BUILDING_WIDTH / 2;
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ceilX, floorY); ctx.lineTo(ceilX, floorY + 18); ctx.stroke();
    ctx.fillStyle = theme.accentColor || '#C5A059';
    ctx.beginPath(); ctx.arc(ceilX, floorY + 20, 5, 0, Math.PI * 2); ctx.fill();

    const lightRad = ctx.createRadialGradient(ceilX, floorY + 20, 5, ceilX, floorY + 90, 110);
    lightRad.addColorStop(0, 'rgba(255, 245, 220, 0.08)');
    lightRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lightRad;
    ctx.beginPath();
    ctx.arc(ceilX, floorY + 20, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderFloorBackgroundProps(ctx, floor, floorY) {
    const themeName = floor.theme ? floor.theme.name : 'Office';
    const varIdx = Math.abs(floor.floorNumber) % 3;
    const floorSlabY = floorY + 144; // Bottom floor slab surface elevation
    ctx.save();
    ctx.globalAlpha = 0.35; // Soft ambient side-view depth opacity

    if (themeName === 'Sky Helipad') {
      // 🚁 Helipad Target Ring & Perimeter Beacon Lights (Side Elevation)
      const hx = BUILDING_WIDTH / 2;
      ctx.strokeStyle = '#5C7C99'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, floorSlabY - 60, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#5C7C99'; ctx.font = '700 20px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('H', hx, floorSlabY - 60);

      // Warning Strobe Beacons on Floor Slab
      ctx.fillStyle = '#8A3E45';
      ctx.fillRect(WALL_THICKNESS + 25, floorSlabY - 24, 12, 24);
      ctx.fillRect(BUILDING_WIDTH - WALL_THICKNESS - 37, floorSlabY - 24, 12, 24);

    } else if (themeName === 'Royal Penthouse' || themeName === 'Penthouse Lounge') {
      // 🛏️ Royal Penthouse Suite (Grounded on Floor Slab)
      const bedX = varIdx === 0 ? WALL_THICKNESS + 40 : BUILDING_WIDTH - WALL_THICKNESS - 130;
      
      // Quilted Headboard resting on floor
      ctx.fillStyle = '#2A1F2D';
      ctx.fillRect(bedX, floorSlabY - 74, 94, 74);
      ctx.strokeStyle = '#C5A059'; ctx.lineWidth = 1.5;
      ctx.strokeRect(bedX, floorSlabY - 74, 94, 74);

      // Double Pillows
      ctx.fillStyle = '#E2D9C8';
      ctx.fillRect(bedX + 8, floorSlabY - 66, 34, 18);
      ctx.fillRect(bedX + 52, floorSlabY - 66, 34, 18);

      // Satin Duvet Sheet resting on floor slab
      ctx.fillStyle = '#4A2328';
      ctx.fillRect(bedX + 4, floorSlabY - 44, 86, 44);
      ctx.fillStyle = '#6E2D34';
      ctx.fillRect(bedX + 4, floorSlabY - 44, 86, 12);

      // Nightstand & Lamp on floor slab
      const nsX = bedX === WALL_THICKNESS + 40 ? bedX + 100 : bedX - 34;
      ctx.fillStyle = '#221926';
      ctx.fillRect(nsX, floorSlabY - 36, 30, 36);
      ctx.fillStyle = '#C5A059'; ctx.fillRect(nsX + 13, floorSlabY - 24, 4, 4);
      ctx.fillStyle = 'rgba(197, 160, 89, 0.8)';
      ctx.beginPath(); ctx.arc(nsX + 15, floorSlabY - 44, 8, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Diamond Vault' || themeName === 'High-Security Vault') {
      // 🔒 Reinforced Vault Wall Door resting on floor slab
      const vaultX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#1B222A';
      ctx.fillRect(vaultX, floorSlabY - 120, 110, 120);
      ctx.strokeStyle = '#4B6B82'; ctx.lineWidth = 2;
      ctx.strokeRect(vaultX, floorSlabY - 120, 110, 120);

      // Vault Wheel Lock
      ctx.fillStyle = '#C5A059';
      ctx.beginPath(); ctx.arc(vaultX + 55, floorSlabY - 60, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0F1720';
      ctx.beginPath(); ctx.arc(vaultX + 55, floorSlabY - 60, 10, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Grand Ballroom') {
      // 🎻 Grand Piano resting on floor slab
      const pianoX = WALL_THICKNESS + 45;
      ctx.fillStyle = '#120D0A';
      ctx.fillRect(pianoX, floorSlabY - 48, 85, 48);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(pianoX + 10, floorSlabY - 48, 65, 8);
      // Legs to floor
      ctx.fillRect(pianoX + 8, floorSlabY - 16, 6, 16);
      ctx.fillRect(pianoX + 72, floorSlabY - 16, 6, 16);

    } else if (themeName === 'High-Stakes Casino') {
      // 🎰 Slot Machine Cabinet & Roulette Table resting on floor slab
      const slotX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#2E1212';
      ctx.fillRect(slotX, floorSlabY - 90, 46, 90);
      ctx.fillStyle = '#A07038'; ctx.fillRect(slotX + 6, floorSlabY - 72, 34, 22);

      const rX = BUILDING_WIDTH - WALL_THICKNESS - 145;
      ctx.fillStyle = '#164223';
      ctx.fillRect(rX, floorSlabY - 46, 105, 46);

    } else if (themeName === 'Executive Boardroom' || themeName === 'Executive Office' || themeName === 'Office') {
      // 💼 Executive Workstation grounded on floor slab
      const deskX = WALL_THICKNESS + 50;
      ctx.fillStyle = '#222B3A';
      ctx.fillRect(deskX, floorSlabY - 46, 90, 46);
      ctx.fillStyle = '#323E52'; ctx.fillRect(deskX - 4, floorSlabY - 52, 98, 6);

      // Monitors on desk
      ctx.fillStyle = '#0F1724';
      ctx.fillRect(deskX + 10, floorSlabY - 78, 34, 26);
      ctx.fillRect(deskX + 48, floorSlabY - 78, 34, 26);
      ctx.fillStyle = 'rgba(74, 95, 120, 0.7)';
      ctx.fillRect(deskX + 13, floorSlabY - 75, 28, 20);
      ctx.fillRect(deskX + 51, floorSlabY - 75, 28, 20);

      // Potted Plant on floor slab
      const plantX = BUILDING_WIDTH - WALL_THICKNESS - 75;
      ctx.fillStyle = '#705B48'; ctx.fillRect(plantX, floorSlabY - 30, 26, 30);
      ctx.fillStyle = '#4A6B56';
      ctx.beginPath(); ctx.arc(plantX + 8, floorSlabY - 38, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(plantX + 20, floorSlabY - 42, 16, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Modern Art Gallery' || themeName === 'Art Gallery') {
      // 🎨 Painting Easel standing on floor slab
      const easelX = WALL_THICKNESS + 50;
      ctx.strokeStyle = '#9E7A53'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(easelX + 22, floorSlabY - 100); ctx.lineTo(easelX + 4, floorSlabY);
      ctx.moveTo(easelX + 22, floorSlabY - 100); ctx.lineTo(easelX + 40, floorSlabY);
      ctx.stroke();
      ctx.fillStyle = '#E2D9C8'; ctx.fillRect(easelX + 2, floorSlabY - 80, 40, 44);

      // Gilded Renaissance Frame on wall
      const frameX = BUILDING_WIDTH - WALL_THICKNESS - 135;
      ctx.fillStyle = '#C5A059'; ctx.fillRect(frameX, floorSlabY - 110, 76, 56);
      ctx.fillStyle = '#1A242B'; ctx.fillRect(frameX + 5, floorSlabY - 105, 66, 46);

    } else if (themeName === 'Rooftop Conservatory') {
      // 🌿 Stone Fountain resting on floor slab
      const fX = BUILDING_WIDTH / 2 - 35;
      ctx.fillStyle = '#2A3B30'; ctx.fillRect(fX, floorSlabY - 38, 70, 38);
      ctx.fillStyle = '#4A6B56'; ctx.beginPath(); ctx.arc(fX + 35, floorSlabY - 44, 18, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Cyber Stock Exchange') {
      // 📈 Multi-Monitor Trading Wall (Eye Level)
      const tX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#0F1A2A'; ctx.fillRect(tX, floorSlabY - 115, 120, 50);
      ctx.fillStyle = '#3D5A73'; ctx.fillRect(tX + 5, floorSlabY - 110, 110, 8);

    } else if (themeName === 'Luxury Spa') {
      // 💆 Massage Table resting on floor slab
      const spaX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#1B2C2D'; ctx.fillRect(spaX, floorSlabY - 36, 84, 36);
      ctx.fillStyle = '#4E757D'; ctx.fillRect(spaX + 6, floorSlabY - 42, 24, 8);

    } else if (themeName === 'Cybernetics Lab') {
      // 🤖 Android Torso Pod resting on floor slab
      const podX = BUILDING_WIDTH / 2 - 25;
      ctx.fillStyle = '#0F2630'; ctx.fillRect(podX, floorSlabY - 115, 50, 115);
      ctx.strokeStyle = '#3B6B78'; ctx.lineWidth = 2; ctx.strokeRect(podX, floorSlabY - 115, 50, 115);

    } else if (themeName === 'Grand Library' || themeName === 'Library') {
      // 📚 Grand Bookshelf resting on floor slab
      const bookX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#362214'; ctx.fillRect(bookX, floorSlabY - 124, 105, 124);
      const bookColors = ['#7A3B3B', '#2B4A6A', '#9C6E3B', '#3A6B48', '#5A3B6A'];
      for (let row = 0; row < 3; row++) {
        for (let b = 0; b < 9; b++) {
          ctx.fillStyle = bookColors[(row + b) % bookColors.length];
          ctx.fillRect(bookX + 8 + b * 10, floorSlabY - 116 + row * 36, 8, 26);
        }
      }

    } else if (themeName === 'Private Cinema') {
      // 🎬 Projector Screen mounted on back wall
      const scrX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#E5DEC9'; ctx.fillRect(scrX, floorSlabY - 118, 110, 60);
      ctx.fillStyle = '#140E18'; ctx.fillRect(scrX + 4, floorSlabY - 114, 102, 52);

    } else if (themeName === 'Observatory') {
      // 🔭 Astronomical Telescope standing on floor slab
      const teleX = BUILDING_WIDTH / 2 - 20;
      ctx.strokeStyle = '#584B78'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(teleX + 20, floorSlabY - 100); ctx.lineTo(teleX - 10, floorSlabY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(teleX + 20, floorSlabY - 100); ctx.lineTo(teleX + 50, floorSlabY); ctx.stroke();

    } else if (themeName === 'VIP Nightclub' || themeName === 'Nightclub') {
      // 🎧 DJ Console & Speaker Towers grounded on floor slab
      const djX = BUILDING_WIDTH / 2 - 45;
      ctx.fillStyle = '#1E122A'; ctx.fillRect(djX, floorSlabY - 52, 90, 52);
      ctx.fillStyle = '#0B0610';
      ctx.beginPath(); ctx.arc(djX + 24, floorSlabY - 38, 12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(djX + 66, floorSlabY - 38, 12, 0, Math.PI * 2); ctx.fill();

      // Speaker Towers on floor slab
      ctx.fillStyle = '#120A1A';
      ctx.fillRect(WALL_THICKNESS + 25, floorSlabY - 98, 34, 98);
      ctx.fillRect(BUILDING_WIDTH - WALL_THICKNESS - 59, floorSlabY - 98, 34, 98);

    } else if (themeName === 'Sub-Level Security Command' || themeName === 'Security Room') {
      // 📹 6-Screen CCTV Array on back wall
      const cctvX = WALL_THICKNESS + 45;
      ctx.fillStyle = '#0D121A'; ctx.fillRect(cctvX, floorSlabY - 124, 125, 68);
      ctx.fillStyle = 'rgba(138, 62, 69, 0.6)';
      ctx.fillRect(cctvX + 6, floorSlabY - 120, 36, 28);
      ctx.fillRect(cctvX + 46, floorSlabY - 120, 36, 28);
      ctx.fillRect(cctvX + 86, floorSlabY - 120, 34, 28);

    } else if (themeName === 'Forensic Crime Lab' || themeName === 'Laboratory') {
      // 🧪 Chemical Workstation grounded on floor slab
      const labX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#122824'; ctx.fillRect(labX, floorSlabY - 44, 92, 44);
      ctx.fillStyle = '#4A6B56';
      ctx.fillRect(labX + 12, floorSlabY - 60, 8, 16);
      ctx.fillRect(labX + 26, floorSlabY - 66, 10, 22);

    } else if (themeName === 'Deep Geothermal Station' || themeName === 'Boiler Room') {
      // ♨️ Copper Steam Pipes along upper ceiling
      ctx.strokeStyle = '#9C5430'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(WALL_THICKNESS, floorY + 22); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS, floorY + 22); ctx.stroke();
      ctx.fillStyle = '#331B10'; ctx.beginPath(); ctx.arc(WALL_THICKNESS + 120, floorY + 22, 14, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Classified Arms Depot') {
      // 🔫 Tactical Weapon Rack resting on floor slab
      const wX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#252525'; ctx.fillRect(wX, floorSlabY - 110, 95, 110);
      ctx.strokeStyle = '#784444'; ctx.lineWidth = 2; ctx.strokeRect(wX, floorSlabY - 110, 95, 110);

    } else if (themeName === 'Bio-Containment Sector') {
      // ☣️ Bio-Containment Vat standing on floor slab
      const vatX = BUILDING_WIDTH / 2 - 22;
      ctx.fillStyle = '#15261D'; ctx.fillRect(vatX, floorSlabY - 110, 44, 110);
      ctx.fillStyle = '#4A6B4E'; ctx.beginPath(); ctx.arc(vatX + 22, floorSlabY - 60, 16, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Underground Metro Hub') {
      // 🚇 Turnstile Gate resting on floor slab
      const tX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#1E222A'; ctx.fillRect(tX, floorSlabY - 54, 85, 54);
      ctx.fillStyle = '#9A7242'; ctx.fillRect(tX + 10, floorSlabY - 48, 12, 12);

    } else if (themeName === 'Nuclear Reactor Bay') {
      // ☢️ Reactor Core Rod Casing standing on floor slab
      const nX = BUILDING_WIDTH / 2 - 30;
      ctx.fillStyle = '#282810'; ctx.fillRect(nX, floorSlabY - 120, 60, 120);
      ctx.fillStyle = '#7A8A3E'; ctx.beginPath(); ctx.arc(nX + 30, floorSlabY - 60, 20, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Sewer Filtration Plant') {
      // 🌊 Iron Sluice Gate & Drainage Pipes
      ctx.strokeStyle = '#5A6B48'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(WALL_THICKNESS, floorY + 30); ctx.lineTo(BUILDING_WIDTH - WALL_THICKNESS, floorY + 30); ctx.stroke();

    } else if (themeName === 'Tactical Training Vault') {
      // 🎯 Target Dummy standing on floor slab
      const dX = WALL_THICKNESS + 50;
      ctx.fillStyle = '#291E25'; ctx.fillRect(dX, floorSlabY - 80, 24, 80);
      ctx.fillStyle = '#6E5062'; ctx.beginPath(); ctx.arc(dX + 12, floorSlabY - 92, 12, 0, Math.PI * 2); ctx.fill();

    } else if (themeName === 'Deep Cyber Mainframe') {
      // 💻 Dual Server Rack Towers resting on floor slab
      const sX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#0B1E30'; ctx.fillRect(sX, floorSlabY - 120, 45, 120);
      ctx.fillRect(sX + 60, floorSlabY - 120, 45, 120);
      ctx.fillStyle = '#3B5875'; ctx.fillRect(sX + 6, floorSlabY - 110, 33, 4); ctx.fillRect(sX + 66, floorSlabY - 110, 33, 4);

    } else if (themeName === 'Subterranean Bunker') {
      // 🛏️ Military Cot standing on floor slab
      const bX = WALL_THICKNESS + 40;
      ctx.fillStyle = '#201814'; ctx.fillRect(bX, floorSlabY - 30, 80, 30);
      ctx.fillStyle = '#706254'; ctx.fillRect(bX + 4, floorSlabY - 36, 72, 6);

    } else if (themeName === 'Sub-Zero Cryo Chamber') {
      // 🧊 Cryogenic Stasis Pod standing on floor slab
      const cryoX = BUILDING_WIDTH / 2 - 25;
      ctx.fillStyle = '#0F2433'; ctx.fillRect(cryoX, floorSlabY - 118, 50, 118);
      ctx.strokeStyle = '#3D6878'; ctx.lineWidth = 2; ctx.strokeRect(cryoX, floorSlabY - 118, 50, 118);
      ctx.fillStyle = 'rgba(61, 104, 120, 0.6)'; ctx.fillRect(cryoX + 8, floorSlabY - 105, 34, 75);

    } else {
      // Central Vault Hub Door standing on floor slab
      const vX = BUILDING_WIDTH / 2 - 35;
      ctx.fillStyle = '#2B2217'; ctx.fillRect(vX, floorSlabY - 120, 70, 120);
      ctx.strokeStyle = '#C5A059'; ctx.lineWidth = 2; ctx.strokeRect(vX, floorSlabY - 120, 70, 120);
      ctx.fillStyle = '#C5A059'; ctx.beginPath(); ctx.arc(vX + 35, floorSlabY - 60, 20, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  renderObject(ctx, obj, player) {
    ctx.save();

    const ox = obj.x;
    const oy = obj.y;

    if (obj.type === 'security_camera') {
      // 📹 Security Camera vector graphics & ON/OFF cycle
      const cycle = ((Date.now() / 1000) + ox * 0.1) % 6.0;
      const isCameraOff = cycle >= 4.0;

      ctx.fillStyle = '#1A1D24';
      ctx.fillRect(ox + 4, oy, 24, 12);
      ctx.fillStyle = '#2A2E3D';
      ctx.fillRect(ox + 8, oy + 12, 16, 16);

      if (isCameraOff) {
        // OFF Phase: Lens is dim grey, status LED blinks amber/cooling
        const coolBlink = Math.floor(Date.now() / 300) % 2 === 0;
        ctx.fillStyle = coolBlink ? '#A07038' : '#33281E';
        ctx.beginPath(); ctx.arc(ox + 16, oy + 20, 4, 0, Math.PI * 2); ctx.fill();

        // OFF Status Tag
        ctx.fillStyle = 'rgba(160, 112, 56, 0.2)';
        ctx.fillRect(ox - 10, oy - 14, 52, 12);
        ctx.fillStyle = '#A07038';
        ctx.font = '700 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OFF / COOLING', ox + 16, oy - 5);

      } else {
        // ON Phase: Active Scanning Beam & Red Sensor Lens
        const pulse = Math.floor(Date.now() / 250) % 2 === 0;
        ctx.fillStyle = pulse ? '#8A3E45' : '#4A1D22';
        ctx.beginPath(); ctx.arc(ox + 16, oy + 20, 4, 0, Math.PI * 2); ctx.fill();

        // Sweeping Laser Beam Cone
        const sweep = Math.sin(Date.now() / 450) * 32;
        ctx.strokeStyle = 'rgba(138, 62, 69, 0.4)';
        ctx.fillStyle = 'rgba(138, 62, 69, 0.08)';
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

    } else if (obj.type.startsWith('power_')) {
      // ⚡ Floating, Rotating Power-Up Orbs
      const floatY = oy + Math.sin(Date.now() * 0.005 + ox) * 6;
      const rotAngle = (Date.now() * 0.003) % (Math.PI * 2);

      let color = '#D48C46';
      let iconSymbol = '⚡';
      let labelText = 'DRILL POWER';

      if (obj.type === 'power_super_grapple') {
        color = '#5C7C99'; iconSymbol = '🚀'; labelText = 'SUPER VAULT';
      } else if (obj.type === 'power_time_freeze') {
        color = '#4E757D'; iconSymbol = '❄️'; labelText = 'CHRONO LOCK';
      } else if (obj.type === 'power_speed_surge') {
        color = '#C5A059'; iconSymbol = '⚡'; labelText = 'PHANTOM SPRINT';
      } else if (obj.type === 'power_sonar_reveal') {
        color = '#4A6B56'; iconSymbol = '📡'; labelText = 'SONAR SWEEP';
      }

      ctx.save();
      ctx.translate(ox + 18, floatY);

      // Rotating Outer Energy Aura Ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Soft Inner Glow Orb
      const orbGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      orbGrad.addColorStop(0, '#FFFFFF');
      orbGrad.addColorStop(0.5, color);
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();

      // Center Symbol Icon
      ctx.rotate(Math.sin(rotAngle) * 0.2);
      ctx.fillStyle = '#101217';
      ctx.font = '700 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconSymbol, 0, 0);

      ctx.restore();

      // Floating Label Prompt
      ctx.fillStyle = 'rgba(10, 14, 20, 0.75)';
      ctx.fillRect(ox - 24, floatY - 24, 84, 16);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - 24, floatY - 24, 84, 16);
      ctx.fillStyle = color;
      ctx.font = '700 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, ox + 18, floatY - 13);

    } else if (obj.type === 'rare_diamond_chest') {
      // 💎 Rare Diamond Treasure Chest
      const floatY = oy + Math.sin(Date.now() * 0.004 + ox) * 4;

      // Chest Body
      ctx.fillStyle = '#2A2118';
      ctx.fillRect(ox, floatY + 8, 36, 26);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, floatY + 8, 36, 26);

      // Glowing Diamond Facet floating above chest
      ctx.save();
      ctx.translate(ox + 18, floatY - 4);
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Floating Label Prompt
      ctx.fillStyle = 'rgba(10, 14, 20, 0.75)';
      ctx.fillRect(ox - 20, floatY - 22, 76, 15);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox - 20, floatY - 22, 76, 15);
      ctx.fillStyle = '#00E5FF';
      ctx.font = '700 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DIAMOND CHEST', ox + 18, floatY - 12);

    } else if (obj.type === 'express_elevator') {
      // 🛗 Express Elevator Shaft Doors
      ctx.fillStyle = '#161D28';
      ctx.fillRect(ox, oy, 44, 76);
      ctx.strokeStyle = '#5C7C99';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox, oy, 44, 76);

      // Bronze Metallic Split Doors
      ctx.fillStyle = '#2A3545';
      ctx.fillRect(ox + 4, oy + 8, 16, 64);
      ctx.fillRect(ox + 24, oy + 8, 16, 64);
      ctx.strokeStyle = '#C5A059'; ctx.lineWidth = 1;
      ctx.strokeRect(ox + 4, oy + 8, 16, 64);
      ctx.strokeRect(ox + 24, oy + 8, 16, 64);

      // Digital Floor Indicator Header
      ctx.fillStyle = '#0D131C';
      ctx.fillRect(ox + 6, oy - 14, 32, 12);
      ctx.fillStyle = '#5C7C99';
      ctx.font = '700 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛗 10-FL', ox + 22, oy - 5);

    } else if (obj.type === 'moving_laser_barrier') {
      // ⚡ Sweeping Laser Grid Hazard Emitter
      const laserX = WALL_THICKNESS + 40 + (Math.sin(Date.now() * 0.003 + obj.y) + 1) * 120;
      
      // Laser Emitter Beam Line
      ctx.strokeStyle = 'rgba(138, 62, 69, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laserX, oy - 60);
      ctx.lineTo(laserX, oy + 45);
      ctx.stroke();

      // Warning Sensor Emitter Node
      ctx.fillStyle = '#8A3E45';
      ctx.beginPath(); ctx.arc(laserX, oy - 60, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(laserX, oy + 45, 5, 0, Math.PI * 2); ctx.fill();
    }

    // Check Proximity Interaction Prompt for manual objects (Elevator, Camera, Safe, Bomb)
    if (player && Math.abs(player.x - obj.x) < 45 && Math.abs(player.y - obj.y) < 30) {
      if (['express_elevator', 'security_camera', 'safe_vault', 'bomb_device'].includes(obj.type)) {
        let promptLabel = '';
        let strokeColor = '#C5A059';

        if (obj.type === 'express_elevator') {
          promptLabel = '🛗 [E] EXPRESS ELEVATOR (10 FLOORS)';
          strokeColor = '#5C7C99';
        } else if (obj.type === 'security_camera') {
          const cycle = ((Date.now() / 1000) + obj.x * 0.1) % 6.0;
          const isCameraOff = cycle >= 4.0;
          if (isCameraOff) {
            promptLabel = '💥 [E] SMASH CAMERA (-3s)';
            strokeColor = '#00E676';
          } else {
            promptLabel = '🔒 CAMERA ACTIVE (WAIT FOR OFF)';
            strokeColor = '#8A3E45';
          }
        } else if (obj.type === 'safe_vault') {
          promptLabel = '[E] CRACK SAFE';
        } else {
          promptLabel = '[E] DEFUSE BOMB (+45s)';
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(obj.x - 55, obj.y - 24, 146, 18);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(obj.x - 55, obj.y - 24, 146, 18);

        ctx.fillStyle = strokeColor;
        ctx.font = '700 8.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(promptLabel, obj.x + 18, obj.y - 12);
      }
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
