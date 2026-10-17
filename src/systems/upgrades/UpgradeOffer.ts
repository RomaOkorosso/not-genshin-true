import type { Rng } from '../../core/rng/Rng';
import {
  FIRST_LEVELUP_OFFER,
  LEVEL1_UPGRADE_POOL,
  getUpgradeDef,
  type UpgradeDef,
  type UpgradeId,
} from '../../game/balance/upgrades';

export function isUpgradeAvailable(def: UpgradeDef, owned: Map<UpgradeId, number>): boolean {
  const stacks = owned.get(def.id) ?? 0;
  if (stacks >= def.maxStacks) return false;
  if (def.requires) {
    for (const req of def.requires) {
      if (!owned.has(req)) return false;
    }
  }
  return true;
}

export function getAvailableUpgrades(owned: Map<UpgradeId, number>): UpgradeDef[] {
  return LEVEL1_UPGRADE_POOL.filter((def) => isUpgradeAvailable(def, owned));
}

/** Scripted first offer, then weighted RNG without duplicates. */
export function rollUpgradeOffer(
  owned: Map<UpgradeId, number>,
  levelUpsCompleted: number,
  rng: Rng,
  count = 3,
): UpgradeDef[] {
  if (levelUpsCompleted === 0) {
    return FIRST_LEVELUP_OFFER.map(getUpgradeDef).filter((def) =>
      isUpgradeAvailable(def, owned),
    );
  }

  const available = getAvailableUpgrades(owned);
  const picked: UpgradeDef[] = [];
  const remaining = [...available];

  while (picked.length < count && remaining.length > 0) {
    const choice = rng.weightedPick(remaining);
    picked.push(choice);
    const idx = remaining.findIndex((u) => u.id === choice.id);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return picked;
}
