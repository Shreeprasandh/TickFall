// Solo Mode Bot AI with Easy, Medium, and Hard difficulty levels

import { BOT_DIFFICULTIES } from '../utils/constants.js';

export class BotAI {
  constructor(role = 'DETECTIVE', difficulty = 'MEDIUM') {
    this.role = role; // 'THIEF' or 'DETECTIVE'
    this.difficulty = difficulty;
    this.targetX = 220;
    this.thinkTimer = 0;
    this.inputState = { left: false, right: false, jump: false, stomp: false, slide: false, interact: false };
  }

  update(botEntity, opponentEntity, buildingFloors, timerSystem) {
    this.inputState = { left: false, right: false, jump: false, stomp: false, slide: false, interact: false };
    if (!botEntity || !botEntity.active) return this.inputState;

    this.thinkTimer += 1 / 60;

    // AI decision rate depends on difficulty
    const reactionDelay = this.difficulty === BOT_DIFFICULTIES.HARD ? 0.05 : (this.difficulty === BOT_DIFFICULTIES.MEDIUM ? 0.15 : 0.35);

    if (this.thinkTimer >= reactionDelay) {
      this.thinkTimer = 0;
      this.decidePath(botEntity, opponentEntity, buildingFloors, timerSystem);
    }

    // Execute horizontal movement toward targetX
    const dx = this.targetX - (botEntity.x + botEntity.width / 2);
    if (Math.abs(dx) > 10) {
      if (dx < 0) this.inputState.left = true;
      else this.inputState.right = true;
    } else if (this.role === 'DETECTIVE') {
      // Near ceiling hole -> pulse grapple jump to climb up!
      this.inputState.jump = true;
    }

    return this.inputState;
  }

  decidePath(botEntity, opponentEntity, buildingFloors, timerSystem) {
    const currentFloorIdx = Math.clamp ? Math.clamp(Math.floor(botEntity.y / 160), 0, buildingFloors.length - 1) : Math.min(Math.max(Math.floor(botEntity.y / 160), 0), buildingFloors.length - 1);
    const currentFloor = buildingFloors[currentFloorIdx];

    if (!currentFloor) return;

    if (this.role === 'THIEF') {
      // Thief AI Goal: Move DOWN. Head for floor holes!
      if (currentFloor.holes && currentFloor.holes.length > 0) {
        const hole = currentFloor.holes[0];
        this.targetX = hole.x + hole.width / 2;

        if (Math.abs(botEntity.x + botEntity.width / 2 - this.targetX) < 25) {
          this.inputState.stomp = true;
        }
      }

      // Interact with security cameras to smash (-3s time boost)
      if (currentFloor.objects) {
        const cam = currentFloor.objects.find(o => o.type === 'security_camera' && o.active);
        if (cam) {
          this.targetX = cam.x + cam.width / 2;
          if (Math.abs(botEntity.x - cam.x) < 35) {
            this.inputState.interact = true;
          }
        }
      }

    } else {
      // Detective AI Goal: Ascend UP toward Floor 1 / Bomb room or pursue Thief!
      // In building array, lower floor index = higher floor (index 0 is Floor 40, index 39 is Floor 1)
      const floorAboveIdx = Math.max(0, currentFloorIdx - 1);
      const floorAbove = buildingFloors[floorAboveIdx];

      if (floorAbove && floorAbove.holes && floorAbove.holes.length > 0) {
        const holeAbove = floorAbove.holes[0];
        this.targetX = holeAbove.x + holeAbove.width / 2;

        if (Math.abs(botEntity.x + botEntity.width / 2 - this.targetX) < 45) {
          this.inputState.jump = true; // Grapple up!
        }
      }

      // Radio Station reporting (+6s time boost for Detective)
      if (currentFloor.objects) {
        const radio = currentFloor.objects.find(o => o.type === 'radio_station' && o.active);
        if (radio) {
          this.targetX = radio.x + radio.width / 2;
          if (Math.abs(botEntity.x - radio.x) < 35) {
            this.inputState.interact = true;
          }
        }
      }

      // Pursue Thief if nearby
      if (opponentEntity && Math.abs(opponentEntity.currentFloorIndex - botEntity.currentFloorIndex) <= 1) {
        this.targetX = opponentEntity.x + opponentEntity.width / 2;
        if (Math.abs(botEntity.x - opponentEntity.x) < 35) {
          this.inputState.interact = true;
        }
      }
    }
  }
}
