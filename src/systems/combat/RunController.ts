import { EventBus } from '../../core/events/EventBus';
import { ObjectPool } from '../../core/pooling/ObjectPool';
import { Rng } from '../../core/rng/Rng';
import { TimerService } from '../../core/timers/TimerService';
import { ARCHER_ULTIMATE, TOWER_BASELINE, xpRequiredForLevel } from '../../game/balance/archer';
import type { EnemyId } from '../../game/balance/enemies';
import type { UpgradeDef, UpgradeId, UpgradePoolId } from '../../game/balance/upgrades';
import { getLevelDef, type LevelId } from '../../game/content/levels';
import type { AudioService } from '../../platform/types';
import {
  createEnemy,
  resetEnemy,
  resetEnemyIdCounter,
  type EnemyModel,
} from '../enemies/EnemyModel';
import {
  applyUpgrade,
  createBaseCombatStats,
  refreshAttackSpeed,
  type CombatStats,
} from '../heroes/ArcherStats';
import { hasOfferableEvolution, rollUpgradeOffer } from '../upgrades/UpgradeOffer';
import { WaveDirector } from '../waves/WaveDirector';
import { multishotAngleOffsets } from './MultishotAim';
import {
  createProjectile,
  deactivateProjectile,
  launchProjectile,
  resetProjectileIdCounter,
  type ProjectileModel,
} from './ProjectileModel';
import { nearestToTower, type TargetingStrategy } from './Targeting';

export type RunPhase = 'combat' | 'levelup' | 'paused' | 'victory' | 'defeat';

export interface RunSnapshot {
  phase: RunPhase;
  levelId: LevelId;
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
  evolutionAvailable: boolean;
  ultimateReady: boolean;
  ultimateCooldownRemaining: number;
  ultimateCooldownMax: number;
}

export interface RunEvents {
  onLevelUp: { level: number; offer: UpgradeDef[] };
  onVictory: { towerHp: number; elapsedMs: number; levelId: LevelId };
  onDefeat: { elapsedMs: number; levelId: LevelId };
  onEliteSpawn: { enemyId: EnemyId };
  onBossSpawn: { enemyId: EnemyId };
  onBossSummon: { count: number };
  onEvolutionReady: Record<string, never>;
  onUltimate: Record<string, never>;
  onEnemyDeath: { x: number; y: number };
  onCritHit: { x: number; y: number };
}

const ARENA = {
  width: 720,
  height: 1280,
  centerX: 360,
  centerY: 640,
  spawnPadding: 80,
} as const;

const MAX_DELTA_MS = 50;
const ARROW_STORM_INTERVAL = 5;

export class RunController {
  readonly bus = new EventBus();
  readonly timers = new TimerService();

  private rng: Rng;
  private waves: WaveDirector;
  private stats: CombatStats = createBaseCombatStats();
  private owned = new Map<UpgradeId, number>();
  private phase: RunPhase = 'combat';
  private levelId: LevelId = 1;
  private upgradePoolId: UpgradePoolId = 'level1';
  private emergencyHealEnabled = true;
  private victoryBossId: EnemyId = 'raider_captain';
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
  private arrowStormTimer = ARROW_STORM_INTERVAL;
  private ultimateCooldown = 0;

  private readonly enemies: EnemyModel[] = [];
  private readonly projectiles: ProjectileModel[] = [];
  private readonly enemyPool: ObjectPool<EnemyModel>;
  private readonly projectilePool: ObjectPool<ProjectileModel>;

  constructor(
    private readonly audio: AudioService,
    seed?: number,
  ) {
    this.rng = new Rng(seed ?? Date.now() >>> 0);
    const def = getLevelDef(1);
    this.waves = new WaveDirector(this.rng, def.segments, def.durationMs);
    this.enemyPool = new ObjectPool(
      () => createEnemy('grunt', 0, 0),
      (e) => {
        e.alive = false;
        e.state = 'dead';
      },
      64,
    );
    this.projectilePool = new ObjectPool(createProjectile, deactivateProjectile, 96);
  }

  start(levelId: LevelId = 1, seed?: number): void {
    this.cleanup();
    resetEnemyIdCounter();
    resetProjectileIdCounter();
    const def = getLevelDef(levelId);
    this.levelId = levelId;
    this.upgradePoolId = def.upgradePoolId;
    this.emergencyHealEnabled = def.emergencyHeal;
    this.victoryBossId = def.victoryBossId;
    this.rng = new Rng(seed ?? Date.now() >>> 0);
    this.waves = new WaveDirector(this.rng, def.segments, def.durationMs);
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
    this.arrowStormTimer = ARROW_STORM_INTERVAL;
    this.ultimateCooldown = 0;
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

  getLevelId(): LevelId {
    return this.levelId;
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

  getOwned(): Map<UpgradeId, number> {
    return this.owned;
  }

  getUpgradePoolId(): UpgradePoolId {
    return this.upgradePoolId;
  }

  getArena() {
    return ARENA;
  }

  snapshot(): RunSnapshot {
    return {
      phase: this.phase,
      levelId: this.levelId,
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
      evolutionAvailable: hasOfferableEvolution(this.owned, this.upgradePoolId),
      ultimateReady: this.phase === 'combat' && this.ultimateCooldown <= 0,
      ultimateCooldownRemaining: Math.max(0, this.ultimateCooldown),
      ultimateCooldownMax: ARCHER_ULTIMATE.cooldownMs / 1000,
    };
  }

  /** Focused arrow barrage. Returns false if on cooldown or not in combat. */
  tryActivateUltimate(): boolean {
    if (this.phase !== 'combat' || this.ultimateCooldown > 0) return false;

    const target = this.targeting(ARENA.centerX, ARENA.centerY, this.stats.range * 1.2, this.enemies);
    const baseAngle = target
      ? Math.atan2(target.y - ARENA.centerY, target.x - ARENA.centerX)
      : this.rng.range(0, Math.PI * 2);
    const n = ARCHER_ULTIMATE.arrowCount;
    const spread = target ? ARCHER_ULTIMATE.fanSpread : Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const angle = target
        ? baseAngle - spread / 2 + t * spread
        : (Math.PI * 2 * i) / n;
      const damage =
        this.stats.damage * this.stats.projectileDamageMult * ARCHER_ULTIMATE.damageMult;
      this.spawnProjectile(angle, damage, false);
    }

    this.ultimateCooldown = ARCHER_ULTIMATE.cooldownMs / 1000;
    this.audio.play('ultimate');
    this.bus.emit<RunEvents['onUltimate']>('ultimate', {});
    return true;
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
    if (this.phase === 'paused' || this.phase === 'levelup') return;

    const dt = deltaMs / 1000;
    this.timers.update(deltaMs);
    if (this.ultimateCooldown > 0) {
      this.ultimateCooldown = Math.max(0, this.ultimateCooldown - dt);
    }
    this.spawnFromWaves(deltaMs);
    this.updateFrenzy(dt);
    this.updateArrowStorm(dt);
    this.updateEnemies(dt);
    this.updateAttack(dt);
    this.updateProjectiles(dt);
    this.checkEndConditions();
  }

  private spawnFromWaves(deltaMs: number): void {
    for (const req of this.waves.update(deltaMs)) {
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

  private updateFrenzy(dt: number): void {
    if (!this.stats.deadeyeFrenzy) return;
    if (this.stats.frenzyTimer > 0) {
      this.stats.frenzyTimer -= dt;
      if (this.stats.frenzyTimer <= 0) {
        this.stats.frenzyStacks = 0;
        this.stats.frenzyTimer = 0;
        refreshAttackSpeed(this.stats);
      }
    }
  }

  private updateArrowStorm(dt: number): void {
    if (!this.stats.arrowStormEnabled) return;
    this.arrowStormTimer -= dt;
    if (this.arrowStormTimer > 0) return;
    this.arrowStormTimer = ARROW_STORM_INTERVAL;
    const target = this.targeting(ARENA.centerX, ARENA.centerY, this.stats.range, this.enemies);
    const baseAngle = target
      ? Math.atan2(target.y - ARENA.centerY, target.x - ARENA.centerX)
      : this.rng.range(0, Math.PI * 2);
    const fan = 8;
    const spread = (Math.PI * 2) / 3;
    for (let i = 0; i < fan; i++) {
      const t = i / (fan - 1);
      const angle = baseAngle - spread / 2 + t * spread;
      this.spawnProjectile(angle, this.stats.damage * this.stats.projectileDamageMult * 0.65, false);
    }
    this.audio.play('archer_shot');
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
      this.updateBossPhases(e, dt);

      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const stopDist = towerR + e.def.radius;
      const speed = e.def.moveSpeed * e.moveSpeedMult;

      if (e.state === 'moving') {
        if (dist <= stopDist) {
          e.state = 'winding_up';
          e.windupRemaining = e.def.attackWindupMs / 1000;
        } else {
          const step = speed * dt;
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
          this.spawnEnemy(summonId, this.rng.range(0, Math.PI * 2));
        }
        this.bus.emit<RunEvents['onBossSummon']>('boss_summon', { count });
      }
    }
  }

  private updateBossPhases(e: EnemyModel, dt: number): void {
    if (e.stoneSkinActive) {
      e.stoneSkinTimer -= dt;
      if (e.stoneSkinTimer <= 0) {
        e.stoneSkinActive = false;
        e.damageTakenMult = 1;
      }
    }

    if (
      e.def.stoneSkinAtRatio !== undefined &&
      !e.stoneSkinTriggered &&
      e.hp / e.maxHp <= e.def.stoneSkinAtRatio
    ) {
      e.stoneSkinTriggered = true;
      e.stoneSkinActive = true;
      e.stoneSkinTimer = (e.def.stoneSkinDurationMs ?? 8000) / 1000;
      e.damageTakenMult = e.def.stoneSkinDamageTakenMult ?? 0.4;
    }

    if (
      e.def.finalPushAtRatio !== undefined &&
      !e.finalPushTriggered &&
      e.hp / e.maxHp <= e.def.finalPushAtRatio
    ) {
      e.finalPushTriggered = true;
      e.moveSpeedMult = e.def.finalPushSpeedMult ?? 1.6;
    }

    if (e.def.periodicSummonMs && e.def.periodicSummonIds?.length) {
      e.periodicSummonTimer -= dt;
      if (e.periodicSummonTimer <= 0) {
        e.periodicSummonTimer = e.def.periodicSummonMs / 1000;
        const count = e.def.periodicSummonCount ?? 2;
        for (let s = 0; s < count; s++) {
          const id =
            e.def.periodicSummonIds[this.rng.int(0, e.def.periodicSummonIds.length)] ?? 'grunt';
          this.spawnEnemy(id, this.rng.range(0, Math.PI * 2));
        }
        this.bus.emit<RunEvents['onBossSummon']>('boss_summon', { count });
      }
    }
  }

  private applyTowerDamage(amount: number): void {
    this.towerHp = Math.max(0, this.towerHp - amount);
    if (
      this.emergencyHealEnabled &&
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
        levelId: this.levelId,
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
    this.stats.attackCounter += 1;
    this.fireVolleyAt(target.x, target.y);
    this.audio.play('archer_shot');
  }

  private fireVolleyAt(tx: number, ty: number): void {
    const baseAngle = Math.atan2(ty - ARENA.centerY, tx - ARENA.centerX);
    let count = this.stats.projectileCount;
    let bonusDamageMult = 1;
    if (this.stats.volleyEnabled && this.stats.attackCounter % 6 === 0) {
      count += 3;
      bonusDamageMult = 0.7;
    }
    const spreadRad = (this.stats.spreadDegrees * Math.PI) / 180;
    const offsets = multishotAngleOffsets(count, spreadRad);
    for (const offset of offsets) {
      const crit = this.rng.next() < this.stats.critChance;
      const damage =
        this.stats.damage *
        this.stats.projectileDamageMult *
        bonusDamageMult *
        (crit ? this.stats.critMultiplier : 1);
      this.spawnProjectile(baseAngle + offset, damage, crit);
      if (crit) this.onCrit();
    }
  }

  private spawnProjectile(angle: number, damage: number, crit: boolean): void {
    const muzzle = 44;
    const cx = ARENA.centerX;
    const cy = ARENA.centerY;
    const pierce =
      this.stats.phantomBarrage || this.stats.ricochetCount === 0
        ? this.stats.pierceCount
        : this.stats.pierceCount;
    const ricochet = this.stats.ricochetCount;
    const p = this.projectilePool.acquire();
    launchProjectile(p, {
      x: cx + Math.cos(angle) * muzzle,
      y: cy + Math.sin(angle) * muzzle,
      angle,
      speed: this.stats.projectileSpeed,
      damage,
      crit,
      pierce,
      pierceFalloff: this.stats.pierceDamageFalloff,
      ricochet,
      ricochetDamageMult: this.stats.ricochetDamageMult,
      allowPierceWithRicochet: this.stats.phantomBarrage,
    });
    this.projectiles.push(p);
  }

  private onCrit(): void {
    if (!this.stats.deadeyeFrenzy) return;
    this.stats.frenzyStacks = Math.min(5, this.stats.frenzyStacks + 1);
    this.stats.frenzyTimer = 3;
    refreshAttackSpeed(this.stats);
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

        const canPierce = p.pierceRemaining > 0;
        if (canPierce) {
          p.pierceRemaining -= 1;
          p.damage *= 1 - p.pierceFalloff;
          continue;
        }

        if (p.ricochetRemaining > 0) {
          const bounceIndex = p.ricochetDamageMult.length - p.ricochetRemaining;
          const mult = p.ricochetDamageMult[Math.max(0, bounceIndex)] ?? 0.55;
          p.ricochetRemaining -= 1;
          p.damage *= mult;
          const next = this.findRicochetTarget(e, p.hitIds);
          if (next) {
            const angle = Math.atan2(next.y - p.y, next.x - p.x);
            const speed = Math.hypot(p.vx, p.vy) || this.stats.projectileSpeed;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            continue;
          }
        }

        deactivateProjectile(p);
        this.projectilePool.release(p);
        this.projectiles.splice(i, 1);
        consumed = true;
        break;
      }
      if (consumed) continue;
    }
  }

  private findRicochetTarget(from: EnemyModel, hitIds: Set<number>): EnemyModel | null {
    let best: EnemyModel | null = null;
    let bestDist = Infinity;
    for (const e of this.enemies) {
      if (!e.alive || e.id === from.id || hitIds.has(e.id)) continue;
      const d = Math.hypot(e.x - from.x, e.y - from.y);
      if (d < bestDist && d < 280) {
        best = e;
        bestDist = d;
      }
    }
    return best;
  }

  private damageEnemy(e: EnemyModel, damage: number, crit: boolean): void {
    e.hp -= damage * e.damageTakenMult;
    e.hitFlash = 0.12;
    this.audio.play(crit ? 'crit_hit' : 'hit');
    if (crit) {
      this.bus.emit<RunEvents['onCritHit']>('crit_hit', { x: e.x, y: e.y });
    }
    if (e.hp <= 0) {
      e.alive = false;
      e.state = 'dead';
      this.killCount += 1;
      this.audio.play('enemy_death');
      this.bus.emit<RunEvents['onEnemyDeath']>('enemy_death', { x: e.x, y: e.y });
      if (e.defId === this.victoryBossId) {
        // Winning kill: credit XP without pausing for a post-victory level-up.
        this.xp += e.def.xp * this.stats.xpGainMult;
        this.victoryPending = true;
        this.pendingOffer = null;
        this.phase = 'victory';
        this.timers.setWorldPaused(true);
        this.audio.play('victory');
        this.bus.emit<RunEvents['onVictory']>('victory', {
          towerHp: this.towerHp,
          elapsedMs: this.waves.getElapsedMs(),
          levelId: this.levelId,
        });
      } else {
        this.grantXp(e.def.xp);
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
    const offer = rollUpgradeOffer(
      this.owned,
      this.levelUpsCompleted,
      this.rng,
      3,
      this.upgradePoolId,
    );
    if (offer.length === 0) return;
    this.pendingOffer = offer;
    this.phase = 'levelup';
    this.timers.setWorldPaused(true);
    this.audio.play('level_up');
    if (offer.some((u) => u.evolution)) {
      this.bus.emit<RunEvents['onEvolutionReady']>('evolution_ready', {});
    }
    this.bus.emit<RunEvents['onLevelUp']>('level_up', {
      level: this.heroLevel,
      offer,
    });
  }

  private checkEndConditions(): void {
    if (this.phase !== 'combat') return;

    if (this.victoryPending) {
      const bossAlive = this.enemies.some((e) => e.alive && e.defId === this.victoryBossId);
      if (!bossAlive) {
        this.phase = 'victory';
        this.timers.setWorldPaused(true);
        this.audio.play('victory');
        this.bus.emit<RunEvents['onVictory']>('victory', {
          towerHp: this.towerHp,
          elapsedMs: this.waves.getElapsedMs(),
          levelId: this.levelId,
        });
      }
    }
  }

  private outOfBounds(x: number, y: number): boolean {
    const pad = 120;
    return x < -pad || y < -pad || x > ARENA.width + pad || y > ARENA.height + pad;
  }

  debugGrantXp(amount: number): void {
    this.grantXp(amount);
  }

  debugDamageTower(amount: number): void {
    this.applyTowerDamage(amount);
  }

  /** Test helper: apply damage through the normal damage path (victory / phases). */
  debugDamageEnemy(enemy: EnemyModel, amount: number): void {
    this.damageEnemy(enemy, amount, false);
  }
}

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
