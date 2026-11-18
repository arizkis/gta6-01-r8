import * as THREE from '../vendor/three.min.js';
import { seededRandom } from './random.js';
export const scope = 'Sky lighting presets, moving rain, ground rings, palm wind and lightning flags.';
export const PRESETS = {
  stormDusk: { sky: 0x253b53, fog: 0x3b626e, sun: 0xffab72, sunPower: 2.5, ambient: 1.65, rain: true, wind: .8, lamps: true, hour: 18.4, angle: [650, 200, 900] },
  wetMidday: { sky: 0x93b4bb, fog: 0x94b1b6, sun: 0xd2e3db, sunPower: 1.8, ambient: 2.2, rain: true, wind: .5, lamps: false, hour: 14, angle: [-300, 1000, 300] },
  neonNight: { sky: 0x0a162c, fog: 0x193647, sun: 0x8a9bd4, sunPower: .8, ambient: 1.2, rain: true, wind: .65, lamps: true, hour: 23.1, angle: [-600, 500, 200] },
  dawn: { sky: 0x9cbcc9, fog: 0x9fbfbf, sun: 0xffd0a1, sunPower: 2.1, ambient: 1.8, rain: false, wind: .25, lamps: false, hour: 6.2, angle: [700, 180, -850] },
};
export function createWeather(scene, city, seed = 17) {
  const rng = seededRandom(seed + 90);
  const sun = new THREE.DirectionalLight(0xffbd92, 2.5); scene.add(sun);
  const ambient = new THREE.HemisphereLight(0xbcd8e5, 0x34454c, 1.5); scene.add(ambient);
  const flash = new THREE.AmbientLight(0xcedeff, 0); scene.add(flash);
  const state = { preset: 'stormDusk', rain: true, wind: .8, wet: true, lamps: true, lightning: 0, thunderDue: false, hour: 18.4, elapsed: 0 };
  let nextFlash = 7, thunderAt = Infinity;
  const count = 1300, rainPositions = new Float32Array(count * 6), drops = [];
  for (let i = 0; i < count; i++) drops.push({ x: rng.range(-150, 150), y: rng.range(0, 155), z: rng.range(-150, 150), speed: rng.range(70, 125) });
  const rainGeometry = new THREE.BufferGeometry(); rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({ color: 0xc2e0e9, transparent: true, opacity: .36, depthWrite: false }));
  rain.frustumCulled = false; scene.add(rain);
  const ringGeometry = new THREE.RingGeometry(.22, .36, 8);
  const rings = new THREE.InstancedMesh(ringGeometry, new THREE.MeshBasicMaterial({ color: 0xadd2d4, transparent: true, opacity: .24, side: THREE.DoubleSide, depthWrite: false }), 90);
  rings.frustumCulled = false; scene.add(rings);
  const ringTransform = new THREE.Object3D(), splash = Array.from({ length: 90 }, () => ({ x: rng.range(-75, 75), z: rng.range(-75, 75), phase: rng() }));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(140, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffba80, transparent: true, opacity: .3, fog: true, depthWrite: false }));
  scene.add(glow);
  function setPreset(name) {
    const p = PRESETS[name]; if (!p) return;
    Object.assign(state, { preset: name, rain: p.rain, wind: p.wind, wet: p.rain, lamps: p.lamps, hour: p.hour });
    scene.background = new THREE.Color(p.sky); scene.fog = new THREE.FogExp2(p.fog, name === 'neonNight' ? .0012 : .0008);
    sun.color.setHex(p.sun); sun.intensity = p.sunPower; sun.position.set(...p.angle); ambient.intensity = p.ambient;
    glow.position.set(1400 + p.angle[0] * 3, p.angle[1], 1100 + p.angle[2] * 3); glow.material.color.setHex(p.sun);
    city.groundMaterial.roughness = p.rain ? .42 : .9; city.roadMaterial.roughness = p.rain ? .22 : .85;
    city.roadMaterial.metalness = p.rain ? .38 : .08;
    rain.visible = rings.visible = p.rain;
    city.lamps.forEach(l => { l.visible = p.lamps; });
    city.signs.forEach(s => { s.material.color.setHex(p.lamps ? 0xffffff : 0xb6c8c1); });
  }
  function update(dt, position) {
    state.elapsed += dt; state.hour = (state.hour + dt / 240) % 24; state.thunderDue = false;
    state.lightning = Math.max(0, state.lightning - dt * 3.5);
    if (state.rain && state.elapsed >= nextFlash) {
      state.lightning = 1; nextFlash = state.elapsed + rng.range(13, 28); thunderAt = state.elapsed + 1.9;
    }
    if (state.elapsed >= thunderAt) { state.thunderDue = true; thunderAt = Infinity; }
    flash.intensity = state.lightning * 3;
    const sky = new THREE.Color(PRESETS[state.preset].sky);
    scene.background.copy(sky.lerp(new THREE.Color(0xc7dcf0), state.lightning * .45));
    rain.position.set(position.x, 0, position.z);
    drops.forEach((drop, i) => {
      drop.y -= dt * drop.speed; drop.x += dt * state.wind * 16;
      if (drop.y < 0) { drop.y = 155; drop.x = rng.range(-150, 150); }
      const n = i * 6;
      rainPositions[n] = drop.x; rainPositions[n + 1] = drop.y; rainPositions[n + 2] = drop.z;
      rainPositions[n + 3] = drop.x + 1.2 * state.wind; rainPositions[n + 4] = drop.y - 5; rainPositions[n + 5] = drop.z;
    });
    rainGeometry.attributes.position.needsUpdate = true;
    splash.forEach((s, i) => {
      s.phase = (s.phase + dt * 1.8) % 1;
      if (s.phase < .05) { s.x = rng.range(-75, 75); s.z = rng.range(-75, 75); }
      const x = position.x + s.x, z = position.z + s.z;
      ringTransform.position.set(x, city.surfaceHeight(x, z) + .08, z); ringTransform.rotation.x = -Math.PI / 2;
      ringTransform.scale.setScalar(.2 + s.phase * 2.8); ringTransform.updateMatrix(); rings.setMatrixAt(i, ringTransform.matrix);
    });
    rings.instanceMatrix.needsUpdate = true;
    city.palms.forEach(p => { p.root.rotation.z = -.055 * state.wind + Math.sin(state.elapsed * 1.7 + p.phase) * .035 * state.wind; });
    city.sea.position.y = -1.7 + Math.sin(state.elapsed * .32) * .12;
  }
  setPreset('stormDusk');
  return { state, setPreset, update, rain, sun, ambient };
}
