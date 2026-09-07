export type Rect = { x: number; y: number; w: number; h: number };

export type HazardKind = "grinder" | "steam" | "portafilter" | "knockbox" | "tamper" | "cup";

export type Hazard = Rect & {
  id: number;
  kind: HazardKind;
  warned: boolean;
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

export type CoachCue = "tap" | "tall" | "steam" | "bean" | null;

export type ScriptBeat = "tap" | "steam" | "bean" | "done";

export const PLAYER_W = 30;
export const PLAYER_H = 38;

/** Hurtbox ≤ ~70% of the kraft sticker so paper edges are cosmetic. */
export const PLAYER_INSET_X = 6;
export const PLAYER_INSET_Y = 7;

export const BEAN_W = 18;
export const BEAN_H = 24;

/**
 * Feel QA lock (`2026-09-05-escape-lbp-reviews-core-feel`):
 * squash hop + fall>rise + land thump — not a floaty toy jump.
 * Soft-danger telegraph must stay ≥550ms. Casa kraft only.
 */
export const FEEL_QA_LOCKED = true;
/** App Store control fairness — coyote, buffer, insets, telegraph, retry. */
export const CONTROL_FAIRNESS = true;
export const APPSTORE_CONTROLS_BRIEF = "2026-09-05-escape-appstore-controls-feel-hits";

/**
 * Committed tap-hop. Fall is heavier than rise so the bean lands with weight.
 * Hold only eases the fall for high honey beans.
 */
export const JUMP_V = -880;
export const GRAVITY_UP = 2200;
export const GRAVITY_DOWN = 3600;
export const GRAVITY_HANG = 2400;
export const GRAVITY_SKIP = 1850;
export const JUMP_CUT = 0.48;
export const SKIP_V = -210;
export const MAX_FALL = 980;
export const JUMP_AIR_S = 0.644;
/** Heel-clip grace after a hop so landing on a kit’s tail is not a cheap roast. */
export const HEEL_MERCY_S = 0.1;

/** Late-tap forgiveness — inside the 110–150 / 120–180 ms brief. */
export const COYOTE_S = 0.13;
export const BUFFER_S = 0.15;

/** Seconds of empty linen before the first kit (also the post-death opener). */
export const INTRO_EMPTY_S = 2.3;

/** Visible warn window before a kit reaches the runner. */
export const TELEGRAPH_S = 0.62;

/** Honey beans ease toward the runner when close. */
export const MAGNET_R = 56;
export const MAGNET_PULL = 260;

/** Readable opening pace; max stays below the old 460 wall. */
export const BASE_SPEED = 280;
export const MAX_SPEED = 400;
export const SPEED_RAMP_S = 90;

export const MAX_DT = 1 / 30;
export const MAX_HAZARDS = 6;
export const MAX_BEANS = 8;

/** Time gaps by phase — always longer than airtime + a land beat. */
export const GAP_S: Record<Phase, readonly [number, number]> = {
  0: [1.55, 1.95],
  1: [1.18, 1.58],
  2: [0.96, 1.34],
  3: [0.8, 1.12],
};

export const KIND_CODE: Record<HazardKind, number> = {
  grinder: 0,
  portafilter: 1,
  steam: 2,
  knockbox: 3,
  tamper: 4,
  cup: 5,
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

export function gravityFor(vy: number, holding: boolean, skipping = false): number {
  if (skipping && !holding) return GRAVITY_SKIP;
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

export function playerHurtboxRatio(): number {
  const visual = PLAYER_W * PLAYER_H;
  const hurt = (PLAYER_W - PLAYER_INSET_X * 2) * (PLAYER_H - PLAYER_INSET_Y * 2);
  return hurt / visual;
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
    return { id, kind, x, y: ground - 128, w: 28, h: 78, warned: false };
  }
  if (kind === "portafilter") {
    return { id, kind, x, y: ground - 88, w: 32, h: 88, warned: false };
  }
  if (kind === "tamper") {
    return { id, kind, x, y: ground - 62, w: 26, h: 62, warned: false };
  }
  if (kind === "cup") {
    return { id, kind, x, y: ground - 58, w: 34, h: 58, warned: false };
  }
  if (kind === "knockbox") {
    return { id, kind, x, y: ground - 40, w: 40, h: 40, warned: false };
  }
  return { id, kind, x, y: ground - 46, w: 36, h: 46, warned: false };
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
