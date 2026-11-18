export const scope = 'World dimensions, districts, colors, movement and persistence constants.';
export const WORLD = { width: 2860, depth: 2360, shoreX: 2630, shoreZ: 2180, road: 112 };
export const STREETS = { x: [240, 680, 1120, 1560, 2000, 2440], z: [280, 720, 1160, 1600, 2040] };
export const SPEEDS = { walk: 7, sprint: 11, forward: 92, reverse: 28, acceleration: 24, brake: 52 };
export const SAVE_KEY = 'high-water-sunspur-v1';
export const PALETTE = { asphalt: 0x283b43, pavement: 0x778b8a, sand: 0xc8ad83, water: 0x176977,
  roofs: [0xe69583, 0x78afa5, 0xd4b570, 0x8887ac], walls: [0xc7bfad, 0xaabec0, 0xc5a89d, 0x91aba3] };
export const DISTRICTS = [
  { name: 'CITRUS COMMONS', short: 'CITRUS', color: '#bfe09b', x: 0, z: 0, w: 1070, d: 1140 },
  { name: 'OLD SALT QUARTER', short: 'OLD SALT', color: '#e8bb8c', x: 0, z: 1140, w: 1300, d: 1220 },
  { name: 'MARIGOLD MARKET', short: 'MARIGOLD', color: '#f2bd65', x: 1070, z: 640, w: 830, d: 960 },
  { name: 'TIDEWORKS', short: 'TIDEWORKS', color: '#89cdd0', x: 1900, z: 0, w: 730, d: 1600 },
  { name: 'SUNSPUR STRAND', short: 'STRAND', color: '#e5a1b2', x: 1300, z: 1600, w: 1330, d: 760 },
];
export const CONTACTS = [
  { id: 'tavi', name: 'Tavi Moss', faction: 'FIXER', x: 350, z: 2170, color: '#f0bb67' },
  { id: 'niko', name: 'Niko Vale', faction: 'MECHANIC', x: 2130, z: 980, color: '#79dbd7' },
  { id: 'paz', name: 'Paz Sol', faction: 'FENCE', x: 1360, z: 1060, color: '#f393b0' },
];
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const clockText = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
