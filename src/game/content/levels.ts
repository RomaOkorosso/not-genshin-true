import type { EnemyId } from '../balance/enemies';
import { LEVEL1_DURATION_MS, LEVEL1_SEGMENTS } from '../balance/level1Waves';
import { LEVEL2_DURATION_MS, LEVEL2_SEGMENTS } from '../balance/level2Waves';
import { LEVEL3_DURATION_MS, LEVEL3_SEGMENTS } from '../balance/level3Waves';
import { LEVEL4_DURATION_MS, LEVEL4_SEGMENTS } from '../balance/level4Waves';
import { LEVEL5_DURATION_MS, LEVEL5_SEGMENTS } from '../balance/level5Waves';
import type { UpgradePoolId } from '../balance/upgrades';
import type { WaveSegment } from '../balance/waves';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface LevelDef {
  id: LevelId;
  name: string;
  introBlurb: string;
  durationMs: number;
  segments: WaveSegment[];
  upgradePoolId: UpgradePoolId;
  emergencyHeal: boolean;
  /** Boss/mini-boss whose death wins the level. */
  victoryBossId: EnemyId;
}

export const LEVELS: Record<LevelId, LevelDef> = {
  1: {
    id: 1,
    name: 'Level 1 — First Defense',
    introBlurb: 'Learn auto-attack, XP, and upgrades. Defend the tower.',
    durationMs: LEVEL1_DURATION_MS,
    segments: LEVEL1_SEGMENTS,
    upgradePoolId: 'level1',
    emergencyHeal: true,
    victoryBossId: 'raider_captain',
  },
  2: {
    id: 2,
    name: 'Level 2 — Swift Horde',
    introBlurb: 'Runners arrive. Keep tempo — leaks hurt.',
    durationMs: LEVEL2_DURATION_MS,
    segments: LEVEL2_SEGMENTS,
    upgradePoolId: 'level2_3',
    emergencyHeal: false,
    victoryBossId: 'elite_grunt',
  },
  3: {
    id: 3,
    name: 'Level 3 — Arrow Craft',
    introBlurb: 'Mixed pressure. Push projectile branches harder.',
    durationMs: LEVEL3_DURATION_MS,
    segments: LEVEL3_SEGMENTS,
    upgradePoolId: 'level2_3',
    emergencyHeal: false,
    victoryBossId: 'raider_captain',
  },
  4: {
    id: 4,
    name: 'Level 4 — Evolution',
    introBlurb: 'Brutes join. Complete a branch for your first Evolution.',
    durationMs: LEVEL4_DURATION_MS,
    segments: LEVEL4_SEGMENTS,
    upgradePoolId: 'level4_5',
    emergencyHeal: false,
    victoryBossId: 'raider_captain',
  },
  5: {
    id: 5,
    name: 'Level 5 — Stone Heart',
    introBlurb: 'Face the Stone Golem. Surviving its phases is the test.',
    durationMs: LEVEL5_DURATION_MS,
    segments: LEVEL5_SEGMENTS,
    upgradePoolId: 'level4_5',
    emergencyHeal: false,
    victoryBossId: 'stone_golem',
  },
};

export const ALL_LEVEL_IDS: LevelId[] = [1, 2, 3, 4, 5];

export function getLevelDef(id: LevelId): LevelDef {
  return LEVELS[id];
}

export function isLevelId(value: unknown): value is LevelId {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}
