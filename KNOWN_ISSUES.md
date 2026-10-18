# Known Issues

- Concept sheets need further cleanup; see `docs/RUNTIME_SPRITES.md` for which keys are extracted vs procedural.
- Arrow / crit arrow / XP orb / seamless grass remain procedural (noisy or non-tiling crops).
- Exact balance values are v0.1; Ultimate cooldown (~25s) will need playtest tuning.
- Audio is WebAudio placeholder beeps — not final SFX/music.
- Phaser bundle is large (~1.5 MB); code-splitting deferred.
- Codex tab lists are capped for scroll performance.
- Default git branch is currently `master`; CI listens to both `main` and `master`.
- Save key is `not-genshin:save:v2` (legacy v1 migrated on load).
- Localization is EN/RU only; English data fields on upgrades/enemies remain as balance fallbacks, UI uses `t()` keys.
