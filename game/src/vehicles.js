import * as THREE from '../vendor/three.min.js';
import { seededRandom } from './random.js';
export const scope = 'Original Sunspur car meshes, COLDFIN van, police variants and parked fleet.';
export const MODELS = {
  hatch: { name: 'Sunspur Minnow', w: 7.3, length: 14, color: 0x7ea998 },
  sedan: { name: 'Pelican Sable', w: 8.2, length: 17, color: 0xc28d83 },
  coupe: { name: 'Citrus Comet', w: 8, length: 16, color: 0xd6ad67 },
  van: { name: 'COLDFIN FREEZER VAN', w: 9.5, length: 22, color: 0xe3dbb6 },
  policeSUV: { name: 'Sunspur Patrol Utility', w: 9, length: 18, color: 0xe0e3d9, police: true },
  policeSedan: { name: 'Sunspur Patrol Sedan', w: 8.2, length: 17, color: 0xe0e3d9, police: true },
};
const mats = new Map();
const mat = color => {
  if (!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({ color, flatShading: true }));
  return mats.get(color);
};
function lettering(text, width, height, color = '#214d54') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const c = canvas.getContext('2d'); c.fillStyle = '#e3dbb6'; c.fillRect(0, 0, 512, 128);
  c.fillStyle = color; c.font = '900 68px sans-serif'; c.textAlign = 'center'; c.fillText(text, 256, 82);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
}
export function createVehicle(scene, type = 'sedan', x = 0, z = 0, heading = 0, color) {
  const spec = MODELS[type], root = new THREE.Group(), wheels = [], lights = [];
  const w = spec.w, length = spec.length, van = type === 'van', paint = color ?? spec.color;
  function box(bw, bh, bd, bx, by, bz, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), typeof material === 'number' ? mat(material) : material);
    mesh.position.set(bx, by, bz); root.add(mesh); return mesh;
  }
  box(w, 3, length, 0, 3, 0, paint);
  box(w * .83, van ? 4 : 3, length * .48, 0, van ? 6 : 5.4, length * .02, paint);
  box(w * .75, 2, .28, 0, 5.7, length * .265, 0x345565);
  box(w * .75, 1.7, .3, 0, 5.7, -length * .24, 0x345565);
  for (const side of [-1, 1]) {
    box(.18, 1.9, length * .36, side * w * .422, 5.8, length * .04, 0x345565);
    box(.8, .8, 1.2, side * (w / 2 + .4), 5, length * .24, paint);
    for (const axle of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 1.4, 10), mat(0x172329));
      wheel.rotation.z = Math.PI / 2; wheel.position.set(side * w / 2, 1.7, axle * length * .31); root.add(wheel); wheels.push(wheel);
      box(.12, 1.1, 1.1, side * (w / 2 + .75), 1.7, axle * length * .31, 0x839596);
    }
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe5af, emissive: 0xffdda0, emissiveIntensity: 1.7 });
    lights.push(box(1.8, .8, .22, side * w * .3, 3.5, length / 2 + .12, lampMat));
    box(1.7, .7, .22, side * w * .31, 3.5, -length / 2 - .12, new THREE.MeshStandardMaterial({ color: 0xd75b55, emissive: 0x661712 }));
  }
  box(w + .3, .7, 1, 0, 1.9, length / 2, 0x798d91); box(w + .3, .7, 1, 0, 1.9, -length / 2, 0x798d91);
  box(2.4, .65, .12, 0, 2.6, -length / 2 - .55, 0xd7d3bd);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.1, 37), new THREE.MeshBasicMaterial({ color: 0xffe6ad, transparent: true, opacity: .075, depthWrite: false }));
  beam.rotation.x = -Math.PI / 2; beam.position.set(0, .08, length / 2 + 18); root.add(beam); lights.push(beam);
  if (van) {
    box(w, 7, length * .62, 0, 6.5, -length * .16, paint);
    box(w * .65, 2.6, 5, 0, 11, length * .02, 0xb8c6b8);
    for (let i = -2; i <= 2; i++) box(w * .5, .18, .2, 0, 12.4, i * .7, 0x597b7a);
    for (const side of [-1, 1]) {
      const logo = lettering('COLDFIN', 11, 2.75); logo.rotation.y = side * Math.PI / 2;
      logo.position.set(side * (w / 2 + .03), 7, -2); root.add(logo);
      box(w * .47, 5.6, .16, side * w * .24, 6.6, -length / 2 - .05, 0xc9c9aa);
      box(.3, 1.1, .2, side * .7, 5.9, -length / 2 - .2, 0x4a6466);
    }
  }
  if (spec.police) {
    for (const side of [-1, 1]) box(.1, 2, length * .69, side * (w / 2 + .04), 3.7, 0, 0x23475a);
    box(5, .7, 2, 0, 7.6, 0, 0x21323f);
    box(2, .6, 1.8, -1.3, 8.2, 0, new THREE.MeshBasicMaterial({ color: 0xf16d88 }));
    box(2, .6, 1.8, 1.3, 8.2, 0, new THREE.MeshBasicMaterial({ color: 0x60c8ea }));
  }
  // Fuse body panels into one colored mesh; wheels and glowing parts stay independent.
  const staticParts = root.children.filter(mesh => mesh.geometry?.type === 'BoxGeometry' && !lights.includes(mesh) && !mesh.material.emissive?.getHex());
  const attributes = { position: [], normal: [], color: [] };
  for (const mesh of staticParts) {
    mesh.updateMatrix(); const geometry = mesh.geometry.toNonIndexed(); geometry.applyMatrix4(mesh.matrix);
    attributes.position.push(...geometry.attributes.position.array); attributes.normal.push(...geometry.attributes.normal.array);
    for (let i = 0; i < geometry.attributes.position.count; i++) attributes.color.push(mesh.material.color.r, mesh.material.color.g, mesh.material.color.b);
    root.remove(mesh); geometry.dispose(); mesh.geometry.dispose();
  }
  const skin = new THREE.BufferGeometry();
  for (const [key, values] of Object.entries(attributes)) skin.setAttribute(key, new THREE.Float32BufferAttribute(values, 3));
  root.add(new THREE.Mesh(skin, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  root.position.set(x, .5, z); root.rotation.y = heading; scene.add(root);
  return { root, type, name: spec.name, x, z, heading, speed: 0, condition: 100, wheels, lights,
    occupied: false, role: 'parked', w, length, radius: van ? 6.8 : 5.5, steer: 0,
    setHeadlights(on) { lights.forEach(light => { light.visible = on; }); } };
}
export function createParkedVehicles(scene, seed = 17) {
  const rng = seededRandom(seed + 7), cars = [];
  cars.push(createVehicle(scene, 'coupe', 718, 1010, Math.PI, 0xe0b673));
  cars.push(createVehicle(scene, 'van', 980, 1770, Math.PI));
  for (const x of [240, 680, 1120, 1560, 2000, 2440]) for (const z of [480, 920, 1370, 1830]) {
    if ((x === 680 && z === 920) || (x === 1120 && z === 1830)) continue;
    cars.push(createVehicle(scene, rng.pick(['sedan', 'hatch', 'coupe']), x - 40, z, rng() > .5 ? 0 : Math.PI, rng.pick([0x7199a5, 0xa87c7d, 0x82927b, 0xc1ad8b, 0x747a98])));
  }
  return cars;
}
export function vehicleBlocker(car) {
  const sin = Math.abs(Math.sin(car.heading)), cos = Math.abs(Math.cos(car.heading));
  return { x: car.x, z: car.z, w: car.w * cos + car.length * sin, d: car.length * cos + car.w * sin, kind: 'car' };
}
