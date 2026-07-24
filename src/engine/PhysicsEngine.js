// Physics Engine with AABB collision, gravity, wall bouncing, and floor holes

import { GRAVITY, MAX_FALL_SPEED, WALL_THICKNESS, BUILDING_WIDTH, FLOOR_HEIGHT, TOTAL_FLOORS } from '../utils/constants.js';
import { checkAABB } from '../utils/math.js';

export class PhysicsEngine {
  static updateEntity(entity, buildingFloors) {
    if (!entity || !entity.active) return;

    // Apply Gravity
    if (!entity.isGrappling && !entity.isGrounded) {
      entity.vy += entity.stomping ? GRAVITY * 2.5 : GRAVITY;
      entity.vy = Math.min(entity.vy, entity.stomping ? 22 : MAX_FALL_SPEED);
    }

    // Apply horizontal velocity
    entity.x += entity.vx;
    entity.y += entity.vy;

    // Wall Bouncing (Left Wall & Right Wall)
    const minX = WALL_THICKNESS;
    const maxX = BUILDING_WIDTH - WALL_THICKNESS - entity.width;

    if (entity.x <= minX) {
      entity.x = minX;
      entity.vx = Math.abs(entity.vx) * 0.8; // Bounce right
    } else if (entity.x >= maxX) {
      entity.x = maxX;
      entity.vx = -Math.abs(entity.vx) * 0.8; // Bounce left
    }

    // Determine current floor index based on Y coordinate
    // Floor 1 is at bottom (y = (TOTAL_FLOORS - 1) * FLOOR_HEIGHT)
    // Floor 40 is at top (y = 0)
    const floorIndex = Math.floor(entity.y / FLOOR_HEIGHT);
    entity.currentFloorIndex = TOTAL_FLOORS - floorIndex; // 1 to 40

    // Reset grounded state before checking floor platforms
    entity.isGrounded = false;

    // Check collision with floor platform beneath entity
    const currentFloorObj = buildingFloors[floorIndex];
    if (currentFloorObj) {
      const platformY = (floorIndex + 1) * FLOOR_HEIGHT - 12; // floor platform surface

      // Platform check: entity landing on floor
      if (entity.vy >= 0 && entity.y + entity.height >= platformY && entity.y + entity.height <= platformY + 20) {
        // Check if entity is over a floor hole
        const overHole = currentFloorObj.holes.some(hole => {
          return entity.x + entity.width * 0.2 >= hole.x && entity.x + entity.width * 0.8 <= hole.x + hole.width;
        });

        // Stomp breaks through floor platform or entity falls through hole
        if (entity.stomping || overHole) {
          // Pass through floor to lower floor!
          if (entity.stomping) {
            entity.y = platformY + 15;
            entity.stomping = false; // Reset stomp after breaking floor
          }
        } else {
          // Solid floor collision -> snap on top
          entity.y = platformY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
        }
      }
    }
  }

  static checkCollision(rect1, rect2) {
    return checkAABB(rect1, rect2);
  }
}
