import Phaser from 'phaser';

/** Generates readable runtime placeholder textures until concept sheets are sliced. */
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
    const g = this.make.graphics({ x: 0, y: 0 });
    g.setVisible(false);

    // Arena grass — dark field (enemies stay warm-colored for contrast)
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

    // Tower — clearer stone + banners, origin-friendly silhouette
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

    // Archer — warm skin + bright cloak vs green field
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

    // Enemies: warm/purple bodies on green grass (not camouflage)
    this.makeEnemy(g, 'enemy_grunt', 0xe8a06e, 0x5d4037, 28, false);
    this.makeEnemy(g, 'enemy_elite_grunt', 0xffb74d, 0xef6c00, 36, true);
    this.makeEnemy(g, 'enemy_raider_captain', 0xe53935, 0xb71c1c, 52, true, true);

    // Projectiles — high-contrast yellow
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

    // XP orb
    g.fillStyle(0xf57f17, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffeb3b, 1);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xfffde7, 0.9);
    g.fillCircle(6, 6, 2);
    g.generateTexture('xp_orb', 16, 16);
    g.clear();

    // Codex book
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

    // Hit spark
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xffecb3, 0.95);
    g.fillCircle(8, 8, 7);
    g.generateTexture('hit_spark', 16, 16);
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

    // Drop shadow for separation from grass
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(cx, cy + bodyR * 0.85, bodyR * 1.5, bodyR * 0.55);

    g.lineStyle(3, outline, 1);
    g.fillStyle(fill, 1);
    g.fillCircle(cx, cy, bodyR);
    g.strokeCircle(cx, cy, bodyR);

    // Eyes — bright white + pupils
    const eyeY = cy - bodyR * 0.15;
    const eyeX = bodyR * 0.28;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - eyeX, eyeY, Math.max(2.5, size * 0.07));
    g.fillCircle(cx + eyeX, eyeY, Math.max(2.5, size * 0.07));
    g.fillStyle(0x111111, 1);
    g.fillCircle(cx - eyeX, eyeY, Math.max(1.2, size * 0.035));
    g.fillCircle(cx + eyeX, eyeY, Math.max(1.2, size * 0.035));

    // Mouth
    g.lineStyle(2, outline, 1);
    g.beginPath();
    g.moveTo(cx - bodyR * 0.2, cy + bodyR * 0.25);
    g.lineTo(cx + bodyR * 0.2, cy + bodyR * 0.25);
    g.strokePath();

    if (horns) {
      g.fillStyle(outline, 1);
      g.fillTriangle(cx - bodyR * 0.55, cy - bodyR * 0.4, cx - bodyR * 0.15, cy - bodyR * 0.9, cx - bodyR * 0.05, cy - bodyR * 0.35);
      g.fillTriangle(cx + bodyR * 0.55, cy - bodyR * 0.4, cx + bodyR * 0.15, cy - bodyR * 0.9, cx + bodyR * 0.05, cy - bodyR * 0.35);
    }

    g.generateTexture(key, size, size);
    g.clear();
  }
}
