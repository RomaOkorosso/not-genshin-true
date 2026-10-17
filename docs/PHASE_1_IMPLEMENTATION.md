# Phase 1 — First Playable Implementation

## Goal

Produce one complete, locally playable Level 1 that proves the combat loop and project architecture. This is an internal build, not yet the external tester build.

## Scene

- Fixed slight top-down/isometric-looking arena.
- Tower centered on screen.
- Archer stands on top of the tower and never moves.
- Enemies may spawn from any angle outside the visible play area.
- Their target is the tower, not a lane.
- Camera does not need to move in MVP.

## Core systems

### Targeting

Archer automatically targets an enemy in range. Default strategy for Level 1: nearest enemy to the tower, with deterministic tie-breaking. Keep targeting strategy swappable for future classes/upgrades.

### Projectile

A shot creates a projectile moving toward its target direction. Projectiles and enemies should be pooled. Projectile data must be compatible with future multishot, piercing, ricochet and crit modifiers.

### Tower

- HP: 100.
- Enemies reaching tower enter attack state.
- A tower attack must have a readable short wind-up rather than instant contact damage.
- On Level 1 only, one hidden emergency safety proc may trigger the first time tower HP drops below ~20.

### XP / Level Up

Enemies award XP on death. XP should be credited automatically; do not require player movement to collect drops in Level 1. A visual XP orb/stream effect may still fly toward the hero/UI.

On level-up:
- pause world simulation;
- show exactly 3 upgrade cards;
- show large Almanac/book access;
- choose one;
- apply it;
- resume combat.

First level-up is scripted to offer:
- Multishot I;
- Quick Draw;
- Sharpened Arrows.

Later choices use weighted RNG from the Level 1 pool.

## Level 1 upgrade pool

Allowed:
- Multishot I
- Multishot II
- Tight Spread
- Quick Draw
- Quick Draw II
- Sharpened Arrows I–III
- Critical Eye
- Piercing I
- Reinforced Tower
- Emergency Repair

Do not allow Evolutions on Level 1.

## Level structure

Duration target: ~8 minutes.

Approximate beats:
- 0:00–0:30: very easy Grunts.
- ~0:30: first level-up.
- 0:30–2:30: gradual density increase.
- ~2:30: first Elite Grunt.
- ~2:55–3:03: breathing window.
- 3:00–5:00: grouped Grunts.
- 5:00–7:00: noticeably denser pressure.
- ~6:30: second Elite.
- ~7:20–7:27: breathing window.
- 7:30–8:00: final pressure + Raider Captain.

## Enemy baseline

### Grunt
- HP: 20
- tower damage: 4
- XP: 1
- slow/basic melee

### Elite Grunt
- HP: 120
- tower damage: 10
- XP: 7
- visually larger / aura variant

### Raider Captain
- HP: 500
- tower damage: 15
- move speed ~70% of Grunt
- at ~60% HP summons 4 Grunts once
- no other mechanics

## Spawn architecture

Data-driven segments, not hand-authored individual spawn timestamps.

Support at least:
- duration
- spawnBudget
- spawnInterval
- enemyWeights
- groupSize
- eliteCount / explicit event hooks

`spawnCost` belongs to enemy data.

## Completion target

Level 1 should be difficult for a completely new player to lose.

Expected metrics after tuning:
- completion: 90–97%+ for new players;
- tower HP on win: typically 75–95;
- 9–11 upgrades;
- boss kill: roughly 15–30 sec;
- no persistent memory growth across repeated runs.

## Definition of Done

- Desktop mouse controls work.
- Touch works at common mobile sizes.
- No selectable game text / browser context-menu accidents over core play surface where avoidable.
- Restarting a run fully clears entities, timers, listeners and state.
- `npm test`, lint and build pass.
- Browser save survives reload.
- GitHub Pages build loads from repository subpath.
