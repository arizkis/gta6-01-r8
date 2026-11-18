import { clamp } from './config.js';
export const scope = 'Countdown, stepped street flooding and the causeway opening state.';
export function createSurge(city) {
  const state = { remaining: 720, duration: 720, level: .16, step: 0, causewayOpen: true };
  const zoneAt = (x, z) => city.floodZones.find(a => x >= a.x && x <= a.x + a.w && z >= a.z && z <= a.z + a.d);
  const depthAt = (x, z) => {
    const zone = zoneAt(x, z);
    return zone ? Math.max(0, state.level - zone.floor) : 0;
  };
  function update(dt, playing) {
    if (playing) state.remaining = clamp(state.remaining - dt, 0, state.duration);
    state.step = Math.floor((state.duration - state.remaining) / 120);
    state.level = .16 + state.step * .18;
    state.causewayOpen = state.remaining > 0;
    for (const { mesh, zone } of city.floodMeshes) {
      mesh.visible = state.level > zone.floor;
      mesh.position.y = .52 + Math.max(0, state.level - zone.floor);
    }
  }
  function reset() { state.remaining = state.duration; update(0, false); }
  update(0, false);
  return { state, zoneAt, depthAt, update, reset };
}
