# Phase 2 — Levels 1–5 Vertical Slice

## Goal

External-testable campaign slice: Levels 1–5, Runner/Brute/Stone Golem, complete basic Archer branches + first Evolutions, useful Codex, placeholder WebAudio SFX, campaign save, UI polished enough for GitHub Pages testers.

Out of scope: Warrior / Mage / Rogue, meta systems, Yandex SDK, Endless, production art/audio packs.

## Campaign

| Level | Theme | Pool | Victory |
|------|--------|------|---------|
| 1 | Basics | `level1` (no Evolutions) | Raider Captain |
| 2 | Tempo / Runners | `level2_3` | Elite Grunt finale |
| 3 | Projectile craft | `level2_3` | Raider Captain |
| 4 | First Evolution | `level4_5` | Raider Captain |
| 5 | Stone Golem | `level4_5` | Stone Golem kill |

Linear unlock: clearing level N unlocks N+1. Menu → Level Select → Combat.

## Architecture additions

- `src/game/content/levels.ts` — `LevelDef` + `LevelId`
- `src/game/balance/level2Waves.ts` … `level5Waves.ts`
- `src/game/scenes/LevelSelectScene.ts`
- `src/game/content/codex.ts` — Heroes / Upgrades / Enemies / Mechanics
- `src/platform/browser/WebAudioService.ts` — short WebAudio beeps
- Save schema v2: `campaign.highestUnlocked`, `campaign.cleared[levelId]`

`RunController.start(levelId, seed?)` loads segments, upgrade pool, emergency-heal flag, and victory boss id.

## Archer Evolutions

| Branch | Prereq chain | Evolution |
|--------|--------------|-----------|
| Multishot | Multishot → Tight Spread → Volley | **Arrow Storm** (5s fan) |
| Pierce | Piercing → Ricochet II | **Phantom Barrage** (pierce+ricochet) |
| Crit/Speed | Quick Draw → Deadly Precision | **Deadeye Frenzy** (crit AS stacks) |

Level 1 stays Evolution-free. Level 4–5 pools bias Evolutions when prereqs are owned.

## Stone Golem

- Periodic Grunt/Runner summons
- ≤50% HP: Stone Skin (temp damage reduction)
- ≤20% HP: Final Push (move speed up)

## Definition of Done

- [x] Menu → unlocked levels 1–5 full runs; progress survives reload
- [x] Level 2 introduces faster Runners; Level 5 ends on Golem with readable phases
- [x] At least one Evolution obtainable on Level 4/5 with correct prereqs
- [x] Codex lists enemies/upgrades with numbers
- [x] Placeholder SFX on shot / hit / level-up / victory (+ evolution)
- [x] Pages CI still builds with repo subpath (`npm test && lint && build`)

## How to verify

```bash
npm test && npm run lint && npm run build
npm run dev
```

Play Level 1 → clear → confirm Level 2 unlocks after reload. On Level 4/5, finish Volley (or Ricochet II / Deadly Precision) and confirm Evolution cards appear with gold chrome.
