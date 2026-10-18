export interface ArcherBaseline {
  damage: number;
  attacksPerSecond: number;
  critChance: number;
  critMultiplier: number;
  projectileCount: number;
  projectileSpeed: number;
  range: number;
  spreadDegrees: number;
  pierceCount: number;
  pierceDamageFalloff: number;
}

export const ARCHER_BASELINE: ArcherBaseline = {
  damage: 12,
  attacksPerSecond: 1.15,
  critChance: 0.06,
  critMultiplier: 1.55,
  projectileCount: 1,
  projectileSpeed: 440,
  range: 360,
  spreadDegrees: 16,
  pierceCount: 0,
  pierceDamageFalloff: 0.15,
};

export const TOWER_BASELINE: {
  maxHp: number;
  radius: number;
  /** Level 1 only: first time HP drops below this ratio, emergency heal. */
  emergencyHpRatio: number;
  emergencyHealRatio: number;
} = {
  maxHp: 120,
  radius: 36,
  emergencyHpRatio: 0.25,
  emergencyHealRatio: 0.35,
};

/** Archer Ultimate — one simple combat button (Milestone 2.5). */
export const ARCHER_ULTIMATE = {
  cooldownMs: 25_000,
  arrowCount: 12,
  damageMult: 1.35,
  /** Fan width in radians when a target is locked. */
  fanSpread: (Math.PI * 2) / 3,
} as const;

export const XP_CURVE = {
  /** XP required to go from level L to L+1: base + (L-1)*growth — slightly faster early levels. */
  base: 4,
  growth: 2.5,
} as const;

export function xpRequiredForLevel(level: number): number {
  return Math.round(XP_CURVE.base + Math.max(0, level - 1) * XP_CURVE.growth);
}
