import type { EnemyId } from './enemies';

export interface WaveSegment {
  id: string;
  startMs: number;
  durationMs: number;
  spawnBudget: number;
  spawnIntervalMs: number;
  enemyWeights: { id: EnemyId; weight: number }[];
  groupSize: { min: number; max: number };
  events?: { atMs: number; enemyId: EnemyId; count: number }[];
}
