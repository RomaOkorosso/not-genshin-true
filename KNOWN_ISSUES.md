# Known Issues

- Generated sprite sheets are concept/source art and need slicing/cleanup for production use. Runtime uses geometric placeholders.
- Exact balance values are v0.1 and expected to change after real playtests (especially Level 2 Runner density and Level 5 Golem HP).
- Final game name, lore and character names are not locked.
- Audio is WebAudio placeholder beeps mapped to semantic events — not final SFX/music.
- Phaser bundle is large (~1.5 MB); code-splitting deferred until after combat validation.
- Codex shows a capped list per tab (first pages); full scrollable wiki can come later.
- Default git branch is currently `master`; CI listens to both `main` and `master`.
- Save key is `not-genshin:save:v2` (legacy v1 is migrated on load).
