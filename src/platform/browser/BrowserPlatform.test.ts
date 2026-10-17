import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVE, migrateSave } from './BrowserPlatform';

describe('migrateSave', () => {
  it('returns defaults for garbage input', () => {
    expect(migrateSave(null).version).toBe(DEFAULT_SAVE.version);
    expect(migrateSave('nope').runsCompleted).toBe(0);
  });

  it('clamps absurd volumes and rejects negatives', () => {
    const migrated = migrateSave({
      version: 99,
      runsCompleted: -5,
      bestTowerHpRemaining: 12.7,
      settings: { sfxVolume: 4, musicVolume: -1 },
    });
    expect(migrated.runsCompleted).toBe(0);
    expect(migrated.bestTowerHpRemaining).toBe(12);
    expect(migrated.settings.sfxVolume).toBe(1);
    expect(migrated.settings.musicVolume).toBe(0);
  });
});
