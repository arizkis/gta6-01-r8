import { createPerson } from './pedestrians.js';
import { vehicleBlocker } from './vehicles.js';
import { SPEEDS, distance } from './config.js';
export const scope = 'Juno on foot, shared player vitals, nearby interactions and safe vehicle entry or exit.';
export function createPlayer(scene, city) {
  const root = createPerson(0xd3ab70); scene.add(root);
  const state = { name: 'Juno Reed', x: 700, z: 1008, heading: Math.PI, health: 100, armour: 0, nerve: 18,
    vehicle: null, sprinting: false, respect: { FIXER: 0, MECHANIC: 0, FENCE: 0 } };
  root.position.set(state.x, .5, state.z); root.rotation.y = state.heading;
  let stride = 0;
  const position = () => state.vehicle || state;
  function update(dt, input, cars) {
    if (state.vehicle) {
      state.x = state.vehicle.x; state.z = state.vehicle.z; state.heading = state.vehicle.heading; root.visible = false; return;
    }
    root.visible = true;
    let dx = (input.has('KeyD') || input.has('ArrowRight') ? 1 : 0) - (input.has('KeyA') || input.has('ArrowLeft') ? 1 : 0);
    let dz = (input.has('KeyS') || input.has('ArrowDown') ? 1 : 0) - (input.has('KeyW') || input.has('ArrowUp') ? 1 : 0);
    const length = Math.hypot(dx, dz); state.sprinting = input.has('ShiftLeft') || input.has('ShiftRight');
    if (length) {
      const speed = state.sprinting ? SPEEDS.sprint : SPEEDS.walk;
      dx *= speed * dt / length; dz *= speed * dt / length;
      const obstacles = cars.map(vehicleBlocker);
      if (!city.collides(state.x + dx, state.z, 1.65, obstacles)) state.x += dx;
      if (!city.collides(state.x, state.z + dz, 1.65, obstacles)) state.z += dz;
      state.heading = Math.atan2(dx, dz); stride += dt * (state.sprinting ? 13 : 8);
    }
    root.position.set(state.x, city.surfaceHeight(state.x, state.z), state.z);
    root.rotation.y += Math.atan2(Math.sin(state.heading - root.rotation.y), Math.cos(state.heading - root.rotation.y)) * Math.min(1, dt * 12);
    root.userData.legs.forEach((leg, i) => { leg.rotation.x = length ? Math.sin(stride + i * Math.PI) * .55 : 0; });
  }
  function interaction(cars, contacts) {
    if (state.vehicle) return { type: 'exit', text: `Exit ${state.vehicle.name}` };
    const contact = contacts.find(person => distance(state, person) < 19);
    if (contact) return { type: 'talk', target: contact, text: `Talk to ${contact.name} / ${contact.faction}` };
    const car = cars.filter(c => c.role === 'parked' && !c.occupied && Math.abs(c.speed) < 1).sort((a, b) => distance(state, a) - distance(state, b))[0];
    if (car && distance(state, car) < 25) return { type: 'enter', target: car, text: `Enter ${car.name}` };
    return null;
  }
  function enter(car) {
    state.vehicle = car; car.occupied = true; root.visible = false; state.x = car.x; state.z = car.z;
  }
  function exit(cars) {
    const car = state.vehicle; if (!car || Math.abs(car.speed) > 8) return false;
    const obstacles = cars.map(vehicleBlocker);
    for (let k = 0; k < 12; k++) {
      const angle = car.heading + Math.PI / 2 + k * Math.PI / 6;
      const x = car.x + Math.sin(angle) * 15, z = car.z + Math.cos(angle) * 15;
      if (!city.collides(x, z, 2, obstacles)) {
        state.x = x; state.z = z; state.heading = car.heading; state.vehicle = null;
        car.occupied = false; car.speed = 0; root.visible = true; root.position.set(x, city.surfaceHeight(x, z), z); return true;
      }
    }
    return false;
  }
  return { state, root, position, update, interaction, enter, exit };
}
