export type Rect = { x: number; y: number; w: number; h: number };

export type HazardKind = "grinder" | "steam" | "portafilter";

export type Hazard = Rect & {
  id: number;
  kind: HazardKind;
};

export type Bean = Rect & {
  id: number;
  taken: boolean;
};

export type World = {
  width: number;
  height: number;
  groundY: number;
};

export const PLAYER_W = 28;
export const PLAYER_H = 36;
export const GRAVITY = 2400;
export const JUMP_V = -780;
export const BASE_SPEED = 220;
export const MAX_SPEED = 460;

export function aabbHits(a: Rect, b: Rect, pad = 2): boolean {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

export function playerRect(x: number, y: number): Rect {
  return { x, y, w: PLAYER_W, h: PLAYER_H };
}

export function speedForScore(score: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + score * 3.2);
}

export function spawnGapForSpeed(speed: number): number {
  return Math.max(780, 1680 - (speed - BASE_SPEED) * 2.4);
}

export function makeHazard(
  id: number,
  world: World,
  kind: HazardKind
): Hazard {
  const ground = world.groundY;
  if (kind === "steam") {
    return { id, kind, x: world.width + 24, y: ground - 118, w: 22, h: 70 };
  }
  if (kind === "portafilter") {
    return { id, kind, x: world.width + 24, y: ground - 92, w: 34, h: 92 };
  }
  return { id, kind, x: world.width + 24, y: ground - 52, w: 44, h: 52 };
}

export function makeBean(id: number, world: World, high: boolean): Bean {
  return {
    id,
    taken: false,
    x: world.width + 40,
    y: world.groundY - (high ? 132 : 78),
    w: 16,
    h: 22,
  };
}

export function pickHazardKind(score: number): HazardKind {
  const roll = (score * 17 + 11) % 10;
  if (score > 18 && roll < 3) return "steam";
  if (score > 8 && roll < 6) return "portafilter";
  return "grinder";
}
