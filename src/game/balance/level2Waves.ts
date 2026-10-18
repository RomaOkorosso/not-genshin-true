import type { WaveSegment } from './waves';

/** Level 2 — Runners after a soft grunt intro. ~7.5 min. */
export const LEVEL2_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 90_000,
    spawnBudget: 8,
    spawnIntervalMs: 3800,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'runners_in',
    startMs: 90_000,
    durationMs: 90_000,
    spawnBudget: 18,
    spawnIntervalMs: 2600,
    enemyWeights: [
      { id: 'grunt', weight: 3 },
      { id: 'runner', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'tempo',
    startMs: 180_000,
    durationMs: 90_000,
    spawnBudget: 28,
    spawnIntervalMs: 2000,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 30_000, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'mid',
    startMs: 270_000,
    durationMs: 90_000,
    spawnBudget: 36,
    spawnIntervalMs: 1700,
    enemyWeights: [
      { id: 'runner', weight: 3 },
      { id: 'grunt', weight: 2 },
    ],
    groupSize: { min: 2, max: 2 },
  },
  {
    id: 'late',
    startMs: 360_000,
    durationMs: 50_000,
    spawnBudget: 28,
    spawnIntervalMs: 1500,
    enemyWeights: [
      { id: 'runner', weight: 3 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'finale',
    startMs: 410_000,
    durationMs: 40_000,
    spawnBudget: 22,
    spawnIntervalMs: 1400,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
];

export const LEVEL2_DURATION_MS = 450_000;
