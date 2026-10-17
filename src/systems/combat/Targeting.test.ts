import { describe, expect, it } from 'vitest';
import { nearestToTower } from './Targeting';

describe('nearestToTower', () => {
  it('picks nearest in-range enemy and ties by id', () => {
    const target = nearestToTower(0, 0, 100, [
      { id: 2, x: 30, y: 0, alive: true },
      { id: 1, x: 30, y: 0, alive: true },
      { id: 3, x: 90, y: 0, alive: true },
      { id: 4, x: 200, y: 0, alive: true },
    ]);
    expect(target?.id).toBe(1);
  });

  it('ignores dead enemies', () => {
    const target = nearestToTower(0, 0, 100, [
      { id: 1, x: 10, y: 0, alive: false },
      { id: 2, x: 40, y: 0, alive: true },
    ]);
    expect(target?.id).toBe(2);
  });
});
