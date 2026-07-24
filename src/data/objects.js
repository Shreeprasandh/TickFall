// Object definitions & interaction behaviors — Refined Palette Edition

export const OBJECT_DEFINITIONS = {
  security_camera: {
    name: 'Camera',
    width: 28,
    height: 28,
    color: '#8B3A3A', // Muted dark crimson
    interactiveBy: 'THIEF',
    actionText: 'SMASH (-3s)',
    timerImpact: -3
  },
  radio_station: {
    name: 'Radio',
    width: 44,
    height: 32,
    color: '#C5A059', // Champagne Gold
    interactiveBy: 'DETECTIVE',
    actionText: 'REPORT (+6s)',
    timerImpact: 6
  },
  air_vent: {
    name: 'Vent',
    width: 36,
    height: 20,
    color: '#4A5060', // Slate Gray
    interactiveBy: 'BOTH',
    actionText: 'ENTER (Skip 2 Floors)',
    timerImpact: -6
  },
  vending_machine: {
    name: 'Vendor',
    width: 32,
    height: 48,
    color: '#7E8694', // Matte Steel
    interactiveBy: 'BOTH',
    actionText: 'BUY ITEM (10 Chips)',
    timerImpact: 0
  },
  safe_vault: {
    name: 'Safe',
    width: 40,
    height: 40,
    color: '#C5A059', // Gold
    interactiveBy: 'THIEF',
    actionText: 'CRACK SAFE (+15 Chips, -4s)',
    timerImpact: -4
  },
  cctv_monitor: {
    name: 'CCTV',
    width: 36,
    height: 28,
    color: '#5C6B80', // Deep Slate
    interactiveBy: 'DETECTIVE',
    actionText: 'SCAN THIEF (+2s)',
    timerImpact: 2
  },
  health_vial: {
    name: 'First Aid',
    width: 20,
    height: 20,
    color: '#527A59', // Sage Green
    interactiveBy: 'BOTH',
    actionText: 'HEAL +1 HP',
    timerImpact: 0
  },
  the_fence: {
    name: 'The Fence',
    width: 36,
    height: 50,
    color: '#A08040', // Muted Bronze
    interactiveBy: 'BOTH',
    actionText: 'OPEN SHOP',
    timerImpact: 0
  },
  bomb_device: {
    name: 'Bomb',
    width: 48,
    height: 40,
    color: '#8B2626', // Deep Burgundy
    interactiveBy: 'DETECTIVE',
    actionText: 'DIFFUSE BOMB',
    timerImpact: 20
  }
};
