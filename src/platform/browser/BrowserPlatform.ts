import type {
  AdResult,
  AdService,
  AnalyticsService,
  CampaignClearRecord,
  CampaignSave,
  LeaderboardEntry,
  LeaderboardService,
  PlatformBundle,
  PlatformService,
  SavePayload,
  SaveService,
} from '../types';
import { WebAudioService } from './WebAudioService';

const SAVE_KEY = 'not-genshin:save:v2';
const SAVE_KEY_LEGACY = 'not-genshin:save:v1';
const LB_KEY = 'not-genshin:leaderboard:v1';
const SAVE_VERSION = 2;

export const DEFAULT_CAMPAIGN: CampaignSave = {
  highestUnlocked: 1,
  cleared: {},
};

export const DEFAULT_SAVE: SavePayload = {
  version: SAVE_VERSION,
  lastRunAt: null,
  runsCompleted: 0,
  bestTowerHpRemaining: 0,
  settings: {
    sfxVolume: 0.7,
    musicVolume: 0.5,
    language: 'auto',
  },
  campaign: { ...DEFAULT_CAMPAIGN, cleared: {} },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function migrateSave(raw: unknown): SavePayload {
  if (!isObject(raw)) {
    return {
      ...DEFAULT_SAVE,
      settings: { ...DEFAULT_SAVE.settings },
      campaign: { highestUnlocked: 1, cleared: {} },
    };
  }

  const settingsRaw = isObject(raw.settings) ? raw.settings : {};
  const sfx = typeof settingsRaw.sfxVolume === 'number' ? clamp01(settingsRaw.sfxVolume) : 0.7;
  const music =
    typeof settingsRaw.musicVolume === 'number' ? clamp01(settingsRaw.musicVolume) : 0.5;
  const language = migrateLanguage(settingsRaw.language);

  return {
    version: SAVE_VERSION,
    lastRunAt: typeof raw.lastRunAt === 'number' ? raw.lastRunAt : null,
    runsCompleted: sanitizeNonNegInt(raw.runsCompleted),
    bestTowerHpRemaining: sanitizeNonNegInt(raw.bestTowerHpRemaining),
    settings: { sfxVolume: sfx, musicVolume: music, language },
    campaign: migrateCampaign(raw.campaign),
  };
}

function migrateLanguage(raw: unknown): 'auto' | 'en' | 'ru' {
  return raw === 'en' || raw === 'ru' || raw === 'auto' ? raw : 'auto';
}

function migrateCampaign(raw: unknown): CampaignSave {
  if (!isObject(raw)) return { highestUnlocked: 1, cleared: {} };
  const highest = sanitizeNonNegInt(raw.highestUnlocked);
  const cleared: Record<string, CampaignClearRecord> = {};
  if (isObject(raw.cleared)) {
    for (const [key, value] of Object.entries(raw.cleared)) {
      if (!isObject(value)) continue;
      cleared[key] = {
        bestTowerHp: sanitizeNonNegInt(value.bestTowerHp),
        clears: sanitizeNonNegInt(value.clears),
      };
    }
  }
  return {
    highestUnlocked: Math.min(5, Math.max(1, highest || 1)),
    cleared,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function sanitizeNonNegInt(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
}

class BrowserPlatformService implements PlatformService {
  readonly id = 'browser' as const;

  async init(): Promise<void> {
    // no-op
  }

  getLocale(): string {
    return typeof navigator !== 'undefined' ? navigator.language : 'en';
  }
}

class LocalStorageSaveService implements SaveService {
  async load(): Promise<SavePayload> {
    try {
      const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(SAVE_KEY_LEGACY);
      if (!raw) {
        return {
          ...DEFAULT_SAVE,
          settings: { ...DEFAULT_SAVE.settings },
          campaign: { highestUnlocked: 1, cleared: {} },
        };
      }
      return migrateSave(JSON.parse(raw) as unknown);
    } catch {
      return {
        ...DEFAULT_SAVE,
        settings: { ...DEFAULT_SAVE.settings },
        campaign: { highestUnlocked: 1, cleared: {} },
      };
    }
  }

  async save(data: SavePayload): Promise<void> {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_LEGACY);
    } catch {
      // ignore
    }
  }
}

class MockAdService implements AdService {
  async showRewarded(): Promise<AdResult> {
    return { shown: true, rewardGranted: true, reason: 'mock' };
  }

  async showInterstitial(): Promise<AdResult> {
    return { shown: true, rewardGranted: false, reason: 'mock' };
  }
}

class LocalLeaderboardService implements LeaderboardService {
  async submit(score: number, name = 'You'): Promise<void> {
    const entries = await this.getTop(50);
    entries.push({ name, score });
    entries.sort((a, b) => b.score - a.score);
    try {
      localStorage.setItem(LB_KEY, JSON.stringify(entries.slice(0, 20)));
    } catch {
      // ignore
    }
  }

  async getTop(limit = 10): Promise<LeaderboardEntry[]> {
    try {
      const raw = localStorage.getItem(LB_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (e): e is LeaderboardEntry =>
            isObject(e) && typeof e.name === 'string' && typeof e.score === 'number',
        )
        .slice(0, limit);
    } catch {
      return [];
    }
  }
}

class ConsoleAnalyticsService implements AnalyticsService {
  track(event: string, props?: Record<string, string | number | boolean>): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, props ?? {});
    }
  }
}

export function createBrowserPlatformBundle(): PlatformBundle {
  return {
    platform: new BrowserPlatformService(),
    saves: new LocalStorageSaveService(),
    ads: new MockAdService(),
    leaderboards: new LocalLeaderboardService(),
    analytics: new ConsoleAnalyticsService(),
    audio: new WebAudioService(),
  };
}

export function recordCampaignVictory(
  save: SavePayload,
  levelId: number,
  towerHp: number,
): SavePayload {
  const key = String(levelId);
  const prev = save.campaign.cleared[key];
  const cleared = { ...save.campaign.cleared };
  cleared[key] = {
    bestTowerHp: Math.max(prev?.bestTowerHp ?? 0, Math.ceil(towerHp)),
    clears: (prev?.clears ?? 0) + 1,
  };
  const nextUnlock = Math.min(5, Math.max(save.campaign.highestUnlocked, levelId + 1));
  return {
    ...save,
    lastRunAt: Date.now(),
    runsCompleted: save.runsCompleted + 1,
    bestTowerHpRemaining: Math.max(save.bestTowerHpRemaining, Math.ceil(towerHp)),
    campaign: {
      highestUnlocked: nextUnlock,
      cleared,
    },
  };
}
