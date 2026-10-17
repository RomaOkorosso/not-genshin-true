import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { CombatScene } from './game/scenes/CombatScene';
import { MenuScene } from './game/scenes/MenuScene';
import { createBrowserPlatformBundle } from './platform/browser/BrowserPlatform';

async function boot(): Promise<void> {
  const platform = createBrowserPlatformBundle();
  await platform.platform.init();
  const save = await platform.saves.load();
  platform.audio.setSfxVolume(save.settings.sfxVolume);
  platform.audio.setMusicVolume(save.settings.musicVolume);

  const parent = document.getElementById('app') ?? undefined;

  new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 720,
    height: 1280,
    backgroundColor: '#1a2a1a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, CombatScene],
    input: {
      activePointers: 3,
    },
    render: {
      antialias: false,
      pixelArt: true,
      powerPreference: 'high-performance',
    },
    callbacks: {
      // Must run before BootScene — otherwise registry is empty and Menu crashes.
      preBoot: (game) => {
        game.registry.set('platform', platform);
      },
    },
  });
}

void boot();
