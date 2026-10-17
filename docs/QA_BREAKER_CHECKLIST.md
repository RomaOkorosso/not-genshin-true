# QA — Breaker Checklist

External testing starts after the Levels 1–5 vertical slice, but architecture should be resistant to these cases from the beginning.

The designated "breaker" tester should be encouraged to play incorrectly and try to abuse the build.

## State / UI abuse

Try:
- spam-clicking upgrade cards;
- pausing exactly as level-up opens;
- pausing while boss spawns;
- repeated restart from pause/menu;
- refresh during victory/defeat/reward screen;
- open/close Almanac rapidly;
- resize browser while combat is active;
- switch tab and return after throttling;
- rotate phone orientation repeatedly;
- multi-touch on conflicting buttons.

Expected: no duplicate reward, duplicate upgrade, duplicated loop or deadlocked pause state.

## Save abuse

Try:
- malformed localStorage;
- missing fields;
- old version save;
- absurdly large numeric values;
- negative values;
- deleting save during runtime;
- reload during save.

Expected: validate/migrate/fallback safely; runtime should not crash.

Client-side Browser build values are not secure against DevTools and are not treated as authoritative anti-cheat storage.

## Combat abuse

Try:
- extreme attack speed;
- extreme projectile count;
- enemies dying during spawn animation;
- boss dying while summoning;
- all enemies dying at once;
- tower reaching zero on the same frame as boss death;
- projectile target dying before impact;
- repeated ricochet/piercing chains once implemented;
- maximum Super Node combinations once Endless exists.

Expected: deterministic resolution rules, no recursion storms and no unbounded allocations.

## Performance

Run multiple full games without page reload and check:
- memory stabilizes after restart;
- enemy/projectile pools do not grow forever;
- timers/listeners do not duplicate;
- audio voices are capped;
- background-tab resume does not simulate an absurd accumulated delta in one frame.

## GitHub test build

The GitHub Pages build is allowed to be cheat-able through DevTools. The goal there is runtime robustness and gameplay QA, not anti-cheat security.

Future leaderboard submissions must be treated as a separate integrity concern in the Yandex production adapter.
