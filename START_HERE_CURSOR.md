# START HERE — Cursor

This repository starts from an empty or nearly empty project. Read in this order before writing code:

1. `AGENTS.md` — non-negotiable project rules.
2. `HANDOFF.md` — full game design.
3. `docs/DESIGN_SPEC.md` — detailed mechanics.
4. `docs/BALANCE_V0_1.md` — Level 1 / Archer balance baseline.
5. `docs/ASSET_MANIFEST.md` — approved art and intended use.
6. `docs/DEPLOYMENT.md` — GitHub Pages and platform abstraction.
7. `docs/PHASE_1_IMPLEMENTATION.md` — exact first implementation scope.
8. `docs/QA_BREAKER_CHECKLIST.md` — abuse/edge-case testing expectations.

## Recommended technical stack

Use a browser-first 2D stack unless the existing repository already has an equivalent viable stack:

- TypeScript
- Vite
- Phaser 3
- Vitest
- ESLint
- GitHub Actions + GitHub Pages

Do not add a backend for the MVP. Do not introduce React for combat rendering unless there is a strong existing-project reason. UI may be Phaser UI or lightweight DOM overlays, but combat must not depend on expensive per-frame DOM updates.

## First objective

Build only Milestone 1 / Level 1. Do not start Warrior, Mage, Rogue, gacha, base, relationships, Endless or Yandex monetization yet.

The first playable target is:

- archer standing on the central tower;
- 360-degree enemy spawns outside the visible arena;
- enemies move toward tower center;
- automatic targeting and shooting;
- Grunt + Elite Grunt + Raider Captain;
- XP and level-ups;
- 3-choice upgrade screen;
- limited Level 1 Archer upgrade pool;
- pause + obvious Almanac button;
- win/lose flow;
- Browser platform adapter with localStorage;
- production build;
- CI checks;
- automatic GitHub Pages deployment.

## Work rules

Before editing, summarize the implementation plan and project structure. Then implement incrementally.

After every meaningful stage:
- run tests;
- run lint;
- run production build;
- update `IMPLEMENTATION_STATUS.md`;
- record unresolved issues in `KNOWN_ISSUES.md`.

Do not silently reinterpret game design. If a requirement conflicts with implementation, document the conflict and choose the smallest viable change.

## Git policy

Do not push broken code.

A push to `main` is allowed only after:

```text
npm test
npm run lint
npm run build
```

all succeed.

Use small understandable commits. GitHub Pages should deploy only after successful CI.
