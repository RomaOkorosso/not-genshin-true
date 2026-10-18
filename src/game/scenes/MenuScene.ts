import Phaser from 'phaser';
import type { PlatformBundle } from '../../platform/types';
import { UI_FONT_BODY, UI_FONT_DISPLAY } from '../../ui/fonts';

export class MenuScene extends Phaser.Scene {
  private platform!: PlatformBundle;

  constructor() {
    super('Menu');
  }

  init(data: { platform?: PlatformBundle }): void {
    this.platform = data.platform ?? (this.registry.get('platform') as PlatformBundle);
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a2a1a);
    for (let y = 0; y < height; y += 64) {
      for (let x = 0; x < width; x += 64) {
        this.add.image(x + 32, y + 32, 'tile_grass').setAlpha(0.35);
      }
    }

    this.add
      .text(width / 2, height * 0.18, 'NOT GENSHIN', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '48px',
        color: '#e8f5e9',
        stroke: '#1b5e20',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.26, 'Levels 1–5 · Vertical Slice', {
        fontFamily: UI_FONT_BODY,
        fontStyle: '700',
        fontSize: '18px',
        color: '#a5d6a7',
      })
      .setOrigin(0.5);

    this.add.image(width / 2, height * 0.42, 'tower').setScale(1.35);
    this.add.image(width / 2, height * 0.36, 'archer').setScale(1.55);

    const play = this.add
      .text(width / 2, height * 0.62, 'PLAY CAMPAIGN', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '700',
        fontSize: '26px',
        color: '#1b1b1b',
        backgroundColor: '#81c784',
        padding: { x: 28, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    play.on('pointerover', () => play.setStyle({ backgroundColor: '#a5d6a7' }));
    play.on('pointerout', () => play.setStyle({ backgroundColor: '#81c784' }));
    play.on('pointerup', () => {
      this.registry.set('platform', this.platform);
      this.scene.start('LevelSelect', { platform: this.platform });
    });

    this.add
      .text(
        width / 2,
        height * 0.74,
        'Almanac is available in-run (book button)\nArcher auto-attacks · Evolutions from Level 4',
        {
          fontFamily: UI_FONT_BODY,
          fontStyle: 'normal',
          fontSize: '16px',
          color: '#c8e6c9',
          align: 'center',
          lineSpacing: 6,
          wordWrap: { width: Math.min(520, width * 0.82) },
        },
      )
      .setOrigin(0.5);

    void this.platform.saves.load().then((save) => {
      this.add
        .text(
          width / 2,
          height * 0.93,
          `Unlocked through Level ${save.campaign.highestUnlocked} · Clears ${save.runsCompleted}`,
          {
            fontFamily: UI_FONT_BODY,
            fontStyle: 'normal',
            fontSize: '15px',
            color: '#81c784',
          },
        )
        .setOrigin(0.5);
    });
  }
}
