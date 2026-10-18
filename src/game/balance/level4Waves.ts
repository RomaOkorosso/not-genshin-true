import type { WaveSegment } from './waves';

/** Level 4 — Brutes after soft open; Evolution optional, not required. ~8.5 min. */
export const LEVEL4_SEGMENTS: WaveSegment[] = [
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
    spawnIntervalMs: 2600,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
    ],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'brutes_in',
    startMs: 150_000,
    durationMs: 120_000,
    spawnBudget: 36,
    spawnIntervalMs: 2200,
    enemyWeights: [
      { id: 'grunt', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 1 },
    ],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 60_000, enemyId: 'elite_brute', count: 1 }],
  },
  {
    id: 'pressure',
    startMs: 270_000,
    durationMs: 120_000,
    spawnBudget: 48,
    spawnIntervalMs: 1700,
    enemyWeights: [
      { id: 'runner', weight: 2 },
      { id: 'brute', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 2 },
    events: [
      { atMs: 0, enemyId: 'elite_runner', count: 1 },
      { atMs: 70_000, enemyId: 'elite_brute', count: 1 },
    ],
  },
  {
    id: 'finale',
    startMs: 390_000,
    durationMs: 120_000,
    spawnBudget: 36,
    spawnIntervalMs: 1500,
    enemyWeights: [
      { id: 'brute', weight: 2 },
      { id: 'runner', weight: 2 },
      { id: 'grunt', weight: 1 },
    ],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'raider_captain', count: 1 }],
  },
];

export const LEVEL4_DURATION_MS = 510_000;
