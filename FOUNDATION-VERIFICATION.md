# HIGH WATER foundation verification

Verified locally through the configured Playwright MCP server in real Headless Chrome 157. Initial viewport: 1280 × 800; subsequent movement, HUD and driving checks: 1024 × 768. No screenshots were captured. Distant test locations were reached by positioning the exposed diagnostic state; movement across district and flood boundaries, entry, driving, braking, exit, and menus used browser keyboard or mouse input.

| Check | Observed result |
| --- | --- |
| Local load | Title screen loaded; all 18 page, style, module and library requests returned HTTP 200 from localhost:8080. No external requests. |
| Console | Zero errors across browser checks. Four SwiftShader GPU ReadPixels performance warnings were reported by the browser; no game warnings or failed module loads. |
| Start | START click and Enter both entered play and revealed the HUD. |
| Walk | 11.0831 units in 1.5833 simulated seconds: 7 units/second. |
| Sprint | 17.7826 units in 1.6166 simulated seconds: 11 units/second. |
| District | Walking south across z=1140 changed Citrus Commons to Old Salt Quarter in the HUD. Other checks showed Marigold Market, Tideworks, Sunspur Strand and Sunspur Causeway. |
| Surge | Counted down during play, starting at 12:00; remained exactly unchanged during a one-second pause check. |
| Flood on foot | At (2440,2010), the visible WATER gauge read 16 cm and its bar filled to 12.3077%. |
| Parked vehicle | Nearby prompt named Citrus Comet; E entered it. |
| Driving and camera | Vehicle moved from z=1010 to z=988.232; chase camera moved from z=1043 to z=1026.182. FOV increased to 68.013 degrees. Card showed Citrus Comet, 72 km/h, 100% condition. |
| Driving through flooding | Drove south into the Strand flood region; card showed 69 km/h and 100% condition, WATER read 34 cm at surge level 0.34. |
| Exit | E exited successfully after slowing and found a free position beside the car. |
| Collision | Impact stopped the car outside a building, reducing condition to 95.392%; position did not enter the blocker. |
| Causeway | Drove east up the ramp to x=2736.409; car height reached 12.1 and district became Sunspur Causeway. |
| Pause and restart | Escape and P opened pause; resume worked. RESTART DAY returned to title, 720 seconds, $140 cash, no selected mission. |
| Job board | Opened from title and pause. Six named jobs rendered in order, five locked, exactly one enabled TAKE THE JOB button. Selecting job one updated the mission card to The Cooler Caper / CONTACT without executing objectives. |
| Traffic | All twelve traffic cars moved between samples, all headlights were on in storm dusk, none were inside building rectangles. |
| Pedestrians | Forty pedestrians existed; 36 moved between samples, 14 umbrellas were visible, two sheltered, and zero pedestrians intersected blockers. |
| Contacts | Prompts correctly named Tavi Moss / FIXER, Niko Vale / MECHANIC and Paz Sol / FENCE. All three floating labels existed; Tavi's label was visible in range and the distant labels were hidden. |
| COLDFIN | Van present at (980,0.5,1770) inside the five-segment impound fence with gate gap. Prompt read Enter COLDFIN FREEZER VAN. |
| World limits | Pier position allowed; sea position (2660,1500) blocked; ordinary road position (1120,1200) free. Six flood regions and 65 wind-driven palms exposed. |
| Weather | All four presets switched sky/sun, rain, lamp flags and pedestrian rain state. Dawn removed umbrellas and sheltering. Forced elapsed-time check produced lightning=1 followed by thunderDue=true. |
| Flood steps | Levels at 720,479,119,0 seconds were 0.16,0.52,1.06,1.24. Ramp stayed dry at the first two levels; outside-zone depth stayed zero; causewayOpen became false at zero. |
| HUD state | Initial cash $140, banked $0, zero wanted stars, zero units, all three evidence chips cleared; cooler, dialogue and phone hidden. |

One browser automation attempt timed out while waiting for a narrow absolute-speed window during continuous reverse input. The corrected test waited for the signed braking threshold, released reverse, coasted below exit speed and passed. No unresolved game error was found. Software rendering remained slow; flat materials and fused actor geometry reduced the sampled visible draw calls from 341 to 161. Movement uses short physics substeps to preserve collision at low frame rates.

Two consecutive runs of `MAKEFUN_OUTPUT_DIR=out node main.ts` both exited 0. SHA-256 manifests for all **22 output files** matched byte-for-byte. Dossier SHA-256:

```text
62b72471ef9ff297c4bf809063dc7013c66d547f77b8e43918df4924e91db449
```

Authored game HTML, CSS and modules total **83,467 bytes**, excluding the unmodified 670,681-byte Three.js library. `git diff --check` passed. `git diff --exit-code a33ade4 -- vendor/makefun-game.ts` passed. The new root entrypoint comment, exact owner wallet, badges, six-job descriptions, controls, referral code and four future shot mappings are present.

Deferred as requested: wanted/evidence execution, police AI, cargo/job execution, dialogue/phone/economy/radio/garage systems, panic and spray/smoke effects in turn 2; staging routes, four new captures and kit check in turn 3. The three starter screenshots remain unchanged for replacement during turn 3. No submission, hosting deployment or recorder action was performed.
