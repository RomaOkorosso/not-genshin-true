# Implementation Status

Current state: **Milestone 2 / Levels 1–5 vertical slice implemented.**

## Done

- Vite + TypeScript + Phaser 3 project scaffold
- Architecture modules: `core/`, `platform/`, `systems/`, `game/`, `ui` (in-scene)
- Browser platform adapters (localStorage saves v2 + campaign, mock ads/leaderboards, WebAudio SFX, analytics)
- Data-driven balance: Archer stats, upgrade pools, enemies, Levels 1–5 waves
- Campaign Level Select with linear unlock
- Combat loop for Levels 1–5:
  - Archer on central tower (no manual movement)
  - 360° off-screen spawns → converge on tower
  - Auto-target nearest + auto-attack + pooled projectiles
  - Grunt / Runner / Brute (+ elites) / Raider Captain / Stone Golem
  - Archer branches through first Evolutions (Arrow Storm, Phantom Barrage, Deadeye Frenzy)
  - XP + level-up (scripted first triad; weighted RNG after; Evolution bias on L4–5)
  - Pause, data Codex/Almanac, victory/defeat, restart cleanup
  - Level-1-only emergency heal; Golem phase hooks on Level 5
- Object pooling; delta clamp on tab resume
- Vitest unit tests, ESLint, production build
- GitHub Actions workflow: lint → test → build → Pages artifact

## Not done (intentionally out of Milestone 2)

- Warrior / Mage / Rogue
- Super Nodes, Endless
- Production sprite slicing from concept sheets
- Real audio assets / music beds
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
