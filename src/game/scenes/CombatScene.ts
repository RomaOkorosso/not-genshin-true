import Phaser from 'phaser';
import { RunController } from '../../systems/combat/RunController';
import { recordCampaignVictory } from '../../platform/browser/BrowserPlatform';
import type { PlatformBundle } from '../../platform/types';
import {
  ALMANAC_TYPE,
  UI_FONT_BODY,
  UI_FONT_DISPLAY,
} from '../../ui/fonts';
import { ARCHER_BASELINE } from '../balance/archer';
import type { UpgradeDef, UpgradeId } from '../balance/upgrades';
import {
  CODEX_SECTIONS,
  pagesForSection,
  type CodexPage,
  type CodexSectionId,
} from '../content/codex';
import { getLevelDef, isLevelId, type LevelId } from '../content/levels';

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
  private levelId: LevelId = 1;
  private run!: RunController;
  private enemyViews = new Map<number, EnemyView>();
  private projectileViews = new Map<number, ProjectileView>();

  private towerHpBar!: Phaser.GameObjects.Rectangle;
  private towerHpText!: Phaser.GameObjects.Text;
  private xpBar!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private codexBtn!: Phaser.GameObjects.Image;

  private overlayRoot!: Phaser.GameObjects.Container;
  private levelUpPanel!: Phaser.GameObjects.Container;
  private pausePanel!: Phaser.GameObjects.Container;
  private endPanel!: Phaser.GameObjects.Container;
  private almanacPanel!: Phaser.GameObjects.Container;
  private almanacOpen = false;
  private pauseMenuOpen = false;
  private almanacHeldCombat = false;
  private codexSection: CodexSectionId = 'mechanics';
  private almanacTabs: Phaser.GameObjects.Text[] = [];
  private almanacScrollContent!: Phaser.GameObjects.Container;
  private almanacScrollMask!: Phaser.GameObjects.Graphics;
  private almanacScrollY = 0;
  private almanacContentHeight = 0;
  private almanacViewport = { x: 0, y: 0, width: 0, height: 0, columnWidth: 0 };
  private almanacDragLastY: number | null = null;
  private bossFlash?: Phaser.GameObjects.Rectangle;
  private hitSparkIds = new Set<number>();
  private ultimateBtn!: Phaser.GameObjects.Text;
  private ultimateCdFill!: Phaser.GameObjects.Rectangle;
  private activeVfx = 0;
  private readonly maxVfx = 24;

  constructor() {
    super('Combat');
  }

  init(data: { platform?: PlatformBundle; levelId?: LevelId }): void {
    this.platform = data.platform ?? (this.registry.get('platform') as PlatformBundle);
    this.levelId = isLevelId(data.levelId) ? data.levelId : 1;
  }

  create(): void {
    const arena = { width: 720, height: 1280, centerX: 360, centerY: 640 };

    this.run = new RunController(this.platform.audio);
    this.run.start(this.levelId);
    this.run.bus.on('boss_spawn', () => this.flashBossSpawn());
    this.run.bus.on('evolution_ready', () => {
      this.platform.audio.play('evolution');
      this.flashEvolution();
    });
    this.run.bus.on('ultimate', () => this.flashUltimateCast(arena.centerX, arena.centerY));
    this.run.bus.on('enemy_death', (p: { x: number; y: number }) => this.spawnDeathPuff(p.x, p.y));
    this.run.bus.on('crit_hit', (p: { x: number; y: number }) => this.spawnCritSpark(p.x, p.y));
    this.run.bus.on('level_up', () => this.flashLevelUp());

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
    const tower = this.add.image(arena.centerX, arena.centerY + 8, 'tower').setDepth(DEPTH.tower);
    const towerScale = Math.min(1, 110 / Math.max(tower.height, 1));
    tower.setScale(towerScale);

    const archer = this.add
      .image(arena.centerX, arena.centerY - 42, 'archer')
      .setDepth(DEPTH.archer);
    const archerScale = Math.min(1.2, 56 / Math.max(archer.height, 1));
    archer.setScale(archerScale);
  }

  private createHud(arena: { width: number }): void {
    const top = 18;
    const hud = DEPTH.hud;
    this.add.rectangle(arena.width / 2, 56, arena.width - 24, 96, 0x0d1610, 0.82).setDepth(hud);

    // Label above the tower HP bar
    this.towerHpText = this.add
      .text(40, top, 'Tower 100 / 100', {
        fontFamily: UI_FONT_BODY,
        fontSize: '16px',
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
        fontFamily: UI_FONT_DISPLAY,
        fontSize: '20px',
        fontStyle: '800',
        color: '#e8f5e9',
      })
      .setOrigin(1, 0)
      .setDepth(hud + 2);

    this.timerText = this.add
      .text(arena.width - 40, top + 28, '0:00', {
        fontFamily: UI_FONT_BODY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#a5d6a7',
      })
      .setOrigin(1, 0)
      .setDepth(hud + 2);

    this.killText = this.add
      .text(arena.width / 2, top + 8, 'Kills 0', {
        fontFamily: UI_FONT_BODY,
        fontSize: '16px',
        fontStyle: '700',
        color: '#c8e6c9',
      })
      .setOrigin(0.5)
      .setDepth(hud + 2);

    const pauseBtn = this.add
      .text(arena.width - 40, 118, 'PAUSE', {
        fontFamily: UI_FONT_DISPLAY,
        fontSize: '16px',
        fontStyle: '800',
        color: '#1b1b1b',
        backgroundColor: '#ffe082',
        padding: { x: 12, y: 10 },
      })
      .setOrigin(1, 0)
      .setDepth(hud + 5)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerup', () => this.onPausePressed());

    this.codexBtn = this.add
      .image(56, 130, 'codex_btn')
      .setDepth(hud + 5)
      .setDisplaySize(52, 58)
      .setInteractive({ useHandCursor: true });
    this.codexBtn.on('pointerup', () => this.toggleAlmanac());

    const ultX = arena.width - 88;
    const ultY = 1180;
    this.add
      .rectangle(ultX, ultY, 120, 56, 0x1b1208, 0.75)
      .setStrokeStyle(2, 0xffe082)
      .setDepth(hud + 4);
    this.ultimateCdFill = this.add
      .rectangle(ultX - 58, ultY, 0, 52, 0x5d4037, 0.85)
      .setOrigin(0, 0.5)
      .setDepth(hud + 5);
    this.ultimateBtn = this.add
      .text(ultX, ultY, 'ULTIMATE', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '16px',
        color: '#fffde7',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(hud + 6)
      .setInteractive({ useHandCursor: true });
    this.ultimateBtn.on('pointerup', () => {
      if (this.almanacOpen || this.pauseMenuOpen) return;
      this.run.tryActivateUltimate();
    });
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
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '42px',
        color: '#fffde7',
      })
      .setOrigin(0.5);
    const resume = this.makeButton(arena.width / 2, arena.height * 0.48, 'RESUME', () => {
      this.closePauseMenu();
    });
    const restart = this.makeButton(arena.width / 2, arena.height * 0.56, 'RESTART', () => this.restartRun());
    const toSelect = this.makeButton(arena.width / 2, arena.height * 0.64, 'LEVEL SELECT', () => {
      this.scene.start('LevelSelect', { platform: this.platform });
    });
    this.pausePanel.add([pBg, pTitle, resume, restart, toSelect]);

    this.buildAlmanacOverlay(arena.width, arena.height);
  }

  private buildAlmanacOverlay(width: number, height: number): void {
    const panelW = width * 0.92;
    const panelH = height * 0.82;
    const panelX = width / 2;
    const panelY = height / 2;
    const padX = width < 500 ? ALMANAC_TYPE.padXMobile : ALMANAC_TYPE.padXDesktop;

    const aBg = this.add
      .rectangle(panelX, panelY, panelW, panelH, 0x2a1810, 0.98)
      .setStrokeStyle(3, 0x8d6e63);

    const aTitle = this.add
      .text(panelX, panelY - panelH / 2 + 36, 'ALMANAC', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: `${ALMANAC_TYPE.titlePx}px`,
        color: '#ffe082',
      })
      .setOrigin(0.5);

    const tabRowY = panelY - panelH / 2 + 96;
    const tabGap = 10;
    const tabAreaLeft = panelX - panelW / 2 + padX;
    const tabAreaWidth = panelW - padX * 2;
    const tabWidth = (tabAreaWidth - tabGap * (CODEX_SECTIONS.length - 1)) / CODEX_SECTIONS.length;

    this.almanacTabs = [];
    const tabObjects: Phaser.GameObjects.GameObject[] = [aBg, aTitle];
    CODEX_SECTIONS.forEach((sec, i) => {
      const tabX = tabAreaLeft + tabWidth * i + tabGap * i + tabWidth / 2;
      const tabPadY = Math.max(
        18,
        Math.ceil((ALMANAC_TYPE.tabMinHeight - ALMANAC_TYPE.tabPx) / 2),
      );
      const tab = this.add
        .text(tabX, tabRowY, sec.label, {
          fontFamily: UI_FONT_DISPLAY,
          fontStyle: '800',
          fontSize: `${ALMANAC_TYPE.tabPx}px`,
          color: '#1b1208',
          backgroundColor: '#ffe082',
          padding: { x: 6, y: tabPadY },
          align: 'center',
          fixedWidth: Math.floor(tabWidth),
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      tab.on('pointerup', () => {
        this.codexSection = sec.id;
        this.almanacScrollY = 0;
        this.refreshAlmanacBody();
        this.syncAlmanacTabStyles();
      });
      this.almanacTabs.push(tab);
      tabObjects.push(tab);
    });

    const contentTop = tabRowY + ALMANAC_TYPE.tabMinHeight / 2 + 22;
    const closeY = panelY + panelH / 2 - 44;
    const contentBottom = closeY - 28;
    const columnWidth = Math.min(ALMANAC_TYPE.maxColumnWidth, panelW - padX * 2);
    this.almanacViewport = {
      x: panelX - columnWidth / 2,
      y: contentTop,
      width: columnWidth,
      height: contentBottom - contentTop,
      columnWidth,
    };

    this.almanacScrollMask = this.add.graphics();
    this.almanacScrollMask.fillStyle(0xffffff);
    this.almanacScrollMask.fillRect(
      this.almanacViewport.x,
      this.almanacViewport.y,
      this.almanacViewport.width,
      this.almanacViewport.height,
    );
    this.almanacScrollMask.setVisible(false);

    this.almanacScrollContent = this.add.container(this.almanacViewport.x, this.almanacViewport.y);
    this.almanacScrollContent.setMask(
      this.almanacScrollMask.createGeometryMask(),
    );

    const scrollHit = this.add
      .rectangle(
        panelX,
        this.almanacViewport.y + this.almanacViewport.height / 2,
        columnWidth + 8,
        this.almanacViewport.height,
        0x000000,
        0.001,
      )
      .setInteractive({ draggable: false, useHandCursor: false });
    scrollHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.almanacDragLastY = pointer.y;
    });
    scrollHit.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.almanacOpen || this.almanacDragLastY === null || !pointer.isDown) return;
      const dy = pointer.y - this.almanacDragLastY;
      this.almanacDragLastY = pointer.y;
      this.scrollAlmanacBy(dy);
    });
    scrollHit.on('pointerup', () => {
      this.almanacDragLastY = null;
    });
    scrollHit.on('pointerout', () => {
      this.almanacDragLastY = null;
    });

    const aClose = this.makeButton(panelX, closeY, 'CLOSE BOOK', () => this.toggleAlmanac(false));
    tabObjects.push(this.almanacScrollContent, scrollHit, aClose);
    this.almanacPanel.add(tabObjects);

    this.syncAlmanacTabStyles();
    this.refreshAlmanacBody();
  }

  private syncAlmanacTabStyles(): void {
    this.almanacTabs.forEach((tab, i) => {
      const active = CODEX_SECTIONS[i]?.id === this.codexSection;
      tab.setStyle({
        backgroundColor: active ? '#ffe082' : '#5d4037',
        color: active ? '#1b1208' : '#ffe0b2',
      });
    });
  }

  private scrollAlmanacBy(deltaY: number): void {
    const maxScroll = Math.max(0, this.almanacContentHeight - this.almanacViewport.height);
    this.almanacScrollY = Phaser.Math.Clamp(this.almanacScrollY + deltaY, -maxScroll, 0);
    this.almanacScrollContent.y = this.almanacViewport.y + this.almanacScrollY;
  }

  private refreshAlmanacBody(): void {
    this.almanacScrollContent.removeAll(true);
    const pages = pagesForSection(this.codexSection);
    const colW = this.almanacViewport.columnWidth;
    let y = 0;

    for (const page of pages) {
      y += this.addAlmanacEntry(page, y, colW);
      y += ALMANAC_TYPE.blockGap;
    }

    this.almanacContentHeight = y;
    this.scrollAlmanacBy(0);
  }

  private addAlmanacEntry(page: CodexPage, y: number, colW: number): number {
    const title = this.add
      .text(0, y, page.title, {
        fontFamily: UI_FONT_BODY,
        fontStyle: '700',
        fontSize: `${ALMANAC_TYPE.entryTitlePx}px`,
        color: '#fff3e0',
        wordWrap: { width: colW },
      })
      .setOrigin(0, 0);

    let cursor = y + title.height + ALMANAC_TYPE.titleToBodyGap;
    const body = this.add
      .text(0, cursor, page.body, {
        fontFamily: UI_FONT_BODY,
        fontStyle: 'normal',
        fontSize: `${ALMANAC_TYPE.bodyPx}px`,
        color: '#ffe0b2',
        lineSpacing: Math.round(ALMANAC_TYPE.bodyPx * (ALMANAC_TYPE.lineHeight - 1)),
        wordWrap: { width: colW },
      })
      .setOrigin(0, 0);
    cursor += body.height;

    const nodes: Phaser.GameObjects.GameObject[] = [title, body];
    if (page.requires) {
      cursor += ALMANAC_TYPE.bodyToMetaGap;
      const req = this.add
        .text(0, cursor, `Requires: ${page.requires}`, {
          fontFamily: UI_FONT_BODY,
          fontStyle: 'normal',
          fontSize: `${ALMANAC_TYPE.metaPx}px`,
          color: '#bcaaa4',
          wordWrap: { width: colW },
        })
        .setOrigin(0, 0);
      nodes.push(req);
      cursor += req.height;
    }

    this.almanacScrollContent.add(nodes);
    return cursor - y;
  }

  private flashBossSpawn(): void {
    const { width, height } = this.scale;
    this.bossFlash?.destroy();
    this.bossFlash = this.add
      .rectangle(width / 2, height / 2, width, height, 0xffecb3, 0.35)
      .setDepth(DEPTH.overlay - 1);
    this.tweens.add({
      targets: this.bossFlash,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.bossFlash?.destroy();
        this.bossFlash = undefined;
      },
    });
  }

  private flashEvolution(): void {
    const { width, height } = this.scale;
    const flash = this.add
      .rectangle(width / 2, height / 2, width, height, 0xce93d8, 0.4)
      .setDepth(DEPTH.overlay - 1);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  private spawnHitSpark(x: number, y: number): void {
    if (!this.tryBeginVfx()) return;
    const key = this.textures.exists('hit_spark') ? 'hit_spark' : undefined;
    const spark = key
      ? this.add.image(x, y, key).setDepth(DEPTH.projectile + 1).setDisplaySize(22, 22)
      : this.add.circle(x, y, 6, 0xfff59d, 0.9).setDepth(DEPTH.projectile + 1);
    this.tweens.add({
      targets: spark,
      scale: 2.2,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        spark.destroy();
        this.endVfx();
      },
    });
  }

  private spawnCritSpark(x: number, y: number): void {
    if (!this.tryBeginVfx()) return;
    const spark = this.add.circle(x, y, 10, 0xffab00, 0.95).setDepth(DEPTH.projectile + 2);
    this.tweens.add({
      targets: spark,
      scale: 2.8,
      alpha: 0,
      duration: 240,
      onComplete: () => {
        spark.destroy();
        this.endVfx();
      },
    });
  }

  private spawnDeathPuff(x: number, y: number): void {
    if (!this.tryBeginVfx()) return;
    const key = this.textures.exists('death_puff') ? 'death_puff' : undefined;
    const puff = key
      ? this.add.image(x, y, key).setDepth(DEPTH.projectile + 1).setDisplaySize(36, 28)
      : this.add.circle(x, y, 14, 0x8d6e63, 0.85).setDepth(DEPTH.projectile + 1);
    this.tweens.add({
      targets: puff,
      y: y - 18,
      scale: 1.6,
      alpha: 0,
      duration: 320,
      onComplete: () => {
        puff.destroy();
        this.endVfx();
      },
    });
  }

  private flashUltimateCast(cx: number, cy: number): void {
    if (!this.tryBeginVfx()) return;
    const ring = this.add.circle(cx, cy, 40, 0xffe082, 0.35).setDepth(DEPTH.projectile + 2);
    this.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 420,
      onComplete: () => {
        ring.destroy();
        this.endVfx();
      },
    });
  }

  private flashLevelUp(): void {
    if (!this.tryBeginVfx()) return;
    const { width, height } = this.scale;
    const flash = this.add
      .rectangle(width / 2, height / 2, width, height, 0xfff59d, 0.22)
      .setDepth(DEPTH.overlay - 1);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      onComplete: () => {
        flash.destroy();
        this.endVfx();
      },
    });
  }

  private tryBeginVfx(): boolean {
    if (this.activeVfx >= this.maxVfx) return false;
    this.activeVfx += 1;
    return true;
  }

  private endVfx(): void {
    this.activeVfx = Math.max(0, this.activeVfx - 1);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '700',
        fontSize: '20px',
        color: '#1b1b1b',
        backgroundColor: '#a5d6a7',
        padding: { x: 18, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerup', onClick);
    return btn;
  }

  private bindInput(): void {
    this.input.keyboard?.on('keydown-ESC', () => this.onPausePressed());
    this.input.keyboard?.on('keydown-P', () => this.onPausePressed());
    this.input.on('wheel', (_p: unknown, _gos: unknown, _dx: number, dy: number) => {
      if (!this.almanacOpen) return;
      this.scrollAlmanacBy(-dy * 0.55);
    });
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
      if (e.hitFlash > 0.08 && !this.hitSparkIds.has(e.id)) {
        this.hitSparkIds.add(e.id);
        this.spawnHitSpark(e.x, e.y);
      } else if (e.hitFlash <= 0) {
        this.hitSparkIds.delete(e.id);
      }
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
    const keyMap: Record<string, string> = {
      grunt: 'enemy_grunt',
      elite_grunt: 'enemy_elite_grunt',
      raider_captain: 'enemy_raider_captain',
      runner: 'enemy_runner',
      elite_runner: 'enemy_elite_runner',
      brute: 'enemy_brute',
      elite_brute: 'enemy_elite_brute',
      stone_golem: 'enemy_stone_golem',
    };
    const key = keyMap[defId] ?? 'enemy_grunt';
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
    this.levelText.setText(`L${snap.levelId} · Lv ${snap.heroLevel}`);
    this.timerText.setText(formatTime(snap.elapsedMs));
    this.killText.setText(`Kills ${snap.killCount}`);
    if (this.codexBtn) {
      const pulse = snap.evolutionAvailable ? 1 + Math.sin(this.time.now / 200) * 0.08 : 1;
      this.codexBtn.setScale(pulse);
      this.codexBtn.setTint(snap.evolutionAvailable ? 0xffecb3 : 0xffffff);
    }
    if (this.ultimateBtn && this.ultimateCdFill) {
      const max = snap.ultimateCooldownMax || 1;
      const rem = snap.ultimateCooldownRemaining;
      const ready = snap.ultimateReady && !this.almanacOpen && !this.pauseMenuOpen;
      const fillW = ready ? 116 : Math.max(0, 116 * (1 - rem / max));
      this.ultimateCdFill.width = fillW;
      this.ultimateCdFill.setFillStyle(ready ? 0x2e7d32 : 0x5d4037, 0.9);
      this.ultimateBtn.setAlpha(ready ? 1 : 0.55);
      this.ultimateBtn.setText(ready ? 'ULTIMATE' : `${Math.ceil(rem)}s`);
    }
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
      .text(width / 2, height * 0.16, 'LEVEL UP — Choose 1', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '30px',
        color: '#fffde7',
      })
      .setOrigin(0.5);

    const book = this.add
      .image(width / 2, height * 0.24, 'codex_btn')
      .setScale(1.0)
      .setInteractive({ useHandCursor: true });
    book.on('pointerup', () => this.toggleAlmanac(true));

    const cards: Phaser.GameObjects.GameObject[] = [bg, title, book];
    const startY = height * 0.36;
    offer.forEach((up, i) => {
      const y = startY + i * 112;
      const isEvo = Boolean(up.evolution);
      const card = this.add
        .rectangle(width / 2, y, width * 0.8, 100, isEvo ? 0x4a148c : 0x1b5e20, 0.96)
        .setStrokeStyle(3, isEvo ? 0xffd54f : 0xa5d6a7)
        .setInteractive({ useHandCursor: true });
      const name = this.add
        .text(width / 2, y - 24, isEvo ? `★ ${up.name}` : up.name, {
          fontFamily: UI_FONT_DISPLAY,
          fontStyle: '800',
          fontSize: isEvo ? '22px' : '20px',
          color: isEvo ? '#ffe082' : '#e8f5e9',
        })
        .setOrigin(0.5);
      const desc = this.add
        .text(width / 2, y + 18, up.description, {
          fontFamily: UI_FONT_BODY,
          fontStyle: 'normal',
          fontSize: '16px',
          color: '#e8f5e9',
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: Math.min(520, width * 0.72) },
        })
        .setOrigin(0.5);
      card.on('pointerup', () => {
        if (this.run.getPhase() !== 'levelup') return;
        if (isEvo) this.platform.audio.play('evolution');
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
    const def = getLevelDef(this.levelId);
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const title = this.add
      .text(width / 2, height * 0.28, victory ? 'VICTORY' : 'DEFEAT', {
        fontFamily: UI_FONT_DISPLAY,
        fontStyle: '800',
        fontSize: '48px',
        color: victory ? '#c8e6c9' : '#ffcdd2',
      })
      .setOrigin(0.5);
    const detail = this.add
      .text(
        width / 2,
        height * 0.38,
        victory
          ? `${def.name}\nTower HP: ${Math.ceil(towerHp)} · Time: ${formatTime(elapsedMs)}`
          : `${def.name}\nThe tower fell at ${formatTime(elapsedMs)}`,
        {
          fontFamily: UI_FONT_BODY,
          fontStyle: 'normal',
          fontSize: '17px',
          color: '#eeeeee',
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    const items: Phaser.GameObjects.GameObject[] = [bg, title, detail];
    let y = 0.5;
    if (victory && this.levelId < 5) {
      items.push(
        this.makeButton(width / 2, height * y, 'NEXT LEVEL', () => {
          this.scene.start('Combat', {
            platform: this.platform,
            levelId: (this.levelId + 1) as LevelId,
          });
        }),
      );
      y += 0.09;
    }
    items.push(this.makeButton(width / 2, height * y, 'PLAY AGAIN', () => this.restartRun()));
    y += 0.09;
    items.push(
      this.makeButton(width / 2, height * y, 'LEVEL SELECT', () => {
        this.scene.start('LevelSelect', { platform: this.platform });
      }),
    );
    this.endPanel.add(items);
  }

  private async persistRunResult(victory: boolean, towerHp: number): Promise<void> {
    const save = await this.platform.saves.load();
    const next = victory
      ? recordCampaignVictory(save, this.levelId, towerHp)
      : { ...save, lastRunAt: Date.now() };
    await this.platform.saves.save(next);
    if (victory) {
      await this.platform.leaderboards.submit(Math.ceil(towerHp) + this.levelId * 100);
    }
    this.platform.analytics.track(victory ? 'run_victory' : 'run_defeat', {
      towerHp: Math.ceil(towerHp),
      level: this.levelId,
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
    this.run.start(this.levelId);
  }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
