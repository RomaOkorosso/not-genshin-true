# Known Issues

- Generated sprite sheets are concept/source art and need slicing/cleanup for production use. Phase 1 uses geometric placeholders.
- Exact balance values are v0.1 and expected to change after real playtests.
- Final game name, lore and character names are not locked.
- Final audio assets are not selected; `AudioService` only receives semantic events.
- Phaser bundle is large (~1.5 MB); code-splitting deferred until after combat validation.
- Almanac is a stub page (enemies + basic rules), not the full in-game wiki yet.
- Opening Almanac from combat pauses via the pause path; closing does not always auto-resume if the player also used Pause — expected for now, refine in UI polish.
- Default git branch is currently `master`; CI listens to both `main` and `master`.
