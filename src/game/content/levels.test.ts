import { describe, expect, it } from 'vitest';
import { ENEMY_DEFS } from '../balance/enemies';
import { ALL_LEVEL_IDS, getLevelDef } from './levels';

describe('campaign levels', () => {
  it('defines five sequential levels with wave data', () => {
    expect(ALL_LEVEL_IDS).toEqual([1, 2, 3, 4, 5]);
    for (const id of ALL_LEVEL_IDS) {
      const def = getLevelDef(id);
      expect(def.segments.length).toBeGreaterThan(0);
      expect(def.durationMs).toBeGreaterThan(60_000);
      expect(ENEMY_DEFS[def.victoryBossId]).toBeTruthy();
    }
  });

  it('disables emergency heal after level 1', () => {
    expect(getLevelDef(1).emergencyHeal).toBe(true);
    expect(getLevelDef(2).emergencyHeal).toBe(false);
    expect(getLevelDef(5).victoryBossId).toBe('stone_golem');
  });

  it('gives runners higher move speed than grunts', () => {
    expect(ENEMY_DEFS.runner.moveSpeed).toBeGreaterThan(ENEMY_DEFS.grunt.moveSpeed);
    expect(ENEMY_DEFS.brute.moveSpeed).toBeLessThan(ENEMY_DEFS.grunt.moveSpeed);
  });
});
