# Implementation Status

Current state: **Phase 1 / Milestone 1 playable prototype implemented.**

## Done

- Vite + TypeScript + Phaser 3 project scaffold
- Architecture modules: `core/`, `platform/`, `systems/`, `game/`, `ui` (in-scene)
- Browser platform adapters (localStorage saves, mock ads/leaderboards, placeholder audio, analytics)
- Data-driven balance: Archer stats, Level 1 upgrade pool, enemy defs, wave segments
- Level 1 combat loop:
  - Archer on central tower (no manual movement)
  - 360° off-screen spawns → converge on tower
  - Auto-target nearest + auto-attack + pooled projectiles
  - Grunt / Elite Grunt / Raider Captain (summon at 60% HP)
  - XP + level-up (scripted first triad; weighted RNG after)
  - Pause, Almanac stub, victory/defeat, restart cleanup
  - Level-1-only emergency heal below ~20% tower HP
- Object pooling for enemies & projectiles; delta clamp on tab resume
- Vitest unit tests (13), ESLint, production build
- GitHub Actions workflow: lint → test → build → Pages artifact

## Not done (intentionally out of Phase 1)

- Warrior / Mage / Rogue
- Evolutions, Super Nodes, Endless
- Levels 2–5, Runner/Brute/Stone Golem
- Full Almanac wiki content
- Real audio assets / music
- Production sprite slicing from concept sheets
- Yandex SDK adapters
- Meta: base, gacha, expeditions, relationships

## Asset note

Runtime uses generated placeholder textures. Concept sheets in `assets/core/` still need slicing/cleanup before art pass.

## How to run

```bash
npm install
npm run dev
npm test && npm run lint && npm run build
```

## Manual GitHub step

Enable **Settings → Pages → Source: GitHub Actions** after the first successful workflow on `main`/`master`.
