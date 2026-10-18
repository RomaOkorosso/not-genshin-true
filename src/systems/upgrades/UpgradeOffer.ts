import type { Rng } from '../../core/rng/Rng';
import {
  FIRST_LEVELUP_OFFER,
  getUpgradeDef,
  getUpgradePool,
  type UpgradeDef,
  type UpgradeId,
  type UpgradePoolId,
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

export function getAvailableUpgrades(
  owned: Map<UpgradeId, number>,
  poolId: UpgradePoolId = 'level1',
): UpgradeDef[] {
  return getUpgradePool(poolId).filter((def) => isUpgradeAvailable(def, owned));
}

/** Prefer continuation / Evolution when available (slot bias). */
export function rollUpgradeOffer(
  owned: Map<UpgradeId, number>,
  levelUpsCompleted: number,
  rng: Rng,
  count = 3,
  poolId: UpgradePoolId = 'level1',
): UpgradeDef[] {
  if (levelUpsCompleted === 0) {
    return FIRST_LEVELUP_OFFER.map(getUpgradeDef).filter((def) =>
      isUpgradeAvailable(def, owned),
    );
  }

  const available = getAvailableUpgrades(owned, poolId);
  const picked: UpgradeDef[] = [];
  const remaining = [...available];

  const evolutions = remaining.filter((u) => u.evolution);
  if (evolutions.length > 0 && picked.length < count) {
    const evo = rng.weightedPick(evolutions.map((u) => ({ ...u, weight: u.weight * 2 })));
    picked.push(evo);
    const idx = remaining.findIndex((u) => u.id === evo.id);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  while (picked.length < count && remaining.length > 0) {
    const choice = rng.weightedPick(remaining);
    picked.push(choice);
    const idx = remaining.findIndex((u) => u.id === choice.id);
    if (idx >= 0) remaining.splice(idx, 1);
  }

  return picked;
}

export function hasOfferableEvolution(
  owned: Map<UpgradeId, number>,
  poolId: UpgradePoolId,
): boolean {
  return getAvailableUpgrades(owned, poolId).some((u) => u.evolution);
}
