import Phaser from 'phaser';
import { setLanguageSetting } from './game/localization/i18n';
import { BootScene } from './game/scenes/BootScene';
import { CombatScene } from './game/scenes/CombatScene';
import { LevelSelectScene } from './game/scenes/LevelSelectScene';
import { MenuScene } from './game/scenes/MenuScene';
import { createBrowserPlatformBundle } from './platform/browser/BrowserPlatform';

async function boot(): Promise<void> {
  const platform = createBrowserPlatformBundle();
  await platform.platform.init();
  const save = await platform.saves.load();
  platform.audio.setSfxVolume(save.settings.sfxVolume);
  platform.audio.setMusicVolume(save.settings.musicVolume);
  setLanguageSetting(save.settings.language, platform.platform.getLocale());

  const parent = document.getElementById('app') ?? undefined;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 720,
    height: 1280,
    backgroundColor: '#1a2a1a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, LevelSelectScene, CombatScene],
    input: {
      activePointers: 3,
    },
    render: {
      // Antialias on so scaled Nunito body copy stays readable (Almanac wiki).
      // Sprite textures still force NEAREST in BootScene.
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      powerPreference: 'high-performance',
    },
    callbacks: {
      // Must run before BootScene — otherwise registry is empty and Menu crashes.
      preBoot: (g) => {
        g.registry.set('platform', platform);
      },
    },
  });

  // Dev/QA hook for browser automation (Almanac screenshots, etc.).
  (window as unknown as { __NG_GAME__?: Phaser.Game }).__NG_GAME__ = game;
}

void boot();
