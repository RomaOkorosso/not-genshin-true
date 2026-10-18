import type { WaveSegment } from './waves';

/** Level 5 — Brute pressure + Stone Golem. ~9 min. */
export const LEVEL5_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 60_000,
    spawnBudget: 20,
    spawnIntervalMs: 1500,
    enemyWeights: [
      { id: 'grunt', weight: 1 },
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 2 },
    ],
    groupSize: { min: 1, max: 3 },
  },
  {
    id: 'build',
    startMs: 60_000,
    durationMs: 150_000,
    spawnBudget: 90,
    spawnIntervalMs: 1100,
    enemyWeights: [
      { id: 'brute', weight: 3 },
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [
      { atMs: 0, enemyId: 'elite_brute', count: 1 },
      { atMs: 80_000, enemyId: 'elite_runner', count: 1 },
    ],
  },
  {
    id: 'pre_boss',
    startMs: 210_000,
    durationMs: 150_000,
    spawnBudget: 95,
    spawnIntervalMs: 1000,
    enemyWeights: [
      { id: 'brute', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 4 },
    events: [{ atMs: 60_000, enemyId: 'elite_brute', count: 1 }],
  },
  {
    id: 'breath',
    startMs: 360_000,
    durationMs: 20_000,
    spawnBudget: 4,
    spawnIntervalMs: 2500,
    enemyWeights: [{ id: 'runner', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'golem',
    startMs: 380_000,
    durationMs: 160_000,
    spawnBudget: 50,
    spawnIntervalMs: 1400,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 0, enemyId: 'stone_golem', count: 1 }],
  },
];

export const LEVEL5_DURATION_MS = 540_000;
