import * as THREE from '../vendor/three.min.js';
import { STREETS, CONTACTS } from './config.js';
import { seededRandom } from './random.js';
export const scope = 'Low-poly people, contact figures, sidewalk strolling, umbrellas and rain shelter state.';
const material = color => new THREE.MeshLambertMaterial({ color, flatShading: true });
export function createPerson(color = 0xc07779, umbrella = false) {
  const root = new THREE.Group(), legs = [];
  function part(geometry, tint, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material(tint)); mesh.position.set(x, y, z); root.add(mesh); return mesh;
  }
  part(new THREE.CylinderGeometry(1.2, 1, 3, 6), color, 0, 4, 0);
  part(new THREE.SphereGeometry(.95, 7, 5), 0xc09576, 0, 6.5, 0);
  part(new THREE.SphereGeometry(1.01, 7, 4, 0, Math.PI * 2, 0, Math.PI * .55), 0x283236, 0, 6.9, 0);
  for (const side of [-1, 1]) {
    legs.push(part(new THREE.CylinderGeometry(.36, .42, 2.6, 5), 0x283f49, side * .6, 1.5, 0));
    part(new THREE.CylinderGeometry(.28, .32, 2.5, 5), color, side * 1.38, 3.8, 0);
  }
  const canopy = new THREE.Group(); canopy.position.set(1, 0, 0); root.add(canopy);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 5.5, 5), material(0xb4c8c4)); shaft.position.y = 7; canopy.add(shaft);
  const top = new THREE.Mesh(new THREE.ConeGeometry(5.1, 1.9, 8), material(color)); top.position.y = 10; canopy.add(top);
  canopy.visible = umbrella;
  const attributes = { position: [], normal: [], color: [] };
  for (const mesh of [...root.children].filter(mesh => mesh.isMesh && !legs.includes(mesh))) {
    mesh.updateMatrix(); const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone(); geometry.applyMatrix4(mesh.matrix);
    attributes.position.push(...geometry.attributes.position.array); attributes.normal.push(...geometry.attributes.normal.array);
    for (let i = 0; i < geometry.attributes.position.count; i++) attributes.color.push(mesh.material.color.r, mesh.material.color.g, mesh.material.color.b);
    root.remove(mesh); geometry.dispose(); mesh.geometry.dispose();
  }
  const skin = new THREE.BufferGeometry();
  for (const [key, values] of Object.entries(attributes)) skin.setAttribute(key, new THREE.Float32BufferAttribute(values, 3));
  root.add(new THREE.Mesh(skin, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  root.userData.legs = legs; root.userData.umbrella = canopy;
  return root;
}
export function createPedestrians(scene, city, seed = 17) {
  const rng = seededRandom(seed + 46), people = [];
  for (let i = 0; i < 40; i++) {
    const street = STREETS.x[i % 6], row = Math.floor(i / 6) % 4;
    const x = street + (i % 2 ? 70 : -70), minZ = STREETS.z[row] + 100, maxZ = STREETS.z[row + 1] - 100;
    const z = rng.range(minZ, maxZ), hasUmbrella = i % 3 === 0;
    const root = createPerson(rng.pick([0xd69485, 0x83aaa4, 0xc9ae73, 0x8182aa, 0xa8b2a2]), hasUmbrella);
    root.position.set(x, city.surfaceHeight(x, z), z); scene.add(root);
    const state = { mode: 'stroll', panic: 0, sheltering: false, speed: rng.range(2, 3.7) };
    const p = { root, x, z, homeX: x, strollZ: z, minZ, maxZ, direction: i % 2 ? 1 : -1, hasUmbrella, state, phase: rng.range(0, 6), shelter: null };
    // Umbrella carriers stay on their sidewalk route instead of relocating to shelter.
    if (i % 8 === 0 && !hasUmbrella) {
      const shelter = city.shelters[i % city.shelters.length];
      p.shelter = { x: shelter.x + shelter.w * .2, z: shelter.z + shelter.d / 2 - 2 };
      if (!city.collides(p.shelter.x, p.shelter.z, 1.5)) { p.x = p.shelter.x; p.z = p.shelter.z; }
      else p.shelter = null;
    }
    people.push(p);
  }
  const contacts = CONTACTS.map(contact => {
    const root = createPerson(new THREE.Color(contact.color).getHex()); root.position.set(contact.x, city.surfaceHeight(contact.x, contact.z), contact.z);
    scene.add(root); return { ...contact, root, state: { mode: 'contact', panic: 0 } };
  });
  function update(dt, weather) {
    for (const p of people) {
      const wasSheltering = p.state.sheltering;
      p.state.sheltering = Boolean(weather.rain && p.shelter && !p.hasUmbrella);
      if (p.state.sheltering && !wasSheltering) { p.x = p.shelter.x; p.z = p.shelter.z; }
      if (!p.state.sheltering && wasSheltering) { p.x = p.homeX; p.z = p.strollZ; }
      p.state.mode = p.state.panic > 0 ? 'panic' : p.state.sheltering ? 'shelter' : 'stroll';
      p.root.userData.umbrella.visible = weather.rain && p.hasUmbrella;
      if (!p.state.sheltering) {
        const nextZ = p.z + p.direction * p.state.speed * dt;
        if (nextZ < p.minZ || nextZ > p.maxZ || city.collides(p.x, nextZ, 1.5)) p.direction *= -1;
        else p.z = nextZ;
        p.phase += dt * 5; p.root.rotation.y = p.direction > 0 ? 0 : Math.PI;
        p.root.userData.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(p.phase + i * Math.PI) * .4; });
      }
      p.root.position.set(p.x, city.surfaceHeight(p.x, p.z), p.z);
    }
  }
  return { people, contacts, update };
}
