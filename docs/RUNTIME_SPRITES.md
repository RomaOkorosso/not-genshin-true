# Runtime sprites

Concept sheets in `assets/core/` are RGB with dark-grey backgrounds. Runtime PNGs live in `public/assets/runtime/` after chroma-key + crop.

## Regenerate

```bash
npm run extract-sprites
```

Requires `sharp` (devDependency). Crop rects are defined in `scripts/extract-runtime-sprites.mjs`.

## Current extracts

| Key | Source | Status |
|-----|--------|--------|
| `archer` | archer_sprite_sheet idle strip | OK — large idle frame |
| `archer_attack` | archer_sprite_sheet | OK — optional attack pose |
| `enemy_grunt` | enemy_bestiary | OK |
| `enemy_grunt_attack` | enemy_bestiary | OK |
| `tower` | tower_environment_pack | OK |
| `tile_grass` | tower_environment_pack | Extracted but **not wired** (not seamless); procedural tile kept |
| `codex_btn` | ui_vfx_pack | OK |
| `hit_spark` | ui_vfx_pack | OK |
| `death_puff` | ui_vfx_pack | OK |

## Procedural fallback (BootScene)

| Key | Reason |
|-----|--------|
| `arrow` / `arrow_crit` | Projectile row crops noisy / labeled; keep high-contrast procedural |
| `xp_orb` | Sheet crop ambiguous; procedural retained |
| Elite / Runner / Brute / Golem / Captain | Not in first extract set |

Boot always generates procedural textures, then overwrites keys when a runtime PNG loads successfully.

## Notes

- Crops may still include label bleed or scale mismatch; refine rects in the extract script as needed.
- Do not treat concept sheets as production atlases without cleanup.
