import type { WaveSegment } from './waves';

/** Level 5 — soft open, mid pressure, late Stone Golem. ~9 min. */
export const LEVEL5_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 90_000,
    spawnBudget: 9,
    spawnIntervalMs: 3600,
    enemyWeights: [
      { id: 'grunt', weight: 3 },
      { id: 'runner', weight: 1 },
    ],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'open_mix',
    startMs: 90_000,
    durationMs: 60_000,
    spawnBudget: 14,
    spawnIntervalMs: 2500,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'build',
    startMs: 150_000,
    durationMs: 120_000,
    spawnBudget: 36,
    spawnIntervalMs: 2100,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
    events: [
      { atMs: 40_000, enemyId: 'elite_brute', count: 1 },
      { atMs: 90_000, enemyId: 'elite_runner', count: 1 },
    ],
  },
  {
    id: 'pre_boss',
    startMs: 270_000,
    durationMs: 100_000,
    spawnBudget: 40,
    spawnIntervalMs: 1700,
    enemyWeights: [
      { id: 'brute', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 2 },
    events: [{ atMs: 50_000, enemyId: 'elite_brute', count: 1 }],
  },
  {
    id: 'breath',
    startMs: 370_000,
    durationMs: 30_000,
    spawnBudget: 4,
    spawnIntervalMs: 4000,
    enemyWeights: [{ id: 'runner', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'golem',
    startMs: 400_000,
    durationMs: 140_000,
    spawnBudget: 12,
    spawnIntervalMs: 3200,
    enemyWeights: [
      { id: 'runner', weight: 1 },
      { id: 'grunt', weight: 2 },
    ],
    groupSize: { min: 1, max: 1 },
    events: [{ atMs: 0, enemyId: 'stone_golem', count: 1 }],
  },
];

export const LEVEL5_DURATION_MS = 540_000;
