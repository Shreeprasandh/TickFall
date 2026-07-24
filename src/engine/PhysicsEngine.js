// Physics Engine with AABB collision, gravity, wall bouncing, and floor holes
// Ensures solid floor platforms stop fast falling/stomping while holes allow clean passage

import { GRAVITY, MAX_FALL_SPEED, WALL_THICKNESS, BUILDING_WIDTH, FLOOR_HEIGHT, TOTAL_FLOORS } from '../utils/constants.js';
import { checkAABB } from '../utils/math.js';

export class PhysicsEngine {
  static updateEntity(entity, buildingFloors) {
    if (!entity || !entity.active) return;

    const prevY = entity.y;

    // Apply Gravity
    if (!entity.isGrappling && !entity.isGrounded) {
      entity.vy += entity.stomping ? GRAVITY * 2.2 : GRAVITY;
      entity.vy = Math.min(entity.vy, entity.stomping ? MAX_FALL_SPEED * 1.5 : MAX_FALL_SPEED);
    }

    // Apply horizontal and vertical movement
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

    // Determine current floor index based on Y coordinate (0 to 199)
    const floorIndex = Math.min(Math.max(Math.floor((entity.y + entity.height / 2) / FLOOR_HEIGHT), 0), TOTAL_FLOORS - 1);
    entity.currentFloorIndex = floorIndex <= 99 ? (100 - floorIndex) : (-(floorIndex - 99));

    // Reset grounded state before checking floor platforms
    entity.isGrounded = false;

    // Check collision with floor platforms (Swept AABB interval check against tunneling)
    const currentFloorObj = buildingFloors[floorIndex];
    if (currentFloorObj) {
      const platformY = (floorIndex + 1) * FLOOR_HEIGHT - 12; // floor platform surface

      // Swept check: entity moved from above platform surface to at/below platform surface
      const wasAbove = (prevY + entity.height) <= (platformY + 8);
      const isBelow = (entity.y + entity.height) >= platformY;

      if (entity.vy >= 0 && (wasAbove || (entity.y + entity.height >= platformY && entity.y + entity.height <= platformY + 36))) {
        // Check if entity is over a floor hole gap
        const overHole = currentFloorObj.holes && currentFloorObj.holes.some(hole => {
          return (entity.x + entity.width * 0.25) >= hole.x && (entity.x + entity.width * 0.75) <= (hole.x + hole.width);
        });

        if (overHole) {
          // Over a floor hole -> Fall down cleanly through the gap
          entity.isGrounded = false;
        } else {
          // Solid floor platform -> Snap safely on top of platform surface!
          entity.y = platformY - entity.height;
          entity.vy = 0;
          entity.isGrounded = true;
          entity.stomping = false; // Reset stomp state on solid ground impact
        }
      }
    }
  }

  static checkCollision(rect1, rect2) {
    return checkAABB(rect1, rect2);
  }
}
