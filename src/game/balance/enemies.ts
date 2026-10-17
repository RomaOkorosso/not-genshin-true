export type EnemyId = 'grunt' | 'elite_grunt' | 'raider_captain';

export interface EnemyDef {
  id: EnemyId;
  displayName: string;
  maxHp: number;
  towerDamage: number;
  xp: number;
  moveSpeed: number;
  attackIntervalMs: number;
  attackWindupMs: number;
  radius: number;
  spawnCost: number;
  color: number;
  elite?: boolean;
  boss?: boolean;
  /** Fraction of max HP at which summon triggers once (Raider Captain). */
  summonAtHpRatio?: number;
  summonCount?: number;
  summonEnemyId?: EnemyId;
}

export const ENEMY_DEFS: Record<EnemyId, EnemyDef> = {
  grunt: {
    id: 'grunt',
    displayName: 'Grunt',
    maxHp: 20,
    towerDamage: 4,
    xp: 1,
    moveSpeed: 55,
    attackIntervalMs: 1200,
    attackWindupMs: 350,
    radius: 12,
    spawnCost: 1,
    color: 0x4caf50,
  },
  elite_grunt: {
    id: 'elite_grunt',
    displayName: 'Elite Grunt',
    maxHp: 120,
    towerDamage: 10,
    xp: 7,
    moveSpeed: 48,
    attackIntervalMs: 1400,
    attackWindupMs: 400,
    radius: 18,
    spawnCost: 5,
    color: 0x2e7d32,
    elite: true,
  },
  raider_captain: {
    id: 'raider_captain',
    displayName: 'Raider Captain',
    maxHp: 500,
    towerDamage: 15,
    xp: 40,
    moveSpeed: 38.5, // ~70% of Grunt
    attackIntervalMs: 2500,
    attackWindupMs: 500,
    radius: 26,
    spawnCost: 20,
    color: 0xc62828,
    boss: true,
    summonAtHpRatio: 0.6,
    summonCount: 4,
    summonEnemyId: 'grunt',
  },
};
