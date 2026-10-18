export type UpgradeId =
  | 'multishot_i'
  | 'multishot_ii'
  | 'tight_spread'
  | 'volley'
  | 'arrow_storm'
  | 'quick_draw'
  | 'quick_draw_ii'
  | 'critical_eye'
  | 'deadly_precision'
  | 'deadeye_frenzy'
  | 'sharpened_arrows_i'
  | 'sharpened_arrows_ii'
  | 'sharpened_arrows_iii'
  | 'piercing_i'
  | 'piercing_ii'
  | 'ricochet_i'
  | 'ricochet_ii'
  | 'phantom_barrage'
  | 'reinforced_tower'
  | 'emergency_repair';

export type UpgradeBranch =
  | 'multishot'
  | 'speed'
  | 'damage'
  | 'pierce'
  | 'tower'
  | 'utility'
  | 'evolution';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  branch: UpgradeBranch;
  weight: number;
  maxStacks: number;
  requires?: UpgradeId[];
  replaces?: UpgradeId;
  evolution?: boolean;
}

/** Full Archer catalog (Milestone 2). */
export const ALL_UPGRADES: UpgradeDef[] = [
  {
    id: 'multishot_i',
    name: 'Multishot I',
    description: '+1 projectile. Each arrow deals 90% damage.',
    branch: 'multishot',
    weight: 10,
    maxStacks: 1,
  },
  {
    id: 'multishot_ii',
    name: 'Multishot II',
    description: '+1 projectile. Each arrow deals 80% damage.',
    branch: 'multishot',
    weight: 8,
    maxStacks: 1,
    requires: ['multishot_i'],
  },
  {
    id: 'tight_spread',
    name: 'Tight Spread',
    description: '-30% spread. +5% projectile damage.',
    branch: 'multishot',
    weight: 7,
    maxStacks: 1,
    requires: ['multishot_ii'],
  },
  {
    id: 'volley',
    name: 'Volley',
    description: 'Every 6th attack: +3 arrows at 70% damage.',
    branch: 'multishot',
    weight: 6,
    maxStacks: 1,
    requires: ['tight_spread'],
  },
  {
    id: 'arrow_storm',
    name: 'Arrow Storm',
    description: 'Evolution: every 5s fire an 8-arrow fan (65% dmg each).',
    branch: 'evolution',
    weight: 14,
    maxStacks: 1,
    requires: ['volley'],
    evolution: true,
  },
  {
    id: 'quick_draw',
    name: 'Quick Draw',
    description: '+15% attack speed.',
    branch: 'speed',
    weight: 10,
    maxStacks: 1,
  },
  {
    id: 'quick_draw_ii',
    name: 'Quick Draw II',
    description: '+15% attack speed.',
    branch: 'speed',
    weight: 8,
    maxStacks: 1,
    requires: ['quick_draw'],
  },
  {
    id: 'critical_eye',
    name: 'Critical Eye',
    description: '+10% crit chance.',
    branch: 'speed',
    weight: 7,
    maxStacks: 1,
    requires: ['quick_draw_ii'],
  },
  {
    id: 'deadly_precision',
    name: 'Deadly Precision',
    description: 'Crit multiplier x1.5 → x1.75.',
    branch: 'speed',
    weight: 6,
    maxStacks: 1,
    requires: ['critical_eye'],
  },
  {
    id: 'deadeye_frenzy',
    name: 'Deadeye Frenzy',
    description: 'Evolution: on crit +4% AS for 3s, max 5 stacks.',
    branch: 'evolution',
    weight: 14,
    maxStacks: 1,
    requires: ['deadly_precision'],
    evolution: true,
  },
  {
    id: 'sharpened_arrows_i',
    name: 'Sharpened Arrows',
    description: '+12% damage.',
    branch: 'damage',
    weight: 12,
    maxStacks: 1,
  },
  {
    id: 'sharpened_arrows_ii',
    name: 'Sharpened Arrows II',
    description: '+12% damage.',
    branch: 'damage',
    weight: 10,
    maxStacks: 1,
    requires: ['sharpened_arrows_i'],
  },
  {
    id: 'sharpened_arrows_iii',
    name: 'Sharpened Arrows III',
    description: '+12% damage.',
    branch: 'damage',
    weight: 8,
    maxStacks: 1,
    requires: ['sharpened_arrows_ii'],
  },
  {
    id: 'piercing_i',
    name: 'Piercing I',
    description: 'Pierce 1 extra target. -15% damage after pierce.',
    branch: 'pierce',
    weight: 8,
    maxStacks: 1,
  },
  {
    id: 'piercing_ii',
    name: 'Piercing II',
    description: '+1 pierce. Falloff -12% per extra target.',
    branch: 'pierce',
    weight: 7,
    maxStacks: 1,
    requires: ['piercing_i'],
  },
  {
    id: 'ricochet_i',
    name: 'Ricochet I',
    description: '1 ricochet at 70% damage.',
    branch: 'pierce',
    weight: 6,
    maxStacks: 1,
    requires: ['piercing_ii'],
  },
  {
    id: 'ricochet_ii',
    name: 'Ricochet II',
    description: '+1 ricochet. Second bounce 55% damage.',
    branch: 'pierce',
    weight: 5,
    maxStacks: 1,
    requires: ['ricochet_i'],
  },
  {
    id: 'phantom_barrage',
    name: 'Phantom Barrage',
    description: 'Evolution: pierce+ricochet coexist. +15% proj speed, +10% dmg.',
    branch: 'evolution',
    weight: 14,
    maxStacks: 1,
    requires: ['ricochet_ii'],
    evolution: true,
  },
  {
    id: 'reinforced_tower',
    name: 'Reinforced Tower',
    description: '+15% max tower HP (heals the bonus).',
    branch: 'tower',
    weight: 6,
    maxStacks: 1,
  },
  {
    id: 'emergency_repair',
    name: 'Emergency Repair',
    description: 'Restore 20% tower HP.',
    branch: 'utility',
    weight: 5,
    maxStacks: 1,
  },
];

const byId = new Map(ALL_UPGRADES.map((u) => [u.id, u]));

export function getUpgradeDef(id: UpgradeId): UpgradeDef {
  const def = byId.get(id);
  if (!def) throw new Error(`Unknown upgrade: ${id}`);
  return def;
}

/** Level 1 pool — no Evolutions. */
export const LEVEL1_UPGRADE_POOL: UpgradeDef[] = ALL_UPGRADES.filter(
  (u) =>
    !u.evolution &&
    u.id !== 'volley' &&
    u.id !== 'deadly_precision' &&
    u.id !== 'piercing_ii' &&
    u.id !== 'ricochet_i' &&
    u.id !== 'ricochet_ii',
);

/** Level 2–3: deeper projectile cards, still no Evolutions. */
export const LEVEL2_3_UPGRADE_POOL: UpgradeDef[] = ALL_UPGRADES.filter((u) => !u.evolution);

/** Level 4–5: full tree including Evolutions. */
export const LEVEL4_5_UPGRADE_POOL: UpgradeDef[] = [...ALL_UPGRADES];

export const FIRST_LEVELUP_OFFER: UpgradeId[] = [
  'multishot_i',
  'quick_draw',
  'sharpened_arrows_i',
];

export type UpgradePoolId = 'level1' | 'level2_3' | 'level4_5';

export function getUpgradePool(poolId: UpgradePoolId): UpgradeDef[] {
  switch (poolId) {
    case 'level1':
      return LEVEL1_UPGRADE_POOL;
    case 'level2_3':
      return LEVEL2_3_UPGRADE_POOL;
    case 'level4_5':
      return LEVEL4_5_UPGRADE_POOL;
  }
}
