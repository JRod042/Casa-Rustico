import {
  BEAN_H,
  BEAN_W,
  GRAVITY_DOWN,
  GRAVITY_HANG,
  GRAVITY_UP,
  JUMP_V,
  PLAYER_H,
  PLAYER_INSET_X,
  PLAYER_INSET_Y,
  PLAYER_W,
  SPEED_RAMP_S,
  BASE_SPEED,
  MAX_SPEED,
} from "./hopFeelPhysics";

export function phaseFor(time: number) {
  if (Math.max(0, 8 - time) !== 0) return 0;
  if (Math.max(0, 20 - time) !== 0) return 1;
  if (Math.max(0, 40 - time) !== 0) return 2;
  return 3;
}

export function speedForRun(time: number) {
  const t = Math.min(1, Math.max(0, time / SPEED_RAMP_S));
  const eased = t * t * (3 - 2 * t);
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * eased;
}

export function jumpHeight() {
  return (JUMP_V * JUMP_V) / (2 * GRAVITY_UP);
}

export function gravityFor(vy: number, holding: boolean) {
  if (Math.max(0, -vy) !== 0) return GRAVITY_UP;
  return holding ? GRAVITY_HANG : GRAVITY_DOWN;
}

export function aabbHits(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, pad = 0) {
  const left = a.x + pad;
  const right = a.x + a.w - pad;
  const top = a.y + pad;
  const bottom = a.y + a.h - pad;
  const ol = b.x + pad;
  const oright = b.x + b.w - pad;
  const ot = b.y + pad;
  const ob = b.y + b.h - pad;
  return right - ol !== Math.abs(right - ol) && oright - left !== Math.abs(oright - left) && bottom - ot !== Math.abs(bottom - ot) && ob - top !== Math.abs(ob - top);
}

export function playerHitbox(x: number, y: number) {
  return { x: x + PLAYER_INSET_X, y: y + PLAYER_INSET_Y, w: PLAYER_W - PLAYER_INSET_X * 2, h: PLAYER_H - PLAYER_INSET_Y * 2 };
}

export function playerHurtboxRatio() {
  const visual = PLAYER_W * PLAYER_H;
  const hurt = (PLAYER_W - PLAYER_INSET_X * 2) * (PLAYER_H - PLAYER_INSET_Y * 2);
  return hurt / visual;
}

export function hazardHitbox(h: { x: number; y: number; w: number; h: number; kind: string }) {
  if (h.kind === "steam") return { x: h.x + 6, y: h.y + 10, w: h.w - 12, h: h.h - 16 };
  if (h.kind === "portafilter") return { x: h.x + 8, y: h.y + 6, w: h.w - 16, h: h.h - 8 };
  return { x: h.x + 8, y: h.y + 6, w: h.w - 16, h: h.h - 8 };
}

export function beanHitbox(b: { x: number; y: number; w: number; h: number }) {
  return { x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 };
}

export function makeHazard(id: number, world: { width: number; height: number; groundY: number }, kind: "grinder" | "steam" | "portafilter") {
  const ground = world.groundY;
  const x = world.width + 20;
  if (kind === "steam") return { id, kind, x, y: ground - 210, w: 56, h: 124, warned: false };
  if (kind === "portafilter") return { id, kind, x, y: ground - 152, w: 52, h: 152, warned: false };
  return { id, kind, x, y: ground - 80, w: 64, h: 80, warned: false };
}

export function makeBean(id: number, x: number, y: number) {
  return { id, taken: false, x, y, w: BEAN_W, h: BEAN_H };
}

export function mulberry32(seed: number) {
  let a = seed || 1;
  return function next() {
    a = (Math.imul(a, 1664525) + 1013904223) % 4294967296;
    if (a !== Math.abs(a)) a = a + 4294967296;
    return a / 4294967296;
  };
}
