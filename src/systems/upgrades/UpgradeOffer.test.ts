import { describe, expect, it } from 'vitest';
import { Rng } from '../../core/rng/Rng';
import type { UpgradeId } from '../../game/balance/upgrades';
import { hasOfferableEvolution, rollUpgradeOffer } from './UpgradeOffer';

describe('rollUpgradeOffer', () => {
  it('scripts the first level-up triad', () => {
    const owned = new Map<UpgradeId, number>();
    const offer = rollUpgradeOffer(owned, 0, new Rng(1), 3, 'level1');
    expect(offer.map((u) => u.id)).toEqual([
      'multishot_i',
      'quick_draw',
      'sharpened_arrows_i',
    ]);
  });

  it('does not offer already owned maxed upgrades later', () => {
    const owned = new Map<UpgradeId, number>([
      ['multishot_i', 1],
      ['quick_draw', 1],
      ['sharpened_arrows_i', 1],
    ]);
    const offer = rollUpgradeOffer(owned, 1, new Rng(99), 3, 'level1');
    expect(offer.every((u) => !owned.has(u.id) || (owned.get(u.id) ?? 0) < u.maxStacks)).toBe(
      true,
    );
    expect(offer.length).toBeGreaterThan(0);
    const ids = new Set(offer.map((u) => u.id));
    expect(ids.size).toBe(offer.length);
  });

  it('offers Arrow Storm when Volley is owned on level4_5 pool', () => {
    const owned = new Map<UpgradeId, number>([
      ['multishot_i', 1],
      ['multishot_ii', 1],
      ['tight_spread', 1],
      ['volley', 1],
    ]);
    expect(hasOfferableEvolution(owned, 'level4_5')).toBe(true);
    expect(hasOfferableEvolution(owned, 'level1')).toBe(false);
    const offer = rollUpgradeOffer(owned, 4, new Rng(3), 3, 'level4_5');
    expect(offer.some((u) => u.id === 'arrow_storm')).toBe(true);
  });
});
