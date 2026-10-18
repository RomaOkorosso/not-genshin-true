import { ENEMY_DEFS, type EnemyId } from '../balance/enemies';
import { ALL_UPGRADES } from '../balance/upgrades';
import { enemyName, upgradeDescription, upgradeDisplayName, upgradeName } from '../localization/content';
import { t } from '../localization/i18n';

export type CodexSectionId = 'mechanics' | 'archer' | 'upgrades' | 'enemies';

export interface CodexPage {
  id: string;
  section: CodexSectionId;
  title: string;
  body: string;
  /** Human-readable requirement names (never raw upgrade ids). */
  requires?: string;
}

const MECHANIC_IDS = [
  'mech_tower',
  'mech_combat',
  'mech_xp',
  'mech_evo',
  'mech_ultimate',
] as const;

/** Build Codex pages for the active locale (call whenever Almanac opens / language changes). */
export function buildCodexPages(): CodexPage[] {
  const mechanics: CodexPage[] = MECHANIC_IDS.map((id) => ({
    id,
    section: 'mechanics' as const,
    title: t(`codex.${id}.title`),
    body: t(`codex.${id}.body`),
  }));

  const archer: CodexPage[] = [
    {
      id: 'archer',
      section: 'archer',
      title: t('codex.archer.title'),
      body: t('codex.archer.body'),
    },
  ];

  const upgrades: CodexPage[] = ALL_UPGRADES.map((u) => ({
    id: `up_${u.id}`,
    section: 'upgrades' as const,
    title: upgradeDisplayName(u),
    body: upgradeDescription(u.id),
    requires: u.requires ? u.requires.map((id) => upgradeName(id)).join(', ') : undefined,
  }));

  const enemies: CodexPage[] = Object.values(ENEMY_DEFS).map((e) => ({
    id: `en_${e.id}`,
    section: 'enemies' as const,
    title: enemyName(e.id),
    body:
      t('codex.enemyStats', {
        hp: e.maxHp,
        dmg: e.towerDamage,
        xp: e.xp,
        speed: e.moveSpeed,
      }) +
      (e.boss ? t('codex.bossTag') : '') +
      (e.elite ? t('codex.eliteTag') : ''),
  }));

  return [...mechanics, ...archer, ...upgrades, ...enemies];
}

export function getCodexSections(): { id: CodexSectionId; label: string }[] {
  return [
    { id: 'mechanics', label: t('codex.section.mechanics') },
    { id: 'archer', label: t('codex.section.archer') },
    { id: 'upgrades', label: t('codex.section.upgrades') },
    { id: 'enemies', label: t('codex.section.enemies') },
  ];
}

export function pagesForSection(section: CodexSectionId): CodexPage[] {
  return buildCodexPages().filter((p) => p.section === section);
}

export function enemyCodexId(id: EnemyId): string {
  return `en_${id}`;
}
