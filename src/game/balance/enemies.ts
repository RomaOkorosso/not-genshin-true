export type EnemyId =
  | 'grunt'
  | 'elite_grunt'
  | 'raider_captain'
  | 'runner'
  | 'elite_runner'
  | 'brute'
  | 'elite_brute'
  | 'stone_golem';

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
  summonAtHpRatio?: number;
  summonCount?: number;
  summonEnemyId?: EnemyId;
  /** Periodic summon while alive (Stone Golem). */
  periodicSummonMs?: number;
  periodicSummonCount?: number;
  periodicSummonIds?: EnemyId[];
  stoneSkinAtRatio?: number;
  stoneSkinDurationMs?: number;
  stoneSkinDamageTakenMult?: number;
  finalPushAtRatio?: number;
  finalPushSpeedMult?: number;
}

const GRUNT_SPEED = 55;

export const ENEMY_DEFS: Record<EnemyId, EnemyDef> = {
  grunt: {
    id: 'grunt',
    displayName: 'Grunt',
    maxHp: 20,
    towerDamage: 4,
    xp: 1,
    moveSpeed: GRUNT_SPEED,
    attackIntervalMs: 1200,
    attackWindupMs: 350,
    radius: 12,
    spawnCost: 1,
    color: 0xe8a06e,
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
    color: 0xffb74d,
    elite: true,
  },
  raider_captain: {
    id: 'raider_captain',
    displayName: 'Raider Captain',
    maxHp: 500,
    towerDamage: 15,
    xp: 40,
    moveSpeed: GRUNT_SPEED * 0.7,
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
  runner: {
    id: 'runner',
    displayName: 'Runner',
    maxHp: 12,
    towerDamage: 3,
    xp: 1,
    moveSpeed: GRUNT_SPEED * 1.7,
    attackIntervalMs: 1000,
    attackWindupMs: 250,
    radius: 10,
    spawnCost: 1,
    color: 0x7e57c2,
  },
  elite_runner: {
    id: 'elite_runner',
    displayName: 'Elite Runner',
    maxHp: 55,
    towerDamage: 6,
    xp: 5,
    moveSpeed: GRUNT_SPEED * 1.85,
    attackIntervalMs: 900,
    attackWindupMs: 220,
    radius: 14,
    spawnCost: 4,
    color: 0x5e35b1,
    elite: true,
  },
  brute: {
    id: 'brute',
    displayName: 'Brute',
    maxHp: 60,
    towerDamage: 8,
    xp: 3,
    moveSpeed: GRUNT_SPEED * 0.75,
    attackIntervalMs: 1600,
    attackWindupMs: 450,
    radius: 20,
    spawnCost: 3,
    color: 0x8d6e63,
  },
  elite_brute: {
    id: 'elite_brute',
    displayName: 'Elite Brute',
    maxHp: 200,
    towerDamage: 14,
    xp: 10,
    moveSpeed: GRUNT_SPEED * 0.7,
    attackIntervalMs: 1700,
    attackWindupMs: 480,
    radius: 26,
    spawnCost: 8,
    color: 0x6d4c41,
    elite: true,
  },
  stone_golem: {
    id: 'stone_golem',
    displayName: 'Stone Golem',
    maxHp: 3200,
    towerDamage: 25,
    xp: 120,
    moveSpeed: GRUNT_SPEED * 0.35,
    attackIntervalMs: 2700,
    attackWindupMs: 600,
    radius: 40,
    spawnCost: 40,
    color: 0x78909c,
    boss: true,
    periodicSummonMs: 12_000,
    periodicSummonCount: 3,
    periodicSummonIds: ['grunt', 'runner'],
    stoneSkinAtRatio: 0.5,
    stoneSkinDurationMs: 8000,
    stoneSkinDamageTakenMult: 0.4,
    finalPushAtRatio: 0.2,
    finalPushSpeedMult: 1.6,
  },
};
