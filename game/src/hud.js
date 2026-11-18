import * as THREE from '../vendor/three.min.js';
import { clockText, clamp } from './config.js';
export const scope = 'Live HUD bindings, contact labels and presentation slots for later gameplay systems.';
export function createHUD(contacts) {
  const el = id => document.getElementById(id), stars = [...el('stars').children];
  const labels = contacts.map(contact => {
    const label = document.createElement('div'); label.className = 'contact-label'; label.textContent = contact.name;
    const faction = document.createElement('small'); faction.textContent = contact.faction; label.append(faction); el('world-labels').append(label);
    return { contact, label };
  });
  const meters = [...document.querySelectorAll('[data-meter]')], factions = [...document.querySelectorAll('[data-faction]')];
  let toastRemaining = 0, unitsSignature = '';
  const text = (id, value) => { const node = el(id); if (node.textContent !== String(value)) node.textContent = value; };
  function notify(message, duration = 3) { text('toast', message); el('toast').hidden = false; toastRemaining = duration; }
  function update(dt, data, camera) {
    const { player, actor, mission, wanted, units, economy, cooler, weather, surge, district, prompt, radio } = data;
    text('district', district); text('map-district', district); text('mission-name', mission.name); text('mission-stage', mission.stage); text('mission-next', mission.objective);
    stars.forEach((star, index) => star.classList.toggle('active', index < wanted.level));
    el('stars').setAttribute('aria-label', `Wanted level ${wanted.level}`); text('wanted-label', wanted.level ? 'WANTED' : 'UNFLAGGED');
    for (const chip of document.querySelectorAll('[data-evidence]')) chip.className = wanted.evidence[chip.dataset.evidence] ? 'known' : 'cleared';
    text('dispatch', `DISPATCH / ${wanted.dispatch || 'NO ACTIVE BULLETIN'}`);
    text('cash', `$${Math.floor(economy.cash)}`); text('banked', `$${Math.floor(economy.banked)}`);
    const hours = Math.floor(weather.hour), minutes = Math.floor((weather.hour % 1) * 60);
    text('clock', `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    text('surge-time', clockText(surge.state.remaining)); el('surge-chip').classList.toggle('urgent', surge.state.remaining < 120);
    text('unit-count', `${String(units.length).padStart(2, '0')} UNITS`);
    const signature = JSON.stringify(units.slice(0, 5));
    if (signature !== unitsSignature) {
      unitsSignature = signature; el('police-units').replaceChildren();
      if (!units.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'NO UNITS ASSIGNED'; el('police-units').append(p); }
      for (const unit of units.slice(0, 5)) {
        const row = document.createElement('div'); row.className = 'unit';
        for (const value of [unit.callsign, `${Math.round(unit.distance)}m`, unit.status]) { const span = document.createElement('span'); span.textContent = value; row.append(span); }
        el('police-units').append(row);
      }
    }
    el('vehicle-card').hidden = !player.vehicle;
    if (player.vehicle) { text('vehicle-name', player.vehicle.name); text('speed', Math.round(Math.abs(player.vehicle.speed) * 3.6)); text('condition', `${Math.round(player.vehicle.condition)}%`); }
    text('radio-line', `RADIO / ${radio.station || 'OFF AIR'}`);
    el('cooler-card').hidden = !cooler.active;
    if (cooler.active) { text('cooler-temp', `${cooler.temperature.toFixed(1)}°C`); text('cooler-integrity', `${Math.round(cooler.integrity)}%`); text('cooler-payout', `$${Math.round(cooler.payout)}`); }
    const depth = surge.depthAt(actor.x, actor.z), floodZone = surge.zoneAt(actor.x, actor.z);
    el('water-card').hidden = !floodZone; text('water-depth', Math.round(depth * 100)); el('water-fill').style.height = `${clamp(depth / 1.3, 0, 1) * 100}%`;
    for (const meter of meters) { const value = clamp(player[meter.dataset.meter], 0, 100); meter.querySelector('b').style.width = `${value}%`; meter.querySelector('span').textContent = Math.round(value); }
    for (const faction of factions) faction.querySelector('b').style.width = `${clamp(player.respect[faction.dataset.faction], 0, 100)}%`;
    el('interaction').hidden = !prompt; text('interaction-text', prompt?.text || '');
    toastRemaining -= dt; if (toastRemaining <= 0) el('toast').hidden = true;
    for (const { contact, label } of labels) {
      const distance = Math.hypot(actor.x - contact.x, actor.z - contact.z);
      const point = new THREE.Vector3(contact.x, contact.root.position.y + 14, contact.z).project(camera);
      label.hidden = distance > 500 || point.z > 1 || point.z < -1 || Math.abs(point.x) > .95 || Math.abs(point.y) > .95 || el('hud').hidden;
      label.style.left = `${(point.x * .5 + .5) * innerWidth}px`; label.style.top = `${(-point.y * .5 + .5) * innerHeight}px`;
    }
    el('flash').style.opacity = weather.lightning * .09;
  }
  return { update, notify, show(visible) { el('hud').hidden = !visible; } };
}
