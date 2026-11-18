import { WORLD, STREETS, CONTACTS } from './config.js';
export const scope = 'Circular local map with street, flood, contact, route and search visualization layers; no police dots.';
export function createMinimap(canvas, city) {
  const c = canvas.getContext('2d'), size = canvas.width, mid = size / 2, scale = .43;
  const state = { route: [], searchArea: null, visionCone: null, destination: null, range: mid / scale };
  function draw(actor, surge) {
    c.clearRect(0, 0, size, size); c.save(); c.beginPath(); c.arc(mid, mid, mid, 0, Math.PI * 2); c.clip();
    c.fillStyle = '#315661'; c.fillRect(0, 0, size, size);
    c.translate(mid - actor.x * scale, mid - actor.z * scale); c.scale(scale, scale);
    c.fillStyle = '#3e5552'; c.fillRect(0, 0, WORLD.shoreX, WORLD.shoreZ);
    c.fillStyle = '#8c9575'; c.fillRect(0, 2140, WORLD.shoreX, 40); c.fillRect(2590, 0, 40, WORLD.shoreZ);
    c.fillStyle = '#637477';
    for (const x of STREETS.x) c.fillRect(x - 56, 0, 112, 2160);
    for (const z of STREETS.z) c.fillRect(40, z - 56, 2600, 112);
    c.fillStyle = '#6c8586'; c.fillRect(2708, 45, 104, 2210);
    for (const z of [720, 2040]) c.fillRect(2496, z - 56, 260, 112);
    c.fillStyle = '#917b60'; c.fillRect(311, 2160, 78, 185);
    c.fillStyle = '#608063'; c.fillRect(300, 340, 280, 285);
    c.fillStyle = '#66c5d260';
    for (const zone of city.floodZones) if (surge.state.level > zone.floor) c.fillRect(zone.x, zone.z, zone.w, zone.d);
    c.fillStyle = '#253c42';
    for (const b of city.blockers) if (b.kind === 'building' || b.kind === 'kiosk') c.fillRect(b.x - b.w / 2, b.z - b.d / 2, b.w, b.d);
    if (state.searchArea) {
      const a = state.searchArea; c.fillStyle = '#ed5d7950'; c.beginPath(); c.arc(a.x, a.z, a.radius, 0, Math.PI * 2); c.fill();
    }
    if (state.visionCone) {
      const v = state.visionCone; c.fillStyle = '#fbbd7144'; c.beginPath(); c.moveTo(v.x, v.z);
      const facing = Math.PI / 2 - v.heading; c.arc(v.x, v.z, v.range, facing - v.angle / 2, facing + v.angle / 2); c.closePath(); c.fill();
    }
    if (state.route.length > 1) {
      c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = '#f588bd'; c.beginPath();
      state.route.forEach((p, i) => i ? c.lineTo(p.x, p.z) : c.moveTo(p.x, p.z)); c.stroke();
    }
    for (const person of CONTACTS) {
      c.fillStyle = person.color; c.beginPath(); c.arc(person.x, person.z, 12, 0, Math.PI * 2); c.fill();
      c.font = 'bold 27px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#102731'; c.fillText(person.name[0], person.x, person.z + 1);
    }
    if (state.destination) {
      const p = state.destination; c.save(); c.translate(p.x, p.z); c.rotate(Math.PI / 4); c.fillStyle = '#f1a4d1'; c.fillRect(-13, -13, 26, 26); c.restore();
    }
    c.save(); c.translate(actor.x, actor.z); c.rotate(-actor.heading); c.fillStyle = '#edf7d4'; c.strokeStyle = '#162e3c'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 17); c.lineTo(-10, -12); c.lineTo(0, -7); c.lineTo(10, -12); c.closePath(); c.fill(); c.stroke(); c.restore();
    c.restore();
  }
  return { state, draw };
}
