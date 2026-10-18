/**
 * Headless Archer clear sim for Levels 1–5 + unit-test gate.
 * Run: npx vite-node scripts/simulate-level-clear.ts
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AudioEvent, AudioService } from '../src/platform/types';
import { ALL_LEVEL_IDS, getLevelDef, type LevelId } from '../src/game/content/levels';
import type { UpgradeDef } from '../src/game/balance/upgrades';
import { RunController } from '../src/systems/combat/RunController';

const silentAudio: AudioService = {
  play(_event: AudioEvent) {},
  setSfxVolume() {},
  setMusicVolume() {},
};

const SEEDS = [1, 7, 42, 99, 12345];
const DT_MS = 50;
const POST_DURATION_GRACE_MS = 120_000;

const UPGRADE_SCORE: Record<string, number> = {
  evolution: 100,
  damage: 85,
  speed: 80,
  multishot: 78,
  pierce: 60,
  tower: 45,
  utility: 40,
};

function scoreUpgrade(u: UpgradeDef, towerHpRatio: number): number {
  let s = u.evolution ? 100 : (UPGRADE_SCORE[u.branch] ?? 20);
  if (towerHpRatio < 0.45 && (u.branch === 'tower' || u.id === 'emergency_repair')) s += 50;
  if (towerHpRatio < 0.3 && u.branch === 'speed') s += 10;
  return s;
}

function pickUpgrade(offer: UpgradeDef[], towerHpRatio: number): UpgradeDef {
  return [...offer].sort((a, b) => scoreUpgrade(b, towerHpRatio) - scoreUpgrade(a, towerHpRatio))[0]!;
}

interface RunResult {
  levelId: LevelId;
  seed: number;
  mode: string;
  phase: string;
  towerHp: number;
  kills: number;
  heroLevel: number;
  elapsedMs: number;
  durationMs: number;
  levelUps: number;
  skips: number;
  ultimates: number;
  ok: boolean;
  note: string;
}

interface SimOptions {
  mode: string;
  useSkip: boolean;
  /** Multiply outgoing damage via repeated debug hits each frame (sanity). */
  assistDamagePerTick?: number;
}

function simulate(levelId: LevelId, seed: number, opts: SimOptions): RunResult {
  const def = getLevelDef(levelId);
  const run = new RunController(silentAudio, seed);
  run.start(levelId, seed);

  let levelUps = 0;
  let skips = 0;
  let ultimates = 0;
  let steps = 0;
  const maxSteps = Math.ceil((def.durationMs + POST_DURATION_GRACE_MS) / DT_MS) + 800;

  while (steps < maxSteps) {
    steps += 1;
    const phase = run.getPhase();

    if (phase === 'victory' || phase === 'defeat') break;

    if (phase === 'levelup') {
      const snap = run.snapshot();
      const offer = snap.offer;
      if (offer && offer.length > 0) {
        const ratio = snap.towerMaxHp > 0 ? snap.towerHp / snap.towerMaxHp : 1;
        run.chooseUpgrade(pickUpgrade(offer, ratio).id);
        levelUps += 1;
      } else {
        break;
      }
      continue;
    }

    if (phase === 'paused') {
      run.togglePause();
      continue;
    }

    if (run.tryActivateUltimate()) ultimates += 1;

    const snapBefore = run.snapshot();
    if (opts.useSkip && snapBefore.towerHp / snapBefore.towerMaxHp > 0.55) {
      if (run.trySkipWait()) skips += 1;
    }

    if (opts.assistDamagePerTick && opts.assistDamagePerTick > 0) {
      for (const e of run.getEnemies()) {
        if (e.alive) run.debugDamageEnemy(e, opts.assistDamagePerTick);
      }
      if (run.getPhase() === 'levelup') continue;
      if (run.getPhase() === 'victory' || run.getPhase() === 'defeat') break;
    }

    run.update(DT_MS);

    const snap = run.snapshot();
    if (
      snap.elapsedMs >= def.durationMs + POST_DURATION_GRACE_MS &&
      snap.enemyCount === 0 &&
      run.getPhase() === 'combat'
    ) {
      break;
    }
  }

  const snap = run.snapshot();
  const phase = run.getPhase();
  run.cleanup();

  let note = '';
  if (phase === 'victory') note = 'cleared';
  else if (phase === 'defeat') note = 'tower fell';
  else if (snap.elapsedMs >= def.durationMs)
    note = 'time ended without victory (boss alive or unfinished)';
  else note = 'sim stopped early / stuck';

  return {
    levelId,
    seed,
    mode: opts.mode,
    phase,
    towerHp: Math.ceil(snap.towerHp),
    kills: snap.killCount,
    heroLevel: snap.heroLevel,
    elapsedMs: Math.round(snap.elapsedMs),
    durationMs: def.durationMs,
    levelUps,
    skips,
    ultimates,
    ok: phase === 'victory',
    note,
  };
}

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function runUnitTests(): { ok: boolean; output: string } {
  try {
    const output = execSync('npm test', {
      encoding: 'utf8',
      cwd: resolve('.'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      output: `${e.stdout ?? ''}${e.stderr ?? ''}${e.message ?? ''}`,
    };
  }
}

function summarize(label: string, results: RunResult[], push: (s?: string) => void): void {
  push(`=== ${label} ===`);
  for (const levelId of ALL_LEVEL_IDS) {
    push(`Level ${levelId}: ${getLevelDef(levelId).name}`);
    const levelResults = results.filter((r) => r.levelId === levelId);
    for (const r of levelResults) {
      const mark = r.ok ? 'PASS' : 'FAIL';
      push(
        `  [${mark}] seed=${r.seed} phase=${r.phase} hp=${r.towerHp} kills=${r.kills} ` +
          `heroLv=${r.heroLevel} t=${fmtMs(r.elapsedMs)}/${fmtMs(r.durationMs)} ` +
          `ups=${r.levelUps} skip=${r.skips} ult=${r.ultimates} — ${r.note}`,
      );
    }
    const wins = levelResults.filter((r) => r.ok).length;
    push(`  Summary: ${wins}/${levelResults.length} seeds cleared`);
    push('');
  }
}

function main(): void {
  const started = Date.now();
  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push('NOT GENSHIN — Tests & level clearability report');
  push(`Generated: ${new Date().toISOString()}`);
  push('');

  push('=== 1) Unit tests (vitest) ===');
  const tests = runUnitTests();
  const testSummary = tests.output
    .split('\n')
    .filter((l) => /Test Files|Tests |FAIL|PASS|✓|×/.test(l) || /failed|passed/.test(l))
    .slice(-20);
  for (const l of testSummary) push(l);
  push(`Unit tests: ${tests.ok ? 'PASS' : 'FAIL'}`);
  push('');

  push('=== 2) Headless clear sims ===');
  push('Bot: Archer RunController, upgrade pick by DPS score (tower bias when low HP),');
  push('     auto Ultimate; Skip Wait only if tower HP > 55%.');
  push(`Seeds: ${SEEDS.join(', ')}, dt=${DT_MS}ms`);
  push('');

  const fair: RunResult[] = [];
  for (const levelId of ALL_LEVEL_IDS) {
    for (const seed of SEEDS) {
      fair.push(simulate(levelId, seed, { mode: 'fair-bot', useSkip: true }));
    }
  }
  summarize('Fair bot (no damage assist)', fair, push);

  // Sanity: prove the win condition path works if DPS is high enough.
  const assist: RunResult[] = [];
  for (const levelId of ALL_LEVEL_IDS) {
    for (const seed of SEEDS.slice(0, 2)) {
      assist.push(
        simulate(levelId, seed, {
          mode: 'assist-20dmg',
          useSkip: true,
          assistDamagePerTick: 20,
        }),
      );
    }
  }
  summarize('Sanity bot (+20 flat damage to every alive enemy each tick)', assist, push);

  const fairByLevel = ALL_LEVEL_IDS.map((id) => {
    const rs = fair.filter((r) => r.levelId === id);
    return { id, wins: rs.filter((r) => r.ok).length, n: rs.length };
  });
  const assistByLevel = ALL_LEVEL_IDS.map((id) => {
    const rs = assist.filter((r) => r.levelId === id);
    return { id, wins: rs.filter((r) => r.ok).length, n: rs.length };
  });

  push('=== 3) Verdict ===');
  push(`Unit tests: ${tests.ok ? 'PASS (41 expected)' : 'FAIL'}`);
  push('');
  push('Fair bot clearability:');
  for (const row of fairByLevel) {
    push(
      `  Level ${row.id}: ${row.wins}/${row.n} — ${
        row.wins === row.n ? 'YES' : row.wins > 0 ? 'PARTIAL' : 'NO under this bot policy'
      }`,
    );
  }
  push('');
  push('Victory-path sanity (damage assist):');
  for (const row of assistByLevel) {
    push(
      `  Level ${row.id}: ${row.wins}/${row.n} — ${
        row.wins > 0 ? 'win condition reachable' : 'still blocked (spawn/boss/script bug likely)'
      }`,
    );
  }
  push('');

  const fairAny = fairByLevel.every((r) => r.wins > 0);
  const assistAll = assistByLevel.every((r) => r.wins > 0);
  if (fairAny) {
    push('Conclusion: Levels 1–5 are clearable by the fair bot on at least one seed each.');
  } else if (assistAll) {
    push(
      'Conclusion: Fair bot could not clear these seeds, but assisted runs prove victory',
    );
    push(
      'conditions work. Levels are likely hard / bot-suboptimal — manual play may still clear;',
    );
    push('treat fair-bot NO as a balance/skill-floor signal, not a hard lock.');
  } else {
    push(
      'Conclusion: Even damage-assisted sims failed some levels — investigate waves/boss scripting.',
    );
  }
  push(`Wall time: ${((Date.now() - started) / 1000).toFixed(2)}s`);
  push('');

  const outPath = resolve('docs/level-clear-report.txt');
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(lines.join('\n'));
  console.log(`\nWrote ${outPath}`);
}

main();
