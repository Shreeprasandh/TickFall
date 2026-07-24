// 28 Hand-Crafted Floor Theme Specs with subtle, smooth, luxury matte color palettes

export const FLOOR_THEME_SPECS = {
  // --- POSITIVE FLOORS (+100 to +1: Cipher / Thief Domain) ---
  'Sky Helipad': {
    name: 'Sky Helipad',
    wallColor: '#0F141C',
    floorColor: '#171F2B',
    accentColor: '#5C7C99',
    pattern: 'sky_grating',
    objectTypes: ['security_camera', 'laser_grid']
  },
  'Royal Penthouse': {
    name: 'Royal Penthouse',
    wallColor: '#14101A',
    floorColor: '#201A28',
    accentColor: '#C5A059',
    pattern: 'marble_gold',
    objectTypes: ['diamond_case', 'luxury_sofa', 'chandelier', 'safe_vault']
  },
  'Diamond Vault': {
    name: 'Diamond Vault',
    wallColor: '#10151C',
    floorColor: '#18202A',
    accentColor: '#4B6B82',
    pattern: 'cyber_traces',
    objectTypes: ['safe_vault', 'security_camera', 'laser_grid']
  },
  'Grand Ballroom': {
    name: 'Grand Ballroom',
    wallColor: '#1C130E',
    floorColor: '#2B1D16',
    accentColor: '#B8860B',
    pattern: 'wood_wainscot',
    objectTypes: ['chandelier', 'valuable_painting', 'coffee_table']
  },
  'High-Stakes Casino': {
    name: 'High-Stakes Casino',
    wallColor: '#1A0D0D',
    floorColor: '#281414',
    accentColor: '#A07038',
    pattern: 'damask_red',
    objectTypes: ['slot_machine', 'roulette_table', 'poker_table', 'safe_vault']
  },
  'Executive Boardroom': {
    name: 'Executive Boardroom',
    wallColor: '#121620',
    floorColor: '#1C2230',
    accentColor: '#4A5F78',
    pattern: 'mahogany_panel',
    objectTypes: ['executive_desk', 'rolling_chair', 'filing_cabinet']
  },
  'Modern Art Gallery': {
    name: 'Modern Art Gallery',
    wallColor: '#181413',
    floorColor: '#26201D',
    accentColor: '#9E7A53',
    pattern: 'canvas_plaster',
    objectTypes: ['sculpture_pedestal', 'valuable_painting', 'spotlight', 'easel_canvas']
  },
  'Rooftop Conservatory': {
    name: 'Rooftop Conservatory',
    wallColor: '#0E1712',
    floorColor: '#17241C',
    accentColor: '#4A6B56',
    pattern: 'glass_lattice',
    objectTypes: ['plant_pot', 'water_fountain', 'bench']
  },
  'Cyber Stock Exchange': {
    name: 'Cyber Stock Exchange',
    wallColor: '#0C121A',
    floorColor: '#141D29',
    accentColor: '#3D5A73',
    pattern: 'ticker_led',
    objectTypes: ['terminal_screen', 'server_rack', 'security_camera']
  },
  'Penthouse Lounge': {
    name: 'Penthouse Lounge',
    wallColor: '#12111A',
    floorColor: '#1C1A28',
    accentColor: '#C5A059',
    pattern: 'velvet_quilt',
    objectTypes: ['luxury_sofa', 'wine_rack', 'coffee_table']
  },
  'Luxury Spa': {
    name: 'Luxury Spa',
    wallColor: '#0E1718',
    floorColor: '#162426',
    accentColor: '#4E757D',
    pattern: 'subway_tile_white',
    objectTypes: ['steam_vent', 'towel_rack', 'water_basin']
  },
  'Cybernetics Lab': {
    name: 'Cybernetics Lab',
    wallColor: '#0A151A',
    floorColor: '#122026',
    accentColor: '#3B6B78',
    pattern: 'circuit_cyan',
    objectTypes: ['terminal_screen', 'beaker_station', 'laser_grid']
  },
  'Grand Library': {
    name: 'Grand Library',
    wallColor: '#18120C',
    floorColor: '#261C14',
    accentColor: '#9C6E3B',
    pattern: 'bookshelf_panel',
    objectTypes: ['bookshelf_large', 'reading_desk', 'rolling_ladder', 'globe']
  },
  'Private Cinema': {
    name: 'Private Cinema',
    wallColor: '#140D18',
    floorColor: '#201526',
    accentColor: '#6A4C6E',
    pattern: 'acoustic_hex',
    objectTypes: ['projector_screen', 'cinema_seat', 'speaker_stack']
  },
  'Observatory': {
    name: 'Observatory',
    wallColor: '#0A0D18',
    floorColor: '#121726',
    accentColor: '#584B78',
    pattern: 'starlight_grid',
    objectTypes: ['telescope', 'star_chart', 'terminal_screen']
  },
  'VIP Nightclub': {
    name: 'VIP Nightclub',
    wallColor: '#140A18',
    floorColor: '#201026',
    accentColor: '#7A3B66',
    pattern: 'neon_stripe',
    objectTypes: ['dj_booth', 'strobe_light', 'speaker_stack', 'vip_couch']
  },
  'High-Security Vault': {
    name: 'High-Security Vault',
    wallColor: '#15171A',
    floorColor: '#202428',
    accentColor: '#8A3E45',
    pattern: 'steel_rivet',
    objectTypes: ['safe_vault', 'security_camera', 'laser_grid', 'cctv_monitor']
  },
  'Central Vault Hub': {
    name: 'Central Vault Hub',
    wallColor: '#1A140C',
    floorColor: '#292015',
    accentColor: '#C5A059',
    pattern: 'bronze_grid',
    objectTypes: ['bomb_device', 'radio_station', 'safe_vault']
  },

  // --- NEGATIVE FLOORS (-1 to -100: Inspector Vale / Detective Domain) ---
  'Sub-Level Security Command': {
    name: 'Sub-Level Security Command',
    wallColor: '#12161C',
    floorColor: '#1E232B',
    accentColor: '#8A3E45',
    pattern: 'cctv_grid',
    objectTypes: ['cctv_monitor', 'radio_station', 'security_camera']
  },
  'Forensic Crime Lab': {
    name: 'Forensic Crime Lab',
    wallColor: '#0B1715',
    floorColor: '#142420',
    accentColor: '#4A6B56',
    pattern: 'bio_hex',
    objectTypes: ['beaker_station', 'centrifuge', 'microscope_desk', 'chemical_barrel']
  },
  'Deep Geothermal Station': {
    name: 'Deep Geothermal Station',
    wallColor: '#1A0E08',
    floorColor: '#28170D',
    accentColor: '#9C5430',
    pattern: 'copper_pipes',
    objectTypes: ['steam_stove', 'chemical_barrel', 'pressure_gauge']
  },
  'Classified Arms Depot': {
    name: 'Classified Arms Depot',
    wallColor: '#141414',
    floorColor: '#222222',
    accentColor: '#784444',
    pattern: 'reinforced_steel',
    objectTypes: ['weapon_rack', 'ammo_crate', 'security_camera']
  },
  'Bio-Containment Sector': {
    name: 'Bio-Containment Sector',
    wallColor: '#0C1611',
    floorColor: '#14221A',
    accentColor: '#4A6B4E',
    pattern: 'hazard_warning',
    objectTypes: ['bio_vat', 'decon_shower', 'terminal_screen']
  },
  'Underground Metro Hub': {
    name: 'Underground Metro Hub',
    wallColor: '#121417',
    floorColor: '#1D2026',
    accentColor: '#9A7242',
    pattern: 'subway_brick',
    objectTypes: ['turnstile', 'bench', 'vending_machine']
  },
  'Nuclear Reactor Bay': {
    name: 'Nuclear Reactor Bay',
    wallColor: '#16160A',
    floorColor: '#242410',
    accentColor: '#7A8A3E',
    pattern: 'radiation_grid',
    objectTypes: ['control_panel', 'cooling_pipe', 'radiation_shield']
  },
  'Sewer Filtration Plant': {
    name: 'Sewer Filtration Plant',
    wallColor: '#121410',
    floorColor: '#1C2018',
    accentColor: '#5A6B48',
    pattern: 'mossy_brick',
    objectTypes: ['water_gate', 'drain_pipe', 'chemical_barrel']
  },
  'Tactical Training Vault': {
    name: 'Tactical Training Vault',
    wallColor: '#161114',
    floorColor: '#241C21',
    accentColor: '#6E5062',
    pattern: 'carbon_mesh',
    objectTypes: ['target_dummy', 'weapon_rack', 'locker']
  },
  'Deep Cyber Mainframe': {
    name: 'Deep Cyber Mainframe',
    wallColor: '#060E17',
    floorColor: '#0D1A28',
    accentColor: '#3B5875',
    pattern: 'matrix_flow',
    objectTypes: ['server_rack', 'terminal_screen', 'cable_spool']
  },
  'Subterranean Bunker': {
    name: 'Subterranean Bunker',
    wallColor: '#12100E',
    floorColor: '#1D1A17',
    accentColor: '#706254',
    pattern: 'bunker_concrete',
    objectTypes: ['metal_cot', 'footlocker', 'radio_station']
  },
  'Sub-Zero Cryo Chamber': {
    name: 'Sub-Zero Cryo Chamber',
    wallColor: '#08141B',
    floorColor: '#10202B',
    accentColor: '#3D6878',
    pattern: 'ice_crystal',
    objectTypes: ['cryo_pod', 'terminal_screen', 'steam_vent']
  }
};

export const POSITIVE_THEMES = [
  'Sky Helipad',
  'Royal Penthouse',
  'Diamond Vault',
  'Grand Ballroom',
  'High-Stakes Casino',
  'Executive Boardroom',
  'Modern Art Gallery',
  'Rooftop Conservatory',
  'Cyber Stock Exchange',
  'Penthouse Lounge',
  'Luxury Spa',
  'Cybernetics Lab',
  'Grand Library',
  'Private Cinema',
  'Observatory',
  'VIP Nightclub',
  'High-Security Vault',
  'Central Vault Hub'
];

export const NEGATIVE_THEMES = [
  'Central Vault Hub',
  'Sub-Level Security Command',
  'Forensic Crime Lab',
  'Deep Geothermal Station',
  'Classified Arms Depot',
  'Bio-Containment Sector',
  'Underground Metro Hub',
  'Nuclear Reactor Bay',
  'Sewer Filtration Plant',
  'Tactical Training Vault',
  'Deep Cyber Mainframe',
  'Subterranean Bunker',
  'Sub-Zero Cryo Chamber'
];

export const THEME_LIST = Object.keys(FLOOR_THEME_SPECS);
