import { describe, expect, it } from 'vitest';
import { Rng } from './Rng';

describe('Rng', () => {
  it('is deterministic for the same seed', () => {
    const a = new Rng(42);
    const b = new Rng(42);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('weightedPick respects weights over many rolls', () => {
    const rng = new Rng(7);
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) {
      const pick = rng.weightedPick([
        { id: 'a' as const, weight: 3 },
        { id: 'b' as const, weight: 1 },
      ]);
      counts[pick.id] += 1;
    }
    expect(counts.a).toBeGreaterThan(counts.b);
  });
});
