# NOT GENSHIN — Milestone 2 Agent Handoff

**Status:** playable Milestone 2 / Levels 1–5 vertical slice  
**Repo:** `https://github.com/RomaOkorosso/not-genshin-true.git`  
**Branch:** `master`  
**Rules:** read `AGENTS.md` and `docs/PHASE_2_IMPLEMENTATION.md` before coding.

Do **not** copy Genshin Impact art, UI, characters, lore, or protected designs.

---

## Snapshot

| Item | Value |
|------|--------|
| Milestone | Phase 2 — Levels 1–5 + Archer Evolutions |
| Stack | TypeScript + Vite 5 + Phaser 3 |
| Tests | Vitest + ESLint |
| CI | GitHub Actions → lint → test → build → Pages |
| Dev | `npm run dev` → `http://127.0.0.1:5173/` |
| Gate before push | `npm test && npm run lint && npm run build` |

Manual GitHub step: **Settings → Pages → Source: GitHub Actions**.

---

## Non-negotiable (from AGENTS.md)

- One run = one hero = one class = one build.
- No manual character movement in the main mode.
- Hero stands on the central tower; enemies spawn 360° off-screen and converge.
- Combat is automatic; depth is buildcraft, not twitch controls.
- Do not front-load Warrior / Mage / Rogue / gacha / base / Endless / Yandex monetization.
- Balance numbers live in data (`src/game/balance/*`), not scattered in combat code.
- Yandex SDK must never mix into combat/domain logic — use platform adapters.

---

## Architecture (key paths)

| Path | Role |
|------|------|
| `src/systems/combat/RunController.ts` | Headless run loop (`start(levelId)`) |
| `src/game/content/levels.ts` | LevelDef 1–5 |
| `src/game/content/codex.ts` | Almanac data pages |
| `src/game/scenes/LevelSelectScene.ts` | Campaign unlock UI |
| `src/game/scenes/CombatScene.ts` | Combat + HUD + overlays |
| `src/platform/browser/WebAudioService.ts` | Placeholder SFX |
| `src/platform/browser/BrowserPlatform.ts` | Save v2 + campaign progress |
| Depth convention | World ≤ 22 · HUD 100 · overlays 300 |

---

## Milestone 2 checklist

### Done

- [x] LevelDef + Level Select + RunController(levelId)
- [x] Runner / Brute (+ elites) + Levels 2–3 waves/pools
- [x] Archer branches + Evolutions + Level 4–5 pools
- [x] Stone Golem phases + Level 5 finale
- [x] Data Codex, WebAudio SFX, campaign save v2
- [x] UI polish + docs + tests + green build gate

### Not done (intentional)

- [ ] Warrior / Mage / Rogue
- [ ] Super Nodes, Endless
- [ ] Production sprite slicing from `assets/core/`
- [ ] Real audio / music beds
- [ ] Yandex SDK adapters
- [ ] Meta: base, gacha, expeditions, relationships

---

## Known issues / tech debt

- Concept sheets in `assets/core/` are **not** sliced — runtime uses generated placeholders.
- Balance is **v0.1**; expect retune after playtests.
- Audio is WebAudio beeps mapped to semantic events.
- Codex tab lists are capped (first pages).
- Default branch is `master`; CI listens to both `main` and `master`.

See also: `KNOWN_ISSUES.md`, `IMPLEMENTATION_STATUS.md`, `docs/PHASE_2_IMPLEMENTATION.md`.

---

## Recommended next work

1. External playtest of Levels 1–5 (Runner tempo, Evolution timing, Golem readability).
2. First sprite extraction per `docs/ASSET_MANIFEST.md` once feel is OK.
3. Milestone 3 only after tester feedback — do not front-load new classes/meta.

---

## How to run

```bash
npm install
npm run dev
npm test && npm run lint && npm run build
```

Do not push broken code. A push to `main`/`master` is allowed only after test + lint + build succeed.
