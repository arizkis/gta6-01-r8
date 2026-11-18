import * as THREE from '../vendor/three.min.js';
import { WORLD, STREETS, PALETTE, DISTRICTS, CONTACTS } from './config.js';
import { seededRandom } from './random.js';
export const scope = 'Seeded city geometry, landmarks, collision surfaces, shelters and flood regions.';

export function createCity(scene, seed = 17) {
  const rng = seededRandom(seed), group = new THREE.Group();
  scene.add(group);
  const blockers = [], palms = [], lamps = [], signs = [], shelters = [], batches = new Map();
  const geometries = { box: new THREE.BoxGeometry(1, 1, 1), cylinder: new THREE.CylinderGeometry(1, 1, 1, 7),
    cone: new THREE.ConeGeometry(1, 1, 5), sphere: new THREE.IcosahedronGeometry(1, 0) };
  const materials = new Map();
  function material(color, glow = false) {
    const key = `${color}/${glow}`;
    if (!materials.has(key)) materials.set(key, color === PALETTE.asphalt ? new THREE.MeshStandardMaterial({ color, roughness: .72, metalness: .12 }) :
      new THREE.MeshLambertMaterial({ color, flatShading: true, emissive: glow ? color : 0, emissiveIntensity: glow ? .9 : 0 }));
    return materials.get(key);
  }
  function shape(kind, x, y, z, w, h, d, color, rotation = 0) {
    const key = `${kind}/${color}`;
    if (!batches.has(key)) batches.set(key, { kind, color, matrices: [] });
    const transform = new THREE.Object3D();
    transform.position.set(x, y, z); transform.scale.set(w, h, d); transform.rotation.y = rotation; transform.updateMatrix();
    batches.get(key).matrices.push(transform.matrix.clone());
  }
  const box = (x, y, z, w, h, d, color, rotation = 0) => shape('box', x, y, z, w, h, d, color, rotation);
  function block(x, z, w, d, kind = 'building') { blockers.push({ x, z, w, d, kind }); }
  function sign(text, x, y, z, color = '#ffd28b', width = 42, rotation = 0) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128;
    const c = canvas.getContext('2d');
    c.fillStyle = '#102830'; c.fillRect(0, 0, 768, 128); c.strokeStyle = color; c.lineWidth = 5; c.strokeRect(6, 6, 756, 116);
    c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `bold ${text.length > 20 ? 36 : 46}px sans-serif`;
    c.fillText(text, 384, 67, 730);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 6), mat);
    mesh.position.set(x, y, z); mesh.rotation.y = rotation; group.add(mesh); signs.push(mesh); return mesh;
  }
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x52685c, roughness: .9 });
  const ground = new THREE.Mesh(new THREE.BoxGeometry(WORLD.shoreX, 2, WORLD.shoreZ), groundMaterial);
  ground.position.set(WORLD.shoreX / 2, -1.1, WORLD.shoreZ / 2); group.add(ground);
  const seaMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.water, roughness: .28, metalness: .55, transparent: true, opacity: .95 });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000), seaMaterial);
  sea.rotation.x = -Math.PI / 2; sea.position.set(1400, -1.7, 1400); group.add(sea);
  box(1315, -.1, 2160, 2630, .3, 40, PALETTE.sand);
  box(2610, -.1, 1080, 40, .3, 2160, PALETTE.sand);
  const roadMaterial = material(PALETTE.asphalt);
  for (const x of STREETS.x) {
    box(x, .02, 1080, 160, .5, 2160, PALETTE.pavement);
    box(x, .35, 1080, WORLD.road, .2, 2160, PALETTE.asphalt);
    for (let z = 90; z < 2150; z += 50) if (!STREETS.z.some(a => Math.abs(a - z) < 68)) box(x, .49, z, 1.6, .05, 23, 0xdfb46f);
  }
  for (const z of STREETS.z) {
    box(1340, .03, z, 2600, .5, 160, PALETTE.pavement);
    box(1340, .36, z, 2600, .2, WORLD.road, PALETTE.asphalt);
    for (let x = 80; x < 2610; x += 50) if (!STREETS.x.some(a => Math.abs(a - x) < 68)) box(x, .5, z, 23, .05, 1.6, 0xdfb46f);
  }
  for (const x of STREETS.x) for (const z of STREETS.z) {
    for (let k = -4; k <= 4; k++) {
      box(x + k * 9, .52, z + 66, 4.6, .06, 19, 0xc2c8b7);
      box(x + 66, .52, z + k * 9, 19, .06, 4.6, 0xc2c8b7);
    }
  }
  function building(x, z, w, d, h, color) {
    box(x, h / 2, z, w, h, d, color); block(x, z, w, d);
    blockers[blockers.length - 1].height = h;
    box(x, h + 1.7, z, w + 4, 3.4, d + 4, rng.pick(PALETTE.roofs));
    box(x, 2, z, w + 3, 4, d + 3, 0x536b69);
    for (let floor = 12; floor < h - 6; floor += 16) for (const side of [-1, 1]) {
      box(x - w * .23, floor, z + side * (d / 2 + .15), 9, 7, .4, floor % 3 ? 0x385e67 : 0xc8b98b);
      box(x + w * .23, floor, z + side * (d / 2 + .15), 9, 7, .4, 0x385e67);
    }
    if (h > 48) box(x + w * .2, h + 5, z - d * .15, 14, 7, 16, 0x8a9b97);
  }
  const reserved = (x, z) => (x < 610 && z < 640) || (x > 760 && x < 1090 && z > 1660 && z < 1950)
    || (x > 1190 && x < 1500 && z > 820 && z < 1110) || (x > 2070 && x < 2310 && z > 790 && z < 1070)
    || (x > 1180 && x < 1490 && z < 650);
  for (let ix = 0; ix < STREETS.x.length - 1; ix++) for (let iz = 0; iz < STREETS.z.length - 1; iz++) {
    for (const dx of [142, 297]) for (const dz of [142, 297]) {
      const x = STREETS.x[ix] + dx + rng.range(-12, 12), z = STREETS.z[iz] + dz + rng.range(-12, 12);
      if (!reserved(x, z)) building(x, z, rng.range(82, 115), rng.range(76, 115), rng.range(25, ix > 2 ? 122 : 75), rng.pick(PALETTE.walls));
    }
  }
  function palm(x, z, height = 28) {
    const root = new THREE.Group(); root.position.set(x, 0, z); group.add(root);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.1, height, 6), material(0x87775b));
    trunk.position.y = height / 2; root.add(trunk);
    for (let k = 0; k < 6; k++) {
      const frond = new THREE.Mesh(new THREE.ConeGeometry(4.1, 22, 3), material(k % 2 ? 0x3c7e66 : 0x517b50));
      const a = k * Math.PI / 3; frond.position.set(Math.sin(a) * 7, height + 1, Math.cos(a) * 7);
      frond.rotation.set(Math.cos(a) * 1.18, a, -Math.sin(a) * 1.18); root.add(frond);
    }
    palms.push({ root, phase: rng.range(0, 6) }); block(x, z, 4, 4, 'tree');
  }
  function lamp(x, z) {
    box(x, 13, z, 1.1, 26, 1.1, 0x35494c); box(x + 3, 26, z, 7, 1, 2, 0x35494c);
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(4, .8, 2), material(0xffd58b, true));
    bulb.position.set(x + 5, 25, z); group.add(bulb); lamps.push(bulb);
    // The warm pool is a translucent surface; no per-lamp shadow maps are needed.
    const pool = new THREE.Mesh(new THREE.CircleGeometry(18, 14), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: .09, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x + 5, .57, z); group.add(pool); lamps.push(pool);
  }
  for (const x of STREETS.x) for (let z = 380; z < 2120; z += 220) {
    if (STREETS.z.some(a => Math.abs(a - z) < 90)) continue;
    palm(x - 69, z, rng.range(24, 36)); lamp(x + 70, z + 26);
  }
  for (let x = 370; x < 2560; x += 130) palm(x, 2125, rng.range(27, 38));
  // Citrus Green: open lawn, shade trees, benches, and a raised fountain.
  box(437, .5, 475, 270, 1, 265, 0x668364);
  for (let k = 0; k < 12; k++) {
    const x = rng.range(335, 550), z = rng.range(365, 580);
    shape('cylinder', x, 9, z, 2, 18, 2, 0x6e6854);
    shape('sphere', x, 23, z, 14, 17, 14, k % 2 ? 0x608966 : 0x49785f); block(x, z, 5, 5, 'tree');
  }
  shape('cylinder', 440, 2, 480, 23, 4, 23, 0xa3b6aa);
  shape('cylinder', 440, 4.1, 480, 20, .5, 20, 0x529298); block(440, 480, 46, 46, 'fountain');
  sign('CITRUS GREEN', 440, 13, 621, '#cbe6ac', 65);
  for (const x of [350, 520]) {
    box(x, 3.5, 610, 18, 2, 6, 0xb69368); box(x, 7, 613, 18, 6, 1.5, 0xb69368); block(x, 610, 18, 7, 'bench');
  }
  // Lantern Fest has a low stage and strings of faceted lanterns.
  box(1325, 2, 480, 120, 4, 65, 0x536c71); block(1325, 480, 120, 65, 'stage');
  sign('LANTERN FEST', 1325, 27, 451, '#f8b77c', 94);
  for (let k = 0; k < 11; k++) shape('sphere', 1205 + k * 24, 31 + Math.sin(k / 10 * Math.PI) * 10, 540, 3, 5, 3, k % 2 ? 0xe8ae7d : 0xc97e9b);
  // Impound perimeter: north gate gap remains wide enough for the van.
  const fence = (x, z, w, d) => {
    box(x, 7, z, w, 1, d, 0x697e7d); box(x, 3, z, w, .7, d, 0x697e7d);
    block(x, z, w, d, 'fence');
    const length = Math.max(w, d);
    for (let t = -length / 2; t <= length / 2; t += 12) box(x + (w > d ? t : 0), 5, z + (d > w ? t : 0), 1, 10, 1, 0x697e7d);
  };
  box(963, .35, 1790, 265, .3, 275, 0x475859);
  fence(830, 1790, 2, 280); fence(1095, 1790, 2, 280); fence(963, 1930, 265, 2);
  fence(875, 1650, 90, 2); fence(1056, 1650, 78, 2);
  sign('SUNSPUR IMPOUND', 970, 18, 1649, '#edc391', 109);
  building(874, 1865, 58, 65, 22, 0x899591);
  // Workshop: an open shutter bay assembled around an actual empty opening.
  box(2190, 19, 850, 172, 38, 78, 0x7a9e9e); block(2190, 850, 172, 78);
  box(2114, 16, 917, 20, 32, 56, 0x7a9e9e); block(2114, 917, 20, 56);
  box(2266, 16, 917, 20, 32, 56, 0x7a9e9e); block(2266, 917, 20, 56);
  box(2190, 34, 918, 172, 6, 60, 0x99b7ad); box(2190, .25, 931, 145, .4, 115, 0x344c50);
  box(2190, 29, 949, 120, 5, 3, 0x9ba9a2);
  sign("NIKO'S WORKSHOP", 2190, 42, 955, '#94f4e7', 145);
  sign('TIDEWORKS / SERVICE 24H', 2190, 25, 810, '#94f4e7', 128);
  shelters.push({ x: 2190, z: 931, w: 130, d: 55 });
  // Marigold stalls and shop awnings leave an open pedestrian aisle.
  for (let k = 0; k < 6; k++) {
    const x = 1235 + (k % 3) * 82, z = 915 + Math.floor(k / 3) * 105;
    box(x, 4, z, 43, 8, 28, k === 0 ? 0xb5715e : 0x739b8d); block(x, z, 43, 28, 'kiosk');
    box(x, 17, z, 58, 2, 43, k % 2 ? 0xe0ad6b : 0xc87588);
    for (const side of [-1, 1]) box(x + side * 24, 9, z, 1, 18, 1, 0x4d625d);
    for (let n = 0; n < 3; n++) box(x - 13 + n * 13, 10, z, 10, 4, 12, 0xe5be76);
    shelters.push({ x, z, w: 56, d: 43 });
    if (k < 2) sign(k === 0 ? 'BAY BITES / FOOD' : 'SECOND TIDE / CLOTHES', x, 22, z + 23, '#ffdda3', 60);
  }
  sign('MARIGOLD MARKET', 1330, 34, 1080, '#f4b66b', 135);
  for (const [x, z] of [[604, 900], [1810, 1270], [2390, 1845]]) {
    box(x, 13, z, 63, 2, 24, 0xc47d85); shelters.push({ x, z, w: 63, d: 24 });
    sign(x === 604 ? 'REED / SAFEHOUSE' : 'SUNSPUR / OPEN LATE', x, 22, z - 13, '#e9c29c', 62);
  }
  box(604, 5, 887, 10, 10, 1, 0x366b6b); block(604, 887, 10, 1, 'safehouse door');
  box(607, 5, 888, .5, .5, .5, 0xe3bf7d);
  // Local neon and wet reflected color distinguish the market and workshop at night.
  for (const [x, z, color] of [[1330, 1082, 0xe784b7], [2190, 959, 0x6be0df]]) {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(75, .7, .7), new THREE.MeshBasicMaterial({ color }));
    tube.position.set(x, 20, z); group.add(tube); lamps.push(tube);
    const reflection = new THREE.Mesh(new THREE.PlaneGeometry(75, 22), new THREE.MeshBasicMaterial({ color, opacity: .13, transparent: true, depthWrite: false }));
    reflection.rotation.x = -Math.PI / 2; reflection.position.set(x, .58, z + 15); group.add(reflection); lamps.push(reflection);
  }
  // South pier, its broad steps, and marked bank drop boxes.
  for (let k = 0; k < 4; k++) box(350, k * .6 + .2, 2170 + k * 9, 78, .7, 12, 0x9f8568);
  for (let z = 2200; z <= 2340; z += 8) box(350, 2.3, z, 78, 1.2, 7, 0x9a8060);
  for (let z = 2190; z <= 2340; z += 35) for (const x of [314, 386]) box(x, 0, z, 5, 11, 5, 0x736851);
  sign('TIN CUP PIER', 350, 18, 2204, '#f4d29b', 72);
  function dropBox(x, z, label) {
    box(x, 4, z, 7, 8, 6, 0x3d9c92); block(x, z, 7, 6, 'drop box');
    sign(label, x, 12, z + 4, '#a7f6d6', 27);
  }
  dropBox(375, 2265, 'BANK DROP'); dropBox(2240, 972, 'BANK DROP');
  const sandbagLines = [];
  function sandbags(x, z, count, alongX = true) {
    const w = alongX ? count * 7 : 5, d = alongX ? 5 : count * 7;
    sandbagLines.push({ x, z, w, d }); block(x, z, w, d, 'sandbags');
    for (let row = 0; row < 2; row++) for (let k = 0; k < count; k++) {
      const step = (k - (count - 1) / 2) * 7 + row * 2;
      box(x + (alongX ? step : 0), 1.4 + row * 2, z + (alongX ? 0 : step), 7, 2.4, 5, row ? 0xb9ad84 : 0x9c997b);
    }
  }
  sandbags(1310, 1100, 23); sandbags(306, 2160, 8, false); sandbags(397, 2160, 8, false);
  // Raised east-edge causeway and two sloping approaches are drivable surfaces.
  box(2760, 5.7, 1150, 110, 12, 2210, 0x647c7e);
  box(2760, 11.9, 1150, 104, .4, 2210, PALETTE.asphalt);
  for (const x of [2705, 2815]) box(x, 14, 1150, 3, 4, 2210, 0xa4b3a7);
  for (let z = 140; z < 2260; z += 90) {
    box(2760, 12.15, z, 2, .1, 33, 0xdec492);
    shape('cylinder', 2760, -6, z, 9, 20, 9, 0x728482);
  }
  for (const z of [720, 2040]) {
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(260, 2, 112), roadMaterial);
    ramp.position.set(2600, 5.5, z); ramp.rotation.z = Math.atan2(12, 250); group.add(ramp);
    sandbags(2590, z - 65, 17); sandbags(2590, z + 65, 17);
    sign('SUNSPUR CAUSEWAY', 2615, 28, z - 60, '#c2e6d9', 120);
  }
  box(2840, 11.8, 1180, 60, 1, 150, PALETTE.asphalt);
  box(2870, 15, 1180, 3, 5, 150, 0x98b1ab); sign('SURGE OVERLOOK', 2845, 25, 1130, '#b1d5dc', 65);
  // Instancing keeps the large handcrafted street scene affordable in Chrome.
  for (const batch of batches.values()) {
    const mesh = new THREE.InstancedMesh(geometries[batch.kind], material(batch.color), batch.matrices.length);
    batch.matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.computeBoundingSphere(); group.add(mesh);
  }
  const floodZones = [
    { id: 'strand', x: 1230, z: 1984, w: 1400, d: 112, floor: 0 },
    { id: 'low-salt', x: 100, z: 1544, w: 1040, d: 112, floor: .12 },
    { id: 'strand-boulevard', x: 2384, z: 1460, w: 112, d: 710, floor: .05 },
    { id: 'pier-steps', x: 280, z: 2120, w: 140, d: 70, floor: .03 },
    ...[720, 2040].map(z => ({ id: `ramp-${z}`, x: 2496, z: z - 56, w: 200, d: 112, floor: .75 })),
  ];
  const floodMeshes = floodZones.map(zone => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(zone.w, zone.d), new THREE.MeshStandardMaterial({ color: 0x428391, metalness: .62, roughness: .2, transparent: true, opacity: .54, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(zone.x + zone.w / 2, .6, zone.z + zone.d / 2);
    group.add(mesh); return { mesh, zone };
  });
  function surfaceHeight(x, z) {
    if (x >= 2700 && x <= 2872 && z > 40 && z < 2255) return 12.1;
    if (x >= 2470 && x < 2730 && [720, 2040].some(a => Math.abs(z - a) < 56)) return Math.max(.5, (x - 2470) / 250 * 12);
    if (x > 310 && x < 390 && z > 2190 && z < 2345) return 3;
    return .5;
  }
  function allowed(x, z, radius = 2) {
    if (x > radius + 25 && x < WORLD.shoreX - radius && z > radius + 25 && z < WORLD.shoreZ - radius) return true;
    if (x > 313 + radius && x < 387 - radius && z > 2155 && z < 2340 - radius) return true;
    if (x > 2708 + radius && x < 2812 - radius && z > 50 && z < 2240) return true;
    if (x > 2800 && x < 2867 - radius && z > 1110 + radius && z < 1250 - radius) return true;
    return x > 2470 && x < 2770 && [720, 2040].some(a => Math.abs(z - a) < 54 - radius);
  }
  function collides(x, z, radius = 2, extra = []) {
    if (!allowed(x, z, radius)) return true;
    return blockers.concat(extra).some(b => Math.abs(x - b.x) < b.w / 2 + radius && Math.abs(z - b.z) < b.d / 2 + radius);
  }
  function districtAt(x, z) {
    if (x > 2640) return 'SUNSPUR CAUSEWAY';
    const district = DISTRICTS.find(d => x >= d.x && x < d.x + d.w && z >= d.z && z < d.z + d.d);
    return district?.name || 'CITRUS COMMONS';
  }
  return { group, blockers, floodZones, floodMeshes, sandbagLines, palms, lamps, signs, shelters, contacts: CONTACTS,
    sea, groundMaterial, roadMaterial, surfaceHeight, allowed, collides, districtAt, sign,
    places: { impound: { x: 980, z: 1770 }, workshop: { x: 2190, z: 935 }, safehouse: { x: 605, z: 924 },
      food: { x: 1235, z: 915 }, clothes: { x: 1317, z: 915 }, pier: { x: 350, z: 2265 }, market: { x: 1330, z: 1060 } } };
}
