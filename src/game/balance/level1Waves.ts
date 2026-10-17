import type { EnemyId } from './enemies';

export interface WaveSegment {
  id: string;
  /** Segment start time in ms from run start. */
  startMs: number;
  durationMs: number;
  spawnBudget: number;
  spawnIntervalMs: number;
  enemyWeights: { id: EnemyId; weight: number }[];
  groupSize: { min: number; max: number };
  /** Explicit one-shot elite/boss hooks at offset from segment start. */
  events?: { atMs: number; enemyId: EnemyId; count: number }[];
}

/**
 * ~8 minute Level 1, data-driven segments.
 * Tuned for high completion rate for first-time players.
 */
export const LEVEL1_SEGMENTS: WaveSegment[] = [
  {
    id: 'intro',
    startMs: 0,
    durationMs: 30_000,
    spawnBudget: 8,
    spawnIntervalMs: 2200,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'first_levelup_window',
    startMs: 30_000,
    durationMs: 30_000,
    spawnBudget: 10,
    spawnIntervalMs: 2000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'ramp_a',
    startMs: 60_000,
    durationMs: 60_000,
    spawnBudget: 28,
    spawnIntervalMs: 1600,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
  },
  {
    id: 'ramp_b',
    startMs: 120_000,
    durationMs: 30_000,
    spawnBudget: 18,
    spawnIntervalMs: 1400,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 2 },
  },
  {
    id: 'first_elite',
    startMs: 150_000,
    durationMs: 25_000,
    spawnBudget: 14,
    spawnIntervalMs: 1500,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 2 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'breath_1',
    startMs: 175_000,
    durationMs: 8_000,
    spawnBudget: 2,
    spawnIntervalMs: 3000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'groups_early',
    startMs: 183_000,
    durationMs: 117_000,
    spawnBudget: 70,
    spawnIntervalMs: 1250,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 3 },
  },
  {
    id: 'dense',
    startMs: 300_000,
    durationMs: 90_000,
    spawnBudget: 85,
    spawnIntervalMs: 1000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 4 },
  },
  {
    id: 'second_elite',
    startMs: 390_000,
    durationMs: 50_000,
    spawnBudget: 40,
    spawnIntervalMs: 1050,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 2, max: 3 },
    events: [{ atMs: 0, enemyId: 'elite_grunt', count: 1 }],
  },
  {
    id: 'breath_2',
    startMs: 440_000,
    durationMs: 10_000,
    spawnBudget: 3,
    spawnIntervalMs: 2800,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'finale',
    startMs: 450_000,
    durationMs: 30_000,
    spawnBudget: 36,
    spawnIntervalMs: 900,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 3, max: 5 },
    events: [{ atMs: 0, enemyId: 'raider_captain', count: 1 }],
  },
];

export const LEVEL1_DURATION_MS = 480_000;
