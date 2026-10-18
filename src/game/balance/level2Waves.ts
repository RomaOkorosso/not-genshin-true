import type { WaveSegment } from './waves';

/** Level 2 — tempo / Runners. ~7.5 min. */
export const LEVEL2_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 40_000,
    spawnBudget: 12,
    spawnIntervalMs: 1800,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'runners_in',
    startMs: 40_000,
    durationMs: 80_000,
    spawnBudget: 40,
    spawnIntervalMs: 1400,
    enemyWeights: [
      { id: 'runner', weight: 3 },
      { id: 'grunt', weight: 2 },
    ],
    groupSize: { min: 1, max: 3 },
  },
  {
    id: 'elite_runner',
    startMs: 120_000,
    durationMs: 40_000,
    spawnBudget: 22,
    spawnIntervalMs: 1300,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'mid',
    startMs: 160_000,
    durationMs: 140_000,
    spawnBudget: 90,
    spawnIntervalMs: 1100,
    enemyWeights: [
      { id: 'runner', weight: 3 },
      { id: 'grunt', weight: 2 },
    ],
    groupSize: { min: 2, max: 4 },
  },
  {
    id: 'late_elite',
    startMs: 300_000,
    durationMs: 80_000,
    spawnBudget: 50,
    spawnIntervalMs: 1000,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 4 },
    events: [{ atMs: 0, enemyId: 'elite_runner', count: 1 }],
  },
  {
    id: 'finale',
    startMs: 380_000,
    durationMs: 70_000,
    spawnBudget: 45,
    spawnIntervalMs: 900,
    enemyWeights: [
      { id: 'runner', weight: 3 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 3, max: 5 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
];

export const LEVEL2_DURATION_MS = 450_000;
