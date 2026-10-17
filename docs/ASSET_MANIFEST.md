# Asset Manifest

## Approved visual direction

Primary reference:

`../assets/references/style_reference_approved.png`

This is the currently approved style direction: more visibly pixelized than the earlier concepts while retaining polished mobile-fantasy readability.

## Core generated sheets

### `assets/core/archer_sprite_sheet.png`
Contains concept frames for:
- Archer character;
- idle;
- attack;
- crit attack;
- hurt;
- victory;
- defeat;
- normal arrow;
- crit arrow;
- multishot;
- piercing arrow;
- ricochet arrow.

### `assets/core/enemy_bestiary.png`
Contains concept sprites/frames for:
- Grunt;
- Elite Grunt;
- Brute;
- Raider Captain;
- walk/attack/hurt/death concepts;
- rough scale comparison.

### `assets/core/tower_environment_pack.png`
Contains:
- central tower with Archer on top;
- tower variations;
- grass/path tiles;
- transition tiles;
- pine trees;
- ruins;
- fences;
- torches;
- barrels/crates/props;
- rocks;
- stairs/platform edges;
- sample 360-degree arena layout.

Important gameplay layout rule:
- hero stands on central tower;
- enemies approach from every direction outside the screen;
- do not convert the main mode into lane-based TD.

### `assets/core/ui_vfx_pack.png`
Contains concepts for:
- large Codex/Almanac book button;
- reroll;
- pause;
- currencies;
- rarity frames;
- upgrade card;
- Evolution card;
- Super Node card;
- HP/boss/tower/XP bars;
- hit/crit/death VFX;
- level-up;
- Evolution;
- Super Node activation;
- tower damage;
- boss spawn;
- victory badge.

## Reference evolution history

`assets/references/early_style_concept.png`
- early clean/cartoon direction;
- superseded by more pixelized style.

`assets/references/arena_concept_pre_pixel.png`
- establishes central tower and 360-degree enemy approach;
- less pixelized than final approved direction.

`assets/references/style_reference_approved.png`
- current primary style target.

## Production warning

Generated sheets are not automatically production-ready sprite sheets.

Before runtime use, inspect for:
- inconsistent frame dimensions;
- non-transparent backgrounds;
- generated text artifacts;
- slight design drift between frames;
- inconsistent weapon/hand positions;
- scale mismatch;
- animation continuity.

Recommended first production extraction:
1. Archer idle/attack/hurt;
2. normal arrow;
3. Grunt walk/attack/death;
4. central tower;
5. one grass arena background/tiles;
6. XP orb;
7. hit spark;
8. Codex button;
9. simple HP/XP bars.

Do not spend time polishing every generated asset before Level 1 gameplay works.
