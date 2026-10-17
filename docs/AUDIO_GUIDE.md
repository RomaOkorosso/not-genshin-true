# Audio Guide — Placeholder Stage

Audio is intentionally low priority until the core loop is validated.

Cursor may use/generated placeholder sounds provided licensing is safe and replacement is easy.

Required logical sound events:
- archer shot
- hit
- crit hit
- enemy death
- tower hit
- elite arrival
- boss arrival
- level-up
- upgrade selected
- Almanac open/close
- victory
- defeat
- reward

Later:
- Evolution
- Super Node
- class-specific attacks
- base ambience

Implementation rule: game logic emits semantic audio events; it must not know concrete filenames. Audio mappings belong in data/config.

Music placeholder targets:
- one looping combat track;
- one boss intensity variant;
- one menu/base loop.

Do not spend significant implementation time on procedural music or advanced adaptive soundtrack before the vertical slice is fun.
