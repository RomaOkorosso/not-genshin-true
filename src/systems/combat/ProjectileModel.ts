export interface ProjectileModel {
  id: number;
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  crit: boolean;
  pierceRemaining: number;
  pierceFalloff: number;
  hitIds: Set<number>;
  lifetime: number;
  radius: number;
}

let nextProjectileId = 1;

export function resetProjectileIdCounter(start = 1): void {
  nextProjectileId = start;
}

export function createProjectile(): ProjectileModel {
  return {
    id: nextProjectileId++,
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    damage: 0,
    crit: false,
    pierceRemaining: 0,
    pierceFalloff: 0,
    hitIds: new Set(),
    lifetime: 0,
    radius: 6,
  };
}

export function launchProjectile(
  p: ProjectileModel,
  opts: {
    x: number;
    y: number;
    angle: number;
    speed: number;
    damage: number;
    crit: boolean;
    pierce: number;
    pierceFalloff: number;
    lifetime?: number;
  },
): void {
  p.id = nextProjectileId++;
  p.active = true;
  p.x = opts.x;
  p.y = opts.y;
  p.vx = Math.cos(opts.angle) * opts.speed;
  p.vy = Math.sin(opts.angle) * opts.speed;
  p.damage = opts.damage;
  p.crit = opts.crit;
  p.pierceRemaining = opts.pierce;
  p.pierceFalloff = opts.pierceFalloff;
  p.hitIds.clear();
  p.lifetime = opts.lifetime ?? 2.5;
  p.radius = 6;
}

export function deactivateProjectile(p: ProjectileModel): void {
  p.active = false;
  p.hitIds.clear();
}
