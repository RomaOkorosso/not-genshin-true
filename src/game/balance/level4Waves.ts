import type { WaveSegment } from './waves';

/** Level 4 — Evolution window + Brutes. ~8.5 min. */
export const LEVEL4_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 50_000,
    spawnBudget: 18,
    spawnIntervalMs: 1600,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'brutes_in',
    startMs: 50_000,
    durationMs: 130_000,
    spawnBudget: 75,
    spawnIntervalMs: 1150,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 2 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 40_000, enemyId: 'elite_brute', count: 1 }],
  },
  {
    id: 'pressure',
    startMs: 180_000,
    durationMs: 180_000,
    spawnBudget: 110,
    spawnIntervalMs: 1000,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 4 },
    events: [
      { atMs: 0, enemyId: 'elite_runner', count: 1 },
      { atMs: 90_000, enemyId: 'elite_brute', count: 1 },
    ],
  },
  {
    id: 'finale',
    startMs: 360_000,
    durationMs: 150_000,
    spawnBudget: 70,
    spawnIntervalMs: 900,
    enemyWeights: [
      { id: 'brute', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 3, max: 5 },
    events: [{ atMs: 0, enemyId: 'raider_captain', count: 1 }],
  },
];

export const LEVEL4_DURATION_MS = 510_000;
