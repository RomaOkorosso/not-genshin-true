import Phaser from 'phaser';
import type { UpgradeDef, UpgradeId } from '../balance/upgrades';
import type { PlatformBundle, SavePayload } from '../../platform/types';
import { RunController } from '../../systems/combat/RunController';

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
        this.add.image(x + 32, y + 32, 'tile_grass');
      }
    }

    // Soft vignette ring suggestion
    const ring = this.add.graphics();
    ring.lineStyle(3, 0x2e4a2e, 0.5);
    ring.strokeCircle(arena.centerX, arena.centerY, 280);

    this.add.image(arena.centerX, arena.centerY + 18, 'tower').setDepth(5);
    this.add.image(arena.centerX, arena.centerY - 48, 'archer').setDepth(6).setScale(1.35);
  }

  private createHud(arena: { width: number }): void {
    const top = 24;
    this.add.rectangle(arena.width / 2, 52, arena.width - 24, 88, 0x0d1610, 0.72).setDepth(20);

    this.add
      .rectangle(40, top + 18, 200, 14, 0x333333)
      .setOrigin(0, 0.5)
      .setDepth(21);
    this.towerHpBar = this.add
      .rectangle(40, top + 18, 200, 14, 0xe53935)
      .setOrigin(0, 0.5)
      .setDepth(22);
    this.towerHpText = this.add
      .text(40, top + 36, 'Tower HP', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#ffcdd2',
      })
      .setDepth(22);

    this.add
      .rectangle(40, top + 58, 200, 10, 0x333333)
      .setOrigin(0, 0.5)
      .setDepth(21);
    this.xpBar = this.add
      .rectangle(40, top + 58, 0, 10, 0xffeb3b)
      .setOrigin(0, 0.5)
      .setDepth(22);

    this.levelText = this.add
      .text(arena.width - 40, top + 12, 'Lv 1', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#e8f5e9',
      })
      .setOrigin(1, 0)
      .setDepth(22);

    this.timerText = this.add
      .text(arena.width - 40, top + 40, '0:00', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#a5d6a7',
      })
      .setOrigin(1, 0)
      .setDepth(22);

    this.killText = this.add
      .text(arena.width / 2, top + 18, 'Kills 0', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#c8e6c9',
      })
      .setOrigin(0.5)
      .setDepth(22);

    const pauseBtn = this.add
      .text(arena.width - 40, 110, 'PAUSE', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#1b1b1b',
        backgroundColor: '#ffe082',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(25)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerup', () => this.onPausePressed());

    const codex = this.add
      .image(56, 130, 'codex_btn')
      .setDepth(25)
      .setScale(0.85)
      .setInteractive({ useHandCursor: true });
    codex.on('pointerup', () => this.toggleAlmanac());
  }

  private createOverlays(arena: { width: number; height: number }): void {
    this.overlayRoot = this.add.container(0, 0).setDepth(40);
    this.levelUpPanel = this.add.container(0, 0).setVisible(false);
    this.pausePanel = this.add.container(0, 0).setVisible(false);
    this.endPanel = this.add.container(0, 0).setVisible(false);
    this.almanacPanel = this.add.container(0, 0).setVisible(false);
    this.overlayRoot.add([this.levelUpPanel, this.pausePanel, this.endPanel, this.almanacPanel]);

    // Pause
    const pBg = this.add.rectangle(arena.width / 2, arena.height / 2, arena.width, arena.height, 0x000000, 0.55);
    const pTitle = this.add
      .text(arena.width / 2, arena.height * 0.35, 'PAUSED', {
        fontFamily: 'Georgia, serif',
        fontSize: '42px',
        color: '#fffde7',
      })
      .setOrigin(0.5);
    const resume = this.makeButton(arena.width / 2, arena.height * 0.48, 'RESUME', () => {
      if (this.run.getPhase() === 'paused') this.run.togglePause();
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
        fontFamily: 'Georgia, serif',
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
          fontFamily: 'Trebuchet MS, sans-serif',
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
        fontFamily: 'Trebuchet MS, sans-serif',
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
    this.run.togglePause();
  }

  private toggleAlmanac(force?: boolean): void {
    this.almanacOpen = force ?? !this.almanacOpen;
    this.almanacPanel.setVisible(this.almanacOpen);
    this.platform.audio.play(this.almanacOpen ? 'almanac_open' : 'almanac_close');
    if (this.almanacOpen && this.run.getPhase() === 'combat') {
      this.run.togglePause();
    } else if (!this.almanacOpen && this.run.getPhase() === 'paused') {
      // leave paused if user opened from pause; if opened from combat we paused — resume
      // Only auto-resume when we were in combat before opening.
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
      view.root.setDepth(10 + Math.floor(e.y / 10));
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      view.hpBar.width = 28 * hpRatio;
      view.hpBar.setFillStyle(hpRatio > 0.35 ? 0x66bb6a : 0xef5350);
      view.sprite.setTint(e.hitFlash > 0 ? 0xffffff : 0xffffff);
      view.sprite.setAlpha(e.hitFlash > 0 ? 0.7 : 1);
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
        const sprite = this.add.image(p.x, p.y, p.crit ? 'arrow_crit' : 'arrow').setDepth(15);
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
    const hpBarBg = this.add.rectangle(0, -sprite.height * 0.55, 28, 5, 0x222222);
    const hpBar = this.add.rectangle(-14, -sprite.height * 0.55, 28, 5, 0x66bb6a).setOrigin(0, 0.5);
    const windup = this.add
      .arc(0, 0, sprite.width * 0.55, 0, 0, false, 0xff7043, 0.35)
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

    this.pausePanel.setVisible(phase === 'paused' && !this.almanacOpen);

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
        fontFamily: 'Georgia, serif',
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
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '22px',
          color: '#e8f5e9',
        })
        .setOrigin(0.5);
      const desc = this.add
        .text(width / 2, y + 16, up.description, {
          fontFamily: 'Trebuchet MS, sans-serif',
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
        fontFamily: 'Georgia, serif',
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
          fontFamily: 'Trebuchet MS, sans-serif',
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
