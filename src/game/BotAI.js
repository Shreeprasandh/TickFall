// Solo Mode Bot AI with balanced, enjoyable difficulty scaling so player can win comfortably

import { BOT_DIFFICULTIES } from '../utils/constants.js';

export class BotAI {
  constructor(role = 'DETECTIVE', difficulty = 'EASY') {
    this.role = role; // 'THIEF' or 'DETECTIVE'
    this.difficulty = difficulty;
    this.targetX = 220;
    this.thinkTimer = 0;
    this.hesitateTimer = 0;
    this.inputState = { left: false, right: false, jump: false, stomp: false, slide: false, interact: false };
  }

  update(botEntity, opponentEntity, buildingFloors, timerSystem) {
    this.inputState = { left: false, right: false, jump: false, stomp: false, slide: false, interact: false };
    if (!botEntity || !botEntity.active) return this.inputState;

    this.thinkTimer += 1 / 60;
    if (this.hesitateTimer > 0) {
      this.hesitateTimer -= 1 / 60;
      return this.inputState; // Human pause / mistake hesitation
    }

    // AI decision rate & mistake frequency tuned for comfortable player wins
    let reactionDelay = 0.65;
    let mistakeChance = 0.40;
    let speedThreshold = 24;

    if (this.difficulty === BOT_DIFFICULTIES.HARD) {
      reactionDelay = 0.35;
      mistakeChance = 0.20;
      speedThreshold = 14;
    } else if (this.difficulty === BOT_DIFFICULTIES.MEDIUM) {
      reactionDelay = 0.50;
      mistakeChance = 0.32;
      speedThreshold = 20;
    }

    if (this.thinkTimer >= reactionDelay) {
      this.thinkTimer = 0;

      // Occasional human mistake: bot hesitates for 0.8s - 1.5s
      if (Math.random() < mistakeChance) {
        this.hesitateTimer = 0.8 + Math.random() * 0.7;
      }

      this.decidePath(botEntity, opponentEntity, buildingFloors, timerSystem);
    }

    // Execute horizontal movement toward targetX
    const dx = this.targetX - (botEntity.x + botEntity.width / 2);
    if (Math.abs(dx) > speedThreshold) {
      if (dx < 0) this.inputState.left = true;
      else this.inputState.right = true;
    } else if (this.role === 'DETECTIVE' && Math.random() < 0.6) {
      // Gentle grapple jump climb
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

      // Interact with security cameras during OFF cycle
      if (currentFloor.objects) {
        const cam = currentFloor.objects.find(o => o.type === 'security_camera' && o.active);
        if (cam) {
          const cycle = ((Date.now() / 1000) + cam.x * 0.1) % 6.0;
          if (cycle >= 4.0) {
            this.targetX = cam.x + cam.width / 2;
            if (Math.abs(botEntity.x - cam.x) < 35) {
              this.inputState.interact = true;
            }
          }
        }
      }

    } else {
      // Detective AI Goal: Ascend UP toward Floor 1
      const floorAboveIdx = Math.max(0, currentFloorIdx - 1);
      const floorAbove = buildingFloors[floorAboveIdx];

      if (floorAbove && floorAbove.holes && floorAbove.holes.length > 0) {
        const holeAbove = floorAbove.holes[0];
        this.targetX = holeAbove.x + holeAbove.width / 2;

        if (Math.abs(botEntity.x + botEntity.width / 2 - this.targetX) < 45) {
          this.inputState.jump = true;
        }
      }

      // Pursue Thief if nearby
      if (opponentEntity && Math.abs(opponentEntity.currentFloorIndex - botEntity.currentFloorIndex) <= 1) {
        this.targetX = opponentEntity.x + opponentEntity.width / 2;
      }
    }
  }
}
