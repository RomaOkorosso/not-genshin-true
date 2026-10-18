export interface PlatformService {
  readonly id: 'browser' | 'yandex';
  init(): Promise<void>;
  getLocale(): string;
}

export interface CampaignClearRecord {
  bestTowerHp: number;
  clears: number;
}

export interface CampaignSave {
  highestUnlocked: number;
  cleared: Record<string, CampaignClearRecord>;
}

export interface SavePayload {
  version: number;
  lastRunAt: number | null;
  runsCompleted: number;
  bestTowerHpRemaining: number;
  settings: {
    sfxVolume: number;
    musicVolume: number;
  };
  campaign: CampaignSave;
}

export interface SaveService {
  load(): Promise<SavePayload>;
  save(data: SavePayload): Promise<void>;
  clear(): Promise<void>;
}

export type AdResult = { shown: boolean; rewardGranted: boolean; reason?: string };

export interface AdService {
  showRewarded(): Promise<AdResult>;
  showInterstitial(): Promise<AdResult>;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export interface LeaderboardService {
  submit(score: number, name?: string): Promise<void>;
  getTop(limit?: number): Promise<LeaderboardEntry[]>;
}

export interface AnalyticsService {
  track(event: string, props?: Record<string, string | number | boolean>): void;
}

export type AudioEvent =
  | 'archer_shot'
  | 'hit'
  | 'crit_hit'
  | 'enemy_death'
  | 'tower_hit'
  | 'elite_arrival'
  | 'boss_arrival'
  | 'level_up'
  | 'upgrade_selected'
  | 'almanac_open'
  | 'almanac_close'
  | 'victory'
  | 'defeat'
  | 'evolution';

export interface AudioService {
  play(event: AudioEvent): void;
  setSfxVolume(volume: number): void;
  setMusicVolume(volume: number): void;
}

export interface PlatformBundle {
  platform: PlatformService;
  saves: SaveService;
  ads: AdService;
  leaderboards: LeaderboardService;
  analytics: AnalyticsService;
  audio: AudioService;
}
