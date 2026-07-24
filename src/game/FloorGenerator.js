// Procedural 200-Floor Building Generator (+100 Positive for Thief, -100 Negative for Detective)
// Balanced spawn rates with guaranteed zero-overlap spatial zone allocation

import { TOTAL_FLOORS, FLOOR_HEIGHT, BUILDING_WIDTH, WALL_THICKNESS } from '../utils/constants.js';
import { FLOOR_THEME_SPECS, POSITIVE_THEMES, NEGATIVE_THEMES } from '../data/floorThemes.js';
import { SeededRandom } from '../utils/math.js';

export class FloorGenerator {
  static generateBuilding(seed = Date.now()) {
    const rng = new SeededRandom(seed);
    const floors = [];

    const POWER_UP_TYPES = [
      'power_floor_breaker',
      'power_super_grapple',
      'power_time_freeze',
      'power_speed_surge',
      'power_sonar_reveal'
    ];

    for (let i = 0; i < TOTAL_FLOORS; i++) {
      // i = 0..99   -> Floor +100 down to Floor +1 (Thief Domain)
      // i = 100..199 -> Floor -1 down to Floor -100 (Detective Domain)
      const floorNumber = i <= 99 ? (100 - i) : (-(i - 99));

      // Theme selection
      let themeName = 'Office';

      if (floorNumber === 100) {
        themeName = 'Sky Helipad';
      } else if (floorNumber === 1) {
        themeName = 'Central Vault Hub';
      } else if (floorNumber === -1) {
        themeName = 'Sub-Level Security Command';
      } else if (floorNumber === -100) {
        themeName = 'Sub-Zero Cryo Chamber';
      } else if (floorNumber > 0) {
        const pool = POSITIVE_THEMES.filter(t => t !== 'Sky Helipad' && t !== 'Central Vault Hub');
        const idx = Math.abs(i * 7 + 3) % pool.length;
        themeName = pool[idx] || 'Royal Penthouse';
      } else {
        const pool = NEGATIVE_THEMES.filter(t => t !== 'Sub-Level Security Command' && t !== 'Sub-Zero Cryo Chamber');
        const idx = Math.abs(i * 11 + 5) % pool.length;
        themeName = pool[idx] || 'Subterranean Bunker';
      }

      const themeSpec = FLOOR_THEME_SPECS[themeName] || FLOOR_THEME_SPECS['Royal Penthouse'];

      // Generate Floor Hole position (gap in floor platform)
      const holeWidth = rng.range(85, 115);
      const holeX = rng.range(WALL_THICKNESS + 20, BUILDING_WIDTH - WALL_THICKNESS - holeWidth - 20);

      // Divide room floor into 4 non-overlapping spatial zones to guarantee zero object overlap
      const availableZones = [];
      const zoneWidth = (BUILDING_WIDTH - WALL_THICKNESS * 2) / 4;
      for (let z = 0; z < 4; z++) {
        const zLeft = WALL_THICKNESS + z * zoneWidth + 10;
        const zRight = zLeft + zoneWidth - 20;
        // Check if zone overlaps with floor hole
        const overlapsHole = (zLeft < holeX + holeWidth + 20 && zRight > holeX - 20);
        if (!overlapsHole) {
          availableZones.push(zLeft + (zoneWidth - 40) / 2);
        }
      }

      // Helper function to pick a guaranteed unique X position
      const getUniqueX = () => {
        if (availableZones.length > 0) {
          const idx = Math.floor(rng.next() * availableZones.length);
          const posX = availableZones[idx];
          availableZones.splice(idx, 1); // Reserve zone so no other object can take it
          return posX;
        }
        return -1; // Zone exhausted
      };

      const objects = [];

      // 1. Mandatory Bomb Device & Radio Station on Target Junction (Floor +1 and Floor -1)
      if (floorNumber === 1 || floorNumber === -1) {
        const bombX = getUniqueX();
        if (bombX !== -1) {
          objects.push({
            id: `bomb_device_${floorNumber}`,
            type: 'bomb_device',
            x: bombX,
            y: (i + 1) * FLOOR_HEIGHT - 60,
            active: true
          });
        }

        const radioX = getUniqueX();
        if (radioX !== -1) {
          objects.push({
            id: `radio_${floorNumber}`,
            type: 'radio_station',
            x: radioX,
            y: (i + 1) * FLOOR_HEIGHT - 48,
            active: true
          });
        }
      }

      // 2. Radio Station: Spawned sparingly (every 10 floors, e.g. +90, +80... -80, -90)
      if (Math.abs(floorNumber) % 10 === 0 && Math.abs(floorNumber) !== 1) {
        const radioX = getUniqueX();
        if (radioX !== -1) {
          objects.push({
            id: `radio_${floorNumber}`,
            type: 'radio_station',
            x: radioX,
            y: (i + 1) * FLOOR_HEIGHT - 48,
            active: true
          });
        }
      }

      // 3. Floating Power-Up Orbs: Rare, strategic spawn rate (~12% per floor / every ~8-10 floors)
      if (Math.abs(floorNumber) % 9 === 0 && Math.abs(floorNumber) !== 1) {
        const pX = getUniqueX();
        if (pX !== -1) {
          const pType = rng.choice(POWER_UP_TYPES);
          objects.push({
            id: `power_${floorNumber}_${i}`,
            type: pType,
            x: pX,
            y: (i + 1) * FLOOR_HEIGHT - 65,
            active: true
          });
        }
      }

      // 4. Rare Diamond Treasure Chest: Rare, valuable spawn rate (~8% per floor / every ~12-15 floors)
      if (Math.abs(floorNumber) % 14 === 0 && Math.abs(floorNumber) !== 1) {
        const dX = getUniqueX();
        if (dX !== -1) {
          objects.push({
            id: `diamond_chest_${floorNumber}`,
            type: 'rare_diamond_chest',
            x: dX,
            y: (i + 1) * FLOOR_HEIGHT - 55,
            active: true
          });
        }
      }

      // 5. Safe Vaults: Moderate spawn rate (~20% per floor / every 5 floors)
      if (Math.abs(floorNumber) % 5 === 0 && Math.abs(floorNumber) !== 1) {
        const safeX = getUniqueX();
        if (safeX !== -1) {
          objects.push({
            id: `safe_${floorNumber}`,
            type: 'safe_vault',
            x: safeX,
            y: (i + 1) * FLOOR_HEIGHT - 56,
            active: true
          });
        }
      }

      // 6. Security Cameras: Mounted on ceiling left or right corner (doesn't occupy floor zones)
      if (themeSpec.objectTypes.includes('security_camera') || rng.next() < 0.35) {
        objects.push({
          id: `cam_${floorNumber}`,
          type: 'security_camera',
          x: rng.choice([WALL_THICKNESS + 15, BUILDING_WIDTH - WALL_THICKNESS - 45]),
          y: i * FLOOR_HEIGHT + 18,
          active: true
        });
      }

      floors.push({
        floorNumber,
        index: i,
        y: i * FLOOR_HEIGHT,
        theme: themeSpec,
        holes: [{ x: holeX, width: holeWidth }],
        objects: objects
      });
    }

    return floors;
  }
}
