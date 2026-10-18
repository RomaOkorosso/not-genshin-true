import { ARCHER_BASELINE, TOWER_BASELINE } from '../../game/balance/archer';
import type { UpgradeId } from '../../game/balance/upgrades';

export interface CombatStats {
  damage: number;
  attacksPerSecond: number;
  baseAttacksPerSecond: number;
  critChance: number;
  critMultiplier: number;
  projectileCount: number;
  projectileDamageMult: number;
  projectileSpeed: number;
  range: number;
  spreadDegrees: number;
  pierceCount: number;
  pierceDamageFalloff: number;
  ricochetCount: number;
  ricochetDamageMult: number[];
  towerMaxHp: number;
  xpGainMult: number;
  volleyEnabled: boolean;
  arrowStormEnabled: boolean;
  phantomBarrage: boolean;
  deadeyeFrenzy: boolean;
  attackCounter: number;
  frenzyStacks: number;
  frenzyTimer: number;
}

export function createBaseCombatStats(): CombatStats {
  return {
    damage: ARCHER_BASELINE.damage,
    attacksPerSecond: ARCHER_BASELINE.attacksPerSecond,
    baseAttacksPerSecond: ARCHER_BASELINE.attacksPerSecond,
    critChance: ARCHER_BASELINE.critChance,
    critMultiplier: ARCHER_BASELINE.critMultiplier,
    projectileCount: ARCHER_BASELINE.projectileCount,
    projectileDamageMult: 1,
    projectileSpeed: ARCHER_BASELINE.projectileSpeed,
    range: ARCHER_BASELINE.range,
    spreadDegrees: ARCHER_BASELINE.spreadDegrees,
    pierceCount: ARCHER_BASELINE.pierceCount,
    pierceDamageFalloff: ARCHER_BASELINE.pierceDamageFalloff,
    ricochetCount: 0,
    ricochetDamageMult: [],
    towerMaxHp: TOWER_BASELINE.maxHp,
    xpGainMult: 1,
    volleyEnabled: false,
    arrowStormEnabled: false,
    phantomBarrage: false,
    deadeyeFrenzy: false,
    attackCounter: 0,
    frenzyStacks: 0,
    frenzyTimer: 0,
  };
}

export function refreshAttackSpeed(stats: CombatStats): void {
  const frenzyBonus = stats.deadeyeFrenzy ? 1 + stats.frenzyStacks * 0.04 : 1;
  stats.attacksPerSecond = stats.baseAttacksPerSecond * frenzyBonus;
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
    case 'volley':
      stats.volleyEnabled = true;
      break;
    case 'arrow_storm':
      stats.arrowStormEnabled = true;
      break;
    case 'quick_draw':
    case 'quick_draw_ii':
      stats.baseAttacksPerSecond *= 1.15;
      refreshAttackSpeed(stats);
      break;
    case 'critical_eye':
      stats.critChance += 0.1;
      break;
    case 'deadly_precision':
      stats.critMultiplier = 1.75;
      break;
    case 'deadeye_frenzy':
      stats.deadeyeFrenzy = true;
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
    case 'piercing_ii':
      stats.pierceCount += 1;
      stats.pierceDamageFalloff = 0.12;
      break;
    case 'ricochet_i':
      stats.ricochetCount = Math.max(stats.ricochetCount, 1);
      stats.ricochetDamageMult = [0.7];
      break;
    case 'ricochet_ii':
      stats.ricochetCount = Math.max(stats.ricochetCount, 2);
      stats.ricochetDamageMult = [0.7, 0.55];
      break;
    case 'phantom_barrage':
      stats.phantomBarrage = true;
      stats.projectileSpeed *= 1.15;
      stats.projectileDamageMult *= 1.1;
      break;
    case 'reinforced_tower':
      stats.towerMaxHp = Math.round(stats.towerMaxHp * 1.15);
      break;
    case 'emergency_repair':
      break;
    default: {
      const _exhaustive: never = upgradeId;
      void _exhaustive;
    }
  }
}
