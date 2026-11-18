// HIGH WATER foundation: seeded city, weather, surge, vehicles, traffic,
// pedestrians, walking, driving, cameras, HUD, minimap, menus and job definitions.
import * as THREE from '../vendor/three.min.js';
import { createCity } from './city.js';
import { createWeather } from './weather.js';
import { createSurge } from './surge.js';
import { createParkedVehicles, vehicleBlocker } from './vehicles.js';
import { createTraffic } from './traffic.js';
import { createPedestrians } from './pedestrians.js';
import { createPlayer } from './player.js';
import { updateDriving } from './driving.js';
import { createCamera } from './camera.js';
import { createMinimap } from './minimap.js';
import { createHUD } from './hud.js';
import { createMissionDirector } from './mission-director.js';
export const scope = 'Boot, shared system state, input, menus and the foundation frame loop.';

function boot() {
  const query = new URLSearchParams(location.search), seed = Number(query.get('seed') || 17);
  const canvas = document.getElementById('world');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene(), city = createCity(scene, Number.isFinite(seed) ? seed : 17);
  const weather = createWeather(scene, city, seed), surge = createSurge(city);
  const parked = createParkedVehicles(scene, seed), traffic = createTraffic(scene, city, seed);
  const crowd = createPedestrians(scene, city, seed), player = createPlayer(scene, city), follow = createCamera(innerWidth, innerHeight, city);
  const minimap = createMinimap(document.getElementById('minimap'), city), hud = createHUD(crowd.contacts), missions = createMissionDirector();
  const state = {
    mode: 'title', wanted: { level: 0, evidence: { plate: false, face: false, outfit: false }, dispatch: '' },
    units: [], economy: { cash: 140, banked: 0 }, cooler: { active: false, temperature: -4, integrity: 100, payout: 0 },
    radio: { station: '' }, dialogue: { active: false, speaker: '', line: '' }, phone: { open: false }, elapsed: 0,
  };
  const input = new Set(), systems = new Set();
  let boardReturn = 'title', prompt = null, lastFrame = performance.now(), lastHUD = 0;
  const cars = () => parked.concat(traffic.cars);
  function setMode(mode) {
    state.mode = mode; input.clear();
    document.getElementById('title-menu').hidden = mode !== 'title';
    document.getElementById('pause-menu').hidden = mode !== 'paused';
    document.getElementById('board-menu').hidden = mode !== 'board';
    hud.show(mode === 'playing' || mode === 'paused');
  }
  function start() { setMode('playing'); canvas.focus(); }
  function openBoard() {
    boardReturn = state.mode === 'title' ? 'title' : 'paused';
    missions.renderBoard(document.getElementById('jobs'), () => { start(); }); setMode('board');
  }
  function closeBoard() { setMode(boardReturn); }
  function interact() {
    prompt = player.interaction(parked, crowd.contacts);
    if (!prompt) return;
    if (prompt.type === 'enter') { player.enter(prompt.target); follow.reset(); }
    if (prompt.type === 'exit' && !player.exit(cars())) hud.notify('Slow down and leave room beside the vehicle.');
    if (prompt.type === 'talk') {
      systems.forEach(system => system.interact?.(prompt));
      window.dispatchEvent(new CustomEvent('highwater:talk', { detail: { id: prompt.target.id } }));
    }
  }
  document.getElementById('start-button').onclick = start;
  document.getElementById('resume-button').onclick = start;
  document.getElementById('restart-button').onclick = () => location.reload();
  document.querySelectorAll('[data-board]').forEach(button => { button.onclick = openBoard; });
  document.getElementById('board-back').onclick = closeBoard;
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(event.code)) event.preventDefault();
    if (!event.repeat) {
      if (event.code === 'Enter' && state.mode === 'title') start();
      else if (event.code === 'Escape' || event.code === 'KeyP') {
        if (state.mode === 'board') closeBoard(); else if (state.mode === 'playing') setMode('paused'); else if (state.mode === 'paused') start();
      } else if (event.code === 'KeyB' && (state.mode === 'playing' || state.mode === 'paused')) openBoard();
      else if (event.code === 'KeyE' && state.mode === 'playing') interact();
      systems.forEach(system => system.keydown?.(event, state.mode));
    }
    if (state.mode === 'playing') input.add(event.code);
  });
  addEventListener('keyup', event => input.delete(event.code));
  addEventListener('blur', () => { if (state.mode === 'playing') setMode('paused'); });
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); follow.resize(innerWidth, innerHeight); });
  const game = { scene, renderer, city, weather, surge, parked, traffic, crowd, player, camera: follow, minimap, hud, missions, state, input,
    start, setMode, openBoard, systems, cars,
    snapshot() {
      const actor = player.position();
      return { mode: state.mode, district: city.districtAt(actor.x, actor.z), position: { x: actor.x, z: actor.z },
        driving: player.state.vehicle?.name || null, speed: player.state.vehicle?.speed || 0, surge: { ...surge.state },
        waterDepth: surge.depthAt(actor.x, actor.z), prompt: prompt?.text || '', traffic: traffic.cars.length, pedestrians: crowd.people.length };
    } };
  window.highWater = game;
  follow.update(1, player.state, false);
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(1, (now - lastFrame) / 1000); lastFrame = now;
    const playing = state.mode === 'playing', ambient = state.mode === 'title';
    if (playing || ambient) {
      weather.update(dt, player.position());
      const steps = Math.max(1, Math.ceil(dt / .04)), step = dt / steps;
      for (let i = 0; i < steps; i++) {
        traffic.update(step, weather.state, player.state.vehicle); crowd.update(step, weather.state);
        if (playing) {
          if (player.state.vehicle) {
            const obstacles = cars().filter(car => car !== player.state.vehicle).map(vehicleBlocker);
            updateDriving(player.state.vehicle, input, step, city, obstacles);
          }
          player.update(step, input, cars());
        }
      }
      parked.forEach(car => car.setHeadlights(weather.state.lamps || weather.state.rain));
    }
    if (playing) {
      state.elapsed += dt;
      systems.forEach(system => system.update?.(dt, game));
      prompt = player.interaction(parked, crowd.contacts);
    }
    surge.update(dt, playing);
    const actor = player.position(); follow.update(dt, actor, Boolean(player.state.vehicle));
    if (now - lastHUD > 60) {
      hud.update((now - lastHUD) / 1000, { player: player.state, actor, mission: missions.state, wanted: state.wanted, units: state.units,
        economy: state.economy, cooler: state.cooler, weather: weather.state, surge, district: city.districtAt(actor.x, actor.z), prompt, radio: state.radio }, follow.camera);
      minimap.draw(actor, surge); lastHUD = now;
    }
    renderer.render(scene, follow.camera);
  }
  setMode('title'); requestAnimationFrame(frame);
}
try { boot(); } catch (error) {
  const panel = document.getElementById('boot-error'); panel.hidden = false;
  panel.textContent = `Sunspur could not start: ${error.message}. This game needs a desktop browser with WebGL enabled.`;
  throw error;
}
