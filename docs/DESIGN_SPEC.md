# Design Specification

## 1. Core fantasy

The player controls a collected hero indirectly while defending a fixed central tower/position. The hero stands on top of the tower and attacks automatically in 360 degrees. Enemies enter from any direction outside the visible screen and converge toward the center.

The game combines:
- survivor-style automatic combat;
- tower-defense pressure;
- 1-of-3 upgrade choices;
- hero collecting;
- a light living-base meta layer.

## 2. Core run

Normal run target: 8–12 minutes.

Flow:

```text
choose hero
→ fight
→ gain XP
→ choose upgrades
→ elites
→ Evolution
→ boss
→ victory/defeat
→ rewards
→ progression/base
```

A run contains one hero only.

## 3. Campaign onboarding

Levels 1–20 are onboarding disguised as a campaign.

One level introduces at most one major new concept.

| Level | Purpose | New concept/system |
|---:|---|---|
| 1 | Learn basic battle | autoattack, XP, 3-choice upgrades, tower HP |
| 2 | Learn tempo | fast enemies |
| 3 | Learn build direction | projectile upgrades |
| 4 | Learn Evolution | first Evolution |
| 5 | First serious test | boss |
| 6 | Status introduction | status effects |
| 7 | Retention introduction | Daily |
| 8 | Environmental play | first environmental mechanic |
| 9 | Defense types | Armor/Shield |
| 10 | Collection | first guaranteed-new summon, Hero Collection/Gacha |
| 11 | New combat model | Warrior |
| 12 | Warrior identity | Thorns/Retaliation |
| 13 | Passive progression | Expeditions |
| 14 | New pressure type | ranged enemies |
| 15 | Mixed build check | boss + adds + ranged |
| 16 | New combat model | Mage |
| 17 | Element interactions | reactions |
| 18 | Living hub | Tavern/Base Lite |
| 19 | Social meta | Relationships |
| 20 | Graduation | combined mechanics, Endless unlock |

Rogue can arrive around Levels 22–25.

## 4. Classes

### Archer
Baseline/reference class.

Identity:
- projectiles;
- multishot;
- piercing;
- ricochet;
- crit;
- attack speed.

### Warrior
Close-defense class.

Identity:
- Thorns;
- Barrier;
- retaliation;
- cleave;
- fortification;
- protecting the tower through proximity and counter-damage.

### Mage
Combination/AoE class.

Identity:
- Fire;
- Frost;
- Arcane;
- status effects;
- elemental reactions;
- chain effects.

### Rogue
Glass-cannon rapid-hit class.

Identity:
- very high attack speed;
- crit scaling;
- Bleed;
- Poison;
- Execute;
- limited Evasion.

No priority-target micro system.

## 5. Class balance rule

All classes must have viable answers to:
- swarms;
- high-HP enemies;
- bosses;
- tower pressure;
- ranged pressure;
- shields/armor;
- status-heavy situations.

Different classes solve these differently.

Avoid campaign stages that effectively require one class.

## 6. Upgrade philosophy

Level-up offers 3 cards.

Player should almost always have a useful continuation path.

Normal campaign should usually allow:
- one highly developed branch;
- part of a second branch;
- roughly one Evolution.

Evolution is a meaningful mechanical upgrade, not a +5% stat node.

An Evolution does not close the underlying branch.

## 7. Endless

Endless is pseudo-infinite rather than a seasonal content treadmill.

Approximate pacing:
- 0–10 min: build start;
- 10–20: advanced build;
- 20–30: multiple developed branches;
- 30–40: late form;
- 40+: Overrun.

After around 40 minutes:
- reward amount stops increasing;
- record/time/wave continues increasing;
- enemy pressure continues scaling sharply.

Reason: Endless should be a record mode, not infinite resource farming.

### Endless upgrade offer logic

If started branches remain unfinished:
- slot 1: 100% continuation from started branch;
- slot 2: high probability of continuation, lower probability utility/new branch;
- slot 3: wildcard.

New branches always remain possible.

### Super Nodes

Super Nodes appear at intersections of developed branches.

Rules:
- major mechanical changes;
- visually distinct from normal cards and Evolutions;
- max about 4 per run;
- exceptional Apex nodes may consume 2 Super Node slots.

## 8. Archer tree

### Multishot

```text
Multishot I
→ Multishot II
→ Tight Spread
→ Volley
→ Arrow Storm (Evolution)
```

### Piercing/Ricochet

```text
Piercing I
→ Piercing II
→ Ricochet I
→ Ricochet II
→ Phantom Barrage (Evolution)
```

### Crit/Speed

```text
Quick Draw
→ Quick Draw II
→ Critical Eye
→ Deadly Precision
→ Deadeye Frenzy (Evolution)
```

### Super Nodes

```text
Arrow Storm + Phantom Barrage
→ Shrapnel Storm

Arrow Storm + Deadeye Frenzy
→ Hurricane

Phantom Barrage + Deadeye Frenzy
→ Hunter's Rhythm

all three + >=2 Super Nodes
→ Celestial Barrage (Apex, costs 2 slots)
```

## 9. Warrior concept tree

```text
Thorns
→ Reinforced Thorns
→ Spiked Armor
→ Retaliation
→ Iron Maiden

Barrier
→ Capacity
→ Regeneration
→ Explosive Barrier
→ Retribution Armor

Wide Swing
→ Heavy Swing
→ Shockwave
→ Fortify
→ Fortress Breaker
```

Intersections:

```text
Thorns + Barrier → Retribution Core
Barrier + Cleave → Shieldquake
Thorns + Cleave → Punishment
all three → Immortal Bastion
```

Immortal Bastion is a strong low-tower-HP state, not literal immortality.

## 10. Mage concept tree

```text
Fireball → Burn → Ignite → Burn Spread → Inferno
Frost Bolt → Slow → Freeze → Shatter → Blizzard
Arcane Bolt → Chain → Extra Chain → Arcane Surge → Arcane Nova
```

Reactions:

```text
Fire + Frost → Thermal Shock
Fire + Arcane → Arcane Combustion
Frost + Arcane → Crystal Resonance
all three → Elemental Cataclysm
```

## 11. Rogue concept tree

```text
Crit Chance → Crit Damage → Frenzy → Frenzy Stacks → Blood Rush
Bleed → Bleed Stacks → Deep Wounds → Hemorrhage → Crimson Storm
Poison → Poison Stacks → Toxic Burst → Poison Spread → Venom Engine
```

Small utility branch:

```text
Evasion → Counter → Phantom Step
```

Intersections:

```text
Crit + Bleed → Open Wound
Crit + Poison → Toxic Frenzy
Bleed + Poison → Septic Wound
Crit + Evasion → Phantom Killer
```

## 12. Codex / Almanac

The Almanac is a major UX feature, not a tiny help icon.

Use a visually obvious large book/tome button.

Accessible from:
- main menu;
- pause;
- level-up screen;
- hero menu;
- base.

It should contain detailed internal-Wiki-style information for:
- Heroes;
- Classes;
- Skills;
- Upgrades;
- Evolutions;
- Super Nodes;
- Enemies;
- Bosses;
- Statuses;
- Locations;
- Items/Relics;
- Buildings;
- Game mechanics.

Descriptions should explain both plain-language behavior and exact numbers.

When a currently available Evolution/synergy exists, the book should visibly pulse/highlight and open directly to the relevant page.

Players should not need an external Wiki to understand the game.

## 13. Base and social meta

Future hub examples:
- Tavern;
- Training Grounds;
- Expedition Guild;
- Workshop;
- Library;
- Hero Quarters;
- Hot Springs.

Heroes should visibly live in the base: resting, training, talking, moving between activities.

Keep the Tamagotchi feeling light. Do not require constant resource clicking or frequent chores.

Relationships may unlock passive hero synergies, but partner heroes do not physically join the run.

## 14. Gacha/meta

Keep currencies understandable:
- Gold;
- Gems;
- Hero Tickets;
- Hero Shards;
- Universal Essence.

Duplicate hero -> Hero Shards.
Duplicate of maxed hero -> Universal Essence.

Need pity system.

First tutorial summon should guarantee a new hero.

Gacha accelerates collection/progression but must not be a campaign paywall.

## 15. Monetization

Potential placements:
- reward x2 after run;
- extra reroll;
- one revive;
- expedition acceleration;
- daily reward chest;
- premium currency;
- cosmetics.

Do not interrupt active combat repeatedly with ads.
