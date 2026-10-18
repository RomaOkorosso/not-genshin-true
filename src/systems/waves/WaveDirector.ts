import type { Rng } from '../../core/rng/Rng';
import type { EnemyId } from '../../game/balance/enemies';
import { ENEMY_DEFS } from '../../game/balance/enemies';
import type { WaveSegment } from '../../game/balance/waves';
import { LEVEL1_DURATION_MS, LEVEL1_SEGMENTS } from '../../game/balance/level1Waves';

export interface SpawnRequest {
  enemyId: EnemyId;
  angle: number;
}

interface SegmentRuntime {
  segment: WaveSegment;
  budgetSpent: number;
  spawnTimer: number;
  eventsFired: Set<number>;
  started: boolean;
}

export class WaveDirector {
  private elapsedMs = 0;
  private readonly runtimes: SegmentRuntime[];
  private finished = false;
  private rng: Rng;
  private durationMs: number;

  constructor(
    rng: Rng,
    segments: WaveSegment[] = LEVEL1_SEGMENTS,
    durationMs: number = LEVEL1_DURATION_MS,
  ) {
    this.rng = rng;
    this.durationMs = durationMs;
    this.runtimes = segments.map((segment) => ({
      segment,
      budgetSpent: 0,
      spawnTimer: 0,
      eventsFired: new Set<number>(),
      started: false,
    }));
  }

  reset(rng?: Rng): void {
    if (rng) this.rng = rng;
    this.elapsedMs = 0;
    this.finished = false;
    for (const rt of this.runtimes) {
      rt.budgetSpent = 0;
      rt.spawnTimer = 0;
      rt.eventsFired.clear();
      rt.started = false;
    }
  }

  getElapsedMs(): number {
    return this.elapsedMs;
  }

  getDurationMs(): number {
    return this.durationMs;
  }

  isTimeUp(): boolean {
    return this.elapsedMs >= this.durationMs;
  }

  isFinished(): boolean {
    return this.finished;
  }

  /**
   * Ms until the next spawn opportunity (segment start, event, or interval tick).
   * Returns null if nothing remains to spawn before the run ends.
   */
  getMsUntilNextActivity(): number | null {
    if (this.finished) return null;
    const now = this.elapsedMs;
    let soonest = Number.POSITIVE_INFINITY;

    for (const rt of this.runtimes) {
      const { segment } = rt;
      const endMs = segment.startMs + segment.durationMs;

      if (segment.events) {
        for (let i = 0; i < segment.events.length; i++) {
          if (rt.eventsFired.has(i)) continue;
          const at = segment.startMs + segment.events[i]!.atMs;
          if (at >= now) soonest = Math.min(soonest, at);
        }
      }

      if (rt.budgetSpent >= segment.spawnBudget) continue;
      if (now > endMs + 50) continue;

      if (now < segment.startMs) {
        soonest = Math.min(soonest, segment.startMs);
      } else {
        const wait = rt.started ? Math.max(0, rt.spawnTimer) : 0;
        soonest = Math.min(soonest, now + wait);
      }
    }

    if (!Number.isFinite(soonest) || soonest <= now) return null;
    return soonest - now;
  }

  /** Jump the clock forward without emitting mid-skip spawns. */
  skipAhead(ms: number): number {
    if (ms <= 0 || this.finished) return 0;
    const before = this.elapsedMs;
    this.elapsedMs = Math.min(this.durationMs, this.elapsedMs + ms);
    if (this.elapsedMs >= this.durationMs) this.finished = true;
    // Keep interval timers coherent relative to the jump.
    for (const rt of this.runtimes) {
      if (!rt.started) continue;
      if (rt.budgetSpent >= rt.segment.spawnBudget) continue;
      rt.spawnTimer = Math.max(0, rt.spawnTimer - ms);
    }
    return this.elapsedMs - before;
  }

  update(deltaMs: number): SpawnRequest[] {
    if (this.finished) return [];
    this.elapsedMs += deltaMs;
    const spawns: SpawnRequest[] = [];

    for (const rt of this.runtimes) {
      const { segment } = rt;
      const endMs = segment.startMs + segment.durationMs;
      if (this.elapsedMs < segment.startMs || this.elapsedMs > endMs + 50) continue;

      if (!rt.started) {
        rt.started = true;
        rt.spawnTimer = 0;
      }

      const localMs = this.elapsedMs - segment.startMs;

      if (segment.events) {
        for (let i = 0; i < segment.events.length; i++) {
          const ev = segment.events[i]!;
          if (rt.eventsFired.has(i)) continue;
          if (localMs >= ev.atMs) {
            rt.eventsFired.add(i);
            for (let c = 0; c < ev.count; c++) {
              spawns.push({ enemyId: ev.enemyId, angle: this.randomAngle() });
            }
          }
        }
      }

      if (rt.budgetSpent >= segment.spawnBudget) continue;

      rt.spawnTimer -= deltaMs;
      while (rt.spawnTimer <= 0 && rt.budgetSpent < segment.spawnBudget) {
        const group = this.rng.int(segment.groupSize.min, segment.groupSize.max + 1);
        const baseAngle = this.randomAngle();
        for (let g = 0; g < group; g++) {
          if (rt.budgetSpent >= segment.spawnBudget) break;
          const enemyId = this.pickEnemy(segment);
          const cost = ENEMY_DEFS[enemyId].spawnCost;
          if (rt.budgetSpent + cost > segment.spawnBudget && rt.budgetSpent > 0) break;
          rt.budgetSpent += cost;
          const jitter = (this.rng.next() - 0.5) * 0.35;
          spawns.push({ enemyId, angle: baseAngle + jitter });
        }
        rt.spawnTimer += segment.spawnIntervalMs;
      }
    }

    if (this.elapsedMs >= this.durationMs) {
      this.finished = true;
    }

    return spawns;
  }

  private pickEnemy(segment: WaveSegment): EnemyId {
    return this.rng.weightedPick(segment.enemyWeights).id;
  }

  private randomAngle(): number {
    return this.rng.range(0, Math.PI * 2);
  }
}
