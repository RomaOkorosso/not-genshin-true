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

/** Base approach speed — tuned so early packs are killable before they stack on the tower. */
const GRUNT_SPEED = 42;

export const ENEMY_DEFS: Record<EnemyId, EnemyDef> = {
  grunt: {
    id: 'grunt',
    displayName: 'Grunt',
    maxHp: 18,
    towerDamage: 3,
    xp: 1,
    moveSpeed: GRUNT_SPEED,
    attackIntervalMs: 1400,
    attackWindupMs: 380,
    radius: 12,
    spawnCost: 1,
    color: 0xe8a06e,
  },
  elite_grunt: {
    id: 'elite_grunt',
    displayName: 'Elite Grunt',
    maxHp: 100,
    towerDamage: 7,
    xp: 7,
    moveSpeed: 38,
    attackIntervalMs: 1500,
    attackWindupMs: 420,
    radius: 18,
    spawnCost: 5,
    color: 0xffb74d,
    elite: true,
  },
  raider_captain: {
    id: 'raider_captain',
    displayName: 'Raider Captain',
    maxHp: 420,
    towerDamage: 12,
    xp: 40,
    moveSpeed: GRUNT_SPEED * 0.7,
    attackIntervalMs: 2600,
    attackWindupMs: 550,
    radius: 26,
    spawnCost: 20,
    color: 0xc62828,
    boss: true,
    summonAtHpRatio: 0.6,
    summonCount: 3,
    summonEnemyId: 'grunt',
  },
  runner: {
    id: 'runner',
    displayName: 'Runner',
    maxHp: 11,
    towerDamage: 2,
    xp: 1,
    moveSpeed: GRUNT_SPEED * 1.4,
    attackIntervalMs: 1100,
    attackWindupMs: 280,
    radius: 10,
    spawnCost: 1,
    color: 0x7e57c2,
  },
  elite_runner: {
    id: 'elite_runner',
    displayName: 'Elite Runner',
    maxHp: 48,
    towerDamage: 4,
    xp: 5,
    moveSpeed: GRUNT_SPEED * 1.5,
    attackIntervalMs: 1000,
    attackWindupMs: 250,
    radius: 14,
    spawnCost: 4,
    color: 0x5e35b1,
    elite: true,
  },
  brute: {
    id: 'brute',
    displayName: 'Brute',
    maxHp: 52,
    towerDamage: 5,
    xp: 3,
    moveSpeed: GRUNT_SPEED * 0.65,
    attackIntervalMs: 1800,
    attackWindupMs: 480,
    radius: 20,
    spawnCost: 3,
    color: 0x8d6e63,
  },
  elite_brute: {
    id: 'elite_brute',
    displayName: 'Elite Brute',
    maxHp: 170,
    towerDamage: 9,
    xp: 10,
    moveSpeed: GRUNT_SPEED * 0.6,
    attackIntervalMs: 1900,
    attackWindupMs: 500,
    radius: 26,
    spawnCost: 8,
    color: 0x6d4c41,
    elite: true,
  },
  stone_golem: {
    id: 'stone_golem',
    displayName: 'Stone Golem',
    maxHp: 1800,
    towerDamage: 10,
    xp: 120,
    moveSpeed: GRUNT_SPEED * 0.28,
    attackIntervalMs: 3000,
    attackWindupMs: 700,
    radius: 40,
    spawnCost: 40,
    color: 0x78909c,
    boss: true,
    periodicSummonMs: 18_000,
    periodicSummonCount: 1,
    periodicSummonIds: ['grunt', 'runner'],
    stoneSkinAtRatio: 0.5,
    stoneSkinDurationMs: 5500,
    stoneSkinDamageTakenMult: 0.55,
    finalPushAtRatio: 0.2,
    finalPushSpeedMult: 1.35,
  },
};
