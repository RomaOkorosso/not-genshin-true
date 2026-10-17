import { ARCHER_BASELINE, TOWER_BASELINE } from '../../game/balance/archer';
import type { UpgradeId } from '../../game/balance/upgrades';

export interface CombatStats {
  damage: number;
  attacksPerSecond: number;
  critChance: number;
  critMultiplier: number;
  projectileCount: number;
  /** Multiplier applied to each projectile's damage (multishot falloff). */
  projectileDamageMult: number;
  projectileSpeed: number;
  range: number;
  spreadDegrees: number;
  pierceCount: number;
  pierceDamageFalloff: number;
  towerMaxHp: number;
  xpGainMult: number;
}

export function createBaseCombatStats(): CombatStats {
  return {
    damage: ARCHER_BASELINE.damage,
    attacksPerSecond: ARCHER_BASELINE.attacksPerSecond,
    critChance: ARCHER_BASELINE.critChance,
    critMultiplier: ARCHER_BASELINE.critMultiplier,
    projectileCount: ARCHER_BASELINE.projectileCount,
    projectileDamageMult: 1,
    projectileSpeed: ARCHER_BASELINE.projectileSpeed,
    range: ARCHER_BASELINE.range,
    spreadDegrees: ARCHER_BASELINE.spreadDegrees,
    pierceCount: ARCHER_BASELINE.pierceCount,
    pierceDamageFalloff: ARCHER_BASELINE.pierceDamageFalloff,
    towerMaxHp: TOWER_BASELINE.maxHp,
    xpGainMult: 1,
  };
}

export function applyUpgrade(stats: CombatStats, upgradeId: UpgradeId): void {
  switch (upgradeId) {
    case 'multishot_i':
      stats.projectileCount += 1;
      stats.projectileDamageMult = 0.9;
      break;
    case 'multishot_ii':
      stats.projectileCount += 1;
      stats.projectileDamageMult = 0.8;
      break;
    case 'tight_spread':
      stats.spreadDegrees *= 0.7;
      stats.projectileDamageMult *= 1.05;
      break;
    case 'quick_draw':
    case 'quick_draw_ii':
      stats.attacksPerSecond *= 1.15;
      break;
    case 'critical_eye':
      stats.critChance += 0.1;
      break;
    case 'sharpened_arrows_i':
    case 'sharpened_arrows_ii':
    case 'sharpened_arrows_iii':
      stats.damage *= 1.12;
      break;
    case 'piercing_i':
      stats.pierceCount += 1;
      stats.pierceDamageFalloff = 0.15;
      break;
    case 'reinforced_tower':
      stats.towerMaxHp = Math.round(stats.towerMaxHp * 1.15);
      break;
    case 'emergency_repair':
      // Instant heal handled by run controller.
      break;
    default: {
      const _exhaustive: never = upgradeId;
      void _exhaustive;
    }
  }
}

export function ownedUpgradeIds(owned: Map<UpgradeId, number>): UpgradeId[] {
  return [...owned.keys()];
}
