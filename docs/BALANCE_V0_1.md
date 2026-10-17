# Balance v0.1

All values are initial test values, not final production balance.

## Archer baseline

```text
Damage: 10
Attack speed: 1.0 / sec
Crit chance: 5%
Crit multiplier: x1.5
Projectile count: 1
```

## Archer upgrades

### Multishot

**Multishot I**
- +1 projectile
- each arrow: 90% base projectile damage

**Multishot II**
- +1 projectile
- each arrow: 80% base projectile damage

**Tight Spread**
- -30% spread
- +5% projectile damage

**Volley**
- every 6th attack: +3 arrows
- bonus arrows: 70% normal damage

**Arrow Storm — Evolution**
- every 5 sec
- 8-arrow fan
- each arrow: 65% current projectile damage

### Piercing / Ricochet

**Piercing I**
- penetrates 1 additional target
- subsequent target: -15% damage

**Piercing II**
- +1 additional penetration
- penalty becomes -12% per extra target

**Ricochet I**
- 1 ricochet
- 70% damage

**Ricochet II**
- +1 ricochet
- second ricochet: 55% damage

**Phantom Barrage — Evolution**
- piercing + ricochet can coexist
- +15% projectile speed
- +10% projectile damage
- same projectile must not hit same target twice

### Crit / Speed

**Quick Draw**
- +15% attack speed

**Quick Draw II**
- +15% attack speed

**Critical Eye**
- +10 percentage points crit chance

**Deadly Precision**
- crit multiplier x1.5 -> x1.75

**Deadeye Frenzy — Evolution**
- on crit: +4% attack speed
- 3 sec duration
- max 5 stacks
- new crit refreshes duration

### Universal Archer cards

**Sharpened Arrows**
- +12% damage
- max 3

**Lightweight Bow**
- +8% attack speed
- max 3

**Eagle Eye**
- +5 percentage points crit
- max 2

**Heavy Arrow**
- +20% damage
- -8% attack speed

**Reinforced Tower**
- +15% max tower HP

**Emergency Repair**
- restore 20% tower HP
- one-time per appearance/run

**Experience Gain**
- +10% XP
- max 2

**Reroll**
- +1 reroll

## Endless Archer extensions

### Arrow Storm path
- Relentless Volley: interval 5s -> 4s
- Endless Quiver: +3 Arrow Storm arrows
- Rain of Arrows: each Arrow Storm arrow has 20% chance to spawn a small extra arrow at a nearby target

### Phantom path
- Spectral Arrow: piercing penalty -12% -> -7%
- Chain Flight: +1 ricochet
- Infinite Trajectory: each new unique enemy hit by one projectile gives +5% damage to that projectile, max +25%

### Deadeye path
- Perfect Tempo: Frenzy max stacks 5 -> 7
- Critical Momentum: every third consecutive crit gives temporary +10% crit damage
- Machine Bow: while at max Frenzy stacks, +1 projectile

## Archer Super Nodes

### Shrapnel Storm
Requirements: Arrow Storm + Phantom Barrage
- Arrow Storm gains piercing
- 1 ricochet
- after last hit, projectile splits into 2 fragments
- fragment damage = 35%

### Hurricane
Requirements: Arrow Storm + Deadeye Frenzy
- each Frenzy stack adds +1 projectile to next Arrow Storm

### Hunter's Rhythm
Requirements: Phantom Barrage + Deadeye Frenzy
- every piercing/ricochet hit gives +1% crit chance to next basic attack
- max +20%
- resets after basic attack

### Celestial Barrage
Requirements:
- all three primary branches
- at least 2 normal Super Nodes
- costs 2 Super Node slots

Effect:
- every ~15 sec
- 24 arrows
- each = 50% damage
- can pierce and crit
- must not recursively trigger itself or infinite proc chains

## Level 1 target

Duration: ~8 min.

Tower:
```text
HP = 100
```

### Grunt
```text
HP = 20
Tower damage = 4
XP = 1
```

### Elite Grunt
```text
HP = 120
Tower damage = 10
XP = 7
```

### Raider Captain
```text
HP = 500
Tower damage = 15
Attack interval ~2.5 sec
Movement speed = ~70% of Grunt
At 60% HP: summon 4 Grunts once
```

Level 1 must be very hard to fail.

Hidden safety mechanic allowed only for Level 1:
- when tower first falls below ~20 HP, trigger one Emergency Barrier/Repair.

Remove this safety net from Level 2 onward.

## Level 1 phase plan

16 x ~30-second segments.

```text
0:00–0:30   very low pressure
0:30–1:00   first level-up
1:00–2:30   gradual density increase
~2:30       first Elite
3:00–5:00   grouped enemies
5:00–7:00   denser pressure
~7:20       breathing window
7:30–8:00   final wave + Raider Captain
```

First level-up is intentionally scripted to offer:
- Multishot I
- Quick Draw
- Sharpened Arrows

Target Level 1 metrics:
- completion rate: 90–97%+ for new players;
- tower HP after victory: usually 75–95;
- roughly 9–11 upgrades;
- 0–5 enemy leaks to tower;
- boss kill time roughly 15–30 sec.

## Future initial enemy concepts

### Runner
```text
HP ~12
move speed ~+70% vs Grunt
Tower damage ~3
XP ~1
```

### Brute
```text
HP ~60
move speed ~-25%
Tower damage ~8
XP ~3
```

### Stone Golem first serious boss
Initial concept:
```text
HP ~3000–3500
very slow
Tower damage ~25
attack every ~2.5–3 sec
```

Abilities:
- periodically summon Grunts/Runners;
- around 50% HP: Stone Skin / shield;
- around 20% HP: Final Push movement speed increase.
