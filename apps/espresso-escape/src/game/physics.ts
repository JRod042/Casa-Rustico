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

export type Phase = 0 | 1 | 2 | 3;

export type CoachCue = "tap" | "tall" | "steam" | null;

export const PLAYER_W = 30;
export const PLAYER_H = 38;

/** Inset the hurtbox so art can overlap a few pixels without a cheap roast. */
export const PLAYER_INSET_X = 6;
export const PLAYER_INSET_Y = 5;

export const BEAN_W = 18;
export const BEAN_H = 24;

/**
 * Punchy tap-jump (Geometry Dash / Canabalt / Chrome Dino family).
 * 1.0.5 floated: −880 / 2300 up / 2700 down. This launch is taller and
 * snaps down so the first hop is obvious in under a second.
 * Hold only eases the fall for high honey beans — a tap still clears portafilters.
 */
export const JUMP_V = -1020;
export const GRAVITY_UP = 2750;
export const GRAVITY_DOWN = 3000;
export const GRAVITY_HANG = 2500;
export const JUMP_AIR_S = 0.73;
/** Heel-clip grace after a hop so landing on a kit’s tail is not a cheap roast. */
export const HEEL_MERCY_S = 0.16;

/** Late-tap forgiveness — 1.0.5 was 0.10 / 0.12, too tight to feel. */
export const COYOTE_S = 0.18;
export const BUFFER_S = 0.2;

/** Slower opening so the first red mark has a full read. */
export const BASE_SPEED = 248;
export const MAX_SPEED = 375;
export const SPEED_RAMP_S = 90;

/** Seconds of empty linen before the first kit rolls in. */
export const INTRO_EMPTY_S = 2.55;

export const MAX_DT = 1 / 30;
export const MAX_HAZARDS = 6;
export const MAX_BEANS = 8;

/** Time gaps by phase — land beat is longer than 1.0.5 so hops reset. */
export const GAP_S: Record<Phase, readonly [number, number]> = {
  0: [1.85, 2.3],
  1: [1.4, 1.82],
  2: [1.12, 1.5],
  3: [0.92, 1.24],
};

export const KIND_CODE: Record<HazardKind, number> = {
  grinder: 0,
  portafilter: 1,
  steam: 2,
};

export function phaseFor(time: number): Phase {
  if (time < 8) return 0;
  if (time < 20) return 1;
  if (time < 40) return 2;
  return 3;
}

export function speedForRun(time: number): number {
  const t = Math.min(1, Math.max(0, time / SPEED_RAMP_S));
  const eased = t * t * (3 - 2 * t);
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * eased;
}

export function jumpHeight(): number {
  return (JUMP_V * JUMP_V) / (2 * GRAVITY_UP);
}

export function gravityFor(vy: number, holding: boolean): number {
  if (vy < 0) return GRAVITY_UP;
  return holding ? GRAVITY_HANG : GRAVITY_DOWN;
}

export function aabbHits(a: Rect, b: Rect, pad = 0): boolean {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

export function playerHitbox(x: number, y: number): Rect {
  return {
    x: x + PLAYER_INSET_X,
    y: y + PLAYER_INSET_Y,
    w: PLAYER_W - PLAYER_INSET_X * 2,
    h: PLAYER_H - PLAYER_INSET_Y * 2,
  };
}

export function hazardHitbox(h: Hazard): Rect {
  if (h.kind === "steam") {
    return { x: h.x + 3, y: h.y + 8, w: h.w - 6, h: h.h - 12 };
  }
  if (h.kind === "portafilter") {
    return { x: h.x + 5, y: h.y + 4, w: h.w - 10, h: h.h - 6 };
  }
  return { x: h.x + 5, y: h.y + 4, w: h.w - 10, h: h.h - 5 };
}

export function beanHitbox(b: Bean): Rect {
  return { x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 };
}

export function makeHazard(id: number, world: World, kind: HazardKind): Hazard {
  const ground = world.groundY;
  const x = world.width + 20;
  if (kind === "steam") {
    return { id, kind, x, y: ground - 128, w: 28, h: 78 };
  }
  if (kind === "portafilter") {
    return { id, kind, x, y: ground - 88, w: 32, h: 88 };
  }
  return { id, kind, x, y: ground - 46, w: 36, h: 46 };
}

export function makeBean(id: number, x: number, y: number): Bean {
  return { id, taken: false, x, y, w: BEAN_W, h: BEAN_H };
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
