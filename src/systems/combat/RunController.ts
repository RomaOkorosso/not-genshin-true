import { EventBus } from '../../core/events/EventBus';
import { ObjectPool } from '../../core/pooling/ObjectPool';
import { Rng } from '../../core/rng/Rng';
import { TimerService } from '../../core/timers/TimerService';
import { xpRequiredForLevel } from '../../game/balance/archer';
import { TOWER_BASELINE } from '../../game/balance/archer';
import type { EnemyId } from '../../game/balance/enemies';
import type { UpgradeDef, UpgradeId } from '../../game/balance/upgrades';
import type { AudioService } from '../../platform/types';
import {
  applyUpgrade,
  createBaseCombatStats,
  type CombatStats,
} from '../heroes/ArcherStats';
import {
  createEnemy,
  resetEnemy,
  resetEnemyIdCounter,
  type EnemyModel,
} from '../enemies/EnemyModel';
import { rollUpgradeOffer } from '../upgrades/UpgradeOffer';
import { WaveDirector } from '../waves/WaveDirector';
import {
  createProjectile,
  deactivateProjectile,
  launchProjectile,
  resetProjectileIdCounter,
  type ProjectileModel,
} from './ProjectileModel';
import { multishotAngleOffsets } from './MultishotAim';
import { nearestToTower, type TargetingStrategy } from './Targeting';

export type RunPhase = 'combat' | 'levelup' | 'paused' | 'victory' | 'defeat';

export interface RunSnapshot {
  phase: RunPhase;
  elapsedMs: number;
  durationMs: number;
  towerHp: number;
  towerMaxHp: number;
  heroLevel: number;
  xp: number;
  xpToNext: number;
  ownedUpgrades: UpgradeId[];
  offer: UpgradeDef[] | null;
  enemyCount: number;
  killCount: number;
  bossAlive: boolean;
  emergencyUsed: boolean;
}

export interface RunEvents {
  onLevelUp: { level: number; offer: UpgradeDef[] };
  onVictory: { towerHp: number; elapsedMs: number };
  onDefeat: { elapsedMs: number };
  onEliteSpawn: { enemyId: EnemyId };
  onBossSpawn: { enemyId: EnemyId };
  onBossSummon: { count: number };
}

const ARENA = {
  width: 720,
  height: 1280,
  centerX: 360,
  centerY: 640,
  spawnPadding: 80,
} as const;

const MAX_DELTA_MS = 50;

export class RunController {
  readonly bus = new EventBus();
  readonly timers = new TimerService();

  private rng: Rng;
  private waves: WaveDirector;
  private stats: CombatStats = createBaseCombatStats();
  private owned = new Map<UpgradeId, number>();
  private phase: RunPhase = 'combat';
  private towerHp = TOWER_BASELINE.maxHp;
  private towerMaxHp = TOWER_BASELINE.maxHp;
  private heroLevel = 1;
  private xp = 0;
  private attackCooldown = 0;
  private emergencyUsed = false;
  private killCount = 0;
  private levelUpsCompleted = 0;
  private pendingOffer: UpgradeDef[] | null = null;
  private targeting: TargetingStrategy = nearestToTower;
  private victoryPending = false;

  private readonly enemies: EnemyModel[] = [];
  private readonly projectiles: ProjectileModel[] = [];
  private readonly enemyPool: ObjectPool<EnemyModel>;
  private readonly projectilePool: ObjectPool<ProjectileModel>;

  constructor(
    private readonly audio: AudioService,
    seed?: number,
  ) {
    this.rng = new Rng(seed ?? Date.now() >>> 0);
    this.waves = new WaveDirector(this.rng);
    this.enemyPool = new ObjectPool(
      () => createEnemy('grunt', 0, 0),
      (e) => {
        e.alive = false;
        e.state = 'dead';
      },
      48,
    );
    this.projectilePool = new ObjectPool(createProjectile, deactivateProjectile, 64);
  }

  start(seed?: number): void {
    this.cleanup();
    resetEnemyIdCounter();
    resetProjectileIdCounter();
    this.rng = new Rng(seed ?? Date.now() >>> 0);
    this.waves = new WaveDirector(this.rng);
    this.stats = createBaseCombatStats();
    this.owned.clear();
    this.phase = 'combat';
    this.towerMaxHp = TOWER_BASELINE.maxHp;
    this.towerHp = this.towerMaxHp;
    this.heroLevel = 1;
    this.xp = 0;
    this.attackCooldown = 0;
    this.emergencyUsed = false;
    this.killCount = 0;
    this.levelUpsCompleted = 0;
    this.pendingOffer = null;
    this.victoryPending = false;
    this.timers.setWorldPaused(false);
  }

  cleanup(): void {
    this.timers.clearAll();
    this.bus.clear();
    for (const e of this.enemies) this.enemyPool.release(e);
    this.enemies.length = 0;
    for (const p of this.projectiles) this.projectilePool.release(p);
    this.projectiles.length = 0;
  }

  getPhase(): RunPhase {
    return this.phase;
  }

  getEnemies(): readonly EnemyModel[] {
    return this.enemies;
  }

  getProjectiles(): readonly ProjectileModel[] {
    return this.projectiles;
  }

  getStats(): CombatStats {
    return this.stats;
  }

  getArena() {
    return ARENA;
  }

  snapshot(): RunSnapshot {
    return {
      phase: this.phase,
      elapsedMs: this.waves.getElapsedMs(),
      durationMs: this.waves.getDurationMs(),
      towerHp: this.towerHp,
      towerMaxHp: this.towerMaxHp,
      heroLevel: this.heroLevel,
      xp: this.xp,
      xpToNext: xpRequiredForLevel(this.heroLevel),
      ownedUpgrades: [...this.owned.keys()],
      offer: this.pendingOffer,
      enemyCount: this.enemies.filter((e) => e.alive).length,
      killCount: this.killCount,
      bossAlive: this.enemies.some((e) => e.alive && e.def.boss),
      emergencyUsed: this.emergencyUsed,
    };
  }

  togglePause(): void {
    if (this.phase === 'combat') {
      this.phase = 'paused';
      this.timers.setWorldPaused(true);
    } else if (this.phase === 'paused') {
      this.phase = 'combat';
      this.timers.setWorldPaused(false);
    }
  }

  isSimulating(): boolean {
    return this.phase === 'combat';
  }

  chooseUpgrade(upgradeId: UpgradeId): void {
    if (this.phase !== 'levelup' || !this.pendingOffer) return;
    if (!this.pendingOffer.some((u) => u.id === upgradeId)) return;

    const stacks = this.owned.get(upgradeId) ?? 0;
    this.owned.set(upgradeId, stacks + 1);
    applyUpgrade(this.stats, upgradeId);

    if (upgradeId === 'reinforced_tower') {
      const bonus = this.stats.towerMaxHp - this.towerMaxHp;
      this.towerMaxHp = this.stats.towerMaxHp;
      this.towerHp = Math.min(this.towerMaxHp, this.towerHp + Math.max(0, bonus));
    }
    if (upgradeId === 'emergency_repair') {
      this.towerHp = Math.min(this.towerMaxHp, this.towerHp + this.towerMaxHp * 0.2);
    }

    this.audio.play('upgrade_selected');
    this.pendingOffer = null;
    this.phase = 'combat';
    this.timers.setWorldPaused(false);
    this.levelUpsCompleted += 1;
  }

  update(rawDeltaMs: number): void {
    const deltaMs = Math.min(Math.max(rawDeltaMs, 0), MAX_DELTA_MS);
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    if (this.phase === 'paused' || this.phase === 'levelup') {
      return;
    }

    this.timers.update(deltaMs);
    this.spawnFromWaves(deltaMs);
    this.updateEnemies(deltaMs / 1000);
    this.updateAttack(deltaMs / 1000);
    this.updateProjectiles(deltaMs / 1000);
    this.checkEndConditions();
  }

  private spawnFromWaves(deltaMs: number): void {
    const requests = this.waves.update(deltaMs);
    for (const req of requests) {
      this.spawnEnemy(req.enemyId, req.angle);
    }
  }

  spawnEnemy(enemyId: EnemyId, angle: number): EnemyModel {
    const dist =
      Math.max(ARENA.width, ARENA.height) * 0.55 + ARENA.spawnPadding + this.rng.range(0, 40);
    const x = ARENA.centerX + Math.cos(angle) * dist;
    const y = ARENA.centerY + Math.sin(angle) * dist;
    const enemy = this.enemyPool.acquire();
    resetEnemy(enemy, enemyId, x, y);
    this.enemies.push(enemy);

    if (enemy.def.elite) {
      this.audio.play('elite_arrival');
      this.bus.emit<RunEvents['onEliteSpawn']>('elite_spawn', { enemyId });
    }
    if (enemy.def.boss) {
      this.audio.play('boss_arrival');
      this.bus.emit<RunEvents['onBossSpawn']>('boss_spawn', { enemyId });
    }
    return enemy;
  }

  private updateEnemies(dt: number): void {
    const cx = ARENA.centerX;
    const cy = ARENA.centerY;
    const towerR = TOWER_BASELINE.radius;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      if (!e.alive) {
        this.enemyPool.release(e);
        this.enemies.splice(i, 1);
        continue;
      }

      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);

      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stopDist = towerR + e.def.radius;

      if (e.state === 'moving') {
        if (dist <= stopDist) {
          e.state = 'winding_up';
          e.windupRemaining = e.def.attackWindupMs / 1000;
        } else {
          const step = e.def.moveSpeed * dt;
          e.x += (dx / dist) * step;
          e.y += (dy / dist) * step;
        }
      } else if (e.state === 'winding_up') {
        e.windupRemaining -= dt;
        if (e.windupRemaining <= 0) {
          this.applyTowerDamage(e.def.towerDamage);
          this.audio.play('tower_hit');
          e.state = 'attacking';
          e.attackCooldown = e.def.attackIntervalMs / 1000;
        }
      } else if (e.state === 'attacking') {
        e.attackCooldown -= dt;
        if (e.attackCooldown <= 0) {
          e.state = 'winding_up';
          e.windupRemaining = e.def.attackWindupMs / 1000;
        }
      }

      if (
        e.def.summonAtHpRatio !== undefined &&
        !e.summonTriggered &&
        e.hp / e.maxHp <= e.def.summonAtHpRatio
      ) {
        e.summonTriggered = true;
        const count = e.def.summonCount ?? 0;
        const summonId = e.def.summonEnemyId ?? 'grunt';
        for (let s = 0; s < count; s++) {
          const a = this.rng.range(0, Math.PI * 2);
          this.spawnEnemy(summonId, a);
        }
        this.bus.emit<RunEvents['onBossSummon']>('boss_summon', { count });
      }
    }
  }

  private applyTowerDamage(amount: number): void {
    this.towerHp = Math.max(0, this.towerHp - amount);
    if (
      !this.emergencyUsed &&
      this.towerHp > 0 &&
      this.towerHp / this.towerMaxHp < TOWER_BASELINE.emergencyHpRatio
    ) {
      this.emergencyUsed = true;
      this.towerHp = Math.min(
        this.towerMaxHp,
        this.towerHp + this.towerMaxHp * TOWER_BASELINE.emergencyHealRatio,
      );
    }
    if (this.towerHp <= 0) {
      this.phase = 'defeat';
      this.timers.setWorldPaused(true);
      this.audio.play('defeat');
      this.bus.emit<RunEvents['onDefeat']>('defeat', {
        elapsedMs: this.waves.getElapsedMs(),
      });
    }
  }

  private updateAttack(dt: number): void {
    this.attackCooldown -= dt;
    if (this.attackCooldown > 0) return;

    const target = this.targeting(
      ARENA.centerX,
      ARENA.centerY,
      this.stats.range,
      this.enemies,
    );
    if (!target) return;

    this.attackCooldown = 1 / this.stats.attacksPerSecond;
    this.fireAt(target.x, target.y);
    this.audio.play('archer_shot');
  }

  private fireAt(tx: number, ty: number): void {
    const cx = ARENA.centerX;
    const cy = ARENA.centerY;
    // Aim radially from tower center — enemies walk along the same rays.
    const baseAngle = Math.atan2(ty - cy, tx - cx);
    const count = this.stats.projectileCount;
    const spreadRad = (this.stats.spreadDegrees * Math.PI) / 180;
    const offsets = multishotAngleOffsets(count, spreadRad);
    /** Muzzle sits on the fire ray so the path shares the enemy's radial line. */
    const muzzle = 44;

    for (const offset of offsets) {
      const angle = baseAngle + offset;
      const crit = this.rng.next() < this.stats.critChance;
      const damage =
        this.stats.damage *
        this.stats.projectileDamageMult *
        (crit ? this.stats.critMultiplier : 1);
      const p = this.projectilePool.acquire();
      launchProjectile(p, {
        x: cx + Math.cos(angle) * muzzle,
        y: cy + Math.sin(angle) * muzzle,
        angle,
        speed: this.stats.projectileSpeed,
        damage,
        crit,
        pierce: this.stats.pierceCount,
        pierceFalloff: this.stats.pierceDamageFalloff,
      });
      this.projectiles.push(p);
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!;
      if (!p.active) {
        this.projectilePool.release(p);
        this.projectiles.splice(i, 1);
        continue;
      }

      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime -= dt;
      if (p.lifetime <= 0 || this.outOfBounds(p.x, p.y)) {
        deactivateProjectile(p);
        this.projectilePool.release(p);
        this.projectiles.splice(i, 1);
        continue;
      }

      let consumed = false;
      for (const e of this.enemies) {
        if (!e.alive || p.hitIds.has(e.id)) continue;
        const hitR = e.def.radius + p.radius;
        if (!segmentHitsCircle(prevX, prevY, p.x, p.y, e.x, e.y, hitR)) continue;

        p.hitIds.add(e.id);
        this.damageEnemy(e, p.damage, p.crit);

        if (p.pierceRemaining > 0) {
          p.pierceRemaining -= 1;
          p.damage *= 1 - p.pierceFalloff;
        } else {
          deactivateProjectile(p);
          this.projectilePool.release(p);
          this.projectiles.splice(i, 1);
          consumed = true;
          break;
        }
      }
      if (consumed) continue;
    }
  }

  private damageEnemy(e: EnemyModel, damage: number, crit: boolean): void {
    e.hp -= damage;
    e.hitFlash = 0.12;
    this.audio.play(crit ? 'crit_hit' : 'hit');
    if (e.hp <= 0) {
      e.alive = false;
      e.state = 'dead';
      this.killCount += 1;
      this.audio.play('enemy_death');
      this.grantXp(e.def.xp);
      if (e.def.boss) {
        this.victoryPending = true;
      }
    }
  }

  private grantXp(amount: number): void {
    this.xp += amount * this.stats.xpGainMult;
    while (this.xp >= xpRequiredForLevel(this.heroLevel)) {
      this.xp -= xpRequiredForLevel(this.heroLevel);
      this.heroLevel += 1;
      this.openLevelUp();
      if (this.phase !== 'combat') break;
    }
  }

  private openLevelUp(): void {
    const offer = rollUpgradeOffer(this.owned, this.levelUpsCompleted, this.rng, 3);
    if (offer.length === 0) return;
    this.pendingOffer = offer;
    this.phase = 'levelup';
    this.timers.setWorldPaused(true);
    this.audio.play('level_up');
    this.bus.emit<RunEvents['onLevelUp']>('level_up', {
      level: this.heroLevel,
      offer,
    });
  }

  private checkEndConditions(): void {
    if (this.phase !== 'combat') return;

    if (this.victoryPending) {
      const bossAlive = this.enemies.some((e) => e.alive && e.def.boss);
      if (!bossAlive) {
        this.phase = 'victory';
        this.timers.setWorldPaused(true);
        this.audio.play('victory');
        this.bus.emit<RunEvents['onVictory']>('victory', {
          towerHp: this.towerHp,
          elapsedMs: this.waves.getElapsedMs(),
        });
      }
    }

    // If time is up and captain never spawned somehow, still allow clear of remaining.
    if (this.waves.isTimeUp() && this.enemies.every((e) => !e.alive || !e.def.boss)) {
      // Wait for captain kill primarily; if somehow no boss left after time, win when field clear
      // after captain was killed (victoryPending) — handled above.
    }
  }

  private outOfBounds(x: number, y: number): boolean {
    const pad = 120;
    return (
      x < -pad ||
      y < -pad ||
      x > ARENA.width + pad ||
      y > ARENA.height + pad
    );
  }

  /** Test helper: force XP grant. */
  debugGrantXp(amount: number): void {
    this.grantXp(amount);
  }

  /** Test helper: force tower damage. */
  debugDamageTower(amount: number): void {
    this.applyTowerDamage(amount);
  }
}

/** Swept circle vs segment — prevents tunneling at large dt. */
export function segmentHitsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  radius: number,
): boolean {
  const abx = x2 - x1;
  const aby = y2 - y1;
  const acx = cx - x1;
  const acy = cy - y1;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq <= 1e-8) {
    return Math.hypot(acx, acy) <= radius;
  }
  let t = (acx * abx + acy * aby) / abLenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const px = x1 + abx * t - cx;
  const py = y1 + aby * t - cy;
  return px * px + py * py <= radius * radius;
}
