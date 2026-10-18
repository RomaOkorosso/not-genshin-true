# Implementation Status

Current state: **Milestone 2.5 + EN/RU localization.**

## Done

- Milestone 2 campaign Levels 1–5 (unlocks, Evolutions, Golem, Codex, save v2)
- Runtime sprite extracts + Archer Ultimate + combat VFX/SFX
- EN/RU localization (`src/game/localization/`) with AUTO/EN/RU menu toggle
- Save `settings.language` (default `auto` from browser locale)
- Vitest, ESLint, production build, GitHub Actions → Pages

## Not done (intentional)

- Warrior / Mage / Rogue
- Super Nodes, Endless, meta (base/gacha/…)
- Full sheet cleanup / seamless grass from extract
- Binary SFX/music packs
- Yandex SDK adapters (browser `navigator.language` is enough for now)

## How to run

```bash
npm install
npm run extract-sprites   # optional: regenerate runtime PNGs
npm run dev
npm test && npm run lint && npm run build
```
