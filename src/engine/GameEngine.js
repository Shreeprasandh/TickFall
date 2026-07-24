// Main Game Engine Loop with State Machine & Interaction Logic

import { GAME_STATES, ROLES, TIMER_ACTIONS, TOTAL_FLOORS, FLOOR_HEIGHT } from '../utils/constants.js';
import { events } from '../utils/events.js';
import { inputManager } from './InputManager.js';
import { audioManager } from './AudioManager.js';
import { Camera } from './Camera.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { ParticleSystem } from './ParticleSystem.js';
import { Renderer } from './Renderer.js';
import { FloorGenerator } from '../game/FloorGenerator.js';
import { ThiefController } from '../game/ThiefController.js';
import { DetectiveController } from '../game/DetectiveController.js';
import { TimerSystem } from '../game/TimerSystem.js';
import { BotAI } from '../game/BotAI.js';
import { StorageManager } from '../utils/storage.js';

export class GameEngine {
  constructor(leftCanvas, rightCanvas) {
    this.gameState = GAME_STATES.HOME;
    this.mode = 'SOLO'; // 'SOLO' or 'MULTIPLAYER'
    this.playerRole = ROLES.THIEF;
    this.timeFrameKey = 'STANDARD';
    this.botDifficulty = 'MEDIUM';

    this.renderer = new Renderer(leftCanvas, rightCanvas);
    this.leftCamera = new Camera(true); // Thief camera
    this.rightCamera = new Camera(false); // Detective camera

    this.thief = new ThiefController();
    this.detective = new DetectiveController();

    this.leftParticles = new ParticleSystem();
    this.rightParticles = new ParticleSystem();

    this.timerSystem = new TimerSystem();
    this.botAI = null;

    this.buildingFloors = [];
    this.lastTime = 0;
    this.isRunning = false;

    this.initEvents();
  }

  initEvents() {
    events.on('timer:changed', (data) => {
      const sign = data.delta >= 0 ? `+${data.delta}s` : `${data.delta}s`;
      const color = data.delta >= 0 ? '#00E676' : '#FF0844';
      this.renderer.addFloatingText(sign, 220, 200, color, 'both');
    });

    events.on('game:over', (data) => {
      this.gameState = GAME_STATES.RESULTS;
      audioManager.stopMusic();
      StorageManager.recordMatchResult(data.winner, this.timerSystem.elapsedSeconds, this.thief.chips + this.detective.chips);
    });
  }

  startSoloGame(playerRole = ROLES.THIEF, difficulty = 'MEDIUM', timeFrameKey = 'STANDARD') {
    this.playerRole = playerRole;
    this.botDifficulty = difficulty;
    this.timeFrameKey = timeFrameKey;
    this.mode = 'SOLO';

    const botRole = playerRole === ROLES.THIEF ? ROLES.DETECTIVE : ROLES.THIEF;
    this.botAI = new BotAI(botRole, difficulty);

    this.buildingFloors = FloorGenerator.generateBuilding(Date.now());
    this.thief.reset();
    this.detective.reset();
    this.timerSystem.reset(timeFrameKey);

    this.gameState = GAME_STATES.PLAYING;
    audioManager.startMusic();

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
    this.lastTime = currentTime;

    if (this.gameState === GAME_STATES.PLAYING) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    inputManager.update();

    // 1. Process Thief Inputs & AI
    let thiefInputs = inputManager.thiefInputs;
    let detectiveInputs = inputManager.detectiveInputs;

    if (this.mode === 'SOLO') {
      if (this.playerRole === ROLES.THIEF) {
        detectiveInputs = this.botAI.update(this.detective, this.thief, this.buildingFloors, this.timerSystem);
      } else {
        thiefInputs = this.botAI.update(this.thief, this.detective, this.buildingFloors, this.timerSystem);
      }
    }

    // 2. Update Controllers
    this.thief.update(thiefInputs);
    this.detective.update(detectiveInputs);

    // 3. Update Physics
    PhysicsEngine.updateEntity(this.thief, this.buildingFloors);
    PhysicsEngine.updateEntity(this.detective, this.buildingFloors);

    // 4. Update Cameras
    this.leftCamera.update(this.thief.y);
    this.rightCamera.update(this.detective.y);

    // 5. Update Timer System
    this.timerSystem.update(dt);

    // 6. Check Object Interactions & Spatials
    this.checkInteractions(thiefInputs, detectiveInputs);
    this.checkConvergenceAndArrest();

    // 7. Update Particles
    this.leftParticles.update();
    this.rightParticles.update();
  }

  checkInteractions(thiefInputs, detectiveInputs) {
    // Check Thief Object Interactions
    if (thiefInputs.interact) {
      const floor = this.buildingFloors[Math.floor(this.thief.y / FLOOR_HEIGHT)];
      if (floor && floor.objects) {
        floor.objects.forEach(obj => {
          if (!obj.active) return;
          if (PhysicsEngine.checkCollision(this.thief, { ...obj, height: 32, width: 32 })) {
            if (obj.type === 'security_camera') {
              obj.active = false;
              this.timerSystem.modifyTime(TIMER_ACTIONS.CAMERA_SMASH, 'Camera Smashed');
              audioManager.playCameraSmash();
              this.leftParticles.emit(obj.x, obj.y, 12, 'camera');
            } else if (obj.type === 'safe_vault') {
              obj.active = false;
              this.thief.chips += 15;
              this.timerSystem.modifyTime(TIMER_ACTIONS.SAFE_CRACK, 'Safe Cracked');
              audioManager.playCoin();
              this.leftParticles.emit(obj.x, obj.y, 15, 'pickup');
            } else if (obj.type === 'the_fence') {
              events.emit('shop:open', { role: 'THIEF' });
            }
          }
        });
      }
    }

    // Check Detective Object Interactions
    if (detectiveInputs.interact) {
      const floor = this.buildingFloors[Math.floor(this.detective.y / FLOOR_HEIGHT)];
      if (floor && floor.objects) {
        floor.objects.forEach(obj => {
          if (!obj.active) return;
          if (PhysicsEngine.checkCollision(this.detective, { ...obj, height: 32, width: 32 })) {
            if (obj.type === 'radio_station') {
              obj.active = false;
              this.timerSystem.modifyTime(TIMER_ACTIONS.RADIO_STATION_USE, 'Radio Report');
              audioManager.playCoin();
              this.rightParticles.emit(obj.x, obj.y, 10, 'pickup');
            } else if (obj.type === 'bomb_device' && !this.detective.bombDiffused) {
              events.emit('puzzle:open');
            } else if (obj.type === 'the_fence') {
              events.emit('shop:open', { role: 'DETECTIVE' });
            }
          }
        });
      }
    }

    // Check Win Condition: Thief reaches Floor 1 Ground Exit with Azure Diamond
    if (this.thief.currentFloorIndex === 1 && this.thief.y >= (TOTAL_FLOORS - 1) * FLOOR_HEIGHT + 20) {
      this.timerSystem.triggerWin('THIEF', 'CIPHER REACHED THE GROUND EXIT WITH THE AZURE DIAMOND!');
    }
  }

  checkConvergenceAndArrest() {
    // If on same floor and collision occurs
    if (Math.abs(this.thief.currentFloorIndex - this.detective.currentFloorIndex) === 0) {
      if (PhysicsEngine.checkCollision(this.thief, this.detective)) {
        if (this.thief.isStunned) {
          this.timerSystem.triggerWin('DETECTIVE', 'VALE ARRESTED CIPHER ON FLOOR ' + this.thief.currentFloorIndex + '!');
        } else {
          // Stun contact collision push
          this.leftCamera.shake(6);
          this.rightCamera.shake(6);
        }
      }
    }
  }

  render() {
    this.renderer.renderBoth(
      this.leftCamera,
      this.rightCamera,
      this.buildingFloors,
      this.thief,
      this.detective,
      this.leftParticles,
      this.rightParticles
    );
  }
}
