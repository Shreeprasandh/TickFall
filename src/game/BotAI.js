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
    if (Math.abs(dx) > 8) {
      if (dx < 0) this.inputState.left = true;
      else this.inputState.right = true;
    }

    return this.inputState;
  }

  decidePath(botEntity, opponentEntity, buildingFloors, timerSystem) {
    const currentFloorIdx = Math.floor(botEntity.y / 160);
    const currentFloor = buildingFloors[currentFloorIdx];

    if (!currentFloor) return;

    if (this.role === 'THIEF') {
      // Thief AI Goal: Move DOWN. Head for floor holes or vent shortcuts!
      if (currentFloor.holes && currentFloor.holes.length > 0) {
        const nearestHole = currentFloor.holes[0];
        this.targetX = nearestHole.x + nearestHole.width / 2;

        // If above hole, stomp through!
        if (Math.abs(botEntity.x + botEntity.width / 2 - this.targetX) < 30) {
          this.inputState.stomp = true;
        }
      }

      // Hard bot interact with cameras for -3s time reduction
      if (this.difficulty !== BOT_DIFFICULTIES.EASY) {
        const cam = currentFloor.objects.find(o => o.type === 'security_camera' && o.active);
        if (cam) {
          this.targetX = cam.x + cam.width / 2;
          if (Math.abs(botEntity.x - cam.x) < 35) {
            this.inputState.interact = true;
          }
        }
      }

    } else {
      // Detective AI Goal: Move UP toward Floor 1 / Bomb room or pursue Thief!
      if (currentFloor.holes && currentFloor.holes.length > 0) {
        const holeAbove = currentFloor.holes[0];
        this.targetX = holeAbove.x + holeAbove.width / 2;

        // Grapple upward through ceiling hole
        if (Math.abs(botEntity.x + botEntity.width / 2 - this.targetX) < 40) {
          this.inputState.jump = true; // Trigger motorized grapple
        }
      }

      // If Thief is on same or adjacent floor, hard bot aggressively pursues Thief for arrest
      if (this.difficulty === BOT_DIFFICULTIES.HARD && Math.abs(opponentEntity.currentFloorIndex - botEntity.currentFloorIndex) <= 1) {
        this.targetX = opponentEntity.x + opponentEntity.width / 2;
        if (Math.abs(botEntity.x - opponentEntity.x) < 40 && opponentEntity.isStunned) {
          this.inputState.interact = true; // Arrest!
        }
      }
    }
  }
}
