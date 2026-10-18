/**
 * Balance harness: fair-bot clears + 15s telemetry + multi-seed stats.
 * Usage:
 *   npx vite-node scripts/balance-harness.ts              # full report
 *   npx vite-node scripts/balance-harness.ts --diag       # 5-seed Skip vs no-Skip telemetry
 *   npx vite-node scripts/balance-harness.ts --validate   # 100-seed stats only
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AudioEvent, AudioService } from '../src/platform/types';
import { ALL_LEVEL_IDS, getLevelDef, type LevelId } from '../src/game/content/levels';
import type { UpgradeDef, UpgradeId } from '../src/game/balance/upgrades';
import { RunController } from '../src/systems/combat/RunController';

const silentAudio: AudioService = {
  play(_e: AudioEvent) {},
  setSfxVolume() {},
  setMusicVolume() {},
};

const DT_MS = 50;
const BUCKET_MS = 15_000;
const POST_GRACE_MS = 120_000;
const DIAG_SEEDS = [1, 7, 42, 99, 12345];
const VALIDATE_SEED_COUNT = 100;

const UPGRADE_SCORE: Record<string, number> = {
  evolution: 100,
  damage: 85,
  speed: 80,
  multishot: 78,
  pierce: 60,
  tower: 50,
  utility: 40,
};

function scoreUpgrade(u: UpgradeDef, hpRatio: number): number {
  let s = u.evolution ? 100 : (UPGRADE_SCORE[u.branch] ?? 20);
  if (hpRatio < 0.5 && (u.branch === 'tower' || u.id === 'emergency_repair')) s += 55;
  return s;
}

function pickUpgrade(offer: UpgradeDef[], hpRatio: number): UpgradeDef {
  return [...offer].sort((a, b) => scoreUpgrade(b, hpRatio) - scoreUpgrade(a, hpRatio))[0]!;
}

export interface IntervalLog {
  t0: number;
  t1: number;
  aliveEnd: number;
  spawned: number;
  killed: number;
  enemyHpEnd: number;
  towerDpsIn: number;
  heroDpsOut: number;
  towerHpEnd: number;
  heroLevelEnd: number;
  upgrades: string;
}

export interface SimResult {
  levelId: LevelId;
  seed: number;
  useSkip: boolean;
  phase: string;
  ok: boolean;
  towerHp: number;
  towerMaxHp: number;
  kills: number;
  heroLevel: number;
  elapsedMs: number;
  durationMs: number;
  levelUps: number;
  skips: number;
  ultimates: number;
  bossKillMs: number | null;
  defeatMs: number | null;
  upgrades: UpgradeId[];
  intervals: IntervalLog[];
  note: string;
}

function simulate(levelId: LevelId, seed: number, useSkip: boolean): SimResult {
  const def = getLevelDef(levelId);
  const run = new RunController(silentAudio, seed);
  run.start(levelId, seed);

  let levelUps = 0;
  let skips = 0;
  let ultimates = 0;
  let steps = 0;
  const maxSteps = Math.ceil((def.durationMs + POST_GRACE_MS) / DT_MS) + 1000;

  const seenIds = new Set<number>();
  let spawnedTotal = 0;
  let prevKills = 0;
  let prevTowerHp = run.snapshot().towerHp;
  let prevEnemyHpSum = 0;
  let bucketSpawned = 0;
  let bucketKilled = 0;
  let bucketTowerDamage = 0;
  let bucketHeroDamage = 0;
  let bucketStartMs = 0;
  const intervals: IntervalLog[] = [];
  let bossKillMs: number | null = null;
  let defeatMs: number | null = null;
  const bossId = def.victoryBossId;

  const flushBucket = (endMs: number) => {
    const enemies = run.getEnemies().filter((e) => e.alive);
    const enemyHp = enemies.reduce((s, e) => s + e.hp, 0);
    const snap = run.snapshot();
    const dur = Math.max(0.001, (endMs - bucketStartMs) / 1000);
    intervals.push({
      t0: bucketStartMs,
      t1: endMs,
      aliveEnd: enemies.length,
      spawned: bucketSpawned,
      killed: bucketKilled,
      enemyHpEnd: Math.round(enemyHp),
      towerDpsIn: +(bucketTowerDamage / dur).toFixed(2),
      heroDpsOut: +(bucketHeroDamage / dur).toFixed(2),
      towerHpEnd: Math.ceil(snap.towerHp),
      heroLevelEnd: snap.heroLevel,
      upgrades: snap.ownedUpgrades.join(',') || '-',
    });
    bucketSpawned = 0;
    bucketKilled = 0;
    bucketTowerDamage = 0;
    bucketHeroDamage = 0;
    bucketStartMs = endMs;
  };

  while (steps < maxSteps) {
    steps += 1;
    const phase = run.getPhase();
    if (phase === 'victory' || phase === 'defeat') {
      if (phase === 'defeat') defeatMs = run.snapshot().elapsedMs;
      break;
    }

    if (phase === 'levelup') {
      const snap = run.snapshot();
      const offer = snap.offer;
      if (offer?.length) {
        const ratio = snap.towerMaxHp > 0 ? snap.towerHp / snap.towerMaxHp : 1;
        run.chooseUpgrade(pickUpgrade(offer, ratio).id);
        levelUps += 1;
      } else break;
      continue;
    }
    if (phase === 'paused') {
      run.togglePause();
      continue;
    }

    if (run.tryActivateUltimate()) ultimates += 1;
    if (useSkip && run.snapshot().towerHp / run.snapshot().towerMaxHp > 0.55) {
      if (run.trySkipWait()) skips += 1;
    }

    run.update(DT_MS);

    const snap = run.snapshot();
    const elapsed = snap.elapsedMs;

    for (const e of run.getEnemies()) {
      if (!seenIds.has(e.id)) {
        seenIds.add(e.id);
        spawnedTotal += 1;
        bucketSpawned += 1;
      }
    }

    const killsDelta = snap.killCount - prevKills;
    if (killsDelta > 0) {
      bucketKilled += killsDelta;
      prevKills = snap.killCount;
    }

    const towerDrop = prevTowerHp - snap.towerHp;
    if (towerDrop > 0) bucketTowerDamage += towerDrop;
    prevTowerHp = snap.towerHp;

    let enemyHpAfter = 0;
    for (const e of run.getEnemies()) {
      if (e.alive) enemyHpAfter += e.hp;
    }
    const hpDrop = prevEnemyHpSum - enemyHpAfter;
    if (hpDrop > 0) bucketHeroDamage += hpDrop;
    prevEnemyHpSum = enemyHpAfter;

    if (run.getPhase() === 'victory' && bossKillMs === null) {
      bossKillMs = elapsed;
    }

    while (elapsed >= bucketStartMs + BUCKET_MS) {
      flushBucket(bucketStartMs + BUCKET_MS);
    }

    if (elapsed >= def.durationMs + POST_GRACE_MS && snap.enemyCount === 0) break;
    void spawnedTotal;
    void bossId;
  }

  const finalPhase = run.getPhase();
  const snap = run.snapshot();
  if (finalPhase === 'victory' && bossKillMs === null) bossKillMs = snap.elapsedMs;
  if (finalPhase === 'defeat' && defeatMs === null) defeatMs = snap.elapsedMs;
  if (snap.elapsedMs > bucketStartMs) flushBucket(snap.elapsedMs);

  const result: SimResult = {
    levelId,
    seed,
    useSkip,
    phase: finalPhase,
    ok: finalPhase === 'victory',
    towerHp: Math.ceil(snap.towerHp),
    towerMaxHp: snap.towerMaxHp,
    kills: snap.killCount,
    heroLevel: snap.heroLevel,
    elapsedMs: Math.round(snap.elapsedMs),
    durationMs: def.durationMs,
    levelUps,
    skips,
    ultimates,
    bossKillMs: bossKillMs !== null ? Math.round(bossKillMs) : null,
    defeatMs: defeatMs !== null ? Math.round(defeatMs) : null,
    upgrades: [...snap.ownedUpgrades],
    intervals,
    note:
      finalPhase === 'victory'
        ? 'cleared'
        : finalPhase === 'defeat'
          ? 'tower fell'
          : 'incomplete',
  };
  run.cleanup();
  return result;
}

function pct(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))));
  return sorted[i]!;
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function fmtInterval(i: IntervalLog): string {
  return (
    `    ${fmtMs(i.t0)}-${fmtMs(i.t1)} alive=${i.aliveEnd} spawned=${i.spawned} killed=${i.killed} ` +
    `enemyHP=${i.enemyHpEnd} towerDpsIn=${i.towerDpsIn} heroDps=${i.heroDpsOut} ` +
    `towerHP=${i.towerHpEnd} heroLv=${i.heroLevelEnd} ups=[${i.upgrades}]`
  );
}

function runDiag(lines: string[]): void {
  lines.push('=== CONTROL: Skip Wait OFF vs ON (same seeds) ===');
  lines.push(`Seeds: ${DIAG_SEEDS.join(', ')}`);
  lines.push('');

  for (const levelId of ALL_LEVEL_IDS) {
    lines.push(`--- Level ${levelId}: ${getLevelDef(levelId).name} ---`);
    for (const seed of DIAG_SEEDS) {
      const off = simulate(levelId, seed, false);
      const on = simulate(levelId, seed, true);
      lines.push(
        `  seed=${seed}  NO-SKIP: ${off.ok ? 'PASS' : 'FAIL'} t=${fmtMs(off.elapsedMs)} hp=${off.towerHp} lv=${off.heroLevel} ups=${off.levelUps}`,
      );
      lines.push(
        `           SKIP:    ${on.ok ? 'PASS' : 'FAIL'} t=${fmtMs(on.elapsedMs)} hp=${on.towerHp} lv=${on.heroLevel} ups=${on.levelUps} skips=${on.skips}`,
      );

      // Print early intervals (first 2 min) for the worse / no-skip run
      const focus = off.defeatMs !== null && (off.defeatMs ?? 0) < 120_000 ? off : off;
      lines.push('    [NO-SKIP 15s buckets until end or 2:00]');
      for (const iv of focus.intervals) {
        if (iv.t0 >= 120_000 && focus.ok) break;
        if (iv.t0 >= 180_000) break;
        lines.push(fmtInterval(iv));
      }
      if (on.skips > 0) {
        lines.push('    [SKIP 15s buckets — first 90s]');
        for (const iv of on.intervals) {
          if (iv.t0 >= 90_000) break;
          lines.push(fmtInterval(iv));
        }
      }
      lines.push('');
    }
  }
}

function runValidate(lines: string[], useSkip: boolean, seedCount: number): void {
  const label = useSkip ? 'WITH Skip Wait' : 'WITHOUT Skip Wait';
  lines.push(`=== VALIDATE ${seedCount} seeds (${label}) ===`);
  lines.push('');

  for (const levelId of ALL_LEVEL_IDS) {
    const results: SimResult[] = [];
    const upgradeCounts = new Map<string, number>();
    for (let s = 0; s < seedCount; s++) {
      const r = simulate(levelId, s + 1, useSkip);
      results.push(r);
      for (const u of r.upgrades) {
        upgradeCounts.set(u, (upgradeCounts.get(u) ?? 0) + 1);
      }
    }
    const wins = results.filter((r) => r.ok);
    const losses = results.filter((r) => !r.ok);
    const clearRate = (wins.length / results.length) * 100;
    const winHp = wins.map((r) => r.towerHp).sort((a, b) => a - b);
    const heroLv = wins.map((r) => r.heroLevel);
    const bossT = wins.map((r) => r.bossKillMs ?? r.elapsedMs);
    const defT = losses.map((r) => r.defeatMs ?? r.elapsedMs);
    const earlyDefeats = losses.filter((r) => (r.defeatMs ?? r.elapsedMs) < 120_000).length;

    const topUps = [...upgradeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, n]) => `${id}(${n})`)
      .join(', ');

    lines.push(`Level ${levelId}: ${getLevelDef(levelId).name}`);
    lines.push(`  clear rate: ${clearRate.toFixed(1)}% (${wins.length}/${results.length})`);
    lines.push(
      `  win tower HP: median=${median(winHp)}  p10=${pct(winHp, 10)}  p50=${pct(winHp, 50)}  p90=${pct(winHp, 90)}`,
    );
    lines.push(`  median hero level (wins): ${median(heroLv)}`);
    lines.push(`  median boss kill time (wins): ${wins.length ? fmtMs(median(bossT)) : 'n/a'}`);
    lines.push(
      `  median defeat time (losses): ${losses.length ? fmtMs(median(defT)) : 'n/a'}  early(<2m): ${earlyDefeats}`,
    );
    lines.push(`  top upgrades: ${topUps || '-'}`);
    lines.push('');
  }
}

function writeRootCause(lines: string[]): void {
  lines.push('=== ROOT CAUSE (pre-retune findings) ===');
  lines.push('Telemetry showed collapse is driven by early spawn density, not Skip Wait:');
  lines.push('- Levels 2–5 spawned 10–14 enemies in the first 15s while hero DPS was ~3–5.');
  lines.push('- By 0:45–1:15, dense segments put 20–32 alive on field; tower incoming DPS 8–20.');
  lines.push('- Defeat often at 0:25–1:20 with only 0–3 upgrades — before a build exists.');
  lines.push('- Skip Wait was secondary: NO-SKIP failed similarly; Skip could worsen wave stacking');
  lines.push('  when clearing a soft intro then jumping into a hard segment underleveled.');
  lines.push('Retune: softer first 90s budgets/intervals, delay runners/brutes, slower approaches,');
  lines.push('lower tower chip damage, stronger early Archer baseline, higher tower HP + L1 heal.');
  lines.push('');
}

function main(): void {
  const args = new Set(process.argv.slice(2));
  const doDiag = args.has('--diag') || args.has('--full') || args.size === 0;
  const doValidate = args.has('--validate') || args.has('--full') || args.size === 0;
  const started = Date.now();
  const lines: string[] = [];
  lines.push('NOT GENSHIN — Balance harness report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('Fair bot: DPS-biased upgrade picks, auto Ultimate, no damage assist.');
  lines.push('Primary clear-rate target uses WITHOUT Skip Wait; WITH Skip is a control.');
  lines.push('');
  writeRootCause(lines);

  if (doDiag) {
    runDiag(lines);
  }

  if (doValidate) {
    runValidate(lines, false, VALIDATE_SEED_COUNT);
    runValidate(lines, true, VALIDATE_SEED_COUNT);
  }

  lines.push(`Wall time: ${((Date.now() - started) / 1000).toFixed(2)}s`);
  lines.push('');

  const out = resolve('docs/balance-pass-report.txt');
  writeFileSync(out, lines.join('\n'), 'utf8');
  console.log(lines.join('\n'));
  console.log(`\nWrote ${out}`);
}

main();
