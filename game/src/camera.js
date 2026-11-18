import * as THREE from '../vendor/three.min.js';
export const scope = 'Smoothed third-person follow and speed-aware driving chase camera.';
export function createCamera(width, height, city) {
  const camera = new THREE.PerspectiveCamera(64, width / height, .3, 9000);
  let initialized = false;
  const look = new THREE.Vector3(), desired = new THREE.Vector3();
  function update(dt, actor, driving) {
    const speed = driving ? Math.abs(actor.speed) : 0, yaw = actor.heading;
    const back = driving ? 33 + speed * .13 : 25;
    const floor = city.surfaceHeight(actor.x, actor.z);
    desired.set(actor.x - Math.sin(yaw) * back, floor + (driving ? 20 : 18), actor.z - Math.cos(yaw) * back);
    // Raise the camera above nearby solid roofs instead of letting it sit inside a wall.
    for (const b of city.blockers) if (b.kind === 'building' && Math.abs(desired.x - b.x) < b.w / 2 + 2 && Math.abs(desired.z - b.z) < b.d / 2 + 2) desired.y = Math.max(desired.y, (b.height || 38) + 8);
    const focus = new THREE.Vector3(actor.x + Math.sin(yaw) * (driving ? 13 : 3), floor + 5, actor.z + Math.cos(yaw) * (driving ? 13 : 3));
    if (!initialized) { camera.position.copy(desired); look.copy(focus); initialized = true; }
    camera.position.lerp(desired, 1 - Math.exp(-dt * (driving ? 4 : 5.5))); look.lerp(focus, 1 - Math.exp(-dt * 8));
    camera.lookAt(look);
    camera.fov += ((driving ? 65 + speed * .15 : 64) - camera.fov) * Math.min(1, dt * 3); camera.updateProjectionMatrix();
  }
  function resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function reset() { initialized = false; }
  return { camera, update, resize, reset };
}
