import type { WaveSegment } from './waves';

/** Level 3 — mixed pressure after a long soft open. ~8 min. */
export const LEVEL3_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 90_000,
    spawnBudget: 9,
    spawnIntervalMs: 3600,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'mix_in',
    startMs: 90_000,
    durationMs: 90_000,
    spawnBudget: 20,
    spawnIntervalMs: 2500,
    enemyWeights: [
      { id: 'grunt', weight: 3 },
      { id: 'runner', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'build',
    startMs: 180_000,
    durationMs: 120_000,
    spawnBudget: 40,
    spawnIntervalMs: 2000,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 60_000, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'dense',
    startMs: 300_000,
    durationMs: 100_000,
    spawnBudget: 48,
    spawnIntervalMs: 1600,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'finale',
    startMs: 400_000,
    durationMs: 80_000,
    spawnBudget: 32,
    spawnIntervalMs: 1500,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [
      { atMs: 0, enemyId: 'elite_grunt', count: 1 },
      { atMs: 40_000, enemyId: 'raider_captain', count: 1 },
    ],
  },
];

export const LEVEL3_DURATION_MS = 480_000;
