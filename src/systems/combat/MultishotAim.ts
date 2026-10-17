/**
 * Relative aim offsets for multishot.
 * Always includes 0 (primary on the lock target) so even counts don't leave
 * a gap that the tracked enemy sits in.
 */
export function multishotAngleOffsets(count: number, spreadRad: number): number[] {
  if (count <= 1) return [0];
  if (spreadRad <= 0) return Array.from({ length: count }, () => 0);

  const offsets = [0];
  const extras = count - 1;
  const half = spreadRad / 2;
  const maxRank = Math.ceil(extras / 2);

  for (let i = 1; i <= extras; i++) {
    const side = i % 2 === 1 ? 1 : -1;
    const rank = Math.ceil(i / 2);
    offsets.push(side * half * (rank / maxRank));
  }
  return offsets;
}
