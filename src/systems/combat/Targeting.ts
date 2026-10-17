export interface Targetable {
  id: number;
  x: number;
  y: number;
  alive: boolean;
}

export type TargetingStrategy = (
  originX: number,
  originY: number,
  range: number,
  enemies: readonly Targetable[],
) => Targetable | null;

/** Nearest enemy to tower center; deterministic tie-break by id ascending. */
export const nearestToTower: TargetingStrategy = (originX, originY, range, enemies) => {
  const rangeSq = range * range;
  let best: Targetable | null = null;
  let bestDistSq = Infinity;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - originX;
    const dy = enemy.y - originY;
    const distSq = dx * dx + dy * dy;
    if (distSq > rangeSq) continue;
    if (distSq < bestDistSq || (distSq === bestDistSq && best !== null && enemy.id < best.id)) {
      best = enemy;
      bestDistSq = distSq;
    }
  }
  return best;
};
