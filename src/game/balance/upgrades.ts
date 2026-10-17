export type UpgradeId =
  | 'multishot_i'
  | 'multishot_ii'
  | 'tight_spread'
  | 'quick_draw'
  | 'quick_draw_ii'
  | 'sharpened_arrows_i'
  | 'sharpened_arrows_ii'
  | 'sharpened_arrows_iii'
  | 'critical_eye'
  | 'piercing_i'
  | 'reinforced_tower'
  | 'emergency_repair';

export type UpgradeBranch = 'multishot' | 'speed' | 'damage' | 'pierce' | 'tower' | 'utility';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  branch: UpgradeBranch;
  weight: number;
  maxStacks: number;
  /** Required upgrades already owned (any stacks count). */
  requires?: UpgradeId[];
  /** Mutually exclusive / replaces previous tier. */
  replaces?: UpgradeId;
}

/** Level 1 pool only — no Evolutions. */
export const LEVEL1_UPGRADE_POOL: UpgradeDef[] = [
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

export const FIRST_LEVELUP_OFFER: UpgradeId[] = [
  'multishot_i',
  'quick_draw',
  'sharpened_arrows_i',
];

export function getUpgradeDef(id: UpgradeId): UpgradeDef {
  const def = LEVEL1_UPGRADE_POOL.find((u) => u.id === id);
  if (!def) throw new Error(`Unknown upgrade: ${id}`);
  return def;
}
