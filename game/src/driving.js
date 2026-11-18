import { SPEEDS, clamp } from './config.js';
export const scope = 'Arcade throttle, brake, speed-sensitive steering and collision condition loss.';
export function updateDriving(car, input, dt, city, obstacles = []) {
  const throttle = (input.has('KeyW') || input.has('ArrowUp') ? 1 : 0) - (input.has('KeyS') || input.has('ArrowDown') ? 1 : 0);
  const steering = (input.has('KeyA') || input.has('ArrowLeft') ? 1 : 0) - (input.has('KeyD') || input.has('ArrowRight') ? 1 : 0);
  const braking = throttle && Math.sign(car.speed) !== throttle && Math.abs(car.speed) > 2;
  if (throttle) car.speed += throttle * (braking ? SPEEDS.brake : SPEEDS.acceleration) * dt;
  else car.speed *= Math.exp(-dt * .55);
  car.speed = clamp(car.speed, -SPEEDS.reverse, SPEEDS.forward * (.55 + car.condition / 220));
  car.steer += (steering - car.steer) * Math.min(1, dt * 6);
  car.heading += car.steer * Math.min(1.5, Math.abs(car.speed) / 17) * Math.sign(car.speed) * dt / (1 + Math.abs(car.speed) / 95);
  const dx = Math.sin(car.heading) * car.speed * dt, dz = Math.cos(car.heading) * car.speed * dt;
  let collided = false;
  if (!city.collides(car.x + dx, car.z + dz, car.radius, obstacles)) { car.x += dx; car.z += dz; }
  else {
    collided = true;
    if (!city.collides(car.x + dx, car.z, car.radius, obstacles)) car.x += dx * .6;
    else if (!city.collides(car.x, car.z + dz, car.radius, obstacles)) car.z += dz * .6;
  }
  if (collided) { car.condition = clamp(car.condition - Math.abs(car.speed) * .14, 0, 100); car.speed *= -.12; }
  car.root.position.set(car.x, city.surfaceHeight(car.x, car.z), car.z); car.root.rotation.y = car.heading;
  car.wheels.forEach(wheel => { wheel.rotation.x += car.speed * dt / 2; });
  return { collided, speed: car.speed };
}
