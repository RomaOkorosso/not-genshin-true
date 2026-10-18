# Handoff — current engineering state

See also `docs/DESIGN_SPEC.md` and `docs/PHASE_2_IMPLEMENTATION.md`. This file tracks **what exists in code now**.

## Stack

TypeScript, Vite 5, Phaser 3, Vitest, ESLint, GitHub Actions → GitHub Pages.

## Repository layout

```text
src/
  core/          events, rng, timers, pooling
  platform/      browser adapters + service interfaces + WebAudio
  systems/       combat, waves, enemies, heroes, upgrades
  game/
    balance/     data-driven numbers (Archer, enemies, waves L1–L5, upgrades)
    content/     levels, codex
    scenes/      Boot, Menu, LevelSelect, Combat
docs/            design + Phase 1/2 + deployment specs
assets/          concept sheets + style references (not yet sliced)
```

## Milestone 2 + 2.5 gameplay

Playable Levels 1–5 with linear unlock. Archer Evolutions from Level 4+. Level 5 ends on Stone Golem. Archer Ultimate (HUD) + first runtime sprite extracts.

## Next recommended work

1. External playtest (Ultimate, Runner tempo, Golem phases).
2. Refine crops / more enemy extracts (`docs/RUNTIME_SPRITES.md`).
3. Milestone 3+: second class or meta only after tester feedback.

## Platform

- Browser build works without Yandex SDK.
- Saves: `localStorage` key `not-genshin:save:v2` (migrates v1).
- Remote: `https://github.com/RomaOkorosso/not-genshin-true.git`
