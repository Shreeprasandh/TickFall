// Procedural 40-Floor Building Generator

import { TOTAL_FLOORS, FLOOR_HEIGHT, BUILDING_WIDTH, WALL_THICKNESS, THEMES } from '../utils/constants.js';
import { FLOOR_THEME_SPECS } from '../data/floorThemes.js';
import { SeededRandom } from '../utils/math.js';

export class FloorGenerator {
  static generateBuilding(seed = Date.now()) {
    const rng = new SeededRandom(seed);
    const floors = [];

    for (let i = 0; i < TOTAL_FLOORS; i++) {
      const floorNumber = TOTAL_FLOORS - i; // 40 down to 1
      let themeName = 'Office';

      if (floorNumber === 40) {
        themeName = 'Penthouse Lounge';
      } else if (floorNumber === 1) {
        themeName = 'Boiler Room';
      } else if (floorNumber % 8 === 0) {
        themeName = 'Security Room';
      } else {
        themeName = THEMES[(i + rng.int(0, 3)) % THEMES.length];
      }

      const themeSpec = FLOOR_THEME_SPECS[themeName] || FLOOR_THEME_SPECS['Office'];

      // Generate Floor Hole position (gap in floor platform)
      const holeWidth = rng.range(80, 110);
      const holeX = rng.range(WALL_THICKNESS + 10, BUILDING_WIDTH - WALL_THICKNESS - holeWidth - 10);

      // Objects array for this floor
      const objects = [];

      // Always spawn 'The Fence' NPC on floors 32, 24, 16, 8
      if (floorNumber % 8 === 0 && floorNumber !== 40 && floorNumber !== 0) {
        objects.push({
          id: `fence_${floorNumber}`,
          type: 'the_fence',
          x: BUILDING_WIDTH / 2 - 20,
          y: (i + 1) * FLOOR_HEIGHT - 68,
          active: true
        });
      }

      // Always spawn Bomb Device on Floor 1
      if (floorNumber === 1) {
        objects.push({
          id: 'bomb_device_1',
          type: 'bomb_device',
          x: BUILDING_WIDTH / 2 - 28,
          y: (i + 1) * FLOOR_HEIGHT - 60,
          active: true
        });
        // Also spawn Radio Station on Floor 1
        objects.push({
          id: 'radio_1',
          type: 'radio_station',
          x: WALL_THICKNESS + 30,
          y: (i + 1) * FLOOR_HEIGHT - 48,
          active: true
        });
      }

      // Always spawn Security Camera or Safe on random floors
      if (themeSpec.objectTypes.includes('security_camera') && rng.next() < 0.6) {
        objects.push({
          id: `cam_${floorNumber}`,
          type: 'security_camera',
          x: rng.choice([WALL_THICKNESS + 10, BUILDING_WIDTH - WALL_THICKNESS - 42]),
          y: i * FLOOR_HEIGHT + 20,
          active: true
        });
      }

      if (themeSpec.objectTypes.includes('air_vent') && rng.next() < 0.4) {
        objects.push({
          id: `vent_${floorNumber}`,
          type: 'air_vent',
          x: rng.range(WALL_THICKNESS + 40, BUILDING_WIDTH - WALL_THICKNESS - 80),
          y: (i + 1) * FLOOR_HEIGHT - 36,
          active: true
        });
      }

      if (themeSpec.objectTypes.includes('safe_vault') && rng.next() < 0.3) {
        objects.push({
          id: `safe_${floorNumber}`,
          type: 'safe_vault',
          x: rng.range(WALL_THICKNESS + 40, BUILDING_WIDTH - WALL_THICKNESS - 80),
          y: (i + 1) * FLOOR_HEIGHT - 56,
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
