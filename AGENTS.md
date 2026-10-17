# AGENTS.md

## Project purpose

Create a browser-first hybrid-casual RPG / survivor-TD designed for Yandex Games, mobile browsers and desktop browsers.

Working joke/name: "NOT GENSHIN". Do not copy Genshin Impact art, UI, characters, lore or protected designs.

## Non-negotiable core rules

- One run = one hero = one class = one build.
- No hero/class rotation inside a run.
- No manual character movement in the main mode.
- Hero stands on the central tower / defense structure.
- Enemies spawn around the arena, from any direction outside the visible screen, then move toward the tower.
- Combat is automatic.
- Player interaction during combat is primarily upgrade selection, pause/Codex, and eventually one simple Ultimate.
- Core depth comes from buildcraft, Evolutions and later Super Nodes, not twitch controls.
- Any campaign stage must be beatable by any properly progressed class with a sensible build.
- Avoid hard class counters.
- Do not add features outside the specification without clearly documenting the proposal first.

## Visual direction

Primary reference:

`assets/references/style_reference_approved.png`

Style:
- polished pixel-art / pixelized mobile fantasy;
- readable silhouettes;
- slight top-down/isometric arena view;
- bright effects with strong gameplay readability;
- avoid excessive visual noise;
- hero is physically positioned on top of the central tower;
- enemy approach must read as 360-degree pressure, not lane-only TD.

Approved current art pack:
- `assets/core/archer_sprite_sheet.png`
- `assets/core/enemy_bestiary.png`
- `assets/core/tower_environment_pack.png`
- `assets/core/ui_vfx_pack.png`

These generated sheets are concept/source assets. They may require manual slicing, cleanup, transparent backgrounds, scale normalization, or redrawing before production use.

## Architecture requirements

Design a reusable framework for future Yandex Games projects.

Suggested high-level modules:

```text
src/
  core/
    events/
    state/
    rng/
    timers/
    config/

  platform/
    browser/
    yandex/

  services/
    ads/
    saves/
    localization/
    audio/
    analytics/
    leaderboards/

  systems/
    combat/
    waves/
    enemies/
    heroes/
    skills/
    buffs/
    upgrades/
    inventory/
    rewards/

  meta/
    progression/
    gacha/
    daily/
    expeditions/
    relationships/
    base/
    achievements/

  ui/
    combat/
    codex/
    base/
    heroes/
    gacha/
    settings/

  game/
    content/
    balance/
    localization/
```

## Platform abstraction

Yandex SDK must never be mixed directly into combat/domain logic.

Use interfaces/adapters for at least:
- PlatformService
- SaveService
- AdService
- LeaderboardService
- AnalyticsService
- AudioService

Browser build:
- saves -> localStorage;
- ads -> mock/safe simulated result;
- leaderboards -> local/mock implementation;
- must run without Yandex SDK.

Yandex build:
- real Yandex SDK adapters.

## Data-driven balancing

Never scatter balance numbers through runtime logic.

Keep separate data/config for:
- hero stats;
- enemy stats;
- spawn budgets;
- wave definitions;
- XP curves;
- upgrade values;
- boss stats;
- economy values;
- gacha tables;
- localization.

Changing Level 1 HP, spawn interval, damage or an upgrade percentage should not require changing combat code.

## Performance requirements

This is a browser/mobile game. Performance is a first-class feature.

Required:
- object pooling for enemies/projectiles/common VFX;
- no uncontrolled allocations every frame;
- clean timers/listeners on run exit;
- cap particles and simultaneous SFX;
- profile memory regularly;
- avoid expensive DOM work in combat loop;
- no runaway arrays/collections;
- no hidden duplicate game loops.

Targets for MVP:
- 60 FPS on normal desktop;
- stable 30–60 FPS on reasonable phones;
- memory use must remain stable over repeated runs.

## Development sequence

### Milestone 1 — Level 1 combat prototype

Implement only:
- Archer;
- central tower;
- Grunt;
- auto-targeting / auto-attack;
- projectile;
- XP;
- level-up;
- three upgrade choices;
- 8-minute Level 1;
- elite;
- Raider Captain mini-boss;
- victory/defeat;
- pause;
- basic Codex button.

### Milestone 2 — first external-test vertical slice

Add:
- Levels 1–5;
- Runner;
- Brute;
- Elite variants;
- first real boss: Stone Golem;
- complete basic Archer branches;
- first Evolution;
- useful Codex;
- basic sound/VFX;
- save;
- polished enough UI;
- GitHub Pages deployment.

Only after this should external testers be invited.

### Later milestones

Do not front-load them before core validation:
- Warrior;
- Mage;
- Rogue;
- base/hub;
- gacha;
- expeditions;
- relationships;
- Endless;
- Super Nodes;
- Yandex production SDK/monetization.

## CI/CD

On push to `main`:
1. install dependencies;
2. lint;
3. test;
4. production build;
5. only if all checks pass: deploy to GitHub Pages.

Must correctly support repository subpath deployment (`/<repo-name>/`).
Do not hardcode GitHub username.

Provide commands for:
- dev
- test
- lint
- build
- preview

## Documentation to maintain

Keep these files updated:
- `IMPLEMENTATION_STATUS.md`
- `HANDOFF.md`
- `KNOWN_ISSUES.md`

Whenever a milestone is completed, update actual state instead of leaving stale plans.

## Forbidden scope creep

Do NOT silently add:
- manual movement;
- party switching;
- mid-run hero switching;
- mandatory target selection;
- complex active-skill combat;
- hard counter stages;
- live-service seasonal dependency;
- a large number of currencies;
- mandatory ads during active combat;
- large base systems before combat validation.

If a spec creates a technical conflict, document it and propose the smallest change before implementing a different design.
