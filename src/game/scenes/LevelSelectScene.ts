import Phaser from 'phaser';
import type { PlatformBundle } from '../../platform/types';
import { UI_FONT_BODY, UI_FONT_DISPLAY } from '../../ui/fonts';
import { ALL_LEVEL_IDS, getLevelDef, type LevelId } from '../content/levels';

export class LevelSelectScene extends Phaser.Scene {
  private platform!: PlatformBundle;

  constructor() {
    super('LevelSelect');
  }

  init(data: { platform?: PlatformBundle }): void {
    this.platform = data.platform ?? (this.registry.get('platform') as PlatformBundle);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x122018);

    this.add
      .text(width / 2, 56, 'CAMPAIGN', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '36px',
        color: '#e8f5e9',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 96, 'Clear a level to unlock the next', {
        fontFamily: UI_FONT_BODY,
        fontStyle: 'normal',
        fontSize: '16px',
        color: '#a5d6a7',
      })
      .setOrigin(0.5);

    void this.platform.saves.load().then((save) => {
      const unlocked = save.campaign.highestUnlocked;
      ALL_LEVEL_IDS.forEach((id, index) => {
        this.addLevelCard(id, index, unlocked, width);
      });
    });

    const back = this.add
      .text(width / 2, height - 64, 'BACK', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '20px',
        color: '#1b1b1b',
        backgroundColor: '#a5d6a7',
        padding: { x: 22, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('Menu', { platform: this.platform }));
  }

  private addLevelCard(id: LevelId, index: number, unlocked: number, width: number): void {
    const def = getLevelDef(id);
    const y = 150 + index * 110;
    const isOpen = id <= unlocked;
    const colW = Math.min(520, width * 0.78);
    const bg = this.add
      .rectangle(width / 2, y, width * 0.86, 92, isOpen ? 0x1b5e20 : 0x263238, 0.95)
      .setStrokeStyle(2, isOpen ? 0xa5d6a7 : 0x546e7a);

    this.add
      .text(width / 2, y - 18, isOpen ? def.name : `${def.name}  —  LOCKED`, {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '18px',
        color: isOpen ? '#e8f5e9' : '#90a4ae',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, y + 16, def.introBlurb, {
        fontFamily: UI_FONT_BODY,
        fontStyle: 'normal',
        fontSize: '15px',
        color: isOpen ? '#c8e6c9' : '#607d8b',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: colW },
      })
      .setOrigin(0.5);

    if (isOpen) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerup', () => {
        this.platform.analytics.track('run_start', { level: id });
        this.scene.start('Combat', { platform: this.platform, levelId: id });
      });
    }
  }
}
