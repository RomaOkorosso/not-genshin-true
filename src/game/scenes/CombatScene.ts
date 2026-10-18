import Phaser from 'phaser';
import type { PlatformBundle, SavePayload } from '../../platform/types';
import { UI_FONT, UI_FONT_TITLE } from '../../ui/fonts';
import { ARCHER_BASELINE } from '../balance/archer';
import type { UpgradeDef, UpgradeId } from '../balance/upgrades';
import { RunController } from '../../systems/combat/RunController';

/** Keep world sprites below HUD/overlays even with y-sorting. */
const DEPTH = {
  ground: 0,
  rangeRing: 1,
  tower: 5,
  archer: 6,
  enemyBase: 10,
  enemySpan: 9,
  projectile: 22,
  hud: 100,
  overlay: 300,
} as const;

interface EnemyView {
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBar: Phaser.GameObjects.Rectangle;
  windup: Phaser.GameObjects.Arc;
}

interface ProjectileView {
  sprite: Phaser.GameObjects.Image;
}

export class CombatScene extends Phaser.Scene {
  private platform!: PlatformBundle;
  private run!: RunController;
  private enemyViews = new Map<number, EnemyView>();
  private projectileViews = new Map<number, ProjectileView>();

  private towerHpBar!: Phaser.GameObjects.Rectangle;
  private towerHpText!: Phaser.GameObjects.Text;
  private xpBar!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;

  private overlayRoot!: Phaser.GameObjects.Container;
  private levelUpPanel!: Phaser.GameObjects.Container;
  private pausePanel!: Phaser.GameObjects.Container;
  private endPanel!: Phaser.GameObjects.Container;
  private almanacPanel!: Phaser.GameObjects.Container;
  private almanacOpen = false;
  /** Explicit pause menu (PAUSE / Esc), not Almanac soft-pause. */
  private pauseMenuOpen = false;
  /** True when Almanac froze combat and should resume on close. */
  private almanacHeldCombat = false;

  constructor() {
    super('Combat');
  }

  init(data: { platform?: PlatformBundle }): void {
    this.platform = data.platform ?? (this.registry.get('platform') as PlatformBundle);
  }

  create(): void {
    const arena = { width: 720, height: 1280, centerX: 360, centerY: 640 };

    this.run = new RunController(this.platform.audio);
    this.run.start();

    this.drawArena(arena);
    this.createHud(arena);
    this.createOverlays(arena);
    this.bindInput();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdownRun());
  }

  update(_time: number, delta: number): void {
    this.run.update(delta);
    this.syncViews();
    this.syncHud();
    this.syncOverlayVisibility();
  }

  private shutdownRun(): void {
    this.run.cleanup();
    this.enemyViews.clear();
    this.projectileViews.clear();
  }

  private drawArena(arena: { width: number; height: number; centerX: number; centerY: number }): void {
    for (let y = 0; y < arena.height; y += 64) {
      for (let x = 0; x < arena.width; x += 64) {
        this.add.image(x + 32, y + 32, 'tile_grass').setDepth(DEPTH.ground);
      }
    }

    // Attack range must match combat targeting center + stats.range (was hardcoded 280).
    const range = this.run.getStats().range || ARCHER_BASELINE.range;
    const ring = this.add.graphics().setDepth(DEPTH.rangeRing);
    ring.lineStyle(2, 0xfff59d, 0.55);
    ring.strokeCircle(arena.centerX, arena.centerY, range);
    ring.lineStyle(1, 0xffffff, 0.25);
    ring.strokeCircle(arena.centerX, arena.centerY, range - 1);

    // Tower art centered on the same point enemies converge to / targeting uses.
    this.add.image(arena.centerX, arena.centerY + 8, 'tower').setDepth(DEPTH.tower);
    this.add
      .image(arena.centerX, arena.centerY - 42, 'archer')
      .setDepth(DEPTH.archer)
      .setScale(1.45);
  }

  private createHud(arena: { width: number }): void {
    const top = 18;
    const hud = DEPTH.hud;
    this.add.rectangle(arena.width / 2, 56, arena.width - 24, 96, 0x0d1610, 0.82).setDepth(hud);

    // Label above the tower HP bar
    this.towerHpText = this.add
      .text(40, top, 'Tower 100 / 100', {
        fontFamily: UI_FONT,
        fontSize: '15px',
        fontStyle: '700',
        color: '#ffcdd2',
      })
      .setDepth(hud + 2);

    this.add
      .rectangle(40, top + 26, 200, 14, 0x333333)
      .setOrigin(0, 0.5)
      .setDepth(hud + 1);
    this.towerHpBar = this.add
      .rectangle(40, top + 26, 200, 14, 0xe53935)
      .setOrigin(0, 0.5)
      .setDepth(hud + 2);

    this.add
      .rectangle(40, top + 48, 200, 10, 0x333333)
      .setOrigin(0, 0.5)
      .setDepth(hud + 1);
    this.xpBar = this.add
      .rectangle(40, top + 48, 0, 10, 0xffeb3b)
      .setOrigin(0, 0.5)
      .setDepth(hud + 2);

    this.levelText = this.add
      .text(arena.width - 40, top, 'Lv 1', {
        fontFamily: UI_FONT,
        fontSize: '20px',
        fontStyle: '800',
        color: '#e8f5e9',
      })
      .setOrigin(1, 0)
      .setDepth(hud + 2);

    this.timerText = this.add
      .text(arena.width - 40, top + 28, '0:00', {
        fontFamily: UI_FONT,
        fontSize: '16px',
        fontStyle: '700',
        color: '#a5d6a7',
      })
      .setOrigin(1, 0)
      .setDepth(hud + 2);

    this.killText = this.add
      .text(arena.width / 2, top + 8, 'Kills 0', {
        fontFamily: UI_FONT,
        fontSize: '15px',
        fontStyle: '700',
        color: '#c8e6c9',
      })
      .setOrigin(0.5)
      .setDepth(hud + 2);

    const pauseBtn = this.add
      .text(arena.width - 40, 118, 'PAUSE', {
        fontFamily: UI_FONT,
        fontSize: '16px',
        fontStyle: '800',
        color: '#1b1b1b',
        backgroundColor: '#ffe082',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(hud + 5)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerup', () => this.onPausePressed());

    const codex = this.add
      .image(56, 130, 'codex_btn')
      .setDepth(hud + 5)
      .setScale(0.85)
      .setInteractive({ useHandCursor: true });
    codex.on('pointerup', () => this.toggleAlmanac());
  }

  private createOverlays(arena: { width: number; height: number }): void {
    this.overlayRoot = this.add.container(0, 0).setDepth(DEPTH.overlay);
    this.levelUpPanel = this.add.container(0, 0).setVisible(false);
    this.pausePanel = this.add.container(0, 0).setVisible(false);
    this.endPanel = this.add.container(0, 0).setVisible(false);
    this.almanacPanel = this.add.container(0, 0).setVisible(false);
    this.overlayRoot.add([this.levelUpPanel, this.pausePanel, this.endPanel, this.almanacPanel]);

    // Pause
    const pBg = this.add.rectangle(arena.width / 2, arena.height / 2, arena.width, arena.height, 0x000000, 0.55);
    const pTitle = this.add
      .text(arena.width / 2, arena.height * 0.35, 'PAUSED', {
        fontFamily: UI_FONT_TITLE,
        fontStyle: '800',
        fontSize: '42px',
        color: '#fffde7',
      })
      .setOrigin(0.5);
    const resume = this.makeButton(arena.width / 2, arena.height * 0.48, 'RESUME', () => {
      this.closePauseMenu();
    });
    const restart = this.makeButton(arena.width / 2, arena.height * 0.56, 'RESTART', () => this.restartRun());
    const toMenu = this.makeButton(arena.width / 2, arena.height * 0.64, 'MAIN MENU', () => {
      this.scene.start('Menu', { platform: this.platform });
    });
    this.pausePanel.add([pBg, pTitle, resume, restart, toMenu]);

    // Almanac
    const aBg = this.add.rectangle(arena.width / 2, arena.height / 2, arena.width * 0.86, arena.height * 0.7, 0x3e2723, 0.96);
    const aTitle = this.add
      .text(arena.width / 2, arena.height * 0.22, 'ALMANAC', {
        fontFamily: UI_FONT_TITLE,
        fontStyle: '800',
        fontSize: '36px',
        color: '#ffe082',
      })
      .setOrigin(0.5);
    const aBody = this.add
      .text(
        arena.width / 2,
        arena.height * 0.42,
        [
          'Archer — auto-fires at the nearest enemy.',
          'Tower — defend its HP; enemies wind up before striking.',
          'Upgrades — pick 1 of 3 on level-up.',
          '',
          'Enemies:',
          '• Grunt — basic melee',
          '• Elite Grunt — tanky aura variant',
          '• Raider Captain — summons Grunts at 60% HP',
          '',
          'Level 1 has no Evolutions.',
        ].join('\n'),
        {
          fontFamily: UI_FONT,
          fontStyle: '700',
          fontSize: '16px',
          color: '#fff8e1',
          align: 'left',
          wordWrap: { width: arena.width * 0.7 },
        },
      )
      .setOrigin(0.5);
    const aClose = this.makeButton(arena.width / 2, arena.height * 0.78, 'CLOSE BOOK', () => this.toggleAlmanac(false));
    this.almanacPanel.add([aBg, aTitle, aBody, aClose]);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: UI_FONT,
          fontStyle: '700',
        fontSize: '20px',
        color: '#1b1b1b',
        backgroundColor: '#a5d6a7',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerup', onClick);
    return btn;
  }

  private bindInput(): void {
    this.input.keyboard?.on('keydown-ESC', () => this.onPausePressed());
    this.input.keyboard?.on('keydown-P', () => this.onPausePressed());

    this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onPausePressed(): void {
    const phase = this.run.getPhase();
    if (phase === 'levelup' || phase === 'victory' || phase === 'defeat') return;
    if (this.almanacOpen) {
      this.toggleAlmanac(false);
      return;
    }
    if (this.pauseMenuOpen) {
      this.closePauseMenu();
      return;
    }
    this.openPauseMenu();
  }

  private openPauseMenu(): void {
    if (this.run.getPhase() === 'combat') {
      this.run.togglePause();
    }
    this.pauseMenuOpen = true;
  }

  private closePauseMenu(): void {
    if (this.pauseMenuOpen && this.run.getPhase() === 'paused' && !this.almanacHeldCombat) {
      this.run.togglePause();
    }
    this.pauseMenuOpen = false;
  }

  private toggleAlmanac(force?: boolean): void {
    const opening = force ?? !this.almanacOpen;
    if (opening === this.almanacOpen) {
      if (opening) this.almanacPanel.setVisible(true);
      return;
    }

    this.almanacOpen = opening;
    this.almanacPanel.setVisible(opening);
    this.platform.audio.play(opening ? 'almanac_open' : 'almanac_close');

    if (opening) {
      // Soft-pause combat only; do not open the pause menu overlay.
      if (this.run.getPhase() === 'combat') {
        this.run.togglePause();
        this.almanacHeldCombat = true;
      }
      return;
    }

    // Closing the book resumes combat if Almanac was what froze it.
    if (this.almanacHeldCombat && this.run.getPhase() === 'paused') {
      this.run.togglePause();
      this.almanacHeldCombat = false;
    }
  }

  private syncViews(): void {
    const aliveIds = new Set<number>();
    for (const e of this.run.getEnemies()) {
      if (!e.alive) continue;
      aliveIds.add(e.id);
      let view = this.enemyViews.get(e.id);
      if (!view) {
        view = this.createEnemyView(e.defId);
        this.enemyViews.set(e.id, view);
      }
      view.root.setPosition(e.x, e.y);
      const arenaH = this.run.getArena().height;
      const ySort = Math.min(
        DEPTH.enemySpan,
        Math.max(0, Math.floor((e.y / arenaH) * DEPTH.enemySpan)),
      );
      view.root.setDepth(DEPTH.enemyBase + ySort);
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      view.hpBar.width = 32 * hpRatio;
      view.hpBar.setFillStyle(hpRatio > 0.35 ? 0x00e676 : 0xff1744);
      view.sprite.setAlpha(e.hitFlash > 0 ? 0.65 : 1);
      view.windup.setVisible(e.state === 'winding_up');
      if (e.state === 'winding_up') {
        const t = 1 - e.windupRemaining / (e.def.attackWindupMs / 1000);
        view.windup.setEndAngle(Phaser.Math.RadToDeg(Math.PI * 2 * t));
      }
    }
    for (const [id, view] of this.enemyViews) {
      if (!aliveIds.has(id)) {
        view.root.destroy(true);
        this.enemyViews.delete(id);
      }
    }

    const projIds = new Set<number>();
    for (const p of this.run.getProjectiles()) {
      if (!p.active) continue;
      projIds.add(p.id);
      let view = this.projectileViews.get(p.id);
      if (!view) {
        const sprite = this.add
          .image(p.x, p.y, p.crit ? 'arrow_crit' : 'arrow')
          .setDepth(DEPTH.projectile);
        view = { sprite };
        this.projectileViews.set(p.id, view);
      }
      view.sprite.setPosition(p.x, p.y);
      view.sprite.setRotation(Math.atan2(p.vy, p.vx));
      view.sprite.setTexture(p.crit ? 'arrow_crit' : 'arrow');
    }
    for (const [id, view] of this.projectileViews) {
      if (!projIds.has(id)) {
        view.sprite.destroy();
        this.projectileViews.delete(id);
      }
    }
  }

  private createEnemyView(defId: string): EnemyView {
    const key =
      defId === 'elite_grunt'
        ? 'enemy_elite_grunt'
        : defId === 'raider_captain'
          ? 'enemy_raider_captain'
          : 'enemy_grunt';
    const sprite = this.add.image(0, 0, key);
    const barY = -sprite.height * 0.58;
    const hpBarBg = this.add.rectangle(0, barY, 32, 6, 0x111111).setStrokeStyle(1, 0xffffff, 0.35);
    const hpBar = this.add.rectangle(-16, barY, 32, 6, 0x00e676).setOrigin(0, 0.5);
    const windup = this.add
      .arc(0, 0, sprite.width * 0.55, 0, 0, false, 0xff6d00, 0.45)
      .setVisible(false);
    const root = this.add.container(0, 0, [windup, sprite, hpBarBg, hpBar]);
    return { root, sprite, hpBarBg, hpBar, windup };
  }

  private syncHud(): void {
    const snap = this.run.snapshot();
    const hpRatio = snap.towerMaxHp > 0 ? snap.towerHp / snap.towerMaxHp : 0;
    this.towerHpBar.width = 200 * hpRatio;
    this.towerHpText.setText(`Tower ${Math.ceil(snap.towerHp)} / ${snap.towerMaxHp}`);
    const xpRatio = snap.xpToNext > 0 ? snap.xp / snap.xpToNext : 0;
    this.xpBar.width = 200 * xpRatio;
    this.levelText.setText(`Lv ${snap.heroLevel}`);
    this.timerText.setText(formatTime(snap.elapsedMs));
    this.killText.setText(`Kills ${snap.killCount}`);
  }

  private syncOverlayVisibility(): void {
    const phase = this.run.getPhase();
    const snap = this.run.snapshot();

    if (phase === 'levelup' && snap.offer) {
      if (!this.levelUpPanel.visible) this.showLevelUp(snap.offer);
      this.levelUpPanel.setVisible(true);
    } else {
      this.levelUpPanel.setVisible(false);
      this.levelUpPanel.removeAll(true);
    }

    this.pausePanel.setVisible(this.pauseMenuOpen && !this.almanacOpen);

    if (phase === 'victory' || phase === 'defeat') {
      if (!this.endPanel.visible) {
        this.showEnd(phase === 'victory', snap.towerHp, snap.elapsedMs);
        void this.persistRunResult(phase === 'victory', snap.towerHp);
      }
      this.endPanel.setVisible(true);
    }
  }

  private showLevelUp(offer: UpgradeDef[]): void {
    this.levelUpPanel.removeAll(true);
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    const title = this.add
      .text(width / 2, height * 0.18, 'LEVEL UP — Choose 1', {
        fontFamily: UI_FONT_TITLE,
        fontStyle: '800',
        fontSize: '32px',
        color: '#fffde7',
      })
      .setOrigin(0.5);

    const book = this.add
      .image(width / 2, height * 0.28, 'codex_btn')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });
    book.on('pointerup', () => this.toggleAlmanac(true));

    const cards: Phaser.GameObjects.GameObject[] = [bg, title, book];
    const startY = height * 0.4;
    offer.forEach((up, i) => {
      const y = startY + i * 110;
      const card = this.add
        .rectangle(width / 2, y, width * 0.78, 96, 0x1b5e20, 0.95)
        .setStrokeStyle(2, 0xa5d6a7)
        .setInteractive({ useHandCursor: true });
      const name = this.add
        .text(width / 2, y - 22, up.name, {
          fontFamily: UI_FONT,
          fontStyle: '700',
          fontSize: '22px',
          color: '#e8f5e9',
        })
        .setOrigin(0.5);
      const desc = this.add
        .text(width / 2, y + 16, up.description, {
          fontFamily: UI_FONT,
          fontStyle: '700',
          fontSize: '14px',
          color: '#c8e6c9',
          align: 'center',
          wordWrap: { width: width * 0.7 },
        })
        .setOrigin(0.5);
      card.on('pointerup', () => {
        if (this.run.getPhase() !== 'levelup') return;
        this.run.chooseUpgrade(up.id as UpgradeId);
        this.almanacOpen = false;
        this.almanacHeldCombat = false;
        this.almanacPanel.setVisible(false);
      });
      cards.push(card, name, desc);
    });

    this.levelUpPanel.add(cards);
  }

  private showEnd(victory: boolean, towerHp: number, elapsedMs: number): void {
    this.endPanel.removeAll(true);
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const title = this.add
      .text(width / 2, height * 0.32, victory ? 'VICTORY' : 'DEFEAT', {
        fontFamily: UI_FONT_TITLE,
        fontStyle: '800',
        fontSize: '48px',
        color: victory ? '#c8e6c9' : '#ffcdd2',
      })
      .setOrigin(0.5);
    const detail = this.add
      .text(
        width / 2,
        height * 0.42,
        victory
          ? `Tower HP remaining: ${Math.ceil(towerHp)}\nTime: ${formatTime(elapsedMs)}`
          : `The tower fell at ${formatTime(elapsedMs)}`,
        {
          fontFamily: UI_FONT,
          fontStyle: '700',
          fontSize: '18px',
          color: '#eeeeee',
          align: 'center',
        },
      )
      .setOrigin(0.5);
    const again = this.makeButton(width / 2, height * 0.55, 'PLAY AGAIN', () => this.restartRun());
    const menu = this.makeButton(width / 2, height * 0.64, 'MAIN MENU', () => {
      this.scene.start('Menu', { platform: this.platform });
    });
    this.endPanel.add([bg, title, detail, again, menu]);
  }

  private async persistRunResult(victory: boolean, towerHp: number): Promise<void> {
    const save = await this.platform.saves.load();
    const next: SavePayload = {
      ...save,
      lastRunAt: Date.now(),
      runsCompleted: save.runsCompleted + (victory ? 1 : 0),
      bestTowerHpRemaining: victory
        ? Math.max(save.bestTowerHpRemaining, Math.ceil(towerHp))
        : save.bestTowerHpRemaining,
    };
    await this.platform.saves.save(next);
    if (victory) {
      await this.platform.leaderboards.submit(Math.ceil(towerHp));
    }
    this.platform.analytics.track(victory ? 'run_victory' : 'run_defeat', {
      towerHp: Math.ceil(towerHp),
    });
  }

  private restartRun(): void {
    this.almanacOpen = false;
    this.almanacHeldCombat = false;
    this.pauseMenuOpen = false;
    for (const view of this.enemyViews.values()) view.root.destroy(true);
    this.enemyViews.clear();
    for (const view of this.projectileViews.values()) view.sprite.destroy();
    this.projectileViews.clear();
    this.levelUpPanel.removeAll(true).setVisible(false);
    this.endPanel.removeAll(true).setVisible(false);
    this.pausePanel.setVisible(false);
    this.almanacPanel.setVisible(false);
    this.run.start();
  }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
