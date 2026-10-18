import Phaser from 'phaser';
import { getLanguageSetting, setLanguageSetting, t } from '../localization/i18n';
import type { LanguageSetting } from '../localization/types';
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
      .text(width / 2, height * 0.18, t('ui.brand'), {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '48px',
        color: '#e8f5e9',
        stroke: '#1b5e20',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.26, t('ui.menuSubtitle'), {
        fontFamily: UI_FONT_BODY,
        fontStyle: '700',
        fontSize: '18px',
        color: '#a5d6a7',
      })
      .setOrigin(0.5);

    this.add.image(width / 2, height * 0.42, 'tower').setScale(1.35);
    this.add.image(width / 2, height * 0.36, 'archer').setScale(1.55);

    const play = this.add
      .text(width / 2, height * 0.58, t('ui.playCampaign'), {
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

    this.addLangToggle(width, height * 0.68);

    this.add
      .text(width / 2, height * 0.78, t('ui.menuHint'), {
        fontFamily: UI_FONT_BODY,
        fontStyle: 'normal',
        fontSize: '16px',
        color: '#c8e6c9',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: Math.min(520, width * 0.82) },
      })
      .setOrigin(0.5);

    void this.platform.saves.load().then((save) => {
      this.add
        .text(
          width / 2,
          height * 0.93,
          t('ui.unlockedThrough', {
            level: save.campaign.highestUnlocked,
            clears: save.runsCompleted,
          }),
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

  private addLangToggle(width: number, y: number): void {
    const current = getLanguageSetting();
    const label = this.add
      .text(width / 2, y - 22, t('ui.language'), {
        fontFamily: UI_FONT_BODY,
        fontStyle: '700',
        fontSize: '14px',
        color: '#a5d6a7',
      })
      .setOrigin(0.5);

    const options: { id: LanguageSetting; key: string }[] = [
      { id: 'auto', key: 'ui.lang.auto' },
      { id: 'en', key: 'ui.lang.en' },
      { id: 'ru', key: 'ui.lang.ru' },
    ];
    const gap = 100;
    const startX = width / 2 - gap;
    options.forEach((opt, i) => {
      const active = opt.id === current;
      const btn = this.add
        .text(startX + i * gap, y + 10, t(opt.key), {
          fontFamily: UI_FONT_DISPLAY,
          fontStyle: '800',
          fontSize: '16px',
          color: active ? '#1b1208' : '#e8f5e9',
          backgroundColor: active ? '#ffe082' : '#2e7d32',
          padding: { x: 14, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerup', () => void this.changeLanguage(opt.id));
    });

    void label;
  }

  private async changeLanguage(next: LanguageSetting): Promise<void> {
    const save = await this.platform.saves.load();
    const browserLang = this.platform.platform.getLocale();
    setLanguageSetting(next, browserLang);
    save.settings.language = next;
    await this.platform.saves.save(save);
    this.scene.restart({ platform: this.platform });
  }
}
