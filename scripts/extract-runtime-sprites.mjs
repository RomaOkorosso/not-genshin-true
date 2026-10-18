/**
 * Extract chroma-keyed runtime sprites from concept sheets.
 * Usage: node scripts/extract-runtime-sprites.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/assets/runtime');

/** @type {{ key: string, sheet: string, x: number, y: number, w: number, h: number, note?: string }[]} */
const CROPS = [
  // Archer — idle strip frame + attack pose (arrows stay procedural; sheet crops noisy)
  {
    key: 'archer',
    sheet: 'assets/core/archer_sprite_sheet.png',
    x: 470,
    y: 340,
    w: 105,
    h: 149,
    note: 'Idle frame crop from animation strip',
  },
  {
    key: 'archer_attack',
    sheet: 'assets/core/archer_sprite_sheet.png',
    x: 824,
    y: 106,
    w: 65,
    h: 64,
    note: 'Attack pose; optional anim frame',
  },

  // Enemies — Grunt walk + attack from top-left panel
  {
    key: 'enemy_grunt',
    sheet: 'assets/core/enemy_bestiary.png',
    x: 90,
    y: 265,
    w: 64,
    h: 64,
    note: 'Grunt walk/attack strip frame',
  },
  {
    key: 'enemy_grunt_attack',
    sheet: 'assets/core/enemy_bestiary.png',
    x: 160,
    y: 270,
    w: 60,
    h: 56,
    note: 'Grunt attack frame',
  },

  // Tower + grass
  {
    key: 'tower',
    sheet: 'assets/core/tower_environment_pack.png',
    x: 450,
    y: 20,
    w: 180,
    h: 230,
    note: 'Central tower crop (may include archer on top)',
  },
  {
    key: 'tile_grass',
    sheet: 'assets/core/tower_environment_pack.png',
    x: 450,
    y: 300,
    w: 80,
    h: 90,
    note: 'Grass tile variant',
  },

  // UI / VFX
  {
    key: 'codex_btn',
    sheet: 'assets/core/ui_vfx_pack.png',
    x: 40,
    y: 45,
    w: 140,
    h: 135,
    note: 'Codex / Almanac book button',
  },
  {
    key: 'hit_spark',
    sheet: 'assets/core/ui_vfx_pack.png',
    x: 60,
    y: 665,
    w: 130,
    h: 130,
    note: 'Hit spark VFX',
  },
  {
    key: 'death_puff',
    sheet: 'assets/core/ui_vfx_pack.png',
    x: 500,
    y: 670,
    w: 180,
    h: 120,
    note: 'Enemy death puff (smoke)',
  },
];

function isBackground(r, g, b) {
  const avg = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return avg < 78 && spread < 30;
}

async function extractCrop(crop) {
  const src = join(ROOT, crop.sheet);
  const { data, info } = await sharp(src)
    .extract({ left: crop.x, top: crop.y, width: crop.w, height: crop.h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (isBackground(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }

  // Trim transparent margins but keep at least 8px padding intent via sharp trim
  const buf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  const outPath = join(OUT, `${crop.key}.png`);
  writeFileSync(outPath, buf);
  const meta = await sharp(buf).metadata();
  return { key: crop.key, path: outPath, w: meta.width, h: meta.height, note: crop.note };
}

mkdirSync(OUT, { recursive: true });
const results = [];
for (const crop of CROPS) {
  try {
    results.push(await extractCrop(crop));
    console.log('OK', crop.key);
  } catch (err) {
    console.error('FAIL', crop.key, err.message);
  }
}

writeFileSync(
  join(OUT, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), sprites: results }, null, 2),
);
console.log('Wrote', results.length, 'sprites to', OUT);
