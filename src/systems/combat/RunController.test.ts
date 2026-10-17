import { describe, expect, it } from 'vitest';
import type { AudioEvent, AudioService } from '../../platform/types';
import { RunController } from './RunController';

const silentAudio: AudioService = {
  play(_event: AudioEvent) {},
  setSfxVolume() {},
  setMusicVolume() {},
};

describe('RunController', () => {
  it('opens scripted level-up after enough XP', () => {
    const run = new RunController(silentAudio, 123);
    run.start(123);
    run.debugGrantXp(5);
    expect(run.getPhase()).toBe('levelup');
    const snap = run.snapshot();
    expect(snap.offer?.map((u) => u.id)).toEqual([
      'multishot_i',
      'quick_draw',
      'sharpened_arrows_i',
    ]);
    run.chooseUpgrade('quick_draw');
    expect(run.getPhase()).toBe('combat');
    expect(run.getStats().attacksPerSecond).toBeCloseTo(1.15, 5);
    run.cleanup();
  });

  it('triggers Level-1 emergency heal once below 20% HP', () => {
    const run = new RunController(silentAudio, 1);
    run.start(1);
    run.debugDamageTower(85);
    const snap = run.snapshot();
    expect(snap.emergencyUsed).toBe(true);
    expect(snap.towerHp).toBeGreaterThan(15);
    expect(snap.phase).not.toBe('defeat');
    run.cleanup();
  });

  it('clears pools on restart', () => {
    const run = new RunController(silentAudio, 5);
    run.start(5);
    run.spawnEnemy('grunt', 0);
    expect(run.getEnemies().length).toBe(1);
    run.start(5);
    expect(run.getEnemies().length).toBe(0);
    expect(run.getProjectiles().length).toBe(0);
    run.cleanup();
  });

  it('defeats when tower HP reaches zero after emergency', () => {
    const run = new RunController(silentAudio, 2);
    run.start(2);
    run.debugDamageTower(85);
    run.debugDamageTower(200);
    expect(run.getPhase()).toBe('defeat');
    run.cleanup();
  });
});
