import type { EnemyId } from '../balance/enemies';
import type { UpgradeDef, UpgradeId } from '../balance/upgrades';
import type { LevelId } from '../content/levels';
import { t } from './i18n';

export function upgradeName(id: UpgradeId): string {
  return t(`upgrade.${id}.name`);
}

export function upgradeDescription(id: UpgradeId): string {
  return t(`upgrade.${id}.description`);
}

export function upgradeDisplayName(def: UpgradeDef): string {
  const name = upgradeName(def.id);
  return def.evolution ? t('ui.evolutionTag', { name }) : name;
}

export function enemyName(id: EnemyId): string {
  return t(`enemy.${id}.name`);
}

export function levelName(id: LevelId): string {
  return t(`level.${id}.name`);
}

export function levelBlurb(id: LevelId): string {
  return t(`level.${id}.blurb`);
}
