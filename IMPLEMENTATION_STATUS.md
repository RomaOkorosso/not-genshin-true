# Implementation Status

Current state: **Milestone 2.5 — Art pass + combat polish.**

## Done

- Milestone 2 campaign Levels 1–5 (unlocks, Evolutions, Golem, Codex, save v2)
- Runtime sprite extracts from concept sheets (`npm run extract-sprites`)
- BootScene runtime overlay with procedural fallback
- Archer Ultimate stub (HUD + cooldown + barrage)
- Death / crit / level-up / ultimate VFX + `ultimate` SFX
- Vitest, ESLint, production build, GitHub Actions → Pages

## Not done (intentional)

- Warrior / Mage / Rogue
- Super Nodes, Endless, meta (base/gacha/…)
- Full sheet cleanup / seamless grass from extract
- Binary SFX/music packs
- Yandex SDK adapters

## How to run

```bash
npm install
npm run extract-sprites   # optional: regenerate runtime PNGs
npm run dev
npm test && npm run lint && npm run build
```
