import Phaser from 'phaser';

/** Runtime PNG keys under `public/assets/runtime/` (see docs/RUNTIME_SPRITES.md). */
const RUNTIME_SPRITE_KEYS = [
  'archer',
  'archer_attack',
  'enemy_grunt',
  'enemy_grunt_attack',
  'tower',
  // tile_grass extract is a decorative patch, not a seamless 64 tile — keep procedural.
  'codex_btn',
  'hit_spark',
  'death_puff',
] as const;

/**
 * Generates procedural placeholder textures, then overlays extracted runtime
 * sprites when present. Combat keeps the same texture keys either way.
 */
export class BootScene extends Phaser.Scene {
  private failedRuntime = new Set<string>();

  constructor() {
    super('Boot');
  }

  preload(): void {
    const base = import.meta.env.BASE_URL || '/';
    this.load.on('loaderror', (file: { key?: string }) => {
      if (typeof file?.key === 'string' && file.key.startsWith('runtime_')) {
        this.failedRuntime.add(file.key.slice('runtime_'.length));
      }
    });
    for (const key of RUNTIME_SPRITE_KEYS) {
      this.load.image(`runtime_${key}`, `${base}assets/runtime/${key}.png`);
    }
  }

  create(): void {
    this.generateTextures();
    this.applyRuntimeSprites();
    this.forceNearestSpriteFiltering();
    const platform = this.registry.get('platform');
    this.scene.start('Menu', { platform });
  }

  private applyRuntimeSprites(): void {
    for (const key of RUNTIME_SPRITE_KEYS) {
      const runtimeKey = `runtime_${key}`;
      if (this.failedRuntime.has(key) || !this.textures.exists(runtimeKey)) continue;
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
      this.textures.renameTexture(runtimeKey, key);
    }
  }

  /** Keep sprites crisp while canvas antialias helps UI text. */
  private forceNearestSpriteFiltering(): void {
    for (const key of this.textures.getTextureKeys()) {
      if (key === '__DEFAULT' || key === '__MISSING') continue;
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  private generateTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.setVisible(false);

    g.fillStyle(0x2f4a2c, 1);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x3d6b3a, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillRect(32, 32, 32, 32);
    g.fillStyle(0x264024, 1);
    g.fillRect(10, 44, 10, 4);
    g.fillRect(42, 14, 8, 3);
    g.fillStyle(0x4a7c45, 1);
    g.fillCircle(18, 18, 2);
    g.fillCircle(48, 40, 2);
    g.generateTexture('tile_grass', 64, 64);
    g.clear();

    g.fillStyle(0x3e4450, 1);
    g.fillRoundedRect(10, 48, 76, 66, 6);
    g.fillStyle(0x8b919c, 1);
    g.fillRoundedRect(18, 28, 60, 44, 5);
    g.fillStyle(0xb0b6c0, 1);
    g.fillRect(26, 10, 44, 22);
    g.fillStyle(0x2f5fb5, 1);
    g.fillRect(32, 34, 12, 26);
    g.fillRect(52, 34, 12, 26);
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(38, 44, 3);
    g.fillCircle(58, 44, 3);
    g.lineStyle(2, 0x1a1d24, 1);
    g.strokeRoundedRect(18, 28, 60, 44, 5);
    g.generateTexture('tower', 96, 120);
    g.clear();

    g.fillStyle(0x1b1b1b, 1);
    g.fillCircle(16, 11, 8);
    g.fillStyle(0xf0c9a0, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x1b5e20, 1);
    g.fillRoundedRect(7, 16, 18, 20, 4);
    g.fillStyle(0x66bb6a, 1);
    g.fillTriangle(6, 18, 2, 38, 12, 34);
    g.fillStyle(0x5d4037, 1);
    g.fillRect(22, 14, 3, 18);
    g.fillStyle(0xfff176, 1);
    g.fillTriangle(24, 14, 38, 18, 24, 22);
    g.generateTexture('archer', 40, 40);
    g.clear();

    this.makeEnemy(g, 'enemy_grunt', 0xe8a06e, 0x5d4037, 28, false);
    this.makeEnemy(g, 'enemy_elite_grunt', 0xffb74d, 0xef6c00, 36, true);
    this.makeEnemy(g, 'enemy_raider_captain', 0xe53935, 0xb71c1c, 52, true, true);
    this.makeEnemy(g, 'enemy_runner', 0x7e57c2, 0x4527a0, 24, false);
    this.makeEnemy(g, 'enemy_elite_runner', 0xb39ddb, 0x5e35b1, 30, true);
    this.makeEnemy(g, 'enemy_brute', 0x8d6e63, 0x4e342e, 34, false);
    this.makeEnemy(g, 'enemy_elite_brute', 0xa1887f, 0x3e2723, 42, true);
    this.makeEnemy(g, 'enemy_stone_golem', 0x90a4ae, 0x37474f, 64, true, true);

    g.fillStyle(0x1a1a1a, 1);
    g.fillRoundedRect(0, 3, 20, 6, 2);
    g.fillStyle(0xfff176, 1);
    g.fillRoundedRect(1, 4, 18, 4, 2);
    g.fillStyle(0xffee58, 1);
    g.fillTriangle(18, 1, 28, 6, 18, 11);
    g.generateTexture('arrow', 30, 12);
    g.clear();

    g.fillStyle(0x004d40, 1);
    g.fillRoundedRect(0, 2, 22, 8, 2);
    g.fillStyle(0x69f0ae, 1);
    g.fillRoundedRect(1, 3, 20, 6, 2);
    g.fillStyle(0xb9f6ca, 1);
    g.fillTriangle(20, 0, 32, 6, 20, 12);
    g.generateTexture('arrow_crit', 34, 12);
    g.clear();

    g.fillStyle(0xf57f17, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xfffde7, 0.9);
    g.fillCircle(6, 6, 2);
    g.generateTexture('xp_orb', 16, 16);
    g.clear();

    g.fillStyle(0x3e2723, 1);
    g.fillRoundedRect(0, 0, 56, 64, 4);
    g.fillStyle(0xef6c00, 1);
    g.fillRoundedRect(4, 4, 48, 56, 3);
    g.fillStyle(0xffe082, 1);
    g.fillRect(24, 8, 4, 48);
    g.fillCircle(28, 32, 8);
    g.lineStyle(2, 0xffecb3, 1);
    g.strokeRoundedRect(4, 4, 48, 56, 3);
    g.generateTexture('codex_btn', 56, 64);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffecb3, 0.95);
    g.fillCircle(8, 8, 7);
    g.generateTexture('hit_spark', 16, 16);
    g.clear();

    g.fillStyle(0x6d4c41, 0.9);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0xa1887f, 0.85);
    g.fillCircle(18, 10, 8);
    g.fillStyle(0xd7ccc8, 0.7);
    g.fillCircle(8, 8, 5);
    g.generateTexture('death_puff', 28, 28);
    g.clear();

    g.destroy();
  }

  private makeEnemy(
    g: Phaser.GameObjects.Graphics,
    key: string,
    fill: number,
    outline: number,
    size: number,
    aura: boolean,
    horns = false,
  ): void {
    const cx = size / 2;
    const cy = size / 2 + 1;
    const bodyR = size * 0.36;

    if (aura) {
      g.fillStyle(fill, 0.28);
      g.fillCircle(cx, cy, size * 0.48);
    }

    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(cx, cy + bodyR * 0.85, bodyR * 1.5, bodyR * 0.55);

    g.lineStyle(3, outline, 1);
    g.fillStyle(fill, 1);
    g.fillCircle(cx, cy, bodyR);
    g.strokeCircle(cx, cy, bodyR);

    const eyeY = cy - bodyR * 0.15;
    const eyeX = bodyR * 0.28;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - eyeX, eyeY, Math.max(2.5, size * 0.07));
    g.fillCircle(cx + eyeX, eyeY, Math.max(2.5, size * 0.07));
    g.fillStyle(0x111111, 1);
    g.fillCircle(cx - eyeX, eyeY, Math.max(1.2, size * 0.035));
    g.fillCircle(cx + eyeX, eyeY, Math.max(1.2, size * 0.035));

    g.lineStyle(2, outline, 1);
    g.beginPath();
    g.moveTo(cx - bodyR * 0.2, cy + bodyR * 0.25);
    g.lineTo(cx + bodyR * 0.2, cy + bodyR * 0.25);
    g.strokePath();

    if (horns) {
      g.fillStyle(outline, 1);
      g.fillTriangle(
        cx - bodyR * 0.55,
        cy - bodyR * 0.4,
        cx - bodyR * 0.15,
        cy - bodyR * 0.9,
        cx - bodyR * 0.05,
        cy - bodyR * 0.35,
      );
      g.fillTriangle(
        cx + bodyR * 0.55,
        cy - bodyR * 0.4,
        cx + bodyR * 0.15,
        cy - bodyR * 0.9,
        cx + bodyR * 0.05,
        cy - bodyR * 0.35,
      );
    }

    g.generateTexture(key, size, size);
    g.clear();
  }
}
