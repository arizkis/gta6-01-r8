import { createVehicle } from './vehicles.js';
import { STREETS } from './config.js';
import { seededRandom } from './random.js';
export const scope = 'Light looping grid traffic with following distances and weather headlights.';
export function createTraffic(scene, city, seed = 17) {
  const rng = seededRandom(seed + 31), cars = [];
  for (let i = 0; i < 12; i++) {
    const ix = i % 5, iz = Math.floor(i / 5) % 4;
    const x = STREETS.x[ix] + 17, z = STREETS.z[iz] + 17;
    const right = STREETS.x[ix + 1] - 17, bottom = STREETS.z[iz + 1] - 17;
    const route = [{ x, z }, { x: right, z }, { x: right, z: bottom }, { x, z: bottom }];
    const car = createVehicle(scene, rng.pick(['sedan', 'hatch', 'coupe']), x + 65 + (i % 3) * 60, z, Math.PI / 2, rng.pick([0xa79773, 0x89a5a6, 0xb7757f, 0x698b81]));
    Object.assign(car, { role: 'traffic', route, target: 1, cruise: rng.range(19, 29), waiting: false }); cars.push(car);
  }
  function update(dt, weather, playerCar) {
    for (const car of cars) {
      const target = car.route[car.target], dx = target.x - car.x, dz = target.z - car.z, distance = Math.hypot(dx, dz);
      const forward = { x: dx / Math.max(1, distance), z: dz / Math.max(1, distance) };
      const nearby = cars.concat(playerCar ? [playerCar] : []).some(other => {
        if (other === car) return false;
        const ox = other.x - car.x, oz = other.z - car.z, ahead = ox * forward.x + oz * forward.z;
        return ahead > 0 && ahead < 27 && Math.abs(ox * forward.z - oz * forward.x) < 9;
      });
      car.waiting = nearby;
      const desired = nearby ? 0 : car.cruise;
      car.speed += (desired - car.speed) * Math.min(1, dt * 3);
      const travel = Math.min(distance, car.speed * dt);
      car.x += forward.x * travel; car.z += forward.z * travel;
      const heading = Math.atan2(dx, dz);
      car.heading += Math.atan2(Math.sin(heading - car.heading), Math.cos(heading - car.heading)) * Math.min(1, dt * 5);
      if (distance < 4) car.target = (car.target + 1) % car.route.length;
      car.root.position.set(car.x, city.surfaceHeight(car.x, car.z), car.z); car.root.rotation.y = car.heading;
      car.wheels.forEach(wheel => { wheel.rotation.x += car.speed * dt / 2; });
      car.setHeadlights(weather.lamps || weather.rain);
    }
  }
  return { cars, update };
}
