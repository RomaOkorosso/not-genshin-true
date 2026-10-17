# Handoff — current engineering state

See also `docs/DESIGN_SPEC.md` for full design. This file tracks **what exists in code now**.

## Stack

TypeScript, Vite 5, Phaser 3, Vitest, ESLint, GitHub Actions → GitHub Pages.

## Repository layout

```text
src/
  core/          events, rng, timers, pooling
  platform/      browser adapters + service interfaces
  systems/       combat, waves, enemies, heroes, upgrades
  game/
    balance/     data-driven numbers (Archer, enemies, waves, upgrades)
    scenes/      Boot, Menu, Combat
docs/            design + Phase 1 + deployment specs
assets/          concept sheets + style references (not yet sliced)
```

## Phase 1 gameplay

Playable Level 1 (~8 min wave plan): Archer only, tower HP 100, Grunts → Elites → Raider Captain.

Upgrade pool matches `docs/PHASE_1_IMPLEMENTATION.md` (no Evolutions).

## Next recommended work

1. Playtest Level 1 feel / balance (spawn budgets, XP curve).
2. Slice first production sprites from `assets/core/` (see `docs/ASSET_MANIFEST.md`).
3. Milestone 2: Levels 1–5 vertical slice when Phase 1 feels solid.

## Platform

- Browser build works without Yandex SDK.
- Saves: `localStorage` key `not-genshin:save:v1`.
- Remote: `https://github.com/RomaOkorosso/not-genshin-true.git`
