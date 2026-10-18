import type { LocaleCatalog } from './types';

export const EN: LocaleCatalog = {
  // Menu
  'ui.brand': 'NOT GENSHIN',
  'ui.menuSubtitle': 'Levels 1–5 · Vertical Slice',
  'ui.playCampaign': 'PLAY CAMPAIGN',
  'ui.menuHint':
    'In-run: gold book button or Pause → Almanac\nArcher auto-attacks · Evolutions from Level 4',
  'ui.unlockedThrough': 'Unlocked through Level {level} · Clears {clears}',
  'ui.language': 'Language',
  'ui.lang.auto': 'AUTO',
  'ui.lang.en': 'EN',
  'ui.lang.ru': 'RU',

  // Level select
  'ui.campaign': 'CAMPAIGN',
  'ui.campaignHint': 'Clear a level to unlock the next',
  'ui.back': 'BACK',
  'ui.locked': 'LOCKED',

  // Combat HUD
  'ui.towerHp': 'Tower {hp} / {max}',
  'ui.levelHud': 'L{levelId} · Lv {heroLevel}',
  'ui.kills': 'Kills {count}',
  'ui.pause': 'PAUSE',
  'ui.ultimate': 'ULTIMATE',
  'ui.ultimateCd': '{sec}s',
  'ui.skipWait': 'SKIP WAIT',

  // Pause / Almanac
  'ui.paused': 'PAUSED',
  'ui.resume': 'RESUME',
  'ui.restart': 'RESTART',
  'ui.levelSelect': 'LEVEL SELECT',
  'ui.almanac': 'ALMANAC',
  'ui.closeBook': 'CLOSE BOOK',
  'ui.requires': 'Requires: {list}',

  // Level-up / end
  'ui.levelUp': 'LEVEL UP — Choose 1',
  'ui.evolutionTag': '{name} (Evolution)',
  'ui.victory': 'VICTORY',
  'ui.defeat': 'DEFEAT',
  'ui.victoryDetail': '{level}\nTower HP: {hp} · Time: {time}',
  'ui.defeatDetail': '{level}\nThe tower fell at {time}',
  'ui.nextLevel': 'NEXT LEVEL',
  'ui.playAgain': 'PLAY AGAIN',

  // Codex sections
  'codex.section.mechanics': 'Mechanics',
  'codex.section.archer': 'Hero',
  'codex.section.upgrades': 'Upgrades',
  'codex.section.enemies': 'Enemies',

  'codex.mech_tower.title': 'Tower Defense',
  'codex.mech_tower.body':
    'The Archer stands on the central tower and never moves. Enemies approach from every direction. Keep Tower HP above zero.',
  'codex.mech_combat.title': 'Auto Combat',
  'codex.mech_combat.body':
    'Attacks fire automatically at the nearest enemy in range. Your choices are upgrades, pause, and the Almanac.',
  'codex.mech_xp.title': 'XP & Level-Up',
  'codex.mech_xp.body':
    'Kills grant XP instantly. On level-up the run pauses and you pick 1 of 3 cards.',
  'codex.mech_evo.title': 'Evolutions',
  'codex.mech_evo.body':
    'Finish a branch (Volley, Ricochet II, or Deadly Precision) to unlock an Evolution — a major mechanical upgrade, not a small stat bump. Available from Level 4+.',
  'codex.mech_ultimate.title': 'Ultimate',
  'codex.mech_ultimate.body':
    'Tap ULTIMATE for a focused arrow barrage toward the nearest enemy (or a full circle if none). Auto-combat continues; cooldown is about 25 seconds.',
  'codex.archer.title': 'Archer',
  'codex.archer.body':
    'Baseline class: projectiles, multishot, piercing, ricochet, crit, attack speed. Damage 10 · 1.0 APS · 5% crit · x1.5 crit mult.',
  'codex.enemyStats': 'HP {hp} · Tower dmg {dmg} · XP {xp} · Speed {speed}',
  'codex.bossTag': ' · BOSS',
  'codex.eliteTag': ' · ELITE',

  // Levels
  'level.1.name': 'Level 1 — First Defense',
  'level.1.blurb': 'Learn auto-attack, XP, and upgrades. Defend the tower.',
  'level.2.name': 'Level 2 — Swift Horde',
  'level.2.blurb': 'Runners arrive. Keep tempo — leaks hurt.',
  'level.3.name': 'Level 3 — Arrow Craft',
  'level.3.blurb': 'Mixed pressure. Push projectile branches harder.',
  'level.4.name': 'Level 4 — Evolution',
  'level.4.blurb': 'Brutes join. Complete a branch for your first Evolution.',
  'level.5.name': 'Level 5 — Stone Heart',
  'level.5.blurb': 'Face the Stone Golem. Surviving its phases is the test.',

  // Enemies
  'enemy.grunt.name': 'Grunt',
  'enemy.elite_grunt.name': 'Elite Grunt',
  'enemy.raider_captain.name': 'Raider Captain',
  'enemy.runner.name': 'Runner',
  'enemy.elite_runner.name': 'Elite Runner',
  'enemy.brute.name': 'Brute',
  'enemy.elite_brute.name': 'Elite Brute',
  'enemy.stone_golem.name': 'Stone Golem',

  // Upgrades
  'upgrade.multishot_i.name': 'Multishot I',
  'upgrade.multishot_i.description': '+1 projectile. Each arrow deals 90% damage.',
  'upgrade.multishot_ii.name': 'Multishot II',
  'upgrade.multishot_ii.description': '+1 projectile. Each arrow deals 80% damage.',
  'upgrade.tight_spread.name': 'Tight Spread',
  'upgrade.tight_spread.description': '-30% spread. +5% projectile damage.',
  'upgrade.volley.name': 'Volley',
  'upgrade.volley.description': 'Every 6th attack: +3 arrows at 70% damage.',
  'upgrade.arrow_storm.name': 'Arrow Storm',
  'upgrade.arrow_storm.description': 'Evolution: every 5s fire an 8-arrow fan (65% dmg each).',
  'upgrade.quick_draw.name': 'Quick Draw',
  'upgrade.quick_draw.description': '+15% attack speed.',
  'upgrade.quick_draw_ii.name': 'Quick Draw II',
  'upgrade.quick_draw_ii.description': '+15% attack speed.',
  'upgrade.critical_eye.name': 'Critical Eye',
  'upgrade.critical_eye.description': '+10% crit chance.',
  'upgrade.deadly_precision.name': 'Deadly Precision',
  'upgrade.deadly_precision.description': 'Crit multiplier x1.5 → x1.75.',
  'upgrade.deadeye_frenzy.name': 'Deadeye Frenzy',
  'upgrade.deadeye_frenzy.description': 'Evolution: on crit +4% AS for 3s, max 5 stacks.',
  'upgrade.sharpened_arrows_i.name': 'Sharpened Arrows',
  'upgrade.sharpened_arrows_i.description': '+12% damage.',
  'upgrade.sharpened_arrows_ii.name': 'Sharpened Arrows II',
  'upgrade.sharpened_arrows_ii.description': '+12% damage.',
  'upgrade.sharpened_arrows_iii.name': 'Sharpened Arrows III',
  'upgrade.sharpened_arrows_iii.description': '+12% damage.',
  'upgrade.piercing_i.name': 'Piercing I',
  'upgrade.piercing_i.description': 'Pierce 1 extra target. -15% damage after pierce.',
  'upgrade.piercing_ii.name': 'Piercing II',
  'upgrade.piercing_ii.description': '+1 pierce. Falloff -12% per extra target.',
  'upgrade.ricochet_i.name': 'Ricochet I',
  'upgrade.ricochet_i.description': '1 ricochet at 70% damage.',
  'upgrade.ricochet_ii.name': 'Ricochet II',
  'upgrade.ricochet_ii.description': '+1 ricochet. Second bounce 55% damage.',
  'upgrade.phantom_barrage.name': 'Phantom Barrage',
  'upgrade.phantom_barrage.description':
    'Evolution: pierce+ricochet coexist. +15% proj speed, +10% dmg.',
  'upgrade.reinforced_tower.name': 'Reinforced Tower',
  'upgrade.reinforced_tower.description': '+15% max tower HP (heals the bonus).',
  'upgrade.emergency_repair.name': 'Emergency Repair',
  'upgrade.emergency_repair.description': 'Restore 20% tower HP.',
};
