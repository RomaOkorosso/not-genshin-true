import { describe, expect, it } from 'vitest';
import type { AudioEvent, AudioService } from '../../platform/types';
import { applyUpgrade, createBaseCombatStats } from '../heroes/ArcherStats';
import { multishotAngleOffsets } from './MultishotAim';
import { RunController } from './RunController';

const silentAudio: AudioService = {
  play(_event: AudioEvent) {},
  setSfxVolume() {},
  setMusicVolume() {},
};

describe('multishotAngleOffsets', () => {
  it('always includes a primary 0 offset', () => {
    for (const count of [1, 2, 3, 4, 5]) {
      expect(multishotAngleOffsets(count, 0.3)).toContain(0);
      expect(multishotAngleOffsets(count, 0.3)).toHaveLength(count);
    }
  });

  it('fans extras symmetrically for Multishot I (2 shots)', () => {
    const offsets = multishotAngleOffsets(2, Math.PI / 10);
    expect(offsets[0]).toBe(0);
    expect(offsets[1]).not.toBe(0);
  });
});

describe('multishot primary hits lock target', () => {
  it('kills a radial grunt with Multishot I (even shot count)', () => {
    const run = new RunController(silentAudio, 7);
    run.start(1, 7);
    applyUpgrade(run.getStats(), 'multishot_i');
    // Mirror into runtime stats object the controller already holds.
    const stats = run.getStats();
    stats.projectileCount = 2;
    stats.projectileDamageMult = 0.9;

    const angle = Math.PI / 4;
    const enemy = run.spawnEnemy('grunt', angle);
    const arena = run.getArena();
    enemy.x = arena.centerX + Math.cos(angle) * 200;
    enemy.y = arena.centerY + Math.sin(angle) * 200;

    let killed = false;
    for (let frame = 0; frame < 180; frame++) {
      run.update(16);
      if (!enemy.alive) {
        killed = true;
        break;
      }
    }
    expect(killed).toBe(true);
    run.cleanup();
  });
});

describe('createBaseCombatStats sanity', () => {
  it('starts at 1 projectile', () => {
    expect(createBaseCombatStats().projectileCount).toBe(1);
  });
});
