import type { WaveSegment } from './waves';

export type { WaveSegment } from './waves';

/**
 * Level 1 — onboarding. ~8 min.
 * First ~90s are deliberately sparse so the player forms a build.
 * Real pressure lives in the second half; boss at finale.
 */
export const LEVEL1_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 90_000,
    spawnBudget: 6,
    spawnIntervalMs: 4000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'first_levelup_window',
    startMs: 90_000,
    durationMs: 60_000,
    spawnBudget: 10,
    spawnIntervalMs: 3200,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'ramp_a',
    startMs: 150_000,
    durationMs: 90_000,
    spawnBudget: 20,
    spawnIntervalMs: 2400,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'ramp_b',
    startMs: 240_000,
    durationMs: 60_000,
    spawnBudget: 18,
    spawnIntervalMs: 2000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'first_elite',
    startMs: 300_000,
    durationMs: 40_000,
    spawnBudget: 14,
    spawnIntervalMs: 1800,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'breath_1',
    startMs: 340_000,
    durationMs: 20_000,
    spawnBudget: 3,
    spawnIntervalMs: 3500,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'groups_mid',
    startMs: 360_000,
    durationMs: 60_000,
    spawnBudget: 34,
    spawnIntervalMs: 1500,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 3 },
  },
  {
    id: 'dense',
    startMs: 420_000,
    durationMs: 30_000,
    spawnBudget: 28,
    spawnIntervalMs: 1300,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'finale',
    startMs: 450_000,
    durationMs: 30_000,
    spawnBudget: 24,
    spawnIntervalMs: 1300,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'raider_captain', count: 1 }],
  },
];

export const LEVEL1_DURATION_MS = 480_000;
