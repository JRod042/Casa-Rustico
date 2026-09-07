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

export type BubbleKind = "score" | "prize";

export type Bubble = Rect & {
  id: number;
  kind: BubbleKind;
  phase: number;
};

export type SceneryKind = "coffeeTree" | "palm" | "coconuts" | "banana";

export type Scenery = {
  id: number;
  kind: SceneryKind;
  x: number;
  y: number;
  w: number;
  h: number;
  par: number;
  phase: number;
  rustled: boolean;
};

export type World = {
  width: number;
  height: number;
  groundY: number;
};

export type Phase = 0 | 1 | 2 | 3;

export type CoachCue = "tap" | "tall" | "steam" | "bean" | null;

export type ScriptBeat = "tap" | "steam" | "bean" | "done";

/** Stitched espresso bean — plump craft mascot, not a sticker. */
export const PLAYER_W = 76;
export const PLAYER_H = 94;

export const PLAYER_INSET_X = 16;
export const PLAYER_INSET_Y = 14;

export const BEAN_W = 36;
export const BEAN_H = 42;

export const BUBBLE_W = 30;
export const BUBBLE_H = 30;
export const PRIZE_BUBBLE_W = 46;
export const PRIZE_BUBBLE_H = 46;
export const BUBBLE_PTS = 10;
export const PRIZE_BUBBLE_PTS = 50;
export const COMBO_STEP = 5;
export const COMBO_WINDOW = 1.28;
export const MAX_MULT = 8;
export const MAX_BUBBLES = 16;
export const MAX_SCENERY = 9;

export const FEEL_QA_LOCKED = true;
export const CONTROL_FAIRNESS = true;
export const APPSTORE_CONTROLS_BRIEF = "2026-09-05-escape-appstore-controls-feel-hits";

/**
 * Stuffed-toy hop — Media Molecule skip + Animal Crossing plant.
 * Soft rise, long hang, pillowy hold, light skip-run between hops.
 */
export const JUMP_V = -880;
export const GRAVITY_UP = 2200;
export const GRAVITY_APEX = 520;
export const GRAVITY_DOWN = 3600;
export const GRAVITY_HANG = 2400;
export const GRAVITY_SKIP = 1850;
export const JUMP_CUT = 0.48;
export const APEX_V = 90;
export const JUMP_AIR_S = 0.644;
export const HEEL_MERCY_S = 0.1;
export const MAX_FALL = 980;
export const SKIP_V = -210;

export const COYOTE_S = 0.13;
export const BUFFER_S = 0.15;

/** LBP stuffed gyro — restoring lean, not ragdoll. */
export const GYRO_K = 28;
export const GYRO_DAMP = 9;
export const LEAN_MAX = 0.22;

export const BASE_SPEED = 280;
export const MAX_SPEED = 400;
export const SPEED_RAMP_S = 90;

export const MAGNET_R = 56;
export const MAGNET_PULL = 260;
export const BUBBLE_MAGNET_R = 78;
export const BUBBLE_MAGNET_PULL = 240;
export const INTRO_EMPTY_S = 2.3;
export const TELEGRAPH_S = 0.62;

export const MAX_DT = 1 / 30;
export const SUB_DT = 1 / 120;
export const MAX_HAZARDS = 6;
export const MAX_BEANS = 8;
export type FloorMat = "burlap" | "sponge" | "cardboard";
export type AddonKind = "sponge" | "prize";

export type FloorSeg = { x: number; w: number; mat: FloorMat };

export type Addon = Rect & {
  id: number;
  kind: AddonKind;
};

export const SKIP_FOR: Record<FloorMat, number> = {
  burlap: -248,
  sponge: -410,
  cardboard: -168,
};

export const SKIP_G_FOR: Record<FloorMat, number> = {
  burlap: 1720,
  sponge: 1080,
  cardboard: 2280,
};

/** Animal Crossing foot-plant before the next hop. Sponge is an LBP bounce pad — no plant. */
export const PLANT_S: Record<FloorMat, number> = {
  burlap: 0.055,
  sponge: 0,
  cardboard: 0.1,
};

/** LBP sponge restitution vs cardboard dead-stop. Extra bounce on incoming speed. */
export const REST_FOR: Record<FloorMat, number> = {
  burlap: 0.12,
  sponge: 0.38,
  cardboard: 0.02,
};

export const SPONGE_S = 6.5;
export const ADDON_W = 46;
export const ADDON_H = 46;
export const MAX_FLOOR = 8;
export const MAX_ADDONS = 5;

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

export const SCENERY_SPEC: Record<
  SceneryKind,
  { w: number; h: number; par: number; hang: boolean; plant: number }
> = {
  coffeeTree: { w: 62, h: 116, par: 0.66, hang: false, plant: 12 },
  palm: { w: 46, h: 158, par: 0.48, hang: false, plant: 24 },
  banana: { w: 56, h: 102, par: 0.8, hang: false, plant: 10 },
  coconuts: { w: 40, h: 56, par: 0.34, hang: true, plant: 0 },
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

export function skipImpulse(mat: FloorMat, incoming: number): number {
  const extra = Math.min(180, Math.max(0, incoming) * REST_FOR[mat]);
  return SKIP_FOR[mat] - extra;
}

export function gravityFor(
  vy: number,
  holding: boolean,
  skipping = false,
  mat: FloorMat = "burlap",
): number {
  if (skipping && !holding) return SKIP_G_FOR[mat];
  if (vy > -APEX_V && vy < APEX_V) return GRAVITY_APEX;
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
    return { x: h.x + 10, y: h.y + 12, w: h.w - 20, h: h.h - 22 };
  }
  if (h.kind === "portafilter") {
    return { x: h.x + 12, y: h.y + 8, w: h.w - 24, h: h.h - 10 };
  }
  return { x: h.x + 10, y: h.y + 8, w: h.w - 20, h: h.h - 10 };
}

export function beanHitbox(b: Bean): Rect {
  return { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 };
}

export function bubbleHitbox(b: Bubble): Rect {
  const pad = b.kind === "prize" ? 8 : 6;
  return { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
}

export function makeHazard(id: number, world: World, kind: HazardKind): Hazard {
  const ground = world.groundY;
  const x = world.width + 24;
  if (kind === "steam") {
    return { id, kind, x, y: ground - 214, w: 96, h: 124, warned: false };
  }
  if (kind === "portafilter") {
    return { id, kind, x, y: ground - 158, w: 56, h: 158, warned: false };
  }
  if (kind === "tamper") {
    return { id, kind, x, y: ground - 118, w: 52, h: 118, warned: false };
  }
  if (kind === "cup") {
    return { id, kind, x, y: ground - 108, w: 70, h: 108, warned: false };
  }
  if (kind === "knockbox") {
    return { id, kind, x, y: ground - 72, w: 88, h: 72, warned: false };
  }
  return { id, kind, x, y: ground - 84, w: 90, h: 84, warned: false };
}

export function makeBean(id: number, x: number, y: number): Bean {
  return { id, taken: false, x, y, w: BEAN_W, h: BEAN_H };
}

export function makeBubble(
  id: number,
  kind: BubbleKind,
  x: number,
  y: number,
  phase: number,
): Bubble {
  const size = kind === "prize" ? PRIZE_BUBBLE_W : BUBBLE_W;
  const h = kind === "prize" ? PRIZE_BUBBLE_H : BUBBLE_H;
  return { id, kind, x, y, w: size, h, phase };
}

export function makeScenery(
  id: number,
  kind: SceneryKind,
  x: number,
  groundY: number,
  rng: number,
): Scenery {
  const spec = SCENERY_SPEC[kind];
  const y = spec.hang ? 10 + rng * 64 : groundY - spec.h + spec.plant;
  return {
    id,
    kind,
    x,
    y,
    w: spec.w,
    h: spec.h,
    par: spec.par,
    phase: rng * Math.PI * 2,
    rustled: false,
  };
}

export function makeAddon(id: number, kind: AddonKind, x: number, y: number): Addon {
  return { id, kind, x, y, w: ADDON_W, h: ADDON_H };
}

export function makeFloor(x: number, w: number, mat: FloorMat): FloorSeg {
  return { x, w, mat };
}

export function matAt(
  playerX: number,
  floor: FloorSeg[],
  spongeT: number,
): FloorMat {
  if (spongeT > 0) return "sponge";
  const x = playerX + PLAYER_W / 2;
  for (let i = 0; i < floor.length; i += 1) {
    const s = floor[i];
    if (x >= s.x && x < s.x + s.w) return s.mat;
  }
  return "burlap";
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
