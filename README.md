# HIGH WATER

*a Sunspur surge run*

[![Competition](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/arizkis/gta6-01-r8/rank.svg)](https://make.fun/bounty/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/arizkis/gta6-01-r8/reward.svg)](https://make.fun/bounty/gta6-01)

Juno Reed has one night to move cold cargo across Sunspur Bay before the monsoon surge cuts the causeway. An original low-poly 3D crime game with a third-person camera, a coastal street grid, and a cream COLDFIN freezer van worth stealing back.

The full design combines five districts, traffic and pedestrians, four weather and lighting presets, lightning, rising flood water, a twelve-minute surge countdown, wanted levels with plate/face/outfit evidence, coordinated police tactics, cooler temperature and integrity, six crew jobs, cash and bank drops, garage repairs and upgrades, and local radio. Everything in the game is generated from code; the only third-party runtime asset is the unmodified local Three.js r160 ES module. There are no runtime internet requests, external fonts, commercial characters, sampled music, or downloaded art.

## Current build

Turn 1 implements the complete foundation: city and landmarks, collision, four weather presets, rain and splashes, lightning, surge state and visible flooding, on-foot walking and sprinting, vehicle entry and exit, arcade driving and condition damage, chase cameras, parked cars and COLDFIN, light grid traffic, forty pedestrians, umbrellas and shelter, floating contact names, live HUD and minimap, title/pause menus, and the six-job board. Job one can be selected; objective execution and rewards arrive in turn 2.

Turn 2 adds wanted/evidence rules, police AI, cooler execution, job progression, dialogue, phone, economy, radio, garage upgrades, panic and effects. Turn 3 adds the four staging routes, screenshot captures and the kit check. Those later systems are described here as the complete game design, not as implemented features in this foundation.

## The crew's six jobs

| Order | Job | Contact / faction | Work | Pay |
| --- | --- | --- | --- | --- |
| 1 | The Cooler Caper | Tavi Moss / FIXER | Recover COLDFIN from Sunspur Impound; deliver its cooler to Tin Cup Pier. | Up to $620, integrity based |
| 2 | Sandbag Run | Niko Vale / MECHANIC | Run repair kits and sandbags from the workshop to the market barricade against the clock. | $340 |
| 3 | Market Mercy | Paz Sol / FENCE | Collect three market crates and deliver them to the safehouse. | $460 |
| 4 | Clear Your Name | Tavi Moss / FIXER | Swap plates, change clothes, and repaint at the workshop to clear the evidence. | $500 |
| 5 | Five Districts | Niko Vale / MECHANIC | Finish a timed checkpoint run through all five districts as rain worsens. | $780 |
| 6 | The Surge Run | Paz Sol / FENCE | Load the cooler and cross Sunspur Causeway before the surge closes it. | $1,600 |

## Run locally

Use Node 22 or newer. No install or build step is needed.

```sh
node serve.ts
```

Open **http://localhost:8080** in desktop Chrome with WebGL enabled. The server serves `game/index.html` at `/`. Press Enter or click START. A Citrus Comet is parked beside Juno's starting position. Seeded placement defaults to `17`; use `?seed=17` to set it explicitly. The surge timer runs only during play and pauses in menus.

## Controls

| Input | Action |
| --- | --- |
| Enter | Start from the title screen |
| WASD / arrow keys | Walk; throttle, reverse/brake and steer while driving |
| Shift | Sprint on foot |
| E | Enter a nearby parked car, exit at low speed, or interact with a named contact |
| Escape / P | Pause or resume; Escape backs out of the job board |
| B | Open the job board |
| Mouse | Menu buttons |
| F | Radio control, added in turn 2 |
| X | Spike strip, added in turn 2 |

The circular minimap shows roads, coast, flood regions, the player and contact initials. Its input state also accepts a pink route, red search region, a police vision cone and destination diamond. It never draws police dots. Water depth appears whenever Juno or the driven vehicle is in a flood zone. Cooler telemetry appears only for an active cooler job.

## Modules and extension points

All game code is in `game/src/`, using local ES modules. `config.js` and `random.js` define scale and repeatable variation. `city.js` owns geometry, blockers, shelters, landmarks, districts and flood regions. `weather.js` exposes `setPreset(stormDusk|wetMidday|neonNight|dawn)` and live weather flags. `surge.js` exposes countdown state, `depthAt`, `zoneAt`, and `causewayOpen` in its state. `vehicles.js` includes parked cars, COLDFIN and reserved police sedan/SUV factory variants. `traffic.js` and `pedestrians.js` own moving actors. `player.js`, `driving.js`, and `camera.js` handle movement and views. `hud.js` and `minimap.js` read shared data. `mission-director.js` owns definitions and the job board. `main.js` owns input, menus and the frame loop.

`window.highWater` exposes these systems and `snapshot()` for browser diagnostics. The `systems` set accepts update, interaction and keydown hooks for later systems. Shared wanted, units, economy, cooler, radio, dialogue and phone state live in `highWater.state`; mission state lives in `highWater.missions.state`. Pedestrians expose per-person state. Contacts also emit a `highwater:talk` event by contact ID. Flood drag and causeway mission gates are connected in turn 2.

## Staging and screenshot procedure

The following routes are reserved in `shots.json` and implemented in turn 3:

| Screenshot filename | Local route |
| --- | --- |
| `01-cover-surge.jpg` | `http://localhost:8080/?shot=cover&seed=17` |
| `02-market-rainbreak.jpg` | `http://localhost:8080/?shot=market&seed=17` |
| `03-garage-night.jpg` | `http://localhost:8080/?shot=garage&seed=17` |
| `04-causeway-dawn.jpg` | `http://localhost:8080/?shot=causeway&seed=17` |

Serve locally, open each route in desktop Chrome, wait until `window.__shotReady === true`, then capture at **1280 pixels on the long side**. Save JPEGs in `screenshots/` using exactly the filenames above, each within the kit's 256 KiB limit. Keep the game HUD visible and use the route's authored weather and camera. Do not capture or substitute unfinished routes. Turn 1 does not set `__shotReady` or create these captures.

## Package

From the repository root:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The entrypoint copies local game files and available screenshots, then builds `out/dossier.json` with the unchanged kit library. Run it twice and compare file hashes to verify deterministic packaging. Packaging does not submit or publish anything. The source remains compact and runs directly from `game/index.html` through a static server. The vendored Three.js library is distributed with its included license header.

Referral code: **8kbmacyg**
