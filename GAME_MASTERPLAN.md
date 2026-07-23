# ⏱️ THE HEIST CLOCK — COMPLETE MASTER GAME PLAN
## GMTK Game Jam 2026 | Theme: COUNT DOWN

> **This document is the single source of truth for building THE HEIST CLOCK.**
> Every mechanic, pixel, sound, screen, and line of code is specified here.
> A developer with this document alone should be able to build the entire game.

---

## 📋 TABLE OF CONTENTS

1. [Game Overview & Vision](#1-game-overview--vision)
2. [Story & Narrative](#2-story--narrative)
3. [Core Game Mechanics](#3-core-game-mechanics)
4. [Floor System & Procedural Generation](#4-floor-system--procedural-generation)
5. [The Countdown Clock System](#5-the-countdown-clock-system)
6. [Thief — Full Mechanics](#6-thief--full-mechanics)
7. [Detective — Full Mechanics](#7-detective--full-mechanics)
8. [Room Types & Objects Catalog](#8-room-types--objects-catalog)
9. [Power-Ups & Special Items](#9-power-ups--special-items)
10. [Solo Mode (vs Bot)](#10-solo-mode-vs-bot)
11. [Multiplayer Mode](#11-multiplayer-mode)
12. [Win & Lose Conditions](#12-win--lose-conditions)
13. [Character Design Spec](#13-character-design-spec)
14. [Visual Design System](#14-visual-design-system)
15. [UI/UX Complete Specification](#15-uiux-complete-specification)
16. [Screen-by-Screen Layouts](#16-screen-by-screen-layouts)
17. [Animation Specification](#17-animation-specification)
18. [Audio Design Specification](#18-audio-design-specification)
19. [Mobile & PC Controls](#19-mobile--pc-controls)
20. [Technical Architecture](#20-technical-architecture)
21. [Tech Stack & Tools](#21-tech-stack--tools)
22. [Multiplayer Infrastructure](#22-multiplayer-infrastructure)
23. [PWA & App Strategy](#23-pwa--app-strategy)
24. [Free-Tier Tools & Assets](#24-free-tier-tools--assets)
25. [Phase-by-Phase Build Plan](#25-phase-by-phase-build-plan)
26. [File & Folder Structure](#26-file--folder-structure)
27. [Performance & Optimization](#27-performance--optimization)
28. [Accessibility](#28-accessibility)
29. [Post-Jam Expansion Roadmap](#29-post-jam-expansion-roadmap)
30. [GMTK Submission Checklist](#30-gmtk-submission-checklist)

---

## 1. GAME OVERVIEW & VISION

### Name
**THE HEIST CLOCK**
*Tagline: "One Diamond. One Bomb. Two Stories. One Countdown."*

### What Is It?
THE HEIST CLOCK is a split-screen asymmetric multiplayer/solo web game built for GMTK Game Jam 2026. It is inspired by the vertical endless-faller mechanics of *Daddy Was A Thief* — but reinvented as a 1v1 asymmetric experience where BOTH players fight over a single shared countdown timer.

### The Central Mechanic (The "COUNT DOWN" Connection)
One shared countdown timer is on screen at all times representing a BOMB FUSE the thief planted.

- **Thief actions → DECREASE the timer faster** (they want it to hit zero — bomb explodes = chaos cover = escape)
- **Detective actions → PAUSE or ADD time to the timer** (they want to diffuse it — delay the explosion to gain time to catch the thief)

**Win conditions:**
- Timer hits 0:00 → BOMB EXPLODES → Thief wins (chaos cover, escapes)
- Detective catches Thief before timer hits 0 → Detective wins
- Detective diffuses bomb (reaches bomb room, solves puzzle) → Timer freezes → Thief must reach exit before caught → race to finish

### The Two Screens
- **LEFT SCREEN** = Thief — going DOWN from top floor to ground exit
- **RIGHT SCREEN** = Detective — going UP from ground floor to bomb, then chasing Thief

### Target Audience
- Gamers aged 13-35
- Casual to mid-core
- Anyone who loves party games, heist movies, arcade games
- Mobile and PC players equally

### Platform
- Primary: Web browser (itch.io compatible)
- Secondary: PWA (installable on mobile/desktop as app)
- Future: Capacitor.js mobile app → iOS + Android

### Aesthetic Direction
- **Elegant, Rich, Dark** — NOT flashy or garish
- Noir heist atmosphere — think Hitman + Into the Breach color restraint
- Muted deep tones: charcoal, obsidian, warm gold accents, cold blue-white highlights
- Clean geometric shapes, pixel-perfect UI
- Premium indie studio quality — NOT a flash game look

---

## 2. STORY & NARRATIVE

### Lore (Shown in animated intro cutscene, ~15 seconds)

```
NIGHT. 11:58 PM. CASTELLAN TOWER — 40 floors.

THE THIEF (codename: CIPHER) has spent 6 months planning this.
Tonight, they slipped into the top floor, stole the AZURE DIAMOND —
a priceless gem last seen before the war.

But Cipher isn't reckless. On floor 1, on the way in,
they planted a TIME BOMB.
Insurance. Chaos. A diversion.

THE DETECTIVE (codename: VALE) was the only one who noticed.
The security alert. The opened case. The missing diamond.

Now:
  CIPHER must descend 40 floors and reach the exit.
  VALE must climb, diffuse the bomb, and catch CIPHER.

The bomb reads: 05:00.

Count. Down.
```

### Narrative Beats (In-Game)
- Floor milestone messages appear on the SHARED countdown display
- "CIPHER reached floor 30" / "VALE has found the bomb room"
- These are diegetic story beats embedded in the clock display
- After match ends: a 5-second "results card" shows a newspaper headline
  - Thief wins: *"AZURE DIAMOND VANISHES — BLAST ROCKS CASTELLAN TOWER"*
  - Detective wins: *"CIPHER IN CUSTODY — DETECTIVE VALE SAVES THE TOWER"*

---

## 3. CORE GAME MECHANICS

### The Building
- **40 floors** (procedurally laid out each game — different every time)
- **Thief starts at Floor 40** (penthouse), moves DOWN
- **Detective starts at Floor 1** (ground), moves UP
- They travel the SAME building on OPPOSITE paths — they CAN meet on the same floor
- The game ends when: bomb hits 0, thief reaches exit, or detective catches thief

### The Split Screen
```
[ THIEF VIEW  |  DETECTIVE VIEW ]
[ going DOWN  |  going UP       ]
[ LEFT panel  |  RIGHT panel    ]
```
- On mobile (portrait): TOP = Thief, BOTTOM = Detective (stacked)
- On mobile (landscape): LEFT/RIGHT split (same as desktop)
- The COUNTDOWN CLOCK sits in the CENTER between both screens — massive and dramatic

### Shared Timer Display
```
         ╔═══════════════╗
         ║  04 : 32      ║
         ║  ████████░░░░ ║  <- progress bar
         ╚═══════════════╝
```
- Lives between the two panels
- Pulses RED when under 60 seconds
- Shakes violently when under 15 seconds
- Has "BOMB" icon (ticking) when normal, "DIFFUSED" icon when detective solves bomb puzzle

### Camera
- Each panel scrolls vertically to follow its character
- Smooth lerp camera — Thief stays in upper-third of panel (going down), Detective in lower-third (going up)
- Camera shake on impacts, collisions, explosions

---

## 4. FLOOR SYSTEM & PROCEDURAL GENERATION

### Floor Structure
Each floor is a fixed-height room (160px tall). Every floor has:
- Left and right walls (character bounces off them — Daddy Was A Thief style)
- Ceiling (has a hole = where character came from)
- Floor (has a hole = where character exits to next floor)
- Interior: randomly placed objects, enemies, hazards, power-ups

### Procedural Generation Rules
The generator runs at game start and creates the full 40-floor layout, stored in memory.
Both thief and detective share the SAME floor data — so the building is physically consistent.

**Generation Algorithm:**
```
For each floor (1-40):
  1. Pick a Floor Theme from weighted pool
  2. Place 2-5 objects from that theme's object pool
  3. Ensure at least one clear path exists (left or right)
  4. Place 0-2 hazards based on floor difficulty tier
  5. Optionally place 1 power-up (30% chance)
  6. Optionally place 1 special room element (15% chance)
```

**Difficulty Tiers by Floor:**
- Floors 1-10: Easy (wide gaps, fewer hazards, forgiving)
- Floors 11-20: Medium (tighter rooms, 1-2 hazards, enemies)
- Floors 21-30: Hard (dense objects, enemies patrol, moving hazards)
- Floors 31-40: Extreme (heavy hazard concentration, timed obstacles)

Note: Thief traverses 40 to 1 (starts at hardest). Detective traverses 1 to 40 (starts easy).

### Floor Themes (18 total)
1. **Office** — desks, computers, filing cabinets, office chairs
2. **Kitchen** — stoves, fridges, pots, counters, steam vents
3. **Bathroom** — bathtubs (multi-floor fall!), toilets, mirrors
4. **Gym** — barbells, treadmills, punching bags, lockers
5. **Server Room** — server racks, cables, sparking terminals
6. **Casino** — slot machines, card tables, spinning wheel (special bonus room)
7. **Library** — bookshelves, ladders, reading lamps
8. **Art Gallery** — sculptures, paintings on walls, spotlights
9. **Laboratory** — beakers, centrifuges, bubbling flasks (hazardous)
10. **Security Room** — monitors, cameras, guards (elite enemies)
11. **Bedroom** — beds (bounce pad!), wardrobes, lamps
12. **Storage** — crates (stackable), barrels, conveyor belts
13. **Rooftop Garden** — planters, birds, glass skylights
14. **Penthouse Lounge** — (floor 40 only) diamond case, luxury furniture
15. **Boiler Room** — (floor 1 only) bomb location, pipes, steam
16. **Parking Garage** — pillars, cars (use as cover), ramps
17. **Hospital** — gurneys (slide object!), medicine cabinets, IV stands
18. **Nightclub** — strobe lights (visibility hazard), speakers, dance floor

---

## 5. THE COUNTDOWN CLOCK SYSTEM

### Session Time Frame Selection (NEW)
Before each game, players choose a **TIME FRAME** — the total maximum session length.
This is NOT difficulty. Difficulty (bot AI) is a separate setting.
All timers, Sudden Death, and music pacing scale proportionally to the chosen frame.

| Time Frame | Session Limit | Bomb Start Time | Sudden Death At | Feel |
|-----------|--------------|----------------|-----------------|------|
| **SHORT** (7 min) | 7:00 (420s) | 3:30 (210s) | 7 min elapsed | Fast, intense, no room for error |
| **STANDARD** (14 min) | 14:00 (840s) | 7:00 (420s) | 14 min elapsed | Balanced, full experience |
| **EXTENDED** (21 min) | 21:00 (1260s) | 10:30 (630s) | 21 min elapsed | Long burn, full economy + cosmetic farming |

**Rules that apply to all time frames:**
- Bomb timer starts at exactly half the session limit
- Sudden Death triggers at the full session limit (timer can no longer increase)
- Timer cap = session limit (cannot add time beyond this)
- Music pacing thresholds are % of bomb timer, not absolute values (see Section 18)
- Multiplayer uses STANDARD (14 min) as default, host can change before game starts

**What changes with longer sessions:**
- The Fence appears more often (every 8 floors still, but there are more of them as floors repeat)
- More treasures spawn per session (8% floor chance stays, but more floors visited)
- Bot AI has more time to play optimally — harder on longer sessions even at same difficulty
- Music has more time to develop its theme before reaching critical phases

### Bomb Timer Cap
- Timer CANNOT be extended beyond the session limit (Sudden Death hard cap)
- At Sudden Death: both player speeds +20%, music enters Sudden Death pattern, timer freezes for increases
- Thief CAN still decrease the timer during Sudden Death

### How Time Changes

**THIEF ACTIONS that DECREASE time (accelerate bomb, help thief escape):**
| Action | Time Change | Notes |
|--------|------------|-------|
| Destroy a security camera | -3 seconds | Max 1 per floor |
| Knock out a guard | -2 seconds | Must defeat, not avoid |
| Use air vent shortcut | -6 seconds | Rebalanced |
| Ride elevator shaft down | -8 seconds | Rebalanced |
| Detonate a floor charge | -5 seconds | Rare item, single use |
| Perfect floor cleared (no damage) | -1s (combo ×5 max) | Stacks up to 5x |
| Steal hidden treasure | -3 seconds | Loot adds chaos |
| Crack open a safe | -4 seconds | Vault smash bonus |
| Escape drone detection | -2 seconds | Successfully hid |
| Use Signal Jammer ability | -8 seconds | Disables cameras 3 floors |

**DETECTIVE ACTIONS that INCREASE time (help detective):**
| Action | Time Change | Notes |
|--------|------------|-------|
| Reach bomb room (floor 1) | +20 seconds | Activates diffuse sequence |
| Complete bomb diffuse puzzle | +45 seconds | Combined with reach = +65s total |
| Restore a security camera | +4 seconds | Rebalanced |
| Revive a guard NPC | +2 seconds | Rebalanced |
| Find evidence item | +4 seconds | Rebalanced |
| Use Radio Station | +6 seconds | Rebalanced |
| Call backup (special ability) | +8 seconds | Rebalanced |
| Access CCTV monitor | +2 seconds | Minor bonus |
| Perfect floor ascended (no hits) | +1 second | Same |

### Timer Visual States
*Thresholds are % of the bomb start time — scales to all session lengths:*
```
> 40% remaining   → Normal amber glow, soft piano theme
20% - 40%         → Orange pulse, music BPM increases
10% - 20%         → Red flicker, rapid heartbeat, music urgent
5%  - 10%         → Full red vignette, alarm pattern on music theme
< 5%              → CRITICAL: screen shake, discordant theme variation
```

### Bomb Diffuse Sequence (Redesigned)
When detective reaches floor 1 (boiler room):
- A **12-second** mini-game overlay appears on the DETECTIVE's panel only
- **New puzzle**: 6 colored wires shown for 2 seconds, then hidden — must clip correct 3 of 6 from memory
- ✅ Solved → +45 seconds added. Bomb status: "DIFFUSED". Explosion-win removed.
- ❌ Failed → -8 seconds penalty
- **Max 2 attempts per game** (was 3)
- Thief CAN reach Floor 1 and physically interfere with detective during puzzle

---

## 6. THIEF — FULL MECHANICS

### Movement
The thief moves through a building going DOWN (floor 40 to floor 1).

**PC Controls:**
- `A / LEFT ARROW` — Move left
- `D / RIGHT ARROW` — Move right
- `W / UP ARROW / Space` — Jump (hold for higher jump)
- `S / DOWN ARROW` — Stomp (smash through current floor)
- `E` — Interact with object
- `Q` — Use equipped power-up
- `Shift` — Dash (special ability)

**Mobile Controls:**
- Virtual D-pad on left side (Left/Right)
- Jump button (bottom right, large)
- Stomp button (bottom center)
- Interact button appears contextually when near object
- Swipe down = stomp (alternative gesture)
- Swipe up = jump (alternative gesture)
- Tap power-up icon = use power-up

### Physics
- Gravity pulls thief DOWN constantly
- Auto-bounce off walls (like Daddy Was A Thief — character never gets wall-stuck)
- Stomp: short downward dash, breaks weak floors instantly
- Some floors are REINFORCED (need 2 stomps or a power-up to break)
- Jump: arc physics, snappy — NOT floaty

### Thief Special Abilities (Select One at Game Start)
1. **Carbon Wire** — Deploy invisible trip wire on floor; stuns first person (detective/enemy) to cross for 1.5s (12s CD)
2. **Signal Jammer** — RF jammer disables cameras/sensors within 2 floors for 10s. Detective loses radar blips. -8s timer (20s CD)
3. **Crowbar Dash** — Compact pry bar smashes through 1 reinforced floor grate instantly (8s CD)
4. **Thermal Paste Gel** — Apply slippery compound to floor: next character crossing slides uncontrolled 2s (14s CD)
5. **Compact Grapple** — Wrist-mounted hook grapples DOWN 2 floors instantly in 0.5s (10s CD)
6. **Smoke Canister** — Fills floor with smoke 5s. Contextual: only deploys if Vale is within 5 floors! (18s CD)

### Thief Health System
- 3 HP (shown as 3 diamond icons in thief's HUD panel)
- Lose 1 HP when: hit by enemy, fall on hazard, touched by detective
- Recover 1 HP when: collect health vial (rare floor item)
- If HP = 0: Thief is knocked down for 3 seconds (detective can arrest in this window)
- Thief CANNOT die permanently — only gets stunned (keeps game flowing)

### Thief Score (Solo Mode)
- +10 per floor cleared
- +25 per floor cleared without taking damage
- +50 for using a vent/elevator shortcut
- +100 for each hidden treasure collected
- +500 bonus for reaching exit (Win: Escape)
- +300 bonus if bomb explodes (Win: Detonation)
- +5 × seconds survived bonus
- Heist Chips × 0.1 bonus

### Thief Interactions with Objects
| Object | Effect |
|--------|--------|
| Desk | Jump ON it (platform), kick it to create obstacle |
| Bookshelf | Topple to slow detective below |
| Bathtub | Jump in → crash through 3 floors at once (signature mechanic) |
| Vending Machine | Shake for random power-up/item (25% chance) |
| Security Camera | Smash it → -3s on timer, removes detective's map blip |
| Air Vent | Enter → travel 2 floors down instantly (-6s timer) |
| Elevator Shaft | Rare, 5-floor instant descent (-8s timer) |
| Car (Parking Garage) | Use as shield, rolls into enemies |
| Grease Can | Pour → floor below becomes slippery, slows detective |
| Guard Uniform | Disguise — detective's radar loses thief blip for 10s |

---

## 7. DETECTIVE — FULL MECHANICS

### Movement
Detective moves UP (floor 1 to floor 40), pursuing thief.

**PC Controls:**
- `LEFT ARROW` — Move left
- `RIGHT ARROW` — Move right
- `UP ARROW / Space` — Jump (detective has higher jump — trained)
- `DOWN ARROW` — Slide under low obstacles
- `Enter / /` — Interact / Arrest (near stunned thief)
- `Shift` — Sprint burst (2s duration, 6s cooldown)
- `.` (period) — Use power-up

**Mobile Controls:**
- Virtual D-pad on left
- Jump button (bottom right)
- Slide button (bottom left)
- Arrest button appears contextually when near stunned thief
- Tap power-up icon = use power-up

### Grapple Hook (Core Upward Movement)
- Auto-fires when detective is near a ceiling hole to ascend
- Grapple Hook: metallic zip sound, pulls detective up
- Can double-grapple for extra height (bounces off wall + ceiling)
- **Motorized Grapple Advantage:** Detective grapple auto-opens reinforced steel grates!

### Detective Special Abilities (Select One at Game Start)
1. **Enhanced Grapple** — 2x grapple speed for 8s; ascends 2 floors per grapple (15s CD)
2. **Infrared Scanner** — Reveals Cipher's exact floor position on radar 12s + reveals all trap wires (12s CD)
3. **Handcuff Wire** — Remote restraint trap on floor: if stunned Cipher lands on it, instant arrest (20s CD)
4. **Stun Baton** — Melee taser stuns any character (enemy or Cipher) for 2.5s. Recharges by walking (8s CD)
5. **Forensic Light** — UV lamp reveals all secret passages + hidden treasures on current + 2 floors above (14s CD)
6. **Radio Burst** — Encrypted comms calls 1 backup guard on any floor within 5 floors; guard patrols 20s (22s CD)

### Detective Health System
- 3 HP (shown as badge icons in detective's HUD)
- Lose 1 HP when: hit by falling object, trip a thief-placed trap, hit by enemy
- If HP = 0: Detective is knocked down and stunned for 3 seconds (matches thief stun duration)
- Detective CANNOT die permanently — recovers after 3s stun window

### Arrest Mechanic
- When detective reaches the SAME floor as a stunned thief (0 HP thief)
- "ARREST" prompt appears
- Detective must be within 1 floor range of thief and triggered within 3-second stun window
- If stun window passes, thief recovers and moves again
- This creates high-tension "almost got them!" moments

### Detective Interactions with Objects
| Object | Effect |
|--------|--------|
| Security Panel | Access camera feeds — map view toggle for 3s |
| Radio Station | Call backup → slows thief on next floor for 5s |
| Evidence Kit | Collect for +5s timer |
| Key Cabinet | Unlock elevator shaft (faster floor access) |
| Fire Extinguisher | Spray downward → creates temporary ice platform |
| Junction Box | Restore power → reactivates cameras, +5s timer |
| Medkit | +1 HP |
| CCTV Monitor | See thief's exact position for 3s |
| Handcuff Trap | Set on floor below → stuns thief 2s if they land on it |
| Taser Pad | Electrifies floor entrance — thief stunned if they enter |

---

## 8. ROOM TYPES & OBJECTS CATALOG

### Complete Neutral Object List (Both can use)
| Object | Thief Effect | Detective Effect |
|--------|-------------|-----------------|
| Bathtub | Crash through 3 floors instantly | Use as large cover block |
| Bookshelf | Topple → falling obstacle | Climb as improvised ladder |
| Elevator Shard | 5-floor instant descent (-8s) | 4-floor instant ascent |
| Air Vent | 2-floor shortcut down (-6s) | 2-floor shortcut up |
| Crate | Smash through | Stack to reach higher ceiling hole |
| Bed | Bounce pad — extra jump height | Bounce pad — extra jump height |
| Refrigerator | Shield bubble (absorbs 1 hit) | Shield bubble (absorbs 1 hit) |
| Vending Machine | Random power-up (25% chance) | Random power-up (25% chance) |

### Special Floor Types

#### Casino Floor (Special Event Room — 10% Chance Any Floor)
- Both characters transform into a rolling ball momentarily
- Bounce between bumpers to collect Heist Chips (thief) or evidence chips (detective)
- Timer pauses ONLY if both players enter Casino Floor simultaneously (in single-player/bot mode, timer pauses)
- Exits bottom/top automatically after 6s of bouncing

#### Boiler Room (Floor 1 — Critical Room)
- Contains **THE BOMB** (visible ticking prop, wire-covered device)
- Bomb mini-game activates when detective stands on it
- Wire puzzle: 6 colored wires shown for 2s, then hidden — must clip correct 3 of 6 from memory within 12 seconds
- ✅ Solved → +45s added, bomb status set to "DIFFUSED" (max 2 attempts per game)
- ❌ Failed → -8s penalty
- **Floor 1 Exit Door:** Steel vault door on left wall with green LED keycard swipe pad. Thief holds `E` for 0.5s to swipe and escape! Detective on Floor 1 can physically stand in front of the door to block entry.

#### Penthouse Lounge (Floor 40 — Thief Starts Here)
- Pre-smashed diamond case (thief already grabbed it in the intro animation)
- Broken glass on floor (damage if slid through without care)
- Intro animation shows thief grabbing the diamond here before game starts

### Enemies (NPCs)
| Enemy | Location | Behavior |
|-------|----------|----------|
| Security Guard | Floors 10-30 | Patrols left-right, stuns on contact (both players) |
| Angry Janitor | Floors 5-20 | Throws mop projectile, chases for 3s |
| Ninja Assassin | Floors 25-40 | Fast, unpredictable movement |
| Robot Sentry | Server Room | Laser sweep, destroyable with power-up |
| Guard Dog | Any | Chases character for 3s on detection, -1HP |
| Drone | Floors 15-40 | Flies across floor, tracking, -1HP on contact |

### Hazards
| Hazard | Effect |
|--------|--------|
| Steam Pipe | Burns on contact, -1HP |
| Laser Grid | Blocks path — must time jump through gap |
| Falling Debris | Random fall trajectory, -1HP if hit |
| Electrified Floor Tile | -1HP + 1s stun |
| Grenade (dropped by enemy) | Explodes in 2s, area -1HP |
| Spinning Fan | Blocks path, must time pass-through |

---

## 9. POWER-UPS & SPECIAL ITEMS

### Thief Power-Ups
| Power-Up | Effect | Duration | Spawn Rate |
|----------|--------|----------|-----------|
| Smoke Bomb | Obscures detective's right-panel in smoke for 4s (*Contextual: only deploys if Vale is within 5 floors!*) | Instant | 15% |
| Speed Boots | 2x movement speed | 8s | 12% |
| Diamond Shield | Absorb 1 hit without HP loss | Until hit | 10% |
| Gravity Gloves | Pull floor object as throwable projectile | 1 use | 8% |
| Floor Charge | Blow through 2 reinforced floors | 1 use | 6% |
| Stealth Cloak | 5s invisibility on detective's mini-radar | 5s | 10% |
| Grapple Down | Teleport 2 floors downward instantly | Instant | 8% |
| EMP Pulse | Disables all electronics on current + adjacent floor | 6s | 5% |

### Detective Power-Ups
| Power-Up | Effect | Duration | Spawn Rate |
|----------|--------|----------|-----------|
| Tracker Dart | Marks thief position on map for 10s | 10s | 15% |
| Jet Grapple | Triple ascent speed for 5s | 5s | 12% |
| Floor Lock | Seals thief's current floor exits for 3s | 3s | 8% |
| Shock Net | Drops net on floor — thief stunned if they cross | Until trigger | 6% |
| Time Crystal | +12s on timer immediately (balanced vs 90 chips in Fence) | Instant | 10% |
| Drone Deploy | Scout drone shows thief path on radar for 8s | 8s | 8% |
| Backup Call | Spawns NPC guard to stun thief on contact for 10s | 10s | 5% |
| Forensic Light | Reveals all traps and hidden paths on 3 floors | 5s | 7% |

### Universal Power-Ups (Either player)
| Power-Up | Effect |
|----------|--------|
| Health Vial | +1 HP |
| Coin Bag | +50 score (solo mode only) |
| Compass | Shows where opponent is for 5s |
| Turbo | Temporary 3x speed for 3s |

---

## 10. SOLO MODE (VS BOT)

### Overview
Player selects:
1. Their role: Thief OR Detective
2. Their special ability (from their role's list)
3. Difficulty: Easy / Medium / Hard

The opposing role is controlled by an AI Bot.

### Bot AI (Thief Bot — When Player is Detective)

**Easy Thief Bot:**
- Takes straightforward path (no shortcuts)
- 60% chance to avoid hazards
- Never uses power-ups offensively
- Makes 1 intentional "pause" per 5 floors

**Medium Thief Bot:**
- Uses shortcuts 30% of the time
- 80% hazard avoidance
- Uses 1 power-up per game
- Adapts slightly to detective's floor position

**Hard Thief Bot:**
- Always takes fastest possible path
- 95% hazard avoidance
- Uses 2-3 power-ups strategically
- Predicts detective position and uses counter-moves proactively

### Bot AI (Detective Bot — When Player is Thief)

**Easy Detective Bot:**
- Ascends slowly
- Only attempts bomb diffuse once
- Never uses special abilities
- Loses track of thief position often

**Medium Detective Bot:**
- Moderate speed ascent
- Attempts bomb diffuse up to twice
- Uses 1 ability per game
- Uses radar blip actively

**Hard Detective Bot:**
- Fast ascent, uses all shortcuts
- Attempts bomb diffuse up to 2 times (game maximum)
- Uses all abilities optimally
- Anticipates thief floor based on descent rate

### Bot Pathfinding Algorithm
- Node graph per floor (pre-generated by FloorGenerator)
- BFS for fastest path to destination
- Priority queue with hazard weights
- Bot look-ahead: Easy = 2 floors, Medium = 4 floors, Hard = full building

### Solo Scoring & Leaderboard
- Score saved to localStorage
- "Personal Best" shown on difficulty select screen
- Results screen shows: floors cleared, time survived, power-ups used, damage taken
- 6 separate leaderboard slots: Thief Easy/Med/Hard + Detective Easy/Med/Hard

---

## 11. MULTIPLAYER MODE

### Overview
2 players join via room code. One plays Thief, one plays Detective. Real-time sync via WebSockets (PartyKit).

### Room System
1. Host clicks "CREATE ROOM" → Gets a 6-character alphanumeric code (e.g., HX3K9F)
2. Code displayed large on screen with COPY button
3. Guest enters code → Joins room → Sees lobby
4. Lobby screen shows both players, role assignment, ready status

### Role Assignment Modes
- **Random** — System randomly assigns Thief and Detective at match start
- **Manual** — Each player selects their preferred role (first-come first-served; tiebreaker = random)
- **Host Choice** — Host assigns roles before guest joins

### Match Start Sequence
1. Both players click "READY"
2. 3-2-1 countdown animation on both screens simultaneously
3. Brief intro animation (5s): newspaper-style panels telling the heist story
4. Split screen activates — both players gain control at exact same moment
5. Timer starts

### Real-Time Sync (What Is Sent)

**Client sends (every 50ms — 20 updates/second):**
```json
{
  "type": "player_state",
  "x": 245,
  "y": 112,
  "floor": 32,
  "hp": 3,
  "animation": "run_right",
  "facing": "right",
  "power_up": "smoke_bomb"
}
```

**Server sends (authoritative game state every 500ms):**
```json
{
  "type": "game_state",
  "timer": 247.5,
  "bomb_status": "active",
  "thief_floor": 32,
  "detective_floor": 8,
  "game_status": "running"
}
```

**Server sends (on events immediately):**
```json
{
  "type": "timer_update",
  "timer": 244.5,
  "delta": -3,
  "reason": "camera_smashed",
  "source": "thief"
}
```

### The Opponent Mirror (Key Feature)
- On the Thief's panel (left): a small mini-radar in bottom-center shows detective's current floor as a dot on a building silhouette
- On the Detective's panel (right): a small mini-radar shows thief's floor as a dot
- This prevents isolation — you always feel the presence of the other player

### Floor Convergence Event
When thief and detective are on the SAME floor:
- Both panels flash red simultaneously
- A brief "SAME FLOOR" alert appears on the center clock display
- Camera on each panel zooms out slightly to maximize visible floor area
- Creates maximum dramatic tension moments

### Disconnect Handling
- If either player disconnects mid-game: 10-second reconnect window
- Timer PAUSES during reconnect window (shown with "WAITING..." on clock)
- If player doesn't reconnect: bot takes over at same state seamlessly
- Match result is still recorded on reconnect

### Post-Match
- Result screen shown to BOTH players simultaneously
- "REMATCH" button (same room, roles optionally swapped)
- "NEW MATCH" button — back to lobby
- Stats shown: floors traversed, power-ups used, time remaining/elapsed

---

## 12. WIN & LOSE CONDITIONS

### Thief Wins If:
1. Reaches the exit on floor 1 while alive (not arrested) BEFORE timer hits 0
2. Timer hits 0:00 — bomb explodes regardless of thief's floor:
   - Brief explosion animation, screen goes white, thief escapes in chaos

### Detective Wins If:
1. Arrests the thief (reaches stunned 0-HP thief and triggers arrest within 3s window)
2. After bomb diffuse: catches thief before the extra time (+45s from diffuse) runs out

### Draw Condition (Rare):
- If timer hits 0:00 at the EXACT moment thief reaches exit → "MUTUAL ESCAPE" tie screen

### Sudden Death (Anti-Stalemate)
Triggers when total elapsed game time reaches the selected **Session Time Limit** (7, 14, or 21 minutes):
- "SUDDEN DEATH" activates — timer can no longer be increased by detective
- Both player movement speeds increase +20%
- Thief countdown abilities still function
- Music switches to fast Sudden Death pattern
- Forces final resolution within remaining time

---

## 13. CHARACTER DESIGN SPEC

### The Thief — CIPHER

**Silhouette:**
- Height: 48px sprite base (rendered at 2x = 96px)
- Slim, athletic, gender-neutral
- Distinct shape: narrow with utility belt and visible grapple hook wrist device

**Color Palette:**
- Primary: Deep charcoal `#1A1A1A`
- Accent: Warm amber `#D4A017` (visor slit, belt buckle)
- Diamond Glow: Cold blue `#60A8CC` (chest pouch where diamond is held)
- Shadow: Slate blue `#2C3E50`

**Details:**
- Face covered by balaclava
- Two amber-glowing eye slits (visor)
- Utility belt with 3 visible pouches
- Soft rubber sole shoes (flat-bottomed, no heel)
- Diamond visible as faint blue glow through chest pouch

**Idle Animation:** Breathing, amber visor flickers once every 3s
**Run:** 6 frames, fluid forward lean
**Jump:** 4 frames, tucked knees mid-air
**Stomp:** 5 frames, downward thrust with impact particles
**Hit:** 3 frames, white flash on frame 1 then stumble
**Stun:** 6 frames 1.2s loop, kneeling, visor dims
**Victory:** 8 frames, raises diamond in one hand

### The Detective — VALE

**Silhouette:**
- Height: 48px sprite base (rendered at 2x = 96px)
- Slightly broader shoulders, authoritative stance
- Distinct shape: trench coat silhouette with visible badge on chest

**Color Palette:**
- Primary: Deep navy `#1B2A4A`
- Accent: Cold blue-white `#C8D8E8` (badge, scanner light)
- Highlight: Warm gold `#C9A84C` (badge details, coat buttons)
- Earpiece: Small white highlight point

**Details:**
- Dark navy trench coat
- Gold badge on left chest (visible from side view)
- Small earpiece right ear
- Grapple hook wrist device (left wrist)
- Forensic scanner holstered on belt

**Idle:** Adjusts earpiece, alert scan left-right
**Run:** 6 frames, determined stride
**Grapple:** Hook extends from wrist, 5 frame pull-up
**Slide:** Lean-under pose, 3 frames
**Hit:** 3 frames, stumble + badge clinks
**Arrest:** 8 frames, lunges forward, handcuffs snap — slow cinematic moment
**Victory:** 8 frames, holds up handcuffed thief

---

## 14. VISUAL DESIGN SYSTEM

### Complete Color Palette (CSS Custom Properties)

```css
:root {
  /* Backgrounds */
  --bg-deep: #0D0F14;
  --bg-card: #141820;
  --bg-raised: #1C2230;
  --bg-overlay: rgba(13, 15, 20, 0.85);

  /* Thief Side Accents (Amber/Gold) */
  --thief-primary: #C8962B;
  --thief-secondary: #8A6420;
  --thief-glow: rgba(200, 150, 43, 0.3);

  /* Detective Side Accents (Steel Blue) */
  --detective-primary: #4A9ECC;
  --detective-secondary: #2C6A8A;
  --detective-glow: rgba(74, 158, 204, 0.3);

  /* Timer States */
  --timer-normal: #D4A017;
  --timer-warning: #E07020;
  --timer-critical: #CC3030;
  --timer-pulse: rgba(204, 48, 48, 0.4);

  /* Typography */
  --text-primary: #E8EAF0;
  --text-secondary: #8A90A0;
  --text-muted: #4A5060;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-accent: rgba(255, 255, 255, 0.15);

  /* Status */
  --success: #3A9E6A;
  --danger: #CC3030;
  --warning: #D4A017;
  --info: #4A9ECC;
}
```

### Typography

```css
/* Import at top of CSS */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --font-primary: 'Outfit', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;  /* Big numbers, title */
  --font-mono: 'JetBrains Mono', monospace;      /* Room codes, terminals */

  /* Size Scale */
  --text-xs:   0.625rem;  /* 10px */
  --text-sm:   0.75rem;   /* 12px */
  --text-base: 0.875rem;  /* 14px */
  --text-md:   1rem;      /* 16px */
  --text-lg:   1.25rem;   /* 20px */
  --text-xl:   1.5rem;    /* 24px */
  --text-2xl:  2rem;      /* 32px */
  --text-3xl:  3rem;      /* 48px */
  --text-4xl:  4.5rem;    /* 72px - countdown */
}
```

### Visual Effects

**Grain Texture Overlay (Film-grain feel):**
```css
.game-container::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: 0.035;
  pointer-events: none;
  z-index: 9999;
}
```

**Panel Vignette (Dark edges, bright center):**
```css
.game-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%);
  pointer-events: none;
}
```

**Glassmorphism for UI overlays:**
```css
.modal, .hud-panel, .popup {
  background: rgba(20, 24, 32, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Countdown Clock Design
```
╔═══════════════════════════════╗
║  💣 BOMB ACTIVE               ║
║                               ║
║  ╔═══════════════════════╗    ║
║  ║      04 : 32          ║    ║
║  ╚═══════════════════════╝    ║
║                               ║
║  ███████████░░░░░░░░░░░░░░    ║
║                               ║
║  TH: FL.28      DT: FL.7      ║
╚═══════════════════════════════╝
```
- Center display: Space Grotesk Bold 72px for numbers
- Colon separator: pulses at 1s intervals
- Progress bar: amber → orange → red based on state
- Floor indicators: Outfit 12px, shows current floor of each player

---

## 15. UI/UX COMPLETE SPECIFICATION

### Design Philosophy
- **Zero Cognitive Overload**: Everything needed is visible, nothing extraneous
- **Diegetic Where Possible**: UI elements feel part of the world
- **One-Handed Mobile Friendly**: All critical actions reachable with right thumb
- **Responsive**: Adapts from 320px phones to 2560px ultrawide
- **60fps UI**: All animations use CSS transforms, never layout-triggering properties

### Button System

```css
/* PRIMARY — Main CTAs */
.btn-primary {
  background: linear-gradient(135deg, var(--thief-primary), #A07020);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font: 600 1rem var(--font-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 20px rgba(200, 150, 43, 0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(200,150,43,0.45); }
.btn-primary:active { transform: scale(0.97); }

/* SECONDARY — Secondary Actions */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-accent);
  border-radius: 8px;
  padding: 12px 28px;
  font: 600 1rem var(--font-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: border-color 0.15s, background 0.15s;
}
.btn-secondary:hover { border-color: var(--thief-primary); background: rgba(200,150,43,0.08); }

/* GHOST — Tertiary */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 10px 20px;
  font: 400 0.875rem var(--font-primary);
  cursor: pointer;
  transition: color 0.15s;
}
.btn-ghost:hover { color: var(--text-primary); }
```

### Responsive Breakpoints
```css
/* Mobile Portrait: 320px - 480px */
@media (max-width: 480px) { /* stacked panels, compact HUD */ }

/* Mobile Landscape: 481px - 768px */
@media (min-width: 481px) and (max-width: 768px) { /* side-by-side, mini HUD */ }

/* Tablet: 769px - 1024px */
@media (min-width: 769px) and (max-width: 1024px) { /* full split, expanded HUD */ }

/* Desktop: 1025px+ */
@media (min-width: 1025px) { /* optimal experience */ }

/* Wide: 1441px+ — panels capped, centered */
@media (min-width: 1441px) { 
  .game-container { max-width: 1440px; margin: 0 auto; }
}
```

### Toast Notification System
- Position: Top-center of screen (or top of each panel during gameplay)
- Types: info (blue), success (green), warning (amber), error (red)
- Auto-dismiss: 3 seconds
- Slide down on enter, fade up on dismiss
- Examples: "Smoke Bomb equipped!", "BOMB DIFFUSED +60s!", "THIEF STUNNED!"

---

## 16. SCREEN-BY-SCREEN LAYOUTS

### SCREEN 1 — SPLASH / LOADING
- Duration: 1.5-2 seconds max (while assets load)
- Black background `#0D0F14`
- THE HEIST CLOCK logo: Space Grotesk Bold, fades in
- Tagline below: *"One Diamond. One Bomb. Two Stories. One Countdown."* — Outfit Light
- Loading bar: thin amber line fills left to right
- Auto-transitions to HOME on load complete

### SCREEN 2 — HOME / MAIN MENU
```
LAYOUT:
  [Building silhouette background — animated, parallax]
  
  CENTER CONTENT:
    ⏱️  THE HEIST CLOCK         <- Title, Space Grotesk Bold
    ────────────────────────
    
    [ SOLO PLAY ]               <- Primary button
    [ MULTIPLAYER ]             <- Primary button
    [ HOW TO PLAY ]             <- Secondary button
    [ SETTINGS ]                <- Secondary button
    
    ────────────────────────
    🏆 Best: 4,200 (Detective Hard)
    
    v1.0.0              GMTK 2026
```
- Animated: thief silhouette descending on left, detective ascending on right (loop)
- Music begins on load (fade in over 1s)
- Each button staggers in with 80ms delay

### SCREEN 3 — SOLO ROLE SELECT
```
← BACK           CHOOSE YOUR ROLE

  ┌─────────────────────┐   ┌─────────────────────┐
  │   🕵️  CIPHER         │   │   🔍  VALE           │
  │   THE THIEF         │   │   THE DETECTIVE     │
  │                     │   │                     │
  │   ↓ Go Down         │   │   ↑ Go Up           │
  │   Escape with the   │   │   Arrest Cipher     │
  │   Azure Diamond     │   │   Diffuse the bomb  │
  │                     │   │                     │
  │   [ PLAY AS THIEF ] │   │ [ PLAY AS DETECTIVE]│
  └─────────────────────┘   └─────────────────────┘
```
- Hover: character does 2-frame idle animation, card glows in role color
- Click: card scales 0.98, then transitions to ABILITY SELECT

### SCREEN 4 — ABILITY SELECT
```
← BACK      SELECT ABILITY   (Playing as: THIEF)

  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
  │  💨  │  │  🌫️  │  │  🦶  │  │  🧲  │  │  👻  │
  │SHADOW│  │SMOKE │  │GRAV. │  │MAGNET│  │PHASE │
  │ STEP │  │ VEIL │  │BOOTS │  │GLOVE │  │SHIFT │
  │      │  │      │  │      │  │      │  │      │
  │  8s  │  │ 15s  │  │ 20s  │  │ 10s  │  │ 12s  │
  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘

  [SELECTED: Shadow Step]
  "Perform a brief dash through walls and obstacles."
  Cooldown: 8 seconds | Key: Q / Shift

                    [ CONFIRM ]
```
- Hovering shows description below
- Selected card has amber border glow (thief) or blue (detective)
- Confirm → Difficulty select

### SCREEN 5 — DIFFICULTY SELECT
```
← BACK      SELECT DIFFICULTY

  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │   🟢 EASY    │  │  🟡 MEDIUM   │  │   🔴 HARD    │
  │              │  │              │  │              │
  │   7:00 ⏱️   │  │   5:00 ⏱️   │  │   3:30 ⏱️   │
  │              │  │              │  │              │
  │  Bot takes   │  │  Bot is      │  │  Bot is      │
  │  it easy     │  │  alert       │  │  ruthless    │
  │              │  │              │  │              │
  │  Best: 2,100 │  │  Best: ---   │  │  Best: ---   │
  └──────────────┘  └──────────────┘  └──────────────┘

               [ START GAME ]
```
- Personal best shown if exists, dashes if never played
- Start Game triggers 3-2-1 countdown then game

### SCREEN 6 — MULTIPLAYER MENU
```
← BACK                 MULTIPLAYER

  ┌──────────────────────────────────────┐
  │         CREATE A ROOM                │
  │                                      │
  │  Start a game and share the code     │
  │  with a friend.                      │
  │                                      │
  │              [ CREATE ROOM ]         │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │         JOIN A ROOM                  │
  │                                      │
  │  Enter room code:                    │
  │  ┌──────────────────────────────┐   │
  │  │   _ _ _ - _ _ _              │   │  <- Monospace, auto-uppercase
  │  └──────────────────────────────┘   │
  │                                      │
  │                      [ JOIN ROOM ]   │
  └──────────────────────────────────────┘
```

### SCREEN 7 — ROOM LOBBY
```
ROOM CODE: HX3K9F    [📋 COPY]

┌─────────────────────┐  ┌─────────────────────┐
│  PLAYER 1 (HOST)    │  │  PLAYER 2           │
│  🕵️  GhostRun      │  │  ⏳ Waiting...      │
│  [THIEF]           │  │                     │
│  ✅ Ready          │  │                     │
└─────────────────────┘  └─────────────────────┘

Role Assignment:  ○ Random  ● Manual  ○ Host Choice

[Change Role]                        [READY UP]

Share this code with your friend to start playing!
```
- Room code auto-copied on COPY button click
- "Waiting for opponent..." animated dots
- Both ready → 3s countdown → game starts

### SCREEN 8 — INTRO CINEMATIC (Skip-able)
- 5-second animated CSS sequence
- Newspaper-style panels (no video)
- Panel 1: Diamond in case, cold blue glow, "CASTELLAN TOWER — 11:58 PM"
- Panel 2: Gloved hand reaches for diamond
- Panel 3: Bomb timer being set on floor 1, "INSURANCE."
- Panel 4: Detective badge glinting, security alarm going off
- Text overlay fade: *"The diamond is gone. The clock is ticking."*
- SKIP button top-right, appears after 1s

### SCREEN 9 — IN-GAME HUD (Main Split Screen)

**Desktop (1025px+):**
```
┌──────────────────────────────────────────────────────────────────┐
│  THIEF — FLOOR 28   | [CLOCK CENTER] |   DETECTIVE — FLOOR 7    │
│                      |               |                           │
│  ◆◆◆ HP   🌫️ Q:3s  |  💣 04:32     |  🔰🔰🔰 HP  🎯 Q:8s    │
│                      |  ████████░░░  |                           │
│  [CANVAS GAME VIEW] |  TH:28  DT:7  | [CANVAS GAME VIEW]       │
│                      |               |                           │
│  [MINI RADAR]  [AB]  |               |  [AB]  [MINI RADAR]       │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile Portrait:**
```
┌────────────────────────────┐
│ ╔══════╗ 04:32  ╔══════╗  │
│ ║ ◆◆◆ ║ █████░ ║🔰🔰🔰║  │
│ ╚══════╝        ╚══════╝  │
├────────────────────────────┤
│   THIEF PANEL (top half)  │
│                            │
│   [GAME WORLD — CANVAS]   │
│                            │
│  Floor 28                 │
├────────────────────────────┤
│  DETECTIVE PANEL (bottom) │
│                            │
│   [GAME WORLD — CANVAS]   │
│                            │
│  Floor 7                  │
├────────────────────────────┤
│ [←] [STOMP] [→]  [JUMP]  │  <- Virtual controls
└────────────────────────────┘
```

**HUD Elements Per Panel:**
- Floor label: top-left (e.g., "FLOOR 28")
- HP icons: top-right (diamonds for thief, badges for detective)
- Ability icon: bottom-right with circular cooldown arc overlay
- Power-up slot: bottom-left with circular cooldown arc
- Mini-radar: bottom-center (tiny 40px building silhouette with colored dots)

### SCREEN 10 — PAUSE MENU
```
              ⏸️  PAUSED

         [RESUME GAME]
         [HOW TO PLAY]
         [SETTINGS]
         [QUIT TO MENU]

(In multiplayer: "Requesting pause..." — other player must accept)
```
- Both panels visible behind, blurred and darkened
- `Escape` key or mobile menu button triggers pause

### SCREEN 11 — RESULTS SCREEN
```
┌───────────────────────────────────────────────┐
│                                               │
│  ╔═════════════════════════════════════════╗  │
│  ║   💣 BOMB EXPLODES — CIPHER ESCAPES!   ║  │
│  ╚═════════════════════════════════════════╝  │
│                                               │
│  [Newspaper flip animation]                   │
│  "AZURE DIAMOND VANISHES —                   │
│   BLAST ROCKS CASTELLAN TOWER"               │
│                                               │
│  ────────────────────────────────────────    │
│  CIPHER (Thief)       VALE (Detective)        │
│  Floors Cleared: 40   Floors Ascended: 12     │
│  Score: 2,450         Score: 890              │
│  Power-ups Used: 3    Power-ups Used: 1       │
│  Damage Taken: 1      Damage Taken: 2         │
│  ────────────────────────────────────────    │
│                                               │
│  [ PLAY AGAIN ]   [ SWAP ROLES ]             │
│  [ MAIN MENU ]    [ SHARE RESULT ]           │
└───────────────────────────────────────────────┘
```
- Share Result: copies a text snippet to clipboard ("I escaped as CIPHER in THE HEIST CLOCK! Score: 2,450 — gmtk2026")
- PLAY AGAIN: same settings, new seed, both characters reset
- Achievement unlock appears here if earned this game

### SCREEN 12 — HOW TO PLAY
```
Tabs: [THIEF] [DETECTIVE] [CLOCK] [OBJECTS] [TIPS]

[THIEF TAB CONTENT]
  🕵️ CIPHER — THE THIEF
  
  You start at the TOP of the building (Floor 40).
  Your goal: reach the EXIT on Floor 1 before time runs out.
  
  [Animated diagram: character going down]
  
  CONTROLS:
  A/D or ←/→ — Move (auto-bounces off walls)
  W or SPACE  — Jump
  S           — Stomp through floor
  E           — Interact with objects
  Q           — Use ability
  
  HOW YOU WIN:
  ✅ Reach Floor 1 exit while alive
  ✅ Let the bomb timer hit 0:00
  
  HOW YOU LOSE:
  ❌ Detective arrests you when stunned
```

### SCREEN 13 — SETTINGS
```
AUDIO
  🎵 Music Volume:       [──────●───] 70%
  🔊 SFX Volume:         [────────●─] 85%

DISPLAY
  📳 Screen Shake:       [● ON  ]
  ✨ Particle Effects:   [● ON  ]
  👁️ Reduced Motion:     [  OFF ]
  
CONTROLS (Mobile)
  🕹️ Control Scheme:     [Virtual Pad ▾]
  ✋ Left Hand Mode:      [  OFF ]
  👆 Gesture Controls:   [● ON  ]
  
GAME
  📖 Show Tutorials:     [● ON  ]
  🌐 Language:           [English ▾]
  
ACCOUNT
  👤 Display Name:       [ShadowCipher    ] [Edit]
  📊 Clear Local Data:   [RESET SCORES]
  
                        [SAVE SETTINGS]
```

### SCREEN 14 — PROFILE / STATS
```
👤 SHADOW_CIPHER
   Member since: Jul 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIFETIME STATS
  Games Played:    47
  Thief Wins:      18   Detective Wins: 12
  Best Score:      4,200 (Detective — Hard)
  Total Floors:    1,840 floors traversed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACHIEVEMENTS  (12 / 18 unlocked)
  ✅ First Heist         ✅ Speed Demon
  ✅ Perfect Run         ❌ Close Call
  ✅ Bomb Squad          ❌ Iron Will
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AVATAR
  [8 pixel art portraits to choose from]
```

---

## 17. ANIMATION SPECIFICATION

### Character Sprite Animations

**Thief (Cipher) — All Animations:**
```
idle:          4 frames, 800ms loop — breathing, visor flicker
run_left:      6 frames, 400ms loop
run_right:     6 frames, 400ms loop (mirrored)
jump:          4 frames, plays once — tuck knees at apex
fall:          3 frames, loop while airborne and falling
stomp:         5 frames — downward thrust, impact on final frame
land:          2 frames — leg flex, plays once
hit:           3 frames — white flash frame 1, stumble frames 2-3
stun:          6 frames, 1200ms loop — kneeling, visor dim
victory:       8 frames, 1600ms loop — raise diamond, small jump
defeat:        5 frames, once — slumped, visor off
interact:      3 frames — reach toward object
powerup_use:   4 frames — generic activation pose
```

**Detective (Vale) — All Animations:**
```
idle:          4 frames, 900ms loop — adjust earpiece, look around
run_left:      6 frames, 420ms loop
run_right:     6 frames, 420ms loop (mirrored)
jump:          4 frames, once — determined upward leap
grapple:       6 frames — hook extends (frame 1-2), pull up (frames 3-6)
slide:         3 frames — lean-under pose
land:          2 frames — confident stance
hit:           3 frames — stumble, badge jingle implied
stun:          6 frames, 1200ms loop
arrest:        8 frames — cinematic slow, lunge forward, cuffs snap
victory:       8 frames — holds handcuffed thief, badge gleam
defeat:        5 frames — kneeling, frustrated
```

### UI Animations

**Main Menu Building:**
- Silhouette scrolls horizontally at 0.2px/s (very slow parallax)
- Two character silhouettes: loop path (thief goes down one side, detective goes up the other)
- Loop duration: 12 seconds

**Title Logo:**
```css
@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
.game-title { animation: logoFloat 4s ease-in-out infinite; }
```

**Countdown Clock — Normal Tick:**
```css
@keyframes clockTick {
  0% { transform: scale(1.0); }
  10% { transform: scale(1.025); }
  20% { transform: scale(1.0); }
}
/* Triggered via JS every second */
```

**Countdown Clock — Critical State:**
```css
@keyframes clockShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-3px) rotate(-0.5deg); }
  45% { transform: translateX(3px) rotate(0.5deg); }
  75% { transform: translateX(-2px); }
}
.clock.critical { animation: clockShake 0.4s infinite; }
```

**Timer Event Feedback (Time Added/Removed):**
```css
/* Floats up from clock and fades */
.timer-delta {
  position: absolute;
  animation: deltaFloat 1.2s ease-out forwards;
}
@keyframes deltaFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
}
/* Green text for +Xs, Red text for -Xs */
```

**Screen Transitions:**
- All screen changes: 200ms fade through black `#0D0F14`
- Game start: Split-screen panels slide in from left and right simultaneously (300ms ease-out)
- Game end: Result overlay slides up from bottom (400ms ease-out)

### 🌟 5 APPROVED ENHANCEMENT FEATURES

#### 1. 🎮 Interactive 30-Second First-Run Tutorial
- Appears on the player's FIRST game launch (tracked in `localStorage.firstRun = true`)
- Non-intrusive 3-step overlay:
  1. *"Press A/D to move"* → detects movement → checkmark
  2. *"Press S to stomp through the floor"* → detects stomp → checkmark
  3. *"Press E to interact with cameras & objects"* → completes action → tutorial done!
- Can be skipped instantly with `ESC` / `SKIP` button
- Can be replayed anytime from Settings menu

#### 2. ⚠️ "Close Call" Panel Border Glow
- Dynamically shifts based on character distance:
  - **Distance 3 floors:** Faint red border glow pulses slowly on both panels
  - **Distance 1 floor:** Bright red border glow pulses fast
  - **SAME FLOOR:** Border locks solid red + "SAME FLOOR!" alert text banner pops over clock display for 2s

#### 3. 🤵 The Fence Dual-Visit Simultaneous Easter Egg
- If both Cipher (going down) and Vale (going up) arrive at The Fence on the same floor at the same time:
- The Fence NPC speech bubble triggers a unique easter egg line:
  > *"Ah... a thief AND a detective walk into my shop. I suddenly feel very uncomfortable."*

#### 4. 💥 Bomb Detonation Screen-Wipe
- When timer hits 0:00:
  1. White flash shockwave expands outward from center clock (200ms)
  2. Smoke and particle debris burst across both split panels
  3. Cipher's panel shows a gold "ESCAPED IN THE CHAOS!" banner
  4. Vale's panel shows a red "BOMB EXPLODED!" banner
  5. Smooth 400ms slide-up transition to Results Screen

#### 5. 💨 Smooth Camera Lerp & Stomp Dust
- Camera uses dampening lerp (`camera.y += (target.y - camera.y) * 0.12`) when moving through floors
- Stomping through reinforced or weak floors triggers a puff of 8-12 dust particles radiating outward at floor level
- Landing after falling > 2 floors triggers a soft screen bump (3px downward bounce, 100ms)

**Newspaper Results Animation:**
- Results appear as a newspaper page that flips/rotates in (CSS 3D transform)
- Duration: 600ms, ease-out, rotateY from 90deg to 0deg

---

## 18. AUDIO DESIGN SPECIFICATION

### Music System: THEME-BASED MOTIVIC GENERATION (No Audio Files)

**Philosophy:**
Zero audio files for music. All music is generated in real-time via the Web Audio API.
But unlike a random Markov chain (which sounds like clicking random keys), this system uses a
**fixed melodic theme** that gets **developed, varied, and transformed** — exactly like a jazz musician
playing the same standard differently every performance.

You always recognize "The Heist Clock theme." It never sounds identical twice.

---

#### THE HEIST THEME MOTIF (Fixed — The DNA of All Music)
This is a 6-note motif in E minor pentatonic. It is the same in every session:

```
MOTIF: E3 → G3 → Bb3 → A3 → G3 → E3
Hz:   164 → 196 → 233 → 220 → 196 → 164
Character: A descending minor phrase with a turn — tense, noir, heist-like
Duration: Each note held for 1 beat at current BPM
```

This motif is the **only fixed thing**. Everything else is procedural development of it.

---

#### MOTIVIC DEVELOPMENT ENGINE (The 5 States)

The music engine operates as a **phrase state machine**. It picks from 5 phrase types,
weighted by the current game state. The Markov chain is only used to decide WHICH STATE comes
next — not which individual notes to play. Notes within each state are derived from the theme.

```javascript
const HEIST_MOTIF = [164.81, 196.00, 233.08, 220.00, 196.00, 164.81]; // E3 G3 Bb3 A3 G3 E3

const PHRASE_STATES = {

  // STATE 1: MOTIF — plays the core theme as-is
  // Sounds like: the clear recognizable theme
  MOTIF: {
    generate: (bpm) => HEIST_MOTIF.map((hz, i) => ({ hz, duration: beat(bpm) })),
    weight: { lobby: 0.4, normal: 0.3, warning: 0.2, critical: 0.1 }
  },

  // STATE 2: VARIATION — motif with different rhythm / note lengths
  // Sounds like: the theme but syncopated, jazzier
  VARIATION: {
    generate: (bpm, rng) => {
      const rhythms = [beat(bpm)*0.5, beat(bpm)*1.5, beat(bpm), beat(bpm)*0.75, beat(bpm)*1.25, beat(bpm)*0.5];
      return HEIST_MOTIF.map((hz, i) => ({ hz, duration: rhythms[i] }));
    },
    weight: { lobby: 0.3, normal: 0.35, warning: 0.25, critical: 0.15 }
  },

  // STATE 3: INVERSION — motif played upside down (ascending instead of descending)
  // Sounds like: the theme but rising, more hopeful or questioning
  INVERSION: {
    generate: (bpm) => [...HEIST_MOTIF].reverse().map(hz => ({ hz, duration: beat(bpm) })),
    weight: { lobby: 0.15, normal: 0.15, warning: 0.2, critical: 0.1 }
  },

  // STATE 4: EXTENSION — motif + a new tail phrase (derived from motif's last 2 notes)
  // Sounds like: the theme being developed further, like a sentence with added meaning
  EXTENSION: {
    generate: (bpm, rng) => {
      const tail = [
        { hz: 196.00, duration: beat(bpm) * 0.5 }, // G3 — continuation
        { hz: 174.61, duration: beat(bpm) * 0.5 }, // F3 — passing tone
        { hz: 164.81, duration: beat(bpm) * 2.0 }, // E3 — resolve (long hold)
      ];
      return [...HEIST_MOTIF.map(hz => ({ hz, duration: beat(bpm) })), ...tail];
    },
    weight: { lobby: 0.1, normal: 0.15, warning: 0.2, critical: 0.2 }
  },

  // STATE 5: B-SECTION — a contrasting phrase harmonically related to the motif
  // Based on the relative major (G major) — provides relief, then returns to E minor
  // Sounds like: a bridge section, different but clearly same world as the theme
  B_SECTION: {
    generate: (bpm) => [
      { hz: 196.00, duration: beat(bpm) },       // G3
      { hz: 246.94, duration: beat(bpm) },       // B3
      { hz: 293.66, duration: beat(bpm) },       // D4
      { hz: 261.63, duration: beat(bpm) },       // C4
      { hz: 246.94, duration: beat(bpm) * 1.5 }, // B3 (held)
      { hz: 196.00, duration: beat(bpm) * 0.5 }, // G3 (release)
      { hz: 185.00, duration: beat(bpm) * 2.0 }, // F#3 (pivot back to E minor)
    ],
    weight: { lobby: 0.05, normal: 0.05, warning: 0.15, critical: 0.45 }
  }
};
```

The **critical state** is dominated by B_SECTION — its unexpected harmony creates musical
tension that mirrors the game tension perfectly, without sounding random.

---

#### PHRASE STATE TRANSITIONS (Markov Matrix Between States)
The Markov chain is ONLY used to decide what state plays NEXT after a phrase ends:

```
FROM → MOTIF:      MOTIF(30%) VARIATION(35%) INVERSION(20%) EXTENSION(10%) B_SECTION(5%)
FROM → VARIATION:  MOTIF(25%) VARIATION(15%) INVERSION(25%) EXTENSION(25%) B_SECTION(10%)
FROM → INVERSION:  MOTIF(35%) VARIATION(30%) INVERSION(5%)  EXTENSION(20%) B_SECTION(10%)
FROM → EXTENSION:  MOTIF(40%) VARIATION(20%) INVERSION(15%) EXTENSION(10%) B_SECTION(15%)
FROM → B_SECTION:  MOTIF(50%) VARIATION(20%) INVERSION(15%) EXTENSION(10%) B_SECTION(5%)
```

This ensures:
- B_SECTION is always followed by a return to the motif family (50% → MOTIF)
- VARIATION and INVERSION mix freely for jazz feel
- EXTENSION leads back to resolution
- No state repeats itself immediately (self-transition is low or 0)

---

#### TEMPO (BPM) ADAPTATION
Thresholds scale as **% of bomb start time** so they work for all 3 session lengths:

| Bomb Timer Remaining | BPM | Dominant State | Piano Feel |
|---------------------|-----|----------------|------------|
| Lobby (no game) | 68 | MOTIF only | Slow, spacious, soothing |
| > 60% remaining | 88 | MOTIF + VARIATION | Focused, professional |
| 40% – 60% | 104 | VARIATION + INVERSION | Restless, searching |
| 20% – 40% | 118 | EXTENSION + VARIATION | Urgent, developing |
| 10% – 20% | 132 | B_SECTION + EXTENSION | Tense, unfamiliar |
| 5% – 10% | 148 | B_SECTION (dominant) | Near-panic, dissonant bridge |
| < 5% | 164 | B_SECTION + dense rhythm | Full alarm, controlled chaos |

BPM changes are **interpolated over 4 seconds** — not instant jumps.
Players always feel the urgency building smoothly.

---

#### PIANO TIMBRE SYNTHESIS
```javascript
function playNote(ctx, hz, startTime, duration, masterGain) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Triangle wave — warm, piano-like (not harsh like square/sawtooth)
  osc.type = 'triangle';
  osc.frequency.value = hz;

  // Tiny per-note detune gives organic "real piano" feeling
  // NOT random — seeded from note index so same session = same character
  osc.detune.value = (hz % 7) - 3; // ±3 cents, deterministic per note

  // Lowpass filter simulates piano resonance body
  filter.type = 'lowpass';
  filter.frequency.value = 1800 + (hz * 1.2); // higher notes are brighter

  // Piano ADSR envelope: sharp attack, fast decay, low sustain, natural release
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.28, startTime + 0.012);    // Attack
  gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.06); // Decay
  gain.gain.setValueAtTime(0.12, startTime + duration - 0.04);   // Sustain
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.08); // Release

  osc.connect(filter) → filter.connect(gain) → gain.connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}
```

---

#### BASS LAYER
A secondary voice plays on beats 1 and 3 only, at HALF the frequency of each theme note.
This creates the "upright bass walking" feel characteristic of heist/noir music:
```
E3 motif note → E2 bass note (82 Hz)
G3 motif note → G2 bass note (98 Hz)
```
Bass uses a sine wave (not triangle) for warmth without harshness.
Bass gain: 0.18 (slightly louder than melody to "ground" the sound).

---

#### LOBBY MUSIC (Soothing variant)
- BPM: 68
- Uses MOTIF state only (most recognizable, clearest)
- Long note durations (2x normal beat length)
- Added light reverb: ConvolverNode with 1.2s decay
- Bass layer present but at 50% volume
- Sparse: 40% of beats are rests (silence between notes = breathing room)
- Sounds like: a gentle piano playing in the corner of a luxury hotel lobby

---

#### VICTORY / DEFEAT STINGS (Synthesized — 6 seconds each)
```
THIEF WIN:   Ascending run on HEIST_MOTIF starting from E3 → quick octave jump to E4
             Final note held 2s with slow vibrato (oscillating detune ±8Hz)
             Character: cheeky, triumphant

DETECTIVE WIN: HEIST_MOTIF played in augmentation (3x note length), ending on low E2
               Final chord: E minor (E + G + B simultaneously), 3s decay
               Character: resolved, satisfying justice

DRAW:        B_SECTION played once, then fades to silence mid-phrase (unresolved)
             Character: "nobody won... yet"
```

---

#### UNIQUE PER SESSION (Without Being Random)
Each session gets a `sessionId` used only for:
1. Which PHRASE STATE the music STARTS in (not which notes, just the entry state)
2. The rhythm variation offsets in VARIATION state (±10% beat length)
3. Whether the B_SECTION tail extends by 1 extra note or not

This is enough variation to make no two sessions feel identical,
while the theme always remains recognizable throughout.

```javascript
const sessionId = Math.random() * 1000 | 0;
const startState = ['MOTIF', 'VARIATION', 'MOTIF', 'INVERSION'][sessionId % 4];
const rhythmVariance = (sessionId % 20) / 100; // 0.00 to 0.19 offset factor
```

---



### Complete SFX List

**Movement:**
```
sfx/movement/step-thief.wav     - Soft rubber tap (played each step)
sfx/movement/step-detective.wav - Leather heel click
sfx/movement/jump.wav           - Light whoosh (upward)
sfx/movement/stomp.wav          - Heavy thud + wood crack
sfx/movement/stomp-reinforced.wav - Metal clang (reinforced floor attempt)
sfx/movement/grapple-launch.wav - Metallic zip
sfx/movement/grapple-land.wav   - Thunk + brief rattle
sfx/movement/land-soft.wav      - Soft landing
sfx/movement/land-hard.wav      - Hard landing (from multi-floor)
sfx/movement/wall-bounce.wav    - Subtle reverb tap
sfx/movement/bathtub-crash.wav  - Series of crashes as floors break
sfx/movement/vent-enter.wav     - Whoosh + mechanical click
sfx/movement/slide.wav          - Cloth on floor
```

**Combat:**
```
sfx/combat/hit-1.wav            - Impact thud variant 1
sfx/combat/hit-2.wav            - Impact thud variant 2  
sfx/combat/hit-3.wav            - Impact thud variant 3
sfx/combat/stun.wav             - Electric crackle + spin
sfx/combat/arrest.wav           - Metallic handcuff click x2 + "got you"
sfx/combat/enemy-hit.wav        - Yelp + crash
sfx/combat/enemy-alert.wav      - Short alarm blip (enemy spots character)
```

**Power-ups:**
```
sfx/powerup/pickup.wav          - Sparkle chime (ascending)
sfx/powerup/smoke-bomb.wav      - Hiss + expanding whoosh
sfx/powerup/flashbang.wav       - Sharp pop + high ringing fade
sfx/powerup/tracker-dart.wav    - Pfft + electronic ping
sfx/powerup/speed-boots.wav     - Electrical surge + whoosh
sfx/powerup/floor-lock.wav      - Mechanical clunk + electromagnetic hum
sfx/powerup/time-crystal.wav    - Crystalline chime (rising tone)
sfx/powerup/emp-pulse.wav       - Wide electronic wave sweep
sfx/powerup/stealth-activate.wav - Phase-in shimmer
sfx/powerup/ability-cooldown.wav - Click when ability ready again
```

**Timer:**
```
sfx/timer/tick-normal.wav       - Subtle clock tick (every second)
sfx/timer/tick-warning.wav      - Louder, more pronounced tick
sfx/timer/heartbeat.wav         - Deep thump (replaces tick under 30s)
sfx/timer/alarm.wav             - Cycling alarm (loops under 15s)
sfx/timer/time-add.wav          - Rising hopeful tone (detective adds time)
sfx/timer/time-remove.wav       - Falling tense tone (thief removes time)
sfx/timer/bomb-explode.wav      - Deep rumble + crack + debris scatter
sfx/timer/bomb-diffuse.wav      - Deep hum fades to resolution chime
sfx/timer/bomb-diffuse-fail.wav - Short buzzer + wire crackle
sfx/timer/bomb-tick.wav         - Mechanical tick from bomb prop (ambient)
```

**Objects:**
```
sfx/objects/camera-smash.wav    - Glass shatter
sfx/objects/camera-restore.wav  - Electronic beep + click
sfx/objects/bookshelf-topple.wav - Cascade of books falling
sfx/objects/fridge-shield.wav   - Suction pop + hum
sfx/objects/vent-travel.wav     - Rushing air (looped, short)
sfx/objects/desk-kick.wav       - Wooden scrape + thump
sfx/objects/radio-use.wav       - Static + distant voice crackle
sfx/objects/evidence-collect.wav - Paper/bag rustle + ping
sfx/objects/car-roll.wav        - Rubber on concrete
sfx/objects/switch-click.wav    - Electrical panel switch
```

**UI:**
```
sfx/ui/btn-click.wav            - Clean plastic click (subtle)
sfx/ui/btn-hover.wav            - Near-silent tick (barely audible)
sfx/ui/screen-transition.wav    - Quick whoosh
sfx/ui/achievement.wav          - Rising sparkle fanfare (2s)
sfx/ui/room-code-copy.wav       - Click + confirmation tick
sfx/ui/player-joined.wav        - Entry chime
sfx/ui/player-ready.wav         - Confirmation pop
sfx/ui/countdown-321.wav        - Three descending ticks + final bang
sfx/ui/toast-info.wav           - Light ping
sfx/ui/toast-success.wav        - Upward double chime
sfx/ui/toast-error.wav          - Low descending buzz
```

---

## 19. MOBILE & PC CONTROLS

### PC — Full Keyboard Layout

**Thief (Left Panel):**
```
Movement:   A (left),  D (right)
           ← (left),  → (right)  [alternative]
Jump:       W  |  ↑  |  Space
Stomp:      S  |  ↓
Interact:   E
Use Ability: Q
Use Power-Up: F
```

**Detective (Right Panel — Solo or same-keyboard co-op):**
```
Movement:   ← (left), → (right)
Jump/Grapple: ↑
Slide:      ↓
Interact/Arrest: Enter  |  /
Use Ability: Shift
Use Power-Up: . (period)
```

**Online Multiplayer:** Each player uses their OWN device — both use preferred keys.

**Local Same-Keyboard 2-Player (Bonus Mode):**
- Player 1 (Thief): WASD + E + Q + F
- Player 2 (Detective): Arrow Keys + Enter + Shift + .
- No interference between control sets

### Mobile Touch Controls

**Primary Layout (Right-hand primary):**
```
╔═══════════════════════════════════════════════╗
║                                               ║
║               [ GAME VIEW ]                   ║
║                                               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║   ┌─────┐         ┌──────────────────────┐   ║
║   │  ←  │         │   JUMP / GRAPPLE     │   ║
║   └─────┘         └──────────────────────┘   ║
║                                               ║
║   ┌─────┐  ┌────┐  ┌──────┐  ┌──────────┐   ║
║   │  →  │  │STOMP│  │ABIL. │  │ POWER-UP │   ║
║   └─────┘  └────┘  └──────┘  └──────────┘   ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

**Alternative Gesture Controls (enabled in settings):**
- Swipe Left → Move left
- Swipe Right → Move right
- Swipe Down fast → Stomp
- Tap anywhere → Jump (when not near interactive object)
- Long press → Use ability
- Two-finger tap → Use power-up

**Left-Hand Mode (Mirror):**
- All buttons flipped horizontally
- Jump on bottom-left, movement on right
- Accessible for left-thumb players

**Two-Player on One Device (Landscape):**
```
╔══════════════╦════════════════╦══════════════╗
║  THIEF       ║   COUNTDOWN    ║  DETECTIVE   ║
║  GAME VIEW   ║     CLOCK      ║  GAME VIEW   ║
║              ║                ║              ║
╠══════════════╣                ╠══════════════╣
║ [←][↓↑][→]  ║                ║  [←][↓↑][→] ║
║ [JUMP][AB][PU]                ║ [JUMP][AB][PU]
╚══════════════╩════════════════╩══════════════╝
```
- Controls for each player on their own side of the screen
- Compact layout — 44px minimum touch targets

### Gamepad Support
```javascript
// Gamepad API — standard layout
const GAMEPAD_MAP = {
  leftStickX: 'moveHorizontal',      // Left stick
  leftStickY: 'moveVertical',         // Left stick  
  buttonA: 'jump',                    // A / Cross
  buttonB: 'stomp_or_slide',          // B / Circle
  buttonX: 'interact',                // X / Square
  buttonY: 'powerup',                 // Y / Triangle
  leftBumper: 'ability',              // LB / L1
  startButton: 'pause',               // Start / Options
};

// Checked in InputManager.update() each frame
navigator.getGamepads();
```

---

## 20. TECHNICAL ARCHITECTURE

### System Overview
```
CLIENT (Browser)
│
├── GameEngine.js           ← Main loop (requestAnimationFrame, fixed timestep)
│   ├── update(dt)          ← Physics, input, game logic per frame
│   └── render(alpha)       ← Draw to canvas per frame
│
├── Renderer.js             ← Two-canvas orchestrator
│   ├── canvas-thief        ← Left panel canvas
│   ├── canvas-detective    ← Right panel canvas
│   └── clock-display       ← DOM element (center)
│
├── PhysicsEngine.js        ← AABB collision, gravity, wall-bounce
├── InputManager.js         ← Unified keyboard/touch/gamepad
├── AudioManager.js         ← Web Audio API, adaptive music
├── ParticleSystem.js       ← Canvas particles (impacts, pickups)
│
├── FloorGenerator.js       ← Procedural 40-floor building
├── TimerSystem.js          ← Countdown, events, win detection
├── ThiefController.js      ← Thief movement, ability, HP
├── DetectiveController.js  ← Detective movement, grapple, ability
├── BotAI.js                ← Solo mode opponent AI
├── PowerUpSystem.js        ← Pickup spawning and activation
├── ObjectSystem.js         ← Interactable object registry
├── EnemySystem.js          ← NPC patrol and behavior
│
├── NetworkManager.js       ← WebSocket client (PartyKit)
├── UIManager.js            ← Screen state machine
└── [All screen modules]

SERVER (PartyKit — Cloudflare Workers Edge)
│
└── party.ts                ← Room state, timer authority, relay
    ├── onConnect()         ← Send current state to joiner
    ├── onMessage()         ← Handle player actions
    ├── onClose()           ← Handle disconnect
    └── timerLoop()         ← Server-side timer tick (1s interval)
```

### Game Loop
```javascript
class GameEngine {
  constructor() {
    this.lastTime = 0;
    this.accumulator = 0;
    this.FIXED_STEP = 1000 / 60; // ~16.67ms
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    if (!this.running) return;
    
    let deltaTime = Math.min(timestamp - this.lastTime, 50); // cap at 50ms
    this.lastTime = timestamp;
    this.accumulator += deltaTime;

    // Physics: fixed timestep
    while (this.accumulator >= this.FIXED_STEP) {
      this.update(this.FIXED_STEP / 1000); // in seconds
      this.accumulator -= this.FIXED_STEP;
    }

    // Render: every available frame (interpolated)
    const alpha = this.accumulator / this.FIXED_STEP;
    this.render(alpha);

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    InputManager.update();
    ThiefController.update(dt);
    DetectiveController.update(dt);
    EnemySystem.update(dt);
    PowerUpSystem.update(dt);
    ParticleSystem.update(dt);
    TimerSystem.update(dt);
    if (IS_MULTIPLAYER) NetworkManager.syncState();
    else BotAI.update(dt);
  }

  render(alpha) {
    Renderer.renderPanel('thief', alpha);
    Renderer.renderPanel('detective', alpha);
    UIManager.renderHUD();
    ParticleSystem.render();
  }
}
```

### Physics Engine
```javascript
class PhysicsEngine {
  static GRAVITY = 800;          // px/s²
  static MAX_FALL = 600;         // px/s (terminal velocity)
  static STOMP_SPEED = 1200;     // px/s (downward dash)
  static JUMP_FORCE = -520;      // px/s (upward impulse)
  static MOVE_SPEED = 180;       // px/s horizontal
  
  static update(entity, dt, floors) {
    // Apply gravity
    entity.vy += this.GRAVITY * dt;
    entity.vy = Math.min(entity.vy, this.MAX_FALL);
    
    // Override with stomp
    if (entity.stomping) entity.vy = this.STOMP_SPEED;
    
    // Apply movement
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
    
    // Wall bounce
    if (entity.x <= WALL_LEFT) {
      entity.x = WALL_LEFT;
      entity.vx = Math.abs(entity.vx);
    }
    if (entity.x + entity.width >= WALL_RIGHT) {
      entity.x = WALL_RIGHT - entity.width;
      entity.vx = -Math.abs(entity.vx);
    }
    
    // Floor/ceiling collision
    this.resolveFloorCollisions(entity, floors);
  }
  
  static resolveFloorCollisions(entity, floors) {
    for (const floor of floors) {
      const col = AABB.check(entity, floor);
      if (col) {
        if (col.side === 'bottom' && !entity.stomping) {
          entity.y = floor.y - entity.height;
          entity.vy = 0;
          entity.onGround = true;
        }
        if (col.side === 'top') {
          entity.y = floor.y + floor.height;
          entity.vy = 0;
        }
      }
    }
  }
}
```

### Camera System
```javascript
class Camera {
  constructor(targetYRatio) {
    this.y = 0;
    this.targetY = 0;
    this.LERP = 0.12;
    this.targetYRatio = targetYRatio; // 0.25 for thief, 0.75 for detective
  }

  update(character, panelHeight) {
    const idealY = character.y - panelHeight * this.targetYRatio;
    this.y += (idealY - this.y) * this.LERP;
  }

  applyTransform(ctx) {
    ctx.save();
    ctx.translate(0, -Math.round(this.y));
  }

  restoreTransform(ctx) {
    ctx.restore();
  }
}
```

### Event System (Decoupled Communication)
```javascript
class EventBus {
  constructor() { this.listeners = {}; }
  
  on(event, fn) {
    (this.listeners[event] ??= []).push(fn);
  }
  
  emit(event, data) {
    (this.listeners[event] ?? []).forEach(fn => fn(data));
  }
  
  off(event, fn) {
    this.listeners[event] = (this.listeners[event] ?? []).filter(f => f !== fn);
  }
}
export const Events = new EventBus();

// Usage examples:
Events.emit('timer:changed', { delta: -3, reason: 'camera_smashed' });
Events.emit('player:stunned', { player: 'thief', duration: 3000 });
Events.emit('game:ended', { winner: 'thief', reason: 'timer_expired' });
Events.emit('achievement:unlocked', { id: 'speed_demon' });
Events.emit('floor:entered', { player: 'thief', floor: 28 });
Events.emit('powerup:activated', { player: 'thief', type: 'smoke_bomb' });
Events.emit('bomb:diffused');
Events.emit('bomb:diffuse_failed');
```

---

## 21. TECH STACK & TOOLS

### Frontend Stack
| Component | Technology | Why |
|-----------|-----------|-----|
| Language | Vanilla JavaScript (ES2022) | No build overhead, perfect for game jam |
| Rendering | HTML5 Canvas 2D API | Best 2D sprite rendering, hardware accelerated |
| UI/Menus | HTML + CSS (no framework) | Flexible, zero overhead |
| Bundler | None (or Vite in dev) | Single HTML file works on itch.io |
| Modules | ES Modules (native browser) | No transpiler needed |
| Async | async/await | Asset loading, network |

### Backend Stack
| Component | Technology | Why |
|-----------|-----------|-----|
| Realtime | PartyKit (Cloudflare Workers) | Best free-tier stateful WebSockets for games |
| Language | TypeScript (server only) | PartyKit native |
| Storage | localStorage (client) | Profile, scores, achievements |
| Auth | None (jam scope) | Name chosen by player, no login needed |

### Build Output
- Single `index.html` with ES module imports
- All assets in `/assets/` folder
- Zipped for itch.io upload
- Zip contains: `index.html` at root, `assets/`, `manifest.json`, `sw.js`

### Development Tools
| Tool | Purpose | Cost |
|------|---------|------|
| VS Code | Editor | Free |
| Libresprite | Pixel art sprite creation | Free (open source) |
| GIMP | Image editing, backgrounds | Free |
| bfxr.net | SFX generation | Free (browser-based) |
| Soundraw.io | Music generation | Free tier (5 songs/day) |
| Audacity | Audio editing/trimming | Free |
| Chrome DevTools | Debugging, performance profiling | Free |
| GitHub | Version control | Free |
| PartyKit | Multiplayer hosting | Free for hobby/jam |
| Netlify | Static hosting (web app host) | Free tier |

---

## 22. MULTIPLAYER INFRASTRUCTURE

### PartyKit Server

**server/party.ts:**
```typescript
import type * as Party from "partykit/server";

interface Player {
  id: string;
  role: 'thief' | 'detective' | null;
  ready: boolean;
  floor: number;
  hp: number;
}

interface GameState {
  status: 'waiting' | 'starting' | 'running' | 'ended';
  timer: number;
  bombStatus: 'active' | 'diffused';
  winner: string | null;
  seed: number;
}

export default class HeistParty implements Party.Server {
  players: Map<string, Player> = new Map();
  gameState: GameState = {
    status: 'waiting',
    timer: 300,
    bombStatus: 'active',
    winner: null,
    seed: Math.random()
  };
  timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    if (this.players.size >= 2) {
      conn.send(JSON.stringify({ type: 'room_full' }));
      conn.close();
      return;
    }
    
    const player: Player = {
      id: conn.id, role: null, ready: false, floor: 40, hp: 3
    };
    this.players.set(conn.id, player);
    
    conn.send(JSON.stringify({
      type: 'welcome',
      playerId: conn.id,
      gameState: this.gameState,
      players: [...this.players.values()],
      seed: this.gameState.seed
    }));
    
    this.broadcast({ type: 'player_joined', player }, conn.id);
  }

  onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);
    
    switch(data.type) {
      case 'set_role':
        this.players.get(sender.id)!.role = data.role;
        this.broadcast({ type: 'role_set', playerId: sender.id, role: data.role });
        break;
        
      case 'set_ready':
        this.players.get(sender.id)!.ready = true;
        this.broadcast({ type: 'player_ready', playerId: sender.id });
        this.checkBothReady();
        break;
        
      case 'timer_change':
        // Only accept timer changes during active game
        if (this.gameState.status !== 'running') return;
        
        this.gameState.timer += data.delta;
        this.gameState.timer = Math.max(0, Math.min(720, this.gameState.timer));
        
        this.broadcast({
          type: 'timer_update',
          timer: this.gameState.timer,
          delta: data.delta,
          reason: data.reason
        });
        
        if (this.gameState.timer <= 0) this.endGame('thief_wins_explosion');
        break;
        
      case 'player_state':
        // Relay to other player only
        this.relay(data, sender.id);
        break;
        
      case 'game_event':
        // Events like arrest, escape, stun
        this.handleGameEvent(data, sender.id);
        break;
    }
  }

  private checkBothReady() {
    const players = [...this.players.values()];
    if (players.length === 2 && players.every(p => p.ready)) {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.broadcast({ type: 'game_starting', countdown: 3 });
    setTimeout(() => {
      this.gameState.status = 'running';
      this.startTimer();
      this.broadcast({ type: 'game_started' });
    }, 4000); // 3 second countdown + 1s buffer
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.gameState.status !== 'running') return;
      // Timer managed by timer_change events from clients
      // Server syncs authoritative timer every 5s
      this.broadcast({
        type: 'timer_sync',
        timer: this.gameState.timer
      });
    }, 5000);
  }

  private endGame(result: string) {
    this.gameState.status = 'ended';
    this.gameState.winner = result;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.broadcast({ type: 'game_ended', result });
  }

  private broadcast(data: object, excludeId?: string) {
    const message = JSON.stringify(data);
    for (const [id, _] of this.players) {
      if (id !== excludeId) {
        this.room.getConnection(id)?.send(message);
      }
    }
  }

  private relay(data: object, senderId: string) {
    const message = JSON.stringify(data);
    for (const [id, _] of this.players) {
      if (id !== senderId) {
        this.room.getConnection(id)?.send(message);
      }
    }
  }

  onClose(conn: Party.Connection) {
    this.players.delete(conn.id);
    this.broadcast({ type: 'player_disconnected', playerId: conn.id });
    
    // Pause timer during disconnect
    this.gameState.status = 'waiting';
    this.broadcast({ type: 'game_paused', reason: 'player_disconnected' });
    
    // 10 second reconnect window
    setTimeout(() => {
      if (!this.players.has(conn.id) && this.gameState.status !== 'ended') {
        this.endGame('disconnect_forfeit');
      }
    }, 10000);
  }
}
```

**partykit.json:**
```json
{
  "$schema": "https://www.partykit.io/schema.json",
  "name": "the-heist-clock",
  "main": "server/party.ts",
  "compatibilityDate": "2024-01-01"
}
```

**Client NetworkManager:**
```javascript
class NetworkManager {
  constructor() {
    this.ws = null;
    this.roomCode = null;
    this.playerId = null;
    this.onMessage = null;
    this.onConnect = null;
    this.onDisconnect = null;
  }

  async createRoom() {
    this.roomCode = this.generateCode();
    await this.connect();
    return this.roomCode;
  }

  async joinRoom(code) {
    this.roomCode = code.toUpperCase().trim();
    await this.connect();
  }

  connect() {
    return new Promise((resolve, reject) => {
      const host = 'the-heist-clock.YOUR_USERNAME.partykit.dev';
      const url = `wss://${host}/party/${this.roomCode}`;
      
      this.ws = new WebSocket(url);
      this.ws.onopen = () => { this.onConnect?.(); resolve(); };
      this.ws.onmessage = (e) => this.onMessage?.(JSON.parse(e.data));
      this.ws.onclose = () => this.onDisconnect?.();
      this.ws.onerror = reject;
    });
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  generateCode() {
    // No 0/O, no 1/I — avoids confusion
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  disconnect() { this.ws?.close(); }
}
```

### Latency Strategy
- Position sync: every 50ms (20Hz) — sufficient for this game style (not twitch shooter)
- Timer sync: server authoritative, client updates immediately from events, synced every 5s
- Client-side prediction: character moves instantly on client input
- Server reconciliation: if server state differs by > 5px, snap (smooth via lerp)
- Accepted latency: up to 200ms (game is about planning, not millisecond reactions)

---

## 23. PWA & APP STRATEGY

### Web App Phase (Jam Submission)
The game will be:
1. Uploaded to itch.io as an HTML5 game (zip with index.html at root)
2. Also hosted on GitHub Pages / Netlify as a standalone web app
3. PWA-enabled: installable on both desktop and mobile

### manifest.json
```json
{
  "name": "The Heist Clock",
  "short_name": "HeistClock",
  "description": "Asymmetric split-screen heist game. One bomb. One countdown. Two fates.",
  "start_url": "/",
  "display": "fullscreen",
  "orientation": "any",
  "theme_color": "#0D0F14",
  "background_color": "#0D0F14",
  "lang": "en",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "form_factor": "wide",
      "label": "Split-screen gameplay"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "form_factor": "narrow",
      "label": "Mobile view"
    }
  ]
}
```

### Service Worker (sw.js)
```javascript
const CACHE = 'heist-clock-v1.0.0';
const ASSETS = [
  '/', '/index.html',
  '/assets/sprites/thief-spritesheet.png',
  '/assets/sprites/detective-spritesheet.png',
  '/assets/sprites/objects-spritesheet.png',
  '/assets/audio/music/theme-main.mp3',
  '/assets/audio/music/theme-game-normal.mp3',
  // ... all audio files
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Cache-first for assets, network-first for API
  if (e.request.url.includes('partykit.dev')) return; // Never cache WebSocket API
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

### App Phase (Post-Jam — Capacitor.js)
```bash
# After web game is complete and proven:
npm install @capacitor/core @capacitor/cli
npx cap init "The Heist Clock" "com.heistclock.game"
npx cap add android
npx cap add ios
npx cap copy    # Copy web assets to native projects
npx cap open android  # Open in Android Studio
npx cap open ios      # Open in Xcode
```

**Capacitor Enhancements for Native App:**
- `@capacitor/haptics` — vibration on key game events (stun, arrest, bomb explode)
- `@capacitor/app` — handle back button on Android (pause game)
- `@capacitor/splash-screen` — native splash screen
- `@capacitor/status-bar` — hide status bar (fullscreen game)
- `@capacitor/local-notifications` — push reminders ("Your friend is ready!")

---

## 24. FREE-TIER TOOLS & ASSETS

### Music Generation
| Tool | URL | Free Limit | Plan |
|------|-----|-----------|------|
| Soundraw.io | soundraw.io | 5 songs/day, play anywhere | Use for all 6 tracks over 2 days |
| Beatoven.ai | beatoven.ai | 120 mins/month | Backup if Soundraw hits limit |

**Soundraw Generation Steps:**
1. Go to soundraw.io
2. Select: Genre=Jazz, Mood=Tense
3. Adjust: BPM=95, Length=120s
4. Customize instruments to match spec above
5. Download as MP3
6. Trim/loop in Audacity if needed

### SFX Generation
| Tool | URL | What to Get |
|------|-----|-------------|
| bfxr.net | bfxr.net | Custom: jump, stomp, hit, pickup, stomp (all movement + combat) |
| Kenney.nl | kenney.nl/assets/ui-audio | UI clicks, transitions, notifications |
| Kenney.nl | kenney.nl/assets/impact-sounds | Hit/impact variations |
| Mixkit.co | mixkit.co | Ambient sounds, clock ticks |

**bfxr Usage for Key SFX:**
```
Stomp:    Preset "Hit/Hurt" → Wave Type: Square, Base Freq: 0.4, Attack: 0, Decay: 0.3
Jump:     Preset "Jump" → Wave: Sine, Base Freq: 0.3, Pitch Slide: 0.25
Pickup:   Preset "Pickup/Coin" → Wave: Square, Base Freq: 0.7, Pitch Slide: 0.3
Stun:     Preset "Hit/Hurt" + Vibrato → Freq: 0.2, Depth: 0.3
Grapple:  New Random × 5 → pick closest metallic zip sound
```

### Sprite Art Creation
```
Software: Libresprite (free Aseprite fork)
Download: https://libresprite.github.io/

Character canvas: 24×48px (scale 2x in game → 48×96px rendered)
Objects canvas: 16×16px or 32×32px per object
Color palette: limit to 16 colors per character (elegant restraint)

Workflow:
1. Sketch silhouette first (1 color)
2. Block in main color areas
3. Add highlight and shadow (2 values each)
4. Animate idle first (4 frames) to test feel
5. Animate run (6 frames)
6. Add all other states
7. Export as PNG spritesheet
8. Import into game, set up animation frame data
```

### Fonts (Google Fonts — Free SIL Open Font License)
```html
<!-- In index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Grotesk:wght@700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```
OR download woff2 files from Google Fonts and self-host in `/assets/fonts/`.
Self-hosting preferred for: offline PWA support + faster loading.

### Hosting (All Free)
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| itch.io | Jam submission | Always free for jam games |
| GitHub Pages | Mirror web hosting | Free static hosting |
| Netlify | Alternate host with forms | 100GB bandwidth/month free |
| PartyKit | Multiplayer backend | Free for hobby/jam projects |
| GitHub | Code repository | Free private + public |

---

## 25. PHASE-BY-PHASE BUILD PLAN

### PHASE 0 — PROJECT SETUP (Hours 0-2)
**Goal:** Running skeleton in browser.
```
Tasks:
[ ] Create folder structure (see Section 26)
[ ] index.html with two canvas elements + center clock div
[ ] base.css with CSS variables, reset, layout
[ ] Import Google Fonts
[ ] Verify split-screen layout renders on desktop and mobile
[ ] Set up GitHub repo
[ ] npx partykit@latest init in /server
[ ] Verify PartyKit dev server starts locally (npx partykit dev)
[ ] Create constants.js with all game constants

Deliverable: Empty split-screen visible in browser. Both canvases render.
```

### PHASE 1 — MOVEMENT & PHYSICS (Hours 2-12)
**Goal:** Characters move on their respective panels.
```
Tasks:
[ ] GameEngine.js — main loop (RAF + fixed step)
[ ] Renderer.js — two-canvas draw orchestration
[ ] Camera.js — vertical follow with lerp
[ ] PhysicsEngine.js — gravity, AABB, wall bounce
[ ] InputManager.js — keyboard (WASD + arrows)
[ ] ThiefController.js — move, jump, stomp
[ ] DetectiveController.js — move, jump, grapple (simulated for now)
[ ] Placeholder rectangle characters
[ ] Floor tiles (simple solid rectangles, 3 floors for testing)
[ ] Verify: both characters move independently

Test: Thief can move/jump/stomp on left panel.
      Detective can move/jump/grapple on right panel.
      Both respect wall bouncing and gravity.
```

### PHASE 2 — FLOOR SYSTEM (Hours 12-24)
**Goal:** Full 40-floor building, procedurally generated.
```
Tasks:
[ ] FloorGenerator.js — 40-floor generation
[ ] Floor data structure with theme, objects array, hazards, powerup
[ ] 5 initial floor themes: office, kitchen, bedroom, storage, boiler
[ ] Render floors from data (colored blocks initially)
[ ] Floor hole generation (ceiling hole + floor hole for each floor)
[ ] Thief: falls through floor hole with stomp
[ ] Detective: grapples through ceiling hole
[ ] Multi-floor bathtub mechanic
[ ] Air vent shortcut (2-floor skip)
[ ] Viewport: only render floors ±3 from character's current floor

Test: Thief can descend all 40 floors with stomping.
      Detective can ascend all 40 floors with grappling.
      Each run generates a different layout.
```

### PHASE 3 — TIMER SYSTEM (Hours 24-32)
**Goal:** The countdown clock is functional and fought over.
```
Tasks:
[ ] TimerSystem.js — countdown logic
[ ] Clock DOM element with CSS animations
[ ] Timer visual states: normal / warning / critical
[ ] timer:changed event system
[ ] Timer decrease: security camera smash (-3s)
[ ] Timer increase: radio room (+8s)
[ ] Win detection: timer = 0 → thief wins
[ ] Win detection: thief reaches floor 1 exit → thief wins
[ ] Win detection: detective arrests stunned thief → detective wins
[ ] Basic results screen (text only)
[ ] Stun system: thief HP=0 → stun 3s
[ ] Arrest system: detective on same floor as stunned thief

Test: Timer counts down. Both sides can modify it.
      Game correctly detects all three win conditions.
```

### PHASE 4 — OBJECTS & INTERACTIONS (Hours 32-48)
**Goal:** Rich interactive environment with meaningful objects.
```
Tasks:
[ ] ObjectSystem.js — object registry + activation
[ ] Bathtub interaction (3-floor crash)
[ ] Security camera (thief smash → -3s)
[ ] Radio room (detective activate → +8s)
[ ] Air vent (2-floor shortcut, both players)
[ ] Vending machine (random power-up, 25%)
[ ] Health vial (+1 HP)
[ ] Bookshelf (thief topple → obstacle)
[ ] CCTV monitor (detective: see thief position 3s)
[ ] Evidence kit (detective: +5s)
[ ] PowerUpSystem.js — 5 power-ups each side
[ ] EnemySystem.js — security guard (stuns both, patrols)
[ ] HP system visual (diamond icons thief, badge icons detective)
[ ] Hazards: steam pipe, laser grid

Test: All listed objects have working interactions.
      Enemies patrol and stun players.
      Power-ups can be collected and used.
```

### PHASE 5 — SOLO BOT AI (Hours 48-56)
**Goal:** Playable solo mode vs. three-difficulty bot.
```
Tasks:
[ ] BotAI.js base class with difficulty enum
[ ] Easy bot: slow path, 60% hazard avoidance
[ ] Medium bot: shortcuts, 80% avoidance, 1 ability
[ ] Hard bot: optimal path, 95% avoidance, full abilities
[ ] BFS pathfinding on floor graph
[ ] Role select screen (HTML/CSS)
[ ] Ability select screen (HTML/CSS)
[ ] Difficulty select screen (HTML/CSS)
[ ] Solo score calculation
[ ] Personal best storage in localStorage

Test: Play all 6 combos (Thief Easy/Med/Hard, Detective Easy/Med/Hard).
      Bot behaves distinctly per difficulty.
      Scores saved and displayed.
```

### PHASE 6 — MULTIPLAYER (Hours 56-68)
**Goal:** Two players can play online in real-time.
```
Tasks:
[ ] NetworkManager.js — WebSocket client
[ ] PartyKit server (party.ts) — room, timer authority, relay
[ ] Deploy PartyKit: npx partykit deploy
[ ] Multiplayer menu screen (create/join room)
[ ] Room lobby screen (ready system, role assignment)
[ ] Player state sync (x, y, floor, animation, HP) at 20Hz
[ ] Timer change events synced through server
[ ] Server-authoritative timer sync every 5s
[ ] Opponent mirror (mini-radar on each panel)
[ ] Floor convergence event (same floor = red flash)
[ ] Disconnect handling: 10s reconnect window
[ ] Test on two devices (phone + laptop on same WiFi, then different networks)

Test: Full multiplayer match runs reliably.
      Timer is synchronized on both clients.
      Disconnect and reconnect works.
```

### PHASE 7 — VISUAL POLISH (Hours 68-80)
**Goal:** The game looks premium and elegant.
```
Tasks:
[ ] Draw thief sprite sheet (6 animations) in Libresprite
[ ] Draw detective sprite sheet (6 animations) in Libresprite
[ ] Draw object sprite sheet (20 objects × 3 states)
[ ] Draw enemy sprite sheet (3 enemies)
[ ] Floor tile textures per theme (replace colored blocks)
[ ] Grain texture overlay (CSS filter SVG noise)
[ ] Panel vignette (CSS radial-gradient)
[ ] Parallax background layers (background scrolls at 0.5x)
[ ] Particle system (10 effect types: stomp, pickup, hit, etc.)
[ ] Main menu building silhouette animation
[ ] Results screen newspaper animation (CSS 3D flip)
[ ] Screen transitions (fade through black)
[ ] Countdown clock all visual states
[ ] Timer +/- floating text animation
[ ] Character facing direction (canvas ctx.scale(-1,1) for left-facing)
[ ] Screen shake system (canvas transform)
[ ] Glassmorphism for all popup panels

Test: Game looks like a premium indie production.
      All animations play correctly.
      60fps on desktop.
```

### PHASE 8 — AUDIO (Hours 80-86)
**Goal:** Complete audio experience.
```
Tasks:
[ ] Generate 6 music tracks on Soundraw.io
[ ] Download 30+ SFX from bfxr.net + Kenney.nl
[ ] AudioManager.js with Web Audio API
[ ] Adaptive music: crossfade between states
[ ] Wire movement SFX (step, jump, stomp, grapple, land)
[ ] Wire combat SFX (hit variants, stun, arrest)
[ ] Wire power-up SFX (pickup, activate × 8 types)
[ ] Wire timer SFX (tick, warning, heartbeat, alarm, explode)
[ ] Wire object SFX (camera smash, bookshelf, bathtub, etc.)
[ ] Wire UI SFX (click, transition, achievement, toast)
[ ] Settings volume controls (music + SFX sliders)
[ ] Mute toggle
[ ] iOS audio unlock (AudioContext resume on first touch)

Test: Every action has audio feedback.
      Music transitions correctly on timer state changes.
      Audio works on mobile (requires user gesture).
```

### PHASE 9 — MOBILE & UI COMPLETION (Hours 86-92)
**Goal:** Perfect mobile experience, all screens complete.
```
Tasks:
[ ] Virtual D-pad controls (positioned, styled, touch events)
[ ] Swipe gesture controls (touch event handlers)
[ ] Portrait layout (stacked panels) — test on real phone
[ ] Landscape layout (side-by-side) — test on real phone
[ ] Responsive CSS for all 4 breakpoints
[ ] manifest.json + sw.js (PWA)
[ ] App icons (192px, 512px, maskable 512px) — draw in GIMP/Libresprite
[ ] PWA install prompt UI
[ ] Left-hand mode in settings
[ ] HOW TO PLAY screen (all 5 tabs with illustrated content)
[ ] SETTINGS screen (all controls wired to actual settings)
[ ] PROFILE screen (stats from localStorage)
[ ] 10 achievements implemented and triggerable
[ ] Toast notification system
[ ] All 14 screens verified and navigable

Test: Full game playable on Android Chrome (portrait + landscape).
      Full game playable on iOS Safari.
      PWA can be installed on Android home screen.
```

### PHASE 10 — QA & SUBMISSION (Hours 92-96)
**Goal:** Bug-free submission to GMTK Jam.
```
Tasks:
[ ] 10 solo playthroughs (all 6 combinations + extras)
[ ] 5 multiplayer sessions (local + remote)
[ ] Browser testing: Chrome, Firefox, Edge (Windows desktop)
[ ] Mobile testing: Android Chrome + iOS Safari
[ ] Fix all game-breaking bugs (priority 1)
[ ] Fix visual glitches (priority 2)
[ ] Performance: 60fps desktop, 45fps mobile minimum
[ ] itch.io page setup:
    [ ] Title, short description
    [ ] Tags (action, multiplayer, split-screen, etc.)
    [ ] Pricing: No payment
    [ ] Upload ZIP (index.html at root)
    [ ] Upload 3+ screenshots
    [ ] Upload cover image (630×500px)
    [ ] Visibility: Public
    [ ] Kind: HTML
[ ] GMTK jam submission form:
    [ ] Select game from existing projects
    [ ] Fill theme explanation (see Section 30)
    [ ] Submit
[ ] Verify game appears in jam feed

DELIVERABLE: Submitted, working, beautiful game.
```

---

## 26. FILE & FOLDER STRUCTURE

```
the-heist-clock/
│
├── index.html                      ← Entry point (single HTML file)
├── manifest.json                   ← PWA manifest
├── sw.js                           ← Service worker (offline + installable)
├── package.json                    ← NPM (minimal: partykit dependency only)
│
├── src/
│   ├── main.js                     ← Bootstrap: import all modules, start engine
│   │
│   ├── engine/
│   │   ├── GameEngine.js           ← Main loop, state machine, update/render
│   │   ├── Renderer.js             ← Two-canvas rendering orchestrator
│   │   ├── Camera.js               ← Vertical follow camera with lerp
│   │   ├── PhysicsEngine.js        ← AABB collision, gravity, wall bounce
│   │   ├── InputManager.js         ← Keyboard + touch + gamepad unified
│   │   ├── AudioManager.js         ← Web Audio API, adaptive music
│   │   └── ParticleSystem.js       ← Canvas-based particle effects
│   │
│   ├── game/
│   │   ├── FloorGenerator.js       ← Procedural 40-floor building generator
│   │   ├── TimerSystem.js          ← Countdown, timer events, win detection
│   │   ├── ThiefController.js      ← Thief movement, abilities, HP
│   │   ├── DetectiveController.js  ← Detective movement, grapple, abilities
│   │   ├── BotAI.js                ← AI opponent for solo mode
│   │   ├── PowerUpSystem.js        ← Spawn, collect, activate power-ups
│   │   ├── ObjectSystem.js         ← Interactable object logic
│   │   ├── EnemySystem.js          ← NPC patrol + attack behavior
│   │   ├── AchievementSystem.js    ← Track + unlock achievements
│   │   └── ScoreSystem.js          ← Score calculation + localStorage
│   │
│   ├── network/
│   │   ├── NetworkManager.js       ← WebSocket client, room management
│   │   └── RoomCodeGenerator.js    ← 6-char alphanumeric codes
│   │
│   ├── ui/
│   │   ├── UIManager.js            ← Screen state machine + transitions
│   │   ├── screens/
│   │   │   ├── SplashScreen.js     ← Loading screen
│   │   │   ├── HomeScreen.js       ← Main menu
│   │   │   ├── SoloSetupScreen.js  ← Role + ability + difficulty select
│   │   │   ├── MultiplayerScreen.js← Create/join room
│   │   │   ├── LobbyScreen.js      ← Pre-game lobby
│   │   │   ├── GameHUD.js          ← In-game overlay (HP, clock, radar)
│   │   │   ├── PauseScreen.js      ← Pause overlay
│   │   │   ├── ResultsScreen.js    ← Post-game results
│   │   │   ├── HowToPlayScreen.js  ← Tutorial (5 tabs)
│   │   │   ├── SettingsScreen.js   ← Settings panel
│   │   │   └── ProfileScreen.js    ← Stats + achievements
│   │   └── components/
│   │       ├── Button.js           ← Button component factory
│   │       ├── Modal.js            ← Popup modal base
│   │       ├── Toast.js            ← Toast notification manager
│   │       ├── ClockDisplay.js     ← Countdown clock DOM element
│   │       ├── HPDisplay.js        ← HP icons (diamonds/badges)
│   │       ├── MobileControls.js   ← Virtual D-pad + buttons
│   │       └── MiniRadar.js        ← Building silhouette with player dots
│   │
│   ├── data/
│   │   ├── floorThemes.js          ← 18 floor theme definitions
│   │   ├── objects.js              ← Object type registry (behavior, sprite)
│   │   ├── enemies.js              ← Enemy type definitions
│   │   ├── powerups.js             ← Power-up registry
│   │   ├── abilities.js            ← Special ability definitions
│   │   └── achievements.js         ← 18 achievement definitions
│   │
│   └── utils/
│       ├── math.js                 ← lerp, clamp, randomRange, seedRandom
│       ├── storage.js              ← localStorage get/set/clear wrapper
│       ├── events.js               ← EventBus (EventEmitter pattern)
│       └── constants.js            ← All game constants (gravity, speeds, etc.)
│
├── assets/
│   ├── sprites/
│   │   ├── thief-spritesheet.png   ← All thief animations (512×256px)
│   │   ├── detective-spritesheet.png← All detective animations
│   │   ├── objects-spritesheet.png ← 20+ objects × 3 states (1024×512px)
│   │   ├── enemies-spritesheet.png ← 5 enemy types
│   │   ├── ui-icons.png            ← HP icons, power-up icons, etc.
│   │   └── particles.png           ← Particle atlas
│   │
│   ├── audio/
│   │   ├── music/
│   │   │   ├── theme-main.mp3
│   │   │   ├── theme-game-normal.mp3
│   │   │   ├── theme-game-warning.mp3
│   │   │   ├── theme-game-critical.mp3
│   │   │   ├── sting-thief-win.mp3
│   │   │   └── sting-detective-win.mp3
│   │   └── sfx/
│   │       ├── movement/           ← step-thief, step-detective, jump, stomp, etc.
│   │       ├── combat/             ← hit-1 through hit-3, stun, arrest, etc.
│   │       ├── powerups/           ← pickup, smoke-bomb, tracker, etc.
│   │       ├── timer/              ← tick, warning-tick, heartbeat, alarm, explode
│   │       ├── objects/            ← camera-smash, bathtub-crash, vent-enter, etc.
│   │       └── ui/                 ← btn-click, transition, achievement, etc.
│   │
│   └── fonts/
│       ├── Outfit-Variable.woff2   ← Variable font (300-700 weight range)
│       ├── SpaceGrotesk-Bold.woff2
│       └── JetBrainsMono-Regular.woff2
│
├── server/
│   ├── party.ts                    ← PartyKit game room server
│   └── partykit.json               ← PartyKit configuration
│
├── icons/
│   ├── icon-192.png                ← PWA icon (192×192)
│   ├── icon-512.png                ← PWA icon (512×512)
│   └── icon-maskable-512.png       ← PWA maskable icon (512×512)
│
└── screenshots/
    ├── gameplay-desktop.png        ← 1280×720 for itch.io + PWA
    ├── gameplay-mobile.png         ← 390×844 for PWA
    └── results-screen.png          ← 1280×720
```

---

## 27. PERFORMANCE & OPTIMIZATION

### Target Performance Metrics
| Device | Target FPS | Minimum FPS |
|--------|-----------|------------|
| Desktop (modern) | 60fps | 60fps |
| Desktop (mid-range) | 60fps | 45fps |
| Android (mid-range) | 45-60fps | 30fps |
| iOS (iPhone 12+) | 60fps | 45fps |
| iOS (older) | 30-45fps | 30fps |

### Rendering Optimizations
```javascript
// Only render floors within viewport
renderVisibleFloors(ctx, camera) {
  const viewTop = camera.y - 160;     // 1 floor above viewport
  const viewBottom = camera.y + PANEL_HEIGHT + 160; // 1 floor below

  for (const floor of this.floors) {
    const floorY = floor.index * FLOOR_HEIGHT;
    if (floorY >= viewTop && floorY <= viewBottom) {
      this.renderFloor(ctx, floor, camera);
    }
  }
}

// Pre-render static floor backgrounds to offscreen canvas
preRenderFloorBg(floor) {
  const offscreen = new OffscreenCanvas(FLOOR_WIDTH, FLOOR_HEIGHT);
  const ctx = offscreen.getContext('2d');
  // Draw floor background, walls, static decorations once
  floor.cachedBg = offscreen;
}

// In render loop — just draw pre-rendered bg
ctx.drawImage(floor.cachedBg, 0, floorY);
// Then draw dynamic elements (characters, enemies, items) on top
```

### Particle System Budget
```javascript
class ParticleSystem {
  constructor() {
    this.pool = Array.from({length: 200}, () => new Particle());
    this.active = [];
  }

  // Object pool pattern — never allocate during gameplay
  emit(x, y, type) {
    const particle = this.pool.find(p => !p.active);
    if (particle) {
      particle.reset(x, y, type);
      this.active.push(particle);
    }
    // If pool empty, skip (drop particle rather than allocate)
  }

  update(dt) {
    this.active = this.active.filter(p => {
      p.update(dt);
      if (!p.active) this.pool.push(p);
      return p.active;
    });
  }
}
```

### Audio Optimization
```javascript
// Pre-load all audio at start
// Use AudioBuffer (not HTML Audio elements) — no garbage collection spikes
// Pool AudioBufferSourceNode (create per-play, GC-friendly)

playSound(key, volume = 1) {
  const buffer = this.buffers[key];
  if (!buffer) return;
  
  const source = this.context.createBufferSource();
  const gain = this.context.createGain();
  
  source.buffer = buffer;
  gain.gain.value = volume * this.sfxVolume;
  
  source.connect(gain);
  gain.connect(this.masterGain);
  source.start(0);
  // Source auto-GCs when done (by spec)
}
```

### Memory Management
- Pre-generate all 40 floors at game start (one-time cost)
- Only keep 5 floors of objects in active memory (lazy-load ahead)
- Clear event listeners on screen exit (prevent memory leaks)
- Particle pool: pre-allocated, no new object creation during gameplay
- Image assets: loaded once, referenced — never re-fetched

### Network Optimization
- Send only CHANGED state values (delta compression)
- Batch multiple events in single WebSocket message
- Timer events: immediate + periodic sync (not per-frame)
- Disconnect: graceful close with final state broadcast

---

## 28. ACCESSIBILITY

### Visual
- All text: minimum 4.5:1 contrast ratio (WCAG AA)
- Color-blind safe: thief amber (#D4A017) vs detective blue (#4A9ECC) — distinguishable under all common CVD types (deuteranopia, protanopia, tritanopia)
- Never convey information by color alone — icons always accompany color-coded elements
- Reduced Motion mode in settings: disables shake, reduces particle intensity, simplifies transitions

### Keyboard Navigation
- All menu screens fully navigable with Tab/Shift+Tab
- Enter/Space activates focused elements
- Escape closes/backs out of any overlay
- Focus-visible CSS ensures clear focus indicators:
```css
:focus-visible {
  outline: 2px solid var(--thief-primary);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Screen Reader Support (Menus Only — Not In-Game)
- `role="button"` on all interactive elements
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on toast notification container
- `aria-pressed` on toggle buttons (settings)
- `role="region"` + `aria-label` on each game panel during gameplay

### Touch Accessibility
- Minimum touch target: 44×44px (Apple HIG standard)
- Contextual buttons appear near the relevant game area (Interact button near object)
- No reliance on multi-touch gestures for core gameplay
- All gestures have button alternatives

### Cognitive Accessibility
- Tutorial hints on first playthrough (togglable in settings)
- Clear win/lose messaging with visual + audio feedback
- Pause always available (Escape or menu button)
- No time pressure in menus (menus don't auto-proceed)

---

## 29. POST-JAM EXPANSION ROADMAP

### v1.1 — Polish (1-2 weeks post-jam)
- 5 additional floor themes (Hospital, Nightclub, Parking Garage, Lab, Art Gallery fully detailed)
- Casino floor mini-game full implementation
- Local leaderboard for all 6 solo modes
- 8 more achievements (total 18/18)
- Spectator mode (3rd connection can watch a room)
- Performance optimizations from jam feedback
- Bug fixes from community play

### v1.2 — Content (Month 1-2)
- 5 character variants (different thief skins, different detective skins)
- 3 building themes visually: Industrial, Luxury Hotel, Government (same mechanics, different art)
- Daily challenge: seeded run everyone gets the same building
- Run replay system (record inputs, play back)
- Stats dashboard with graphs
- Discord-friendly share card (canvas-generated result image)

### v2.0 — Online Infrastructure (Month 2-4)
- Supabase auth (email + Google login)
- Persistent player profiles in database
- Global leaderboard (per-role, per-difficulty)
- Auto-matchmaking (find a random opponent)
- ELO rating system for ranked matches
- Friend system (add by username)
- Tournament bracket mode (8 players)
- Season system with cosmetic end-season rewards

### v2.5 — Mobile App (Month 4-6)
- Capacitor.js wrapper for Android + iOS
- Haptic feedback on key events (phone vibrates on stun, arrest, bomb)
- Push notifications ("Challenge accepted!", "It's your turn!")
- Full native feel (status bar hide, back button, safe areas)
- App Store (iOS) submission
- Google Play submission
- Cross-play: web ↔ app (same servers, same rooms)

### v3.0 — Platform + Creator (6+ months)
- Electron desktop app
- Level editor: design your own building layouts
- Community workshop: share + rate custom buildings
- Modding API for custom objects, enemies, themes
- Localization: 6 languages (EN, ES, FR, DE, JP, PT)
- Possible console ports if player base warrants

### Monetization Philosophy (If Commercializing)
```
ALWAYS FREE:
  - Core game (solo + online multiplayer)
  - All gameplay mechanics
  - Regular content updates

ONE-TIME PURCHASE ($2.99 or free with jam):
  - Character skin pack (5 alternate thieves, 5 alternate detectives)
  - Building theme pack (3 visual themes)
  
NEVER:
  - Ads
  - Pay-to-win
  - Gameplay advantages for money
  - Subscription

Inspired by: Among Us model (simple, one-time, community-driven)
```

---

## 30. GMTK SUBMISSION CHECKLIST

### Technical Requirements
```
[ ] Game runs in browser — no downloads, no plugins
[ ] Playable with keyboard and mouse only (no special hardware)
[ ] Works on Windows PC in Chrome, Firefox, Edge
[ ] No console errors in production
[ ] Game can be started, played through, and restarted fully
[ ] All screens navigable without getting stuck
[ ] Audio plays (after first user interaction)
[ ] Multiplayer (bonus — jam judges may test)
```

### Content Requirements (GMTK Rules)
```
[ ] No AI-generated art — all sprites hand-drawn in Libresprite
[ ] No AI-generated audio — music from Soundraw (human-parameterized, not AI-authored)
     NOTE: Soundraw uses AI generation — verify GMTK rules on this.
     SAFE ALTERNATIVE: Use Kenney.nl music packs (human-authored, CC0)
[ ] No strong language
[ ] No nudity
[ ] No hateful content/visuals
[ ] Game is suitable for general audience
[ ] External assets credited (Kenney.nl, fonts, etc.)
```

### itch.io Page
```
[ ] Name: The Heist Clock
[ ] Short Description (< 160 chars):
    "Asymmetric split-screen heist game. 
     Both players fight over the same countdown timer.
     One escapes. One hunts. One clock."
     
[ ] Full Description:
    See Section below
    
[ ] Tags: action, multiplayer, split-screen, asymmetric, heist, arcade,
         countdown, singleplayer, mobile-friendly, web
         
[ ] Genre: Platformer / Action
[ ] Pricing: No payment (required)
[ ] Kind: HTML
[ ] Visibility: Public
[ ] Cover image: 630×500px uploaded
[ ] At least 3 screenshots uploaded
[ ] Zip uploaded with index.html at root
```

### itch.io Full Game Description
```
THE HEIST CLOCK

One diamond. One bomb. One countdown timer.
Two players fighting over every second.

━━━━━━━━━━━━━━━━━━━━━━

THE HEIST
CIPHER stole the Azure Diamond from the top floor of Castellan Tower.
On the way in, they planted a time bomb on floor 1.
Insurance. Chaos. A diversion.

THE PURSUIT  
VALE is the only detective who noticed.
Now they're racing to diffuse the bomb — and catch the thief.

THE COUNTDOWN
One shared bomb timer. 
But here's the twist: both players control it.

▸ THIEF destroys cameras, finds shortcuts → timer goes DOWN faster
▸ DETECTIVE restores power, finds evidence → timer ADDS back up

If the timer hits 0, the bomb explodes — and CIPHER escapes in the chaos.
But if VALE makes the arrest... CIPHER is done.

━━━━━━━━━━━━━━━━━━━━━━

GAME MODES
🎮 SOLO — Play as Thief or Detective against a smart AI bot
         Choose from Easy / Medium / Hard difficulty

👥 MULTIPLAYER — Share a room code with a friend
                Online, real-time, split-screen on your own device
                Manual or random role assignment

━━━━━━━━━━━━━━━━━━━━━━

FEATURES
• Split-screen: left panel (Thief going DOWN), right panel (Detective going UP)
• 40 procedurally generated floors — different every run
• 18 floor themes: Office, Casino, Kitchen, Library, Nightclub, and more
• Bathtub crashes (fall through 3 floors at once!), air vents, elevator shafts
• Choose from 5 unique abilities before each match
• 8 power-ups per role — smoke bombs, tracker darts, time crystals
• Adaptive music that intensifies as the timer drops
• Fully playable on mobile and PC
• Installable as a web app (PWA)

━━━━━━━━━━━━━━━━━━━━━━

CONTROLS
PC: WASD to move | Space to jump | S to stomp | E to interact | Q for ability
Mobile: Virtual D-pad + on-screen buttons (or swipe gestures)

━━━━━━━━━━━━━━━━━━━━━━

CREDITS
Design & Code: [Your Name]
Art: [Your Name]
Music: Generated via Soundraw.io
Sound Effects: Kenney.nl (CC0) + custom bfxr.net sounds
Fonts: Outfit, Space Grotesk, JetBrains Mono (Google Fonts)
Multiplayer: PartyKit

Made in 96 hours for GMTK Game Jam 2026 | Theme: COUNT DOWN
```

### Theme Justification (GMTK Form)
```
How does your game fit the theme COUNT DOWN?

THE HEIST CLOCK uses COUNT DOWN in three interlocking ways simultaneously:

1. LITERAL — A bomb countdown timer (5:00 by default) is the visual and 
   mechanical centerpiece of every match. It dominates the center of the 
   screen, visible to both players at all times.

2. STRUCTURAL — Both characters physically COUNT DOWN (and up) the building.
   The Thief descends from Floor 40 counting DOWN to Floor 1.
   The Detective ascends from Floor 1 counting UP through the same building.
   The floors are a physical countdown made spatial.

3. MECHANICAL INNOVATION — This is our core design idea:
   The countdown is not a neutral, passive timer. It is a WEAPON that both 
   players fight over simultaneously.
   
   The Thief performs actions that ACCELERATE the countdown (destroy cameras,
   use shortcuts, detonate floor charges) — because they want the bomb to 
   explode sooner, creating chaos that covers their escape.
   
   The Detective performs actions that SLOW or REVERSE the countdown (restore 
   power, find evidence, diffuse the bomb) — because they want more time to 
   catch the thief.
   
   Every second of the countdown is contested. Every timer event is caused by 
   one player, and felt immediately by both. This makes "COUNT DOWN" not just 
   a backdrop — it IS the game's core conflict.
```

---

## APPENDIX A: ALL GAME CONSTANTS

```javascript
// src/utils/constants.js

export const BUILDING = {
  TOTAL_FLOORS: 40,
  FLOOR_HEIGHT: 160,        // px
  FLOOR_WIDTH: 360,         // px per panel
  WALL_THICKNESS: 16,       // px
};

export const TIMER = {
  EASY: 420,                // 7:00
  MEDIUM: 300,              // 5:00
  HARD: 210,                // 3:30
  MULTIPLAYER: 300,         // 5:00 (fixed)
  MAX: 720,                 // 12:00 (cap to prevent infinite adding)
  
  STATE_WARNING: 120,       // 2:00 — orange
  STATE_CRITICAL: 60,       // 1:00 — red
  STATE_ALARM: 30,          // 0:30 — alarm SFX
  STATE_FINAL: 10,          // 0:10 — full panic
};

export const PHYSICS = {
  GRAVITY: 800,             // px/s²
  MAX_FALL_SPEED: 600,      // px/s
  STOMP_SPEED: 1200,        // px/s (forced downward)
  JUMP_FORCE: -520,         // px/s (upward impulse, negative = up)
  MOVE_SPEED: 180,          // px/s (normal walk)
  SPRINT_SPEED: 300,        // px/s (sprint)
  GRAPPLE_SPEED: 400,       // px/s (detective upward pull)
};

export const CAMERA = {
  LERP_SPEED: 0.12,
  THIEF_Y_RATIO: 0.25,      // Character in upper-25% of panel
  DETECTIVE_Y_RATIO: 0.75,  // Character in lower-25% of panel
  SHAKE_INTENSITY: 6,       // px — max shake offset
  SHAKE_DECAY: 0.85,        // multiplier per frame
};

export const PLAYER = {
  WIDTH: 24,                // px (base sprite)
  HEIGHT: 48,               // px (base sprite)
  RENDER_SCALE: 2,          // renders at 2x: 48×96
  
  THIEF_HP: 3,
  DETECTIVE_HP: 3,
  STUN_DURATION_THIEF: 3000,     // ms
  STUN_DURATION_DETECTIVE: 4000, // ms
  ARREST_WINDOW: 3000,           // ms — detective must arrest within this
  INVINCIBLE_AFTER_HIT: 1500,    // ms — brief invincibility after damage
};

export const ENEMY = {
  GUARD_SPEED: 80,          // px/s patrol speed
  GUARD_DETECT_RANGE: 120,  // px — radius for spot
  JANITOR_THROW_SPEED: 200, // px/s projectile
  DRONE_SPEED: 100,         // px/s horizontal drift
};

export const NETWORK = {
  SYNC_RATE: 20,            // Hz — player state updates per second
  TIMER_SYNC_INTERVAL: 5000,// ms — authoritative timer sync from server
  RECONNECT_TIMEOUT: 10000, // ms — reconnect window
  RECONNECT_ATTEMPTS: 3,    // number of auto-reconnect tries
  MAX_PLAYERS_PER_ROOM: 2,
  ROOM_CODE_LENGTH: 6,
};

export const PARTICLES = {
  POOL_SIZE: 200,
  MAX_ACTIVE: 150,          // never more than this active simultaneously
  STOMP_COUNT: 12,          // particles per stomp
  HIT_COUNT: 6,             // particles per hit
  PICKUP_COUNT: 8,          // particles per item pickup
};

export const AUDIO = {
  MASTER_VOLUME: 1.0,
  MUSIC_VOLUME: 0.7,        // default
  SFX_VOLUME: 0.85,         // default
  MUSIC_FADE_DURATION: 1500,// ms crossfade
  TICK_INTERVAL: 1000,      // ms — timer tick sound
};

export const SCORE = {
  FLOOR_CLEAR: 10,
  ENEMY_EVADE: 25,
  SHORTCUT_BONUS: 50,
  ESCAPE_BONUS: 100,
  EXPLOSION_BONUS: 200,     // thief: bomb hits 0 during play
  ARREST_BONUS: 100,        // detective
  DIFFUSE_BONUS: 50,        // detective: bomb diffused
  PERFECT_FLOOR: 5,         // no damage on floor
};

export const ANIMATION = {
  // Frame counts per animation
  IDLE_FRAMES: 4,
  RUN_FRAMES: 6,
  JUMP_FRAMES: 4,
  STOMP_FRAMES: 5,
  GRAPPLE_FRAMES: 6,
  HIT_FRAMES: 3,
  STUN_FRAMES: 6,
  ARREST_FRAMES: 8,
  VICTORY_FRAMES: 8,

  // Durations in ms
  IDLE_FRAME_MS: 200,       // 800ms / 4 frames
  RUN_FRAME_MS: 67,         // 400ms / 6 frames
  STUN_FRAME_MS: 200,       // 1200ms / 6 frames
  VICTORY_FRAME_MS: 200,    // 1600ms / 8 frames
};
```

---

## APPENDIX B: SPRITESHEET ANIMATION DATA

```javascript
// src/data/animations.js

export const THIEF_ANIMATIONS = {
  idle:     { row: 0, frames: [0,1,2,3],           frameDuration: 200 },
  run:      { row: 1, frames: [0,1,2,3,4,5],       frameDuration: 67  },
  jump:     { row: 2, frames: [0,1,2,3],            frameDuration: 100 },
  fall:     { row: 2, frames: [3],                  frameDuration: 100 }, // hold last jump frame
  stomp:    { row: 3, frames: [0,1,2,3,4],          frameDuration: 40  },
  land:     { row: 3, frames: [4],                  frameDuration: 100 },
  hit:      { row: 4, frames: [0,1,2],              frameDuration: 80  },
  stun:     { row: 4, frames: [3,4,5,4,3,2],       frameDuration: 200 },
  victory:  { row: 5, frames: [0,1,2,3,4,5,6,7],   frameDuration: 200 },
  defeat:   { row: 5, frames: [8,9,10,11,11],       frameDuration: 150 },
};

export const DETECTIVE_ANIMATIONS = {
  idle:     { row: 0, frames: [0,1,2,3],            frameDuration: 225 },
  run:      { row: 1, frames: [0,1,2,3,4,5],        frameDuration: 70  },
  jump:     { row: 2, frames: [0,1,2,3],             frameDuration: 80  },
  grapple:  { row: 2, frames: [4,5,6,7,8,9],        frameDuration: 60  },
  slide:    { row: 3, frames: [0,1,2],               frameDuration: 60  },
  hit:      { row: 4, frames: [0,1,2],               frameDuration: 80  },
  stun:     { row: 4, frames: [3,4,5,4,3,2],        frameDuration: 200 },
  arrest:   { row: 5, frames: [0,1,2,3,4,5,6,7],    frameDuration: 120 }, // slower = cinematic
  victory:  { row: 5, frames: [8,9,10,11,12,13,14,15], frameDuration: 200 },
};
```

---

## APPENDIX C: FLOOR THEME DEFINITIONS

```javascript
// src/data/floorThemes.js (complete)

export const FLOOR_THEMES = {
  office: {
    id: 'office',
    name: 'Office',
    bgColor: '#161B2A',
    floorColor: '#1E2535',
    accentColor: '#4A6FA5',
    objects: ['desk', 'computer', 'filing_cabinet', 'office_chair', 'water_cooler', 'whiteboard'],
    hazards: ['falling_monitor', 'electrical_socket'],
    enemies: ['security_guard'],
    thief_favor: 0.5,     // neutral
    detective_favor: 0.5,
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    bgColor: '#1A1F15',
    floorColor: '#222817',
    accentColor: '#8A7A5A',
    objects: ['stove', 'fridge', 'pot', 'counter', 'microwave', 'sink'],
    hazards: ['steam_burst', 'grease_fire'],
    enemies: ['angry_chef'],
    thief_favor: 0.4,     // slight detective favor (harder room)
    detective_favor: 0.6,
  },
  bathroom: {
    id: 'bathroom',
    name: 'Bathroom',
    bgColor: '#161E20',
    floorColor: '#1E2A2D',
    accentColor: '#6AB8C8',
    objects: ['bathtub', 'toilet', 'mirror', 'sink', 'towel_rack'],
    hazards: ['slippery_floor'],
    enemies: [],
    special: 'bathtub_multifloor',
    thief_favor: 0.7,     // bathtub heavily favors thief (multi-floor)
    detective_favor: 0.3,
  },
  casino: {
    id: 'casino',
    name: 'Casino',
    bgColor: '#150E1F',
    floorColor: '#1D1528',
    accentColor: '#C8A020',
    objects: ['slot_machine', 'card_table', 'chip_stack', 'roulette_wheel', 'chandelier'],
    hazards: [],
    enemies: [],
    special: 'casino_minigame',
    thief_favor: 0.5,
    detective_favor: 0.5,
  },
  server_room: {
    id: 'server_room',
    name: 'Server Room',
    bgColor: '#0E1620',
    floorColor: '#141F2D',
    accentColor: '#20A0CC',
    objects: ['server_rack', 'cable_bundle', 'terminal', 'cooling_unit'],
    hazards: ['sparking_wire', 'robot_sentry'],
    enemies: ['robot_sentry'],
    special: 'emp_zone',
    thief_favor: 0.4,
    detective_favor: 0.6,
  },
  bedroom: {
    id: 'bedroom',
    name: 'Bedroom',
    bgColor: '#1A1520',
    floorColor: '#22202A',
    accentColor: '#806090',
    objects: ['bed', 'wardrobe', 'bedside_lamp', 'mirror', 'rug'],
    hazards: [],
    enemies: [],
    special: 'bed_bounce',
    thief_favor: 0.6,     // bed bounce pad favors thief
    detective_favor: 0.4,
  },
  storage: {
    id: 'storage',
    name: 'Storage',
    bgColor: '#181512',
    floorColor: '#201C18',
    accentColor: '#8A6030',
    objects: ['crate', 'barrel', 'pallet', 'shelf_unit', 'forklift'],
    hazards: ['falling_crate'],
    enemies: [],
    thief_favor: 0.5,
    detective_favor: 0.5,
  },
  gym: {
    id: 'gym',
    name: 'Gym',
    bgColor: '#181A14',
    floorColor: '#202416',
    accentColor: '#90A040',
    objects: ['barbell', 'treadmill', 'punching_bag', 'locker', 'bench'],
    hazards: ['swinging_barbell'],
    enemies: ['security_guard'],
    thief_favor: 0.45,
    detective_favor: 0.55,
  },
  library: {
    id: 'library',
    name: 'Library',
    bgColor: '#151214',
    floorColor: '#1C1820',
    accentColor: '#806844',
    objects: ['bookshelf', 'reading_table', 'ladder', 'lamp', 'armchair'],
    hazards: [],
    enemies: ['angry_librarian'],
    special: 'bookshelf_topple',
    thief_favor: 0.55,    // bookshelf topple helps thief
    detective_favor: 0.45,
  },
  security_room: {
    id: 'security_room',
    name: 'Security Room',
    bgColor: '#101518',
    floorColor: '#15202A',
    accentColor: '#3A6080',
    objects: ['cctv_bank', 'radio_console', 'key_cabinet', 'desk', 'coffee_maker'],
    hazards: [],
    enemies: ['security_guard', 'security_guard'], // always has guards
    special: 'cctv_intel',
    thief_favor: 0.3,     // detective heavily favored (cameras, radio)
    detective_favor: 0.7,
  },
  boiler_room: {
    id: 'boiler_room',
    name: 'Boiler Room',
    bgColor: '#1A1210',
    floorColor: '#221810',
    accentColor: '#C05020',
    objects: ['boiler', 'pipe_cluster', 'valve', 'pressure_gauge'],
    hazards: ['steam_burst', 'hot_pipe'],
    enemies: [],
    special: 'bomb_location',  // Only on floor 1
    thief_favor: 0.4,
    detective_favor: 0.6,
  },
  penthouse: {
    id: 'penthouse',
    name: 'Penthouse Lounge',
    bgColor: '#14121A',
    floorColor: '#1C1828',
    accentColor: '#C8A030',
    objects: ['diamond_case', 'luxury_sofa', 'bar_cabinet', 'grand_piano', 'art_piece'],
    hazards: ['broken_glass'],
    enemies: [],
    special: 'story_start',   // Only on floor 40
    thief_favor: 0.7,
    detective_favor: 0.3,
  },
  // ... hospital, nightclub, art_gallery, lab, parking_garage defined similarly
};
```

---

## APPENDIX D: ACHIEVEMENT DEFINITIONS

```javascript
// src/data/achievements.js

export const ACHIEVEMENTS = [
  {
    id: 'first_heist',
    name: 'First Heist',
    description: 'Complete your first solo game',
    icon: '🎭',
    condition: (stats) => stats.gamesPlayed >= 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Escape as Thief in under 2 minutes',
    icon: '⚡',
    condition: (stats) => stats.lastRunTimeSeconds < 120 && stats.lastRole === 'thief' && stats.lastResult === 'escape',
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    description: 'Complete a game without taking any damage',
    icon: '💎',
    condition: (stats) => stats.lastDamageTaken === 0 && stats.gamesCompleted > 0,
  },
  {
    id: 'close_call',
    name: 'Close Call',
    description: 'Escape as Thief with less than 10 seconds on the timer',
    icon: '😅',
    condition: (stats) => stats.lastTimerOnEscape < 10 && stats.lastRole === 'thief',
  },
  {
    id: 'bomb_squad',
    name: 'Bomb Squad',
    description: 'Diffuse the bomb in under 5 seconds as Detective',
    icon: '💣',
    condition: (stats) => stats.lastDiffuseTime < 5 && stats.lastRole === 'detective',
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Win as Detective with only 1 HP remaining',
    icon: '🔰',
    condition: (stats) => stats.lastHP === 1 && stats.lastRole === 'detective' && stats.lastResult === 'arrest',
  },
  {
    id: 'floor_crusher',
    name: 'Floor Crusher',
    description: 'Stomp through 200 floors total',
    icon: '🦶',
    condition: (stats) => stats.lifetimeStomps >= 200,
  },
  {
    id: 'smoke_mirrors',
    name: 'Smoke & Mirrors',
    description: 'Use the Smoke Bomb power-up 20 times',
    icon: '🌫️',
    condition: (stats) => stats.lifetimeSmokeBombs >= 20,
  },
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Escape as Thief without triggering any security cameras',
    icon: '👻',
    condition: (stats) => stats.lastCamerasTriggered === 0 && stats.lastRole === 'thief' && stats.lastResult === 'escape',
  },
  {
    id: 'hot_pursuit',
    name: 'Hot Pursuit',
    description: 'Arrest the Thief when they are within 2 floors of the exit',
    icon: '🚔',
    condition: (stats) => stats.lastArrestFloor <= 3 && stats.lastRole === 'detective',
  },
  {
    id: 'master_thief',
    name: 'Master Thief',
    description: 'Win 10 multiplayer games as Thief',
    icon: '🕵️',
    condition: (stats) => stats.multiplayerThiefWins >= 10,
  },
  {
    id: 'top_detective',
    name: 'Top Detective',
    description: 'Win 10 multiplayer games as Detective',
    icon: '🔍',
    condition: (stats) => stats.multiplayerDetectiveWins >= 10,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Win 5 games as each role',
    icon: '⚖️',
    condition: (stats) => stats.thiefWins >= 5 && stats.detectiveWins >= 5,
  },
  {
    id: 'casino_royale',
    name: 'Casino Royale',
    description: 'Collect maximum payout on a casino floor',
    icon: '🎰',
    condition: (stats) => stats.lastCasinoMaxPayout === true,
  },
  {
    id: 'bathtub_bandit',
    name: 'Bathtub Bandit',
    description: 'Use the bathtub multi-floor crash 10 times total',
    icon: '🛁',
    condition: (stats) => stats.lifetimeBathtubUses >= 10,
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win a game after reaching 1 HP',
    icon: '👑',
    condition: (stats) => stats.lastMinHP === 1 && stats.lastResult !== 'lose',
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Complete a game without using any power-ups',
    icon: '🥷',
    condition: (stats) => stats.lastPowerUpsUsed === 0 && stats.gamesCompleted > 0,
  },
  {
    id: 'veteran',
    name: 'GMTK Veteran',
    description: 'Play 30 games in total',
    icon: '🎮',
    condition: (stats) => stats.gamesPlayed >= 30,
  },
];
```

---

*End of THE HEIST CLOCK Master Game Plan*
*Version: 1.0 | GMTK Game Jam 2026 | Theme: COUNT DOWN*
*"One Diamond. One Bomb. Two Stories. One Countdown."*

---

**HOW TO USE THIS DOCUMENT:**
This is the ONLY document you need to build the complete game.
Every mechanic, every screen, every sound, every line of code pattern — it's all here.
Start from Phase 0. Work through each Phase. Never deviate from the spec without updating this doc first.
When in doubt: refer to this plan.
