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
      const holeWidth = rng.range(85, 115);
      const holeX = rng.range(WALL_THICKNESS + 20, BUILDING_WIDTH - WALL_THICKNESS - holeWidth - 20);

      const getValidX = (objWidth = 40) => {
        let attempts = 0;
        while (attempts < 25) {
          const candX = rng.range(WALL_THICKNESS + 30, BUILDING_WIDTH - WALL_THICKNESS - objWidth - 30);
          if (candX + objWidth < holeX - 25 || candX > holeX + holeWidth + 25) {
            return candX;
          }
          attempts++;
        }
        return holeX < BUILDING_WIDTH / 2 ? BUILDING_WIDTH - WALL_THICKNESS - objWidth - 40 : WALL_THICKNESS + 40;
      };

      // Objects array for this floor
      const objects = [];

      // Always spawn 'The Fence' NPC on floors 32, 24, 16, 8
      if (floorNumber % 8 === 0 && floorNumber !== 40 && floorNumber !== 0) {
        const fenceX = getValidX(40);
        objects.push({
          id: `fence_${floorNumber}`,
          type: 'the_fence',
          x: fenceX,
          y: (i + 1) * FLOOR_HEIGHT - 68,
          active: true
        });
      }

      // Always spawn Bomb Device on Floor 1
      if (floorNumber === 1) {
        const bombX = getValidX(40);
        objects.push({
          id: 'bomb_device_1',
          type: 'bomb_device',
          x: bombX,
          y: (i + 1) * FLOOR_HEIGHT - 60,
          active: true
        });
        // Also spawn Radio Station on Floor 1
        const radioX = getValidX(40);
        objects.push({
          id: 'radio_1',
          type: 'radio_station',
          x: radioX,
          y: (i + 1) * FLOOR_HEIGHT - 48,
          active: true
        });
      }

      // Spawn Security Camera on random floors (70% spawn rate)
      if (themeSpec.objectTypes.includes('security_camera') || rng.next() < 0.55) {
        objects.push({
          id: `cam_${floorNumber}`,
          type: 'security_camera',
          x: rng.choice([WALL_THICKNESS + 15, BUILDING_WIDTH - WALL_THICKNESS - 45]),
          y: i * FLOOR_HEIGHT + 18,
          active: true
        });
      }

      // Spawn Safe Vault on random floors (40% spawn rate)
      if (themeSpec.objectTypes.includes('safe_vault') || rng.next() < 0.4) {
        const safeX = getValidX(35);
        objects.push({
          id: `safe_${floorNumber}`,
          type: 'safe_vault',
          x: safeX,
          y: (i + 1) * FLOOR_HEIGHT - 56,
          active: true
        });
      }

      // Spawn Radio Station on security & office floors
      if ((floorNumber % 6 === 0 || themeName === 'Security Room') && floorNumber !== 1) {
        const radioX = getValidX(40);
        objects.push({
          id: `radio_${floorNumber}`,
          type: 'radio_station',
          x: radioX,
          y: (i + 1) * FLOOR_HEIGHT - 48,
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
