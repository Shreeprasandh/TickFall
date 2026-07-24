// Refined Architectural Constants for THE HEIST CLOCK (TickFall)

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;
export const TOTAL_FLOORS = 40;
export const FLOOR_HEIGHT = 160;
export const BUILDING_WIDTH = 440;
export const WALL_THICKNESS = 20;

export const GRAVITY = 0.45;
export const MAX_FALL_SPEED = 12;
export const STOMP_SPEED = 18;

// Thief constants
export const THIEF_SPEED = 5.2;
export const THIEF_JUMP_FORCE = -10.5;
export const THIEF_MAX_HP = 3;

// Detective constants
export const DETECTIVE_SPEED = 4.8;
export const DETECTIVE_JUMP_FORCE = -11.0;
export const DETECTIVE_GRAPPLE_SPEED = -14.0;
export const DETECTIVE_MAX_HP = 3;

// Time Frame configurations (in seconds)
export const TIME_FRAMES = {
  SHORT: {
    name: 'SHORT (7 MIN)',
    sessionLimit: 420,
    bombStartTime: 210,
    suddenDeath: 420,
    description: 'Fast, intense, zero margin for error'
  },
  STANDARD: {
    name: 'STANDARD (14 MIN)',
    sessionLimit: 840,
    bombStartTime: 420,
    suddenDeath: 840,
    description: 'Balanced, classic tournament experience'
  },
  EXTENDED: {
    name: 'EXTENDED (21 MIN)',
    sessionLimit: 1260,
    bombStartTime: 630,
    suddenDeath: 1260,
    description: 'Deep tactics, full shop economy & treasure hunt'
  }
};

export const TIMER_ACTIONS = {
  // Thief actions (decrease remaining time)
  CAMERA_SMASH: -3,
  GUARD_KNOCKOUT: -2,
  AIR_VENT_USE: -6,
  ELEVATOR_RIDE: -8,
  FLOOR_CHARGE: -5,
  PERFECT_FLOOR_DESCEND: -1,
  TREASURE_LOOT: -3,
  SAFE_CRACK: -4,
  SIGNAL_JAMMER: -8,

  // Detective actions (increase remaining time)
  REACH_BOMB_ROOM: 20,
  DIFFUSE_BOMB_SOLVED: 45,
  CAMERA_RESTORE: 4,
  GUARD_REVIVE: 2,
  EVIDENCE_COLLECT: 4,
  RADIO_STATION_USE: 6,
  BACKUP_CALL: 8,
  CCTV_CHECK: 2,
  PERFECT_FLOOR_ASCEND: 1,
  DIFFUSE_BOMB_FAILED: -8
};

export const GAME_STATES = {
  SPLASH: 'SPLASH',
  HOME: 'HOME',
  SOLO_SETUP: 'SOLO_SETUP',
  MULTIPLAYER_SETUP: 'MULTIPLAYER_SETUP',
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  RESULTS: 'RESULTS',
  HOW_TO_PLAY: 'HOW_TO_PLAY',
  SETTINGS: 'SETTINGS',
  PROFILE: 'PROFILE'
};

export const ROLES = {
  THIEF: 'THIEF',
  DETECTIVE: 'DETECTIVE'
};

export const BOT_DIFFICULTIES = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

export const THEMES = [
  'Penthouse Lounge', // Floor 40
  'Rooftop Garden',
  'Art Gallery',
  'Nightclub',
  'Casino',
  'Server Room',
  'Laboratory',
  'Security Room',
  'Library',
  'Office',
  'Gym',
  'Kitchen',
  'Hospital',
  'Storage',
  'Bedroom',
  'Parking Garage',
  'Bathroom',
  'Boiler Room' // Floor 1
];

// Luxury Masterpiece Palette: Warm Ivory, Champagne Gold, Deep Slate, Matte Charcoal
export const COLORS = {
  background: '#0D0E12',
  panelBorder: '#1A1D26',
  thiefPrimary: '#E2D9C8',     // Platinum Ivory
  thiefSecondary: '#8B94A0',
  detectivePrimary: '#C5A059', // Champagne Gold
  detectiveSecondary: '#4A5060',
  dangerRed: '#B83232',        // Muted Crimson
  successGreen: '#4A7C59',     // Deep Sage Green
  warningOrange: '#D48C46',    // Warm Amber
  textLight: '#F4F1EA',
  textMuted: '#7E8594',
  cardBg: 'rgba(18, 20, 26, 0.92)'
};
