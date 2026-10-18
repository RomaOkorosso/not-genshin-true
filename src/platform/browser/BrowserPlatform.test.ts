import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVE, migrateSave, recordCampaignVictory } from './BrowserPlatform';

describe('migrateSave', () => {
  it('returns defaults for garbage input', () => {
    expect(migrateSave(null).version).toBe(DEFAULT_SAVE.version);
    expect(migrateSave('nope').runsCompleted).toBe(0);
    expect(migrateSave(null).campaign.highestUnlocked).toBe(1);
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
    expect(migrated.campaign.highestUnlocked).toBe(1);
  });

  it('migrates legacy saves without campaign field', () => {
    const migrated = migrateSave({
      version: 1,
      runsCompleted: 2,
      bestTowerHpRemaining: 80,
      settings: { sfxVolume: 0.5, musicVolume: 0.5 },
    });
    expect(migrated.version).toBe(2);
    expect(migrated.campaign.highestUnlocked).toBe(1);
  });
});

describe('recordCampaignVictory', () => {
  it('unlocks the next level and tracks clears', () => {
    const next = recordCampaignVictory(DEFAULT_SAVE, 1, 88);
    expect(next.campaign.highestUnlocked).toBe(2);
    expect(next.campaign.cleared['1']?.clears).toBe(1);
    expect(next.campaign.cleared['1']?.bestTowerHp).toBe(88);
  });
});
