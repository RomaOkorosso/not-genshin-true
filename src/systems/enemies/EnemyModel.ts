import type { EnemyDef, EnemyId } from '../../game/balance/enemies';
import { ENEMY_DEFS } from '../../game/balance/enemies';

export type EnemyState = 'moving' | 'winding_up' | 'attacking' | 'dead';

export interface EnemyModel {
  id: number;
  defId: EnemyId;
  def: EnemyDef;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  state: EnemyState;
  attackCooldown: number;
  windupRemaining: number;
  summonTriggered: boolean;
  hitFlash: number;
  moveSpeedMult: number;
  damageTakenMult: number;
  stoneSkinActive: boolean;
  stoneSkinTimer: number;
  stoneSkinTriggered: boolean;
  finalPushTriggered: boolean;
  periodicSummonTimer: number;
}

let nextEnemyId = 1;

export function resetEnemyIdCounter(start = 1): void {
  nextEnemyId = start;
}

export function createEnemy(defId: EnemyId, x: number, y: number): EnemyModel {
  const def = ENEMY_DEFS[defId];
  return {
    id: nextEnemyId++,
    defId,
    def,
    x,
    y,
    hp: def.maxHp,
    maxHp: def.maxHp,
    alive: true,
    state: 'moving',
    attackCooldown: 0,
    windupRemaining: 0,
    summonTriggered: false,
    hitFlash: 0,
    moveSpeedMult: 1,
    damageTakenMult: 1,
    stoneSkinActive: false,
    stoneSkinTimer: 0,
    stoneSkinTriggered: false,
    finalPushTriggered: false,
    periodicSummonTimer: def.periodicSummonMs ? def.periodicSummonMs / 1000 : 0,
  };
}

export function resetEnemy(enemy: EnemyModel, defId: EnemyId, x: number, y: number): void {
  const def = ENEMY_DEFS[defId];
  enemy.id = nextEnemyId++;
  enemy.defId = defId;
  enemy.def = def;
  enemy.x = x;
  enemy.y = y;
  enemy.hp = def.maxHp;
  enemy.maxHp = def.maxHp;
  enemy.alive = true;
  enemy.state = 'moving';
  enemy.attackCooldown = 0;
  enemy.windupRemaining = 0;
  enemy.summonTriggered = false;
  enemy.hitFlash = 0;
  enemy.moveSpeedMult = 1;
  enemy.damageTakenMult = 1;
  enemy.stoneSkinActive = false;
  enemy.stoneSkinTimer = 0;
  enemy.stoneSkinTriggered = false;
  enemy.finalPushTriggered = false;
  enemy.periodicSummonTimer = def.periodicSummonMs ? def.periodicSummonMs / 1000 : 0;
}
