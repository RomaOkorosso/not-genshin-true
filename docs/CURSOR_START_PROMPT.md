# Suggested first prompt for Cursor

Read `AGENTS.md`, `docs/DESIGN_SPEC.md`, `docs/BALANCE_V0_1.md`, `docs/DEPLOYMENT.md`, and `docs/ASSET_MANIFEST.md` completely before changing files.

Then create the initial project architecture and implement only Milestone 1 / Level 1.

Priorities:
1. stable browser architecture;
2. central tower with Archer standing on it;
3. enemies spawn outside the visible screen in any direction and converge on the center;
4. Archer auto-targets and auto-attacks;
5. Grunt + Elite + Raider Captain;
6. XP and level-up with 3 choices;
7. scripted first level-up choices as specified;
8. victory/defeat;
9. pause + large Almanac/Codex button;
10. data-driven balance configs;
11. performance-safe pooling/cleanup;
12. tests where practical;
13. production build;
14. GitHub Pages CI/CD setup.

Do not implement Warrior, Mage, Rogue, full gacha, full base, relationships or Endless yet.

Generated asset sheets are references/source material, not guaranteed ready-to-use sprites. If clean runtime sprites cannot be safely extracted, use simple temporary placeholders while preserving the approved visual scale/layout and document exactly what asset preparation is still required.

At the end, create/update:
- `IMPLEMENTATION_STATUS.md`
- `HANDOFF.md`
- `KNOWN_ISSUES.md`

Report:
- project structure;
- stack choice;
- what works;
- what remains;
- how to run dev/test/build/preview;
- any GitHub settings the user must enable manually.
