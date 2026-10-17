import Phaser from 'phaser';

/** Generates simple runtime textures — concept sheets need slicing before use. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.generateTextures();
    const platform = this.registry.get('platform');
    this.scene.start('Menu', { platform });
  }

  private generateTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Arena grass
    g.fillStyle(0x3d6b3a, 1);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x4a7c45, 1);
    g.fillRect(8, 12, 6, 6);
    g.fillRect(40, 36, 5, 5);
    g.fillStyle(0x2f5530, 1);
    g.fillRect(20, 44, 8, 4);
    g.generateTexture('tile_grass', 64, 64);
    g.clear();

    // Tower
    g.fillStyle(0x6b6e76, 1);
    g.fillRoundedRect(8, 40, 80, 70, 8);
    g.fillStyle(0x8a8e98, 1);
    g.fillRoundedRect(18, 20, 60, 40, 6);
    g.fillStyle(0x5a5d66, 1);
    g.fillRect(28, 8, 44, 18);
    g.fillStyle(0x3d5a9c, 1);
    g.fillRect(34, 28, 10, 22);
    g.fillRect(52, 28, 10, 22);
    g.fillStyle(0xd4a017, 1);
    g.fillCircle(39, 36, 3);
    g.fillCircle(57, 36, 3);
    g.generateTexture('tower', 96, 120);
    g.clear();

    // Archer (placeholder silhoutte matching green ranger palette)
    g.fillStyle(0xc4a484, 1);
    g.fillCircle(16, 10, 7);
    g.fillStyle(0x2e7d32, 1);
    g.fillRoundedRect(8, 16, 16, 20, 4);
    g.fillStyle(0x5d4037, 1);
    g.fillRect(22, 14, 3, 18);
    g.fillStyle(0xa5d6a7, 1);
    g.fillTriangle(24, 14, 36, 18, 24, 22);
    g.generateTexture('archer', 40, 40);
    g.clear();

    // Enemies
    this.makeBlob(g, 'enemy_grunt', 0x4caf50, 24);
    this.makeBlob(g, 'enemy_elite_grunt', 0x1b5e20, 32, true);
    this.makeBlob(g, 'enemy_raider_captain', 0xb71c1c, 48, true);

    // Projectile
    g.fillStyle(0xfff59d, 1);
    g.fillRoundedRect(0, 4, 18, 4, 2);
    g.fillStyle(0x81c784, 1);
    g.fillTriangle(18, 2, 26, 6, 18, 10);
    g.generateTexture('arrow', 28, 12);
    g.clear();

    // Crit projectile
    g.fillStyle(0xb9f6ca, 1);
    g.fillRoundedRect(0, 3, 20, 6, 2);
    g.fillStyle(0x69f0ae, 1);
    g.fillTriangle(20, 1, 30, 6, 20, 11);
    g.generateTexture('arrow_crit', 32, 12);
    g.clear();

    // XP orb
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0xfff59d, 0.8);
    g.fillCircle(6, 6, 3);
    g.generateTexture('xp_orb', 16, 16);
    g.clear();

    // UI book
    g.fillStyle(0x5d4037, 1);
    g.fillRoundedRect(0, 0, 56, 64, 4);
    g.fillStyle(0xef6c00, 1);
    g.fillRoundedRect(4, 4, 48, 56, 3);
    g.fillStyle(0xffe082, 1);
    g.fillRect(24, 8, 4, 48);
    g.fillCircle(28, 32, 8);
    g.generateTexture('codex_btn', 56, 64);
    g.clear();

    // Hit spark
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffecb3, 0.9);
    g.fillCircle(8, 8, 7);
    g.generateTexture('hit_spark', 16, 16);
    g.clear();

    g.destroy();
  }

  private makeBlob(
    g: Phaser.GameObjects.Graphics,
    key: string,
    color: number,
    size: number,
    aura = false,
  ): void {
    if (aura) {
      g.fillStyle(color, 0.25);
      g.fillCircle(size / 2, size / 2, size / 2);
    }
    g.fillStyle(color, 1);
    g.fillCircle(size / 2, size / 2 + 2, size * 0.38);
    g.fillStyle(0x1b1b1b, 1);
    g.fillCircle(size / 2 - size * 0.1, size / 2, size * 0.06);
    g.fillCircle(size / 2 + size * 0.1, size / 2, size * 0.06);
    g.generateTexture(key, size, size);
    g.clear();
  }
}
