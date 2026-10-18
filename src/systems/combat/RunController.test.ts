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
    run.start(1, 123);
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
    // Baseline APS 1.15 × Quick Draw 1.15
    expect(run.getStats().attacksPerSecond).toBeCloseTo(1.15 * 1.15, 5);
    run.cleanup();
  });

  it('triggers Level-1 emergency heal once below emergency HP ratio', () => {
    const run = new RunController(silentAudio, 1);
    run.start(1);
    run.debugDamageTower(100); // 120 → 20 (< 25% of 120)
    const snap = run.snapshot();
    expect(snap.emergencyUsed).toBe(true);
    expect(snap.towerHp).toBeGreaterThan(20);
    expect(snap.phase).not.toBe('defeat');
    run.cleanup();
  });

  it('clears pools on restart', () => {
    const run = new RunController(silentAudio, 5);
    run.start(1, 5);
    run.spawnEnemy('grunt', 0);
    expect(run.getEnemies().length).toBe(1);
    run.start(1, 5);
    expect(run.getEnemies().length).toBe(0);
    expect(run.getProjectiles().length).toBe(0);
    run.cleanup();
  });

  it('defeats when tower HP reaches zero after emergency', () => {
    const run = new RunController(silentAudio, 2);
    run.start(1, 2);
    run.debugDamageTower(100);
    run.debugDamageTower(300);
    expect(run.getPhase()).toBe('defeat');
    run.cleanup();
  });

  it('does not emergency-heal on level 2', () => {
    const run = new RunController(silentAudio, 3);
    run.start(2, 3);
    run.debugDamageTower(100);
    expect(run.snapshot().emergencyUsed).toBe(false);
    expect(run.snapshot().towerHp).toBe(20);
    run.cleanup();
  });

  it('triggers Stone Golem Stone Skin and Final Push phases', () => {
    const run = new RunController(silentAudio, 9);
    run.start(5, 9);
    const golem = run.spawnEnemy('stone_golem', 0);
    golem.hp = golem.maxHp * 0.5;
    run.update(16);
    expect(golem.stoneSkinTriggered).toBe(true);
    expect(golem.stoneSkinActive).toBe(true);
    expect(golem.damageTakenMult).toBeLessThan(1);

    golem.hp = golem.maxHp * 0.2;
    run.update(16);
    expect(golem.finalPushTriggered).toBe(true);
    expect(golem.moveSpeedMult).toBeGreaterThan(1);
    run.cleanup();
  });

  it('wins level 5 when the Stone Golem dies', () => {
    const run = new RunController(silentAudio, 11);
    run.start(5, 11);
    const golem = run.spawnEnemy('stone_golem', 0);
    run.debugDamageEnemy(golem, 99999);
    run.update(16);
    expect(run.getPhase()).toBe('victory');
    run.cleanup();
  });

  it('fires Ultimate once then blocks until cooldown', () => {
    const run = new RunController(silentAudio, 13);
    run.start(1, 13);
    expect(run.tryActivateUltimate()).toBe(true);
    expect(run.snapshot().ultimateReady).toBe(false);
    expect(run.tryActivateUltimate()).toBe(false);
    expect(run.getProjectiles().length).toBeGreaterThan(0);
    run.cleanup();
  });

  it('blocks Ultimate while paused', () => {
    const run = new RunController(silentAudio, 14);
    run.start(1, 14);
    run.togglePause();
    expect(run.tryActivateUltimate()).toBe(false);
    run.cleanup();
  });

  it('skips idle wait when the arena is clear', () => {
    const run = new RunController(silentAudio, 17);
    run.start(1, 17);
    let offered = false;
    for (let i = 0; i < 5000 && !offered; i++) {
      if (run.getPhase() === 'levelup') {
        const offer = run.snapshot().offer;
        if (offer?.[0]) run.chooseUpgrade(offer[0].id);
        continue;
      }
      for (const e of run.getEnemies()) {
        if (e.alive) run.debugDamageEnemy(e, 99999);
      }
      if (run.getPhase() === 'levelup') {
        const offer = run.snapshot().offer;
        if (offer?.[0]) run.chooseUpgrade(offer[0].id);
        continue;
      }
      run.update(50);
      if (run.canSkipWait()) offered = true;
    }
    expect(offered).toBe(true);
    const before = run.snapshot().elapsedMs;
    expect(run.trySkipWait()).toBe(true);
    expect(run.snapshot().elapsedMs).toBeGreaterThan(before + 400);
    expect(run.canSkipWait()).toBe(false);
    run.cleanup();
  });
});
