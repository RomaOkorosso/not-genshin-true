import type {
  AdResult,
  AdService,
  AnalyticsService,
  AudioEvent,
  AudioService,
  LeaderboardEntry,
  LeaderboardService,
  PlatformBundle,
  PlatformService,
  SavePayload,
  SaveService,
} from '../types';

const SAVE_KEY = 'not-genshin:save:v1';
const LB_KEY = 'not-genshin:leaderboard:v1';
const SAVE_VERSION = 1;

export const DEFAULT_SAVE: SavePayload = {
  version: SAVE_VERSION,
  lastRunAt: null,
  runsCompleted: 0,
  bestTowerHpRemaining: 0,
  settings: {
    sfxVolume: 0.7,
    musicVolume: 0.5,
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function migrateSave(raw: unknown): SavePayload {
  if (!isObject(raw)) return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };

  const settingsRaw = isObject(raw.settings) ? raw.settings : {};
  const sfx = typeof settingsRaw.sfxVolume === 'number' ? clamp01(settingsRaw.sfxVolume) : 0.7;
  const music =
    typeof settingsRaw.musicVolume === 'number' ? clamp01(settingsRaw.musicVolume) : 0.5;

  return {
    version: SAVE_VERSION,
    lastRunAt: typeof raw.lastRunAt === 'number' ? raw.lastRunAt : null,
    runsCompleted: sanitizeNonNegInt(raw.runsCompleted),
    bestTowerHpRemaining: sanitizeNonNegInt(raw.bestTowerHpRemaining),
    settings: { sfxVolume: sfx, musicVolume: music },
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
    // no-op for browser
  }

  getLocale(): string {
    return typeof navigator !== 'undefined' ? navigator.language : 'en';
  }
}

class LocalStorageSaveService implements SaveService {
  async load(): Promise<SavePayload> {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
      return migrateSave(JSON.parse(raw) as unknown);
    } catch {
      return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
    }
  }

  async save(data: SavePayload): Promise<void> {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // quota / private mode — ignore for MVP
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(SAVE_KEY);
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

class PlaceholderAudioService implements AudioService {
  private sfxVolume = 0.7;
  private musicVolume = 0.5;

  play(event: AudioEvent): void {
    // Placeholder: semantic events only; no concrete filenames yet.
    void event;
    void this.sfxVolume;
    void this.musicVolume;
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = clamp01(volume);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clamp01(volume);
  }
}

export function createBrowserPlatformBundle(): PlatformBundle {
  return {
    platform: new BrowserPlatformService(),
    saves: new LocalStorageSaveService(),
    ads: new MockAdService(),
    leaderboards: new LocalLeaderboardService(),
    analytics: new ConsoleAnalyticsService(),
    audio: new PlaceholderAudioService(),
  };
}
