import Phaser from 'phaser';
import type { PlatformBundle } from '../../platform/types';
import { UI_FONT, UI_FONT_TITLE } from '../../ui/fonts';

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
      .text(width / 2, height * 0.22, 'NOT GENSHIN', {
        fontFamily: UI_FONT_TITLE,
        fontStyle: '800',
        fontSize: '48px',
        color: '#e8f5e9',
        stroke: '#1b5e20',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.3, 'Level 1 — Tower Defense Prototype', {
        fontFamily: UI_FONT,
        fontStyle: '700',
        fontSize: '18px',
        color: '#a5d6a7',
      })
      .setOrigin(0.5);

    this.add.image(width / 2, height * 0.48, 'tower').setScale(1.4);
    this.add.image(width / 2, height * 0.42, 'archer').setScale(1.6);

    const play = this.add
      .text(width / 2, height * 0.68, 'PLAY LEVEL 1', {
        fontFamily: UI_FONT,
        fontStyle: '700',
        fontSize: '28px',
        color: '#1b1b1b',
        backgroundColor: '#81c784',
        padding: { x: 28, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    play.on('pointerover', () => play.setStyle({ backgroundColor: '#a5d6a7' }));
    play.on('pointerout', () => play.setStyle({ backgroundColor: '#81c784' }));
    play.on('pointerup', () => {
      this.platform.analytics.track('run_start', { level: 1 });
      this.registry.set('platform', this.platform);
      this.scene.start('Combat', { platform: this.platform });
    });

    this.add
      .text(
        width / 2,
        height * 0.82,
        'Archer auto-attacks · 360° spawns · pick upgrades\nTouch & mouse supported',
        {
          fontFamily: UI_FONT,
        fontStyle: '700',
          fontSize: '14px',
          color: '#c8e6c9',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    void this.platform.saves.load().then((save) => {
      this.add
        .text(width / 2, height * 0.92, `Runs completed: ${save.runsCompleted}`, {
          fontFamily: UI_FONT,
        fontStyle: '700',
          fontSize: '13px',
          color: '#81c784',
        })
        .setOrigin(0.5);
    });
  }
}
