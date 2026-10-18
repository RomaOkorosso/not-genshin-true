# NOT GENSHIN — Milestone 2.5 Agent Handoff

**Status:** Milestone 2.5 art pass + Ultimate polish on top of Levels 1–5  
**Repo:** `https://github.com/RomaOkorosso/not-genshin-true.git`  
**Branch:** `master`  
**Rules:** read `AGENTS.md`, `docs/PHASE_2_IMPLEMENTATION.md`, `docs/PHASE_2_5_IMPLEMENTATION.md`

Do **not** copy Genshin Impact art, UI, characters, lore, or protected designs.

## Snapshot

| Item | Value |
|------|--------|
| Milestone | 2.5 — runtime sprites + Archer Ultimate |
| Stack | TypeScript + Vite 5 + Phaser 3 |
| Gate | `npm test && npm run lint && npm run build` |
| Sprites | `npm run extract-sprites` → `public/assets/runtime/` |

## Recommended next work

1. External playtest (Ultimate feel, Runner tempo, Golem phases).
2. Refine crop rects / add Runner+Brute extracts.
3. Milestone 3 only after tester feedback — do not front-load new classes/meta.

## How to run

```bash
npm install
npm run extract-sprites
npm run dev
npm test && npm run lint && npm run build
```
