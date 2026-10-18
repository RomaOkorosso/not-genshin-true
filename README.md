# NOT GENSHIN

Browser-first hybrid-casual RPG / survivor-TD (working joke name). **Do not copy Genshin Impact art, UI, characters, lore, or protected designs.**

Start with `START_HERE_CURSOR.md` and `AGENTS.md`.

## Stack

- TypeScript + Vite + Phaser 3
- Vitest + ESLint
- GitHub Actions → GitHub Pages

## Commands

```bash
npm install
npm run dev      # local play
npm test
npm run lint
npm run build
npm run preview
```

## Milestone 2 scope (current)

Archer campaign Levels 1–5: Runners/Brutes/Stone Golem, first Evolutions, data Codex, WebAudio SFX, campaign save unlocks. See `docs/PHASE_2_IMPLEMENTATION.md`.

No Warrior / Mage / Rogue / gacha / base / Endless / Yandex yet.

## GitHub Pages

After the first green CI run, enable **Settings → Pages → Source: GitHub Actions**.

The build base path is derived from `GITHUB_REPOSITORY` (no hardcoded username). Live URL shape:

`https://<user>.github.io/not-genshin-true/`
