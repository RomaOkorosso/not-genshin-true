import { describe, expect, it } from 'vitest';
import type { AudioEvent, AudioService } from '../../platform/types';
import { RunController, segmentHitsCircle } from './RunController';

const silentAudio: AudioService = {
  play(_event: AudioEvent) {},
  setSfxVolume() {},
  setMusicVolume() {},
};

describe('segmentHitsCircle', () => {
  it('detects a pass through the circle', () => {
    expect(segmentHitsCircle(0, 0, 100, 0, 50, 0, 10)).toBe(true);
  });

  it('misses a parallel offset beyond radius', () => {
    expect(segmentHitsCircle(0, 0, 100, 0, 50, 20, 10)).toBe(false);
  });
});

describe('radial projectile aim', () => {
  it('hits enemies approaching from cardinal and diagonal angles', () => {
    const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, -Math.PI / 3];
    for (const angle of angles) {
      const run = new RunController(silentAudio, 42);
      run.start(42);
      const enemy = run.spawnEnemy('grunt', angle);
      // Place inside range on the radial line.
      const dist = 200;
      const arena = run.getArena();
      enemy.x = arena.centerX + Math.cos(angle) * dist;
      enemy.y = arena.centerY + Math.sin(angle) * dist;

      let killed = false;
      for (let frame = 0; frame < 180; frame++) {
        run.update(16);
        if (!enemy.alive) {
          killed = true;
          break;
        }
      }
      expect(killed, `angle ${angle}`).toBe(true);
      run.cleanup();
    }
  });
});
