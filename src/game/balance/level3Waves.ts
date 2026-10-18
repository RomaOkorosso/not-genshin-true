import type { WaveSegment } from './waves';

/** Level 3 — mixed projectile pressure. ~8 min. */
export const LEVEL3_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 45_000,
    spawnBudget: 16,
    spawnIntervalMs: 1700,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'build',
    startMs: 45_000,
    durationMs: 120_000,
    spawnBudget: 70,
    spawnIntervalMs: 1200,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 60_000, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'dense',
    startMs: 165_000,
    durationMs: 150_000,
    spawnBudget: 100,
    spawnIntervalMs: 1000,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 3 },
    ],
    groupSize: { min: 2, max: 4 },
    events: [{ atMs: 0, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'finale',
    startMs: 315_000,
    durationMs: 165_000,
    spawnBudget: 80,
    spawnIntervalMs: 950,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 3, max: 5 },
    events: [
      { atMs: 0, enemyId: 'elite_grunt', count: 1 },
      { atMs: 90_000, enemyId: 'raider_captain', count: 1 },
    ],
  },
];

export const LEVEL3_DURATION_MS = 480_000;
