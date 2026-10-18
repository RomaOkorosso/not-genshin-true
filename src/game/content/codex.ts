import { ENEMY_DEFS, type EnemyId } from '../balance/enemies';
import { ALL_UPGRADES, getUpgradeDef } from '../balance/upgrades';

export type CodexSectionId = 'mechanics' | 'archer' | 'upgrades' | 'enemies';

export interface CodexPage {
  id: string;
  section: CodexSectionId;
  title: string;
  body: string;
  /** Human-readable requirement names (never raw upgrade ids). */
  requires?: string;
}

export const CODEX_PAGES: CodexPage[] = [
  {
    id: 'mech_tower',
    section: 'mechanics',
    title: 'Tower Defense',
    body: 'The Archer stands on the central tower and never moves. Enemies approach from every direction. Keep Tower HP above zero.',
  },
  {
    id: 'mech_combat',
    section: 'mechanics',
    title: 'Auto Combat',
    body: 'Attacks fire automatically at the nearest enemy in range. Your choices are upgrades, pause, and the Almanac.',
  },
  {
    id: 'mech_xp',
    section: 'mechanics',
    title: 'XP & Level-Up',
    body: 'Kills grant XP instantly. On level-up the run pauses and you pick 1 of 3 cards.',
  },
  {
    id: 'mech_evo',
    section: 'mechanics',
    title: 'Evolutions',
    body: 'Finish a branch (Volley, Ricochet II, or Deadly Precision) to unlock an Evolution — a major mechanical upgrade, not a small stat bump. Available from Level 4+.',
  },
  {
    id: 'mech_ultimate',
    section: 'mechanics',
    title: 'Ultimate',
    body: 'Tap ULTIMATE for a focused arrow barrage toward the nearest enemy (or a full circle if none). Auto-combat continues; cooldown is about 25 seconds.',
  },
  {
    id: 'archer',
    section: 'archer',
    title: 'Archer',
    body: 'Baseline class: projectiles, multishot, piercing, ricochet, crit, attack speed. Damage 10 · 1.0 APS · 5% crit · x1.5 crit mult.',
  },
  ...ALL_UPGRADES.map((u) => ({
    id: `up_${u.id}`,
    section: 'upgrades' as const,
    title: u.evolution ? `${u.name} (Evolution)` : u.name,
    body: u.description,
    requires: u.requires
      ? u.requires.map((id) => getUpgradeDef(id).name).join(', ')
      : undefined,
  })),
  ...Object.values(ENEMY_DEFS).map((e) => ({
    id: `en_${e.id}`,
    section: 'enemies' as const,
    title: e.displayName,
    body: `HP ${e.maxHp} · Tower dmg ${e.towerDamage} · XP ${e.xp} · Speed ${e.moveSpeed}${
      e.boss ? ' · BOSS' : ''
    }${e.elite ? ' · ELITE' : ''}`,
  })),
];

export const CODEX_SECTIONS: { id: CodexSectionId; label: string }[] = [
  { id: 'mechanics', label: 'Mechanics' },
  { id: 'archer', label: 'Hero' },
  { id: 'upgrades', label: 'Upgrades' },
  { id: 'enemies', label: 'Enemies' },
];

export function pagesForSection(section: CodexSectionId): CodexPage[] {
  return CODEX_PAGES.filter((p) => p.section === section);
}

export function enemyCodexId(id: EnemyId): string {
  return `en_${id}`;
}
