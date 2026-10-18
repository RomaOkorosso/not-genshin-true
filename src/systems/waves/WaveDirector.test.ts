import { describe, expect, it } from 'vitest';
import { Rng } from '../../core/rng/Rng';
import type { WaveSegment } from '../../game/balance/waves';
import { WaveDirector } from './WaveDirector';

const SEGMENTS: WaveSegment[] = [
  {
    id: 'a',
    startMs: 0,
    durationMs: 5_000,
    spawnBudget: 2,
    spawnIntervalMs: 1000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
  {
    id: 'b',
    startMs: 20_000,
    durationMs: 5_000,
    spawnBudget: 4,
    spawnIntervalMs: 1000,
    enemyWeights: [{ id: 'grunt', weight: 1 }],
    groupSize: { min: 1, max: 1 },
  },
];

describe('WaveDirector skip', () => {
  it('reports wait until the next segment after budget is spent', () => {
    const waves = new WaveDirector(new Rng(1), SEGMENTS, 60_000);
    // Drain segment A budget.
    for (let i = 0; i < 20; i++) waves.update(500);
    expect(waves.getElapsedMs()).toBeGreaterThanOrEqual(5_000);
    const until = waves.getMsUntilNextActivity();
    expect(until).not.toBeNull();
    expect(until!).toBeGreaterThanOrEqual(9_000);
  });

  it('skipAhead jumps the clock without inventing spawns mid-jump', () => {
    const waves = new WaveDirector(new Rng(2), SEGMENTS, 60_000);
    waves.update(100);
    const before = waves.getElapsedMs();
    const advanced = waves.skipAhead(15_000);
    expect(advanced).toBe(15_000);
    expect(waves.getElapsedMs()).toBe(before + 15_000);
    const spawns = waves.update(0);
    expect(spawns.length).toBe(0);
  });
});
