# Phase 2.5 — Art pass + combat polish

## Goal

First runtime sprite extraction from approved concept sheets, plus Archer Ultimate stub and lightweight VFX/SFX polish. No new classes or meta.

## Delivered

### Art

- Extract script: `npm run extract-sprites` → `public/assets/runtime/`
- Docs: `docs/RUNTIME_SPRITES.md`
- BootScene loads runtime PNGs with procedural fallback
- Wired: archer, grunt, tower, codex, hit_spark, death_puff
- Procedural kept: arrows, xp orb, seamless grass tile, other enemies

### Ultimate

- Data: `ARCHER_ULTIMATE` in `src/game/balance/archer.ts`
- `RunController.tryActivateUltimate()` — fan barrage, ~25s cooldown
- HUD button bottom-right with cooldown fill
- Blocked during pause / level-up / Almanac / end
- Codex Mechanics page + `ultimate` audio event

### VFX / SFX

- Death puff, crit spark, level-up flash, ultimate cast ring (capped concurrent VFX)
- WebAudio `ultimate` tone

## Definition of Done

- [x] Runtime extracts or documented fallback for priority keys
- [x] Ultimate usable with clear cooldown UI
- [x] Death/crit/ultimate VFX readable
- [x] No Warrior/Mage/meta/Yandex
- [x] `npm test && npm run lint && npm run build`
