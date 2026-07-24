// Main Game Engine Loop with State Machine & Interaction Logic

import { GAME_STATES, ROLES, TIMER_ACTIONS, TOTAL_FLOORS, FLOOR_HEIGHT, WALL_THICKNESS } from '../utils/constants.js';
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
    this.isPaused = false;
    this.p1Paused = false; // Thief / P1 Pause State
    this.p2Paused = false; // Detective / P2 Pause State

    this.initEvents();
  }

  initEvents() {
    events.on('timer:changed', (data) => {
      const sign = data.delta >= 0 ? `+${data.delta}s` : `${data.delta}s`;
      const color = data.delta >= 0 ? '#00E676' : '#FF0844';
      this.renderer.addFloatingText(sign, 220, 200, color, 'both');
    });

    events.on('timer:modify', (data) => {
      if (this.timerSystem) {
        this.timerSystem.modifyTime(data.delta, data.source || 'Event');
      }
    });

    events.on('bomb:defused_success', () => {
      if (this.detective) this.detective.bombDiffused = true;
      if (this.timerSystem) this.timerSystem.diffuseBomb();
      this.renderer.addFloatingText('BOMB DEFUSED! +45s', 220, 200, '#00E676', 'both');
    });

    events.on('game:over', (data) => {
      this.cutsceneData = data;
      this.cutsceneTimer = 0;
      this.cutsceneDuration = 2.5;
      this.gameState = GAME_STATES.CUTSCENE;
      audioManager.stopMusic();
      audioManager.playVictoryFanfare(data.winner);
      this.leftParticles.emit(240, 360, 40);
      this.rightParticles.emit(240, 360, 40);
    });

    events.on('input:pause', (data) => {
      this.togglePause(data?.role || ROLES.THIEF);
    });
  }

  isGamePaused() {
    if (this.mode === 'SOLO') return this.isPaused;
    return this.p1Paused || this.p2Paused;
  }

  pause(playerRole = ROLES.THIEF) {
    if (this.gameState !== GAME_STATES.PLAYING) return;
    if (this.mode === 'SOLO') {
      this.isPaused = true;
    } else {
      if (playerRole === ROLES.THIEF) this.p1Paused = true;
      else if (playerRole === ROLES.DETECTIVE) this.p2Paused = true;
      else {
        this.p1Paused = true;
        this.p2Paused = true;
      }
    }
    if (this.timerSystem) this.timerSystem.isPaused = this.isGamePaused();
    events.emit('game:paused', {
      mode: this.mode,
      p1Paused: this.p1Paused,
      p2Paused: this.p2Paused,
      isPaused: this.isGamePaused()
    });
  }

  unpausePlayer(playerRole = ROLES.THIEF) {
    if (this.gameState !== GAME_STATES.PLAYING) return;
    if (this.mode === 'SOLO') {
      this.isPaused = false;
    } else {
      if (playerRole === ROLES.THIEF) this.p1Paused = false;
      if (playerRole === ROLES.DETECTIVE) this.p2Paused = false;
    }
    const currentlyPaused = this.isGamePaused();
    if (this.timerSystem) this.timerSystem.isPaused = currentlyPaused;
    events.emit('game:unpaused', {
      mode: this.mode,
      p1Paused: this.p1Paused,
      p2Paused: this.p2Paused,
      isPaused: currentlyPaused
    });
  }

  togglePause(playerRole = ROLES.THIEF) {
    const isPlayerCurrentlyPaused = this.mode === 'SOLO' ? this.isPaused : (playerRole === ROLES.THIEF ? this.p1Paused : this.p2Paused);
    if (isPlayerCurrentlyPaused) {
      this.unpausePlayer(playerRole);
    } else {
      this.pause(playerRole);
    }
  }

  resetPauseState() {
    this.isPaused = false;
    this.p1Paused = false;
    this.p2Paused = false;
    if (this.timerSystem) this.timerSystem.isPaused = false;
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
    this.resetPauseState();

    this.gameState = GAME_STATES.PLAYING;
    audioManager.startInGameMusic();

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  startMultiplayerGame(timeFrameKey = 'STANDARD') {
    this.playerRole = ROLES.THIEF;
    this.timeFrameKey = timeFrameKey;
    this.mode = 'MULTIPLAYER';
    this.botAI = null;

    this.buildingFloors = FloorGenerator.generateBuilding(Date.now());
    this.thief.reset();
    this.detective.reset();
    this.timerSystem.reset(timeFrameKey);
    this.resetPauseState();

    this.gameState = GAME_STATES.PLAYING;
    audioManager.startInGameMusic();

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
      if (!this.isGamePaused()) {
        this.update(dt);
      }
      this.render();
    } else if (this.gameState === GAME_STATES.CUTSCENE) {
      this.cutsceneTimer += dt;
      const progress = Math.min(1.0, this.cutsceneTimer / this.cutsceneDuration);
      
      this.update(dt * 0.15); // Smooth slow-motion physics update
      this.render();
      this.renderer.renderCutsceneOverlays(this.cutsceneData, progress);

      if (this.cutsceneTimer >= this.cutsceneDuration) {
        this.cutsceneTimer = this.cutsceneDuration;
        this.gameState = GAME_STATES.RESULTS;
        StorageManager.recordMatchResult(this.cutsceneData.winner, this.timerSystem.elapsedSeconds, this.thief.chips + this.detective.chips);
        if (window.uiManager) window.uiManager.switchScreen(GAME_STATES.RESULTS);
      }
    } else if (this.gameState === GAME_STATES.RESULTS) {
      this.render(); // Keep rendering canvas background under results modal so screen never freezes!
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    inputManager.update(this.playerRole, this.mode);

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
    // 1. Auto-claim floating power-up Orbs & rare Diamond Chests on proximity touch (instant activation!)
    const charList = [
      { char: this.thief, cam: this.leftCamera, particles: this.leftParticles, isThief: true },
      { char: this.detective, cam: this.rightCamera, particles: this.rightParticles, isThief: false }
    ];

    charList.forEach(({ char, cam, particles, isThief }) => {
      const currentFloorIdx = Math.min(Math.max(Math.floor((char.y + char.height / 2) / FLOOR_HEIGHT), 0), TOTAL_FLOORS - 1);

      // Check current floor and adjacent floor objects
      for (let f = Math.max(0, currentFloorIdx - 1); f <= Math.min(TOTAL_FLOORS - 1, currentFloorIdx + 1); f++) {
        const floorObj = this.buildingFloors[f];
        if (floorObj && floorObj.objects) {
          floorObj.objects.forEach(obj => {
            if (!obj.active) return;

            // 1. Moving Laser Grid Hazard Check (Independent of obj.x origin distance!)
            if (obj.type === 'moving_laser_barrier') {
              const laserX = WALL_THICKNESS + 40 + (Math.sin(Date.now() * 0.003 + obj.y) + 1) * 120;
              const charMidX = char.x + char.width / 2;
              const charMidY = char.y + char.height / 2;

              const onSameFloor = Math.abs(charMidY - (obj.y - 10)) < 70;
              const hitsBeam = Math.abs(charMidX - laserX) < 26;

              if (onSameFloor && hitsBeam && !char.isSliding) {
                if (!char.isLaserTripped) {
                  char.isLaserTripped = true;
                  const timeDelta = isThief ? 4 : -4;
                  this.timerSystem.modifyTime(timeDelta, 'Tripped Laser Grid');
                  audioManager.playAlarm();
                  particles.emit(char.x, char.y, 16, 'camera');
                  const tagText = isThief ? '⚡ LASER GRID TRIP (+4s)!' : '⚡ LASER GRID TRIP (-4s)!';
                  this.renderer.addFloatingText(tagText, char.x - 20, char.y - 20, '#8A3E45', isThief ? 'left' : 'right');
                  setTimeout(() => { if (char) char.isLaserTripped = false; }, 1800);
                }
              }
            } else {
              // 2. Proximity pickup objects
              const dist = Math.hypot((char.x + char.width / 2) - (obj.x + 18), (char.y + char.height / 2) - (obj.y + 18));
              if (dist < 42) {
                if (obj.type === 'power_floor_breaker') {
                  obj.active = false;
                  char.y = Math.min((TOTAL_FLOORS - 1) * FLOOR_HEIGHT, char.y + 5 * FLOOR_HEIGHT);
                  cam.shake(12);
                  particles.emit(char.x, char.y, 25, 'camera');
                  audioManager.playPowerFloorBreaker();
                  this.renderer.addFloatingText('⚡ 5-FLOOR DRILL BLAST!', char.x, char.y - 20, '#FF6D00', isThief ? 'left' : 'right');
                } else if (obj.type === 'power_super_grapple') {
                  obj.active = false;
                  char.y = Math.max(0, char.y - 5 * FLOOR_HEIGHT);
                  cam.shake(10);
                  particles.emit(char.x, char.y, 25, 'pickup');
                  audioManager.playPowerSuperGrapple();
                  this.renderer.addFloatingText('🚀 5-FLOOR SUPER VAULT!', char.x, char.y - 20, '#00F2FE', isThief ? 'left' : 'right');
                } else if (obj.type === 'power_time_freeze') {
                  obj.active = false;
                  audioManager.playPowerTimeFreeze();
                  this.timerSystem.modifyTime(isThief ? -5 : 5, 'Time Freeze');
                  this.renderer.addFloatingText('❄️ CHRONO LOCK (5s)!', char.x, char.y - 20, '#76E4F7', isThief ? 'left' : 'right');
                } else if (obj.type === 'power_speed_surge') {
                  obj.active = false;
                  char.stealthTimer = 4.0;
                  audioManager.playPowerSpeedSurge();
                  this.renderer.addFloatingText('⚡ PHANTOM SPRINT!', char.x, char.y - 20, '#FFD700', isThief ? 'left' : 'right');
                } else if (obj.type === 'power_sonar_reveal') {
                  obj.active = false;
                  audioManager.playPowerSonarReveal();
                  this.renderer.addFloatingText('📡 SONAR REVEAL!', char.x, char.y - 20, '#00E676', isThief ? 'left' : 'right');
                } else if (obj.type === 'express_elevator') {
                  char.y = Math.min((TOTAL_FLOORS - 1) * FLOOR_HEIGHT, char.y + 10 * FLOOR_HEIGHT);
                  cam.shake(10);
                  particles.emit(char.x, char.y, 20, 'pickup');
                  audioManager.playPowerSuperGrapple();
                  this.renderer.addFloatingText('🛗 EXPRESS ELEVATOR (10 FLOORS)!', char.x - 20, char.y - 20, '#5C7C99', isThief ? 'left' : 'right');
                } else if (obj.type === 'rare_diamond_chest') {
                  obj.active = false;
                  char.chips += 25;
                  particles.emit(char.x, char.y, 20, 'pickup');
                  audioManager.playPowerDiamondLoot();
                  this.renderer.addFloatingText('💎 +25 DIAMONDS!', char.x, char.y - 20, '#00E5FF', isThief ? 'left' : 'right');
                }
              }
            }
          });
        }
      }
    });

    // 2. Manual Object Interactions ([E] Key)
    if (thiefInputs.interact) {
      const floor = this.buildingFloors[Math.floor(this.thief.y / FLOOR_HEIGHT)];
      if (floor && floor.objects) {
        floor.objects.forEach(obj => {
          if (!obj.active) return;
          if (PhysicsEngine.checkCollision(this.thief, { ...obj, height: 48, width: 48 })) {
            if (obj.type === 'express_elevator') {
              this.thief.y = Math.min((TOTAL_FLOORS - 1) * FLOOR_HEIGHT, this.thief.y + 10 * FLOOR_HEIGHT);
              this.leftCamera.shake(10);
              this.leftParticles.emit(this.thief.x, this.thief.y, 20, 'pickup');
              audioManager.playPowerSuperGrapple();
              this.renderer.addFloatingText('🛗 EXPRESS ELEVATOR (10 FLOORS)!', this.thief.x - 20, this.thief.y - 20, '#5C7C99', 'left');
            } else if (obj.type === 'security_camera') {
              const cycle = ((Date.now() / 1000) + obj.x * 0.1) % 6.0;
              const isCameraOff = cycle >= 4.0;
              if (isCameraOff) {
                obj.active = false;
                this.timerSystem.modifyTime(TIMER_ACTIONS.CAMERA_SMASH, 'Camera Smashed');
                audioManager.playCameraSmash();
                this.leftParticles.emit(obj.x, obj.y, 16, 'camera');
                this.renderer.addFloatingText('💥 CAMERA SMASHED! (-3s)', obj.x, obj.y - 20, '#00E676', 'left');
              } else {
                audioManager.playAlarm();
                this.renderer.addFloatingText('🔒 CAMERA ACTIVE! WAIT FOR OFF CYCLE', obj.x - 30, obj.y - 20, '#8A3E45', 'left');
              }
            } else if (obj.type === 'safe_vault') {
              obj.active = false;
              this.thief.chips += 15;
              this.timerSystem.modifyTime(TIMER_ACTIONS.SAFE_CRACK, 'Safe Cracked');
              audioManager.playCoin();
              this.leftParticles.emit(obj.x, obj.y, 15, 'pickup');
            }
          }
        });
      }
    }

    if (detectiveInputs.interact) {
      const floor = this.buildingFloors[Math.floor(this.detective.y / FLOOR_HEIGHT)];
      if (floor && floor.objects) {
        floor.objects.forEach(obj => {
          if (!obj.active) return;
          if (PhysicsEngine.checkCollision(this.detective, { ...obj, height: 48, width: 48 })) {
            if (obj.type === 'express_elevator') {
              this.detective.y = Math.max(0, this.detective.y - 10 * FLOOR_HEIGHT);
              this.rightCamera.shake(10);
              this.rightParticles.emit(this.detective.x, this.detective.y, 20, 'pickup');
              audioManager.playPowerSuperGrapple();
              this.renderer.addFloatingText('🛗 EXPRESS ELEVATOR (10 FLOORS)!', this.detective.x - 20, this.detective.y - 20, '#5C7C99', 'right');
            } else if (obj.type === 'security_camera') {
              const cycle = ((Date.now() / 1000) + obj.x * 0.1) % 6.0;
              const isCameraOff = cycle >= 4.0;
              if (isCameraOff) {
                obj.active = false;
                this.timerSystem.modifyTime(TIMER_ACTIONS.CAMERA_SMASH, 'Camera Smashed');
                audioManager.playCameraSmash();
                this.rightParticles.emit(obj.x, obj.y, 16, 'camera');
                this.renderer.addFloatingText('💥 CAMERA SMASHED! (-3s)', obj.x, obj.y - 20, '#00E676', 'right');
              } else {
                audioManager.playAlarm();
                this.renderer.addFloatingText('🔒 CAMERA ACTIVE! WAIT FOR OFF CYCLE', obj.x - 30, obj.y - 20, '#8A3E45', 'right');
              }
            } else if (obj.type === 'bomb_device' && !this.detective.bombDiffused) {
              events.emit('puzzle:open');
            }
          }
        });
      }
    }

    // Check Win Condition: First to reach Floor 1 Bomb Vault (index 39)
    // Check Win Condition: First to reach Central Vault Hub (Floor +1 / Floor -1 junction)
    const thiefFloor = Math.floor(this.thief.y / FLOOR_HEIGHT);
    const detFloor = Math.floor(this.detective.y / FLOOR_HEIGHT);

    if (thiefFloor >= 99 && thiefFloor <= 100 && this.thief.y >= 99 * FLOOR_HEIGHT - 10) {
      this.timerSystem.triggerWin('THIEF', 'CIPHER DESCENDED TO FLOOR +1 CENTRAL VAULT FIRST AND ESCAPED WITH THE DIAMOND!');
    } else if (detFloor <= 100 && detFloor >= 99 && this.detective.y <= 100 * FLOOR_HEIGHT + 35) {
      this.timerSystem.triggerWin('DETECTIVE', 'VALE ASCENDED TO FLOOR -1 SECURITY HUB FIRST AND SECURED THE BUILDING!');
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
