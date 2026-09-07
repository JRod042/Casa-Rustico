const PLAYER_W = 52;
const PLAYER_H = 66;
const PLAYER_INSET_X = 10;
const PLAYER_INSET_Y = 12;
const BEAN_W = 26;
const BEAN_H = 32;
const JUMP_V = -820;
const GRAVITY_UP = 1950;
const GRAVITY_DOWN = 3400;
const GRAVITY_HANG = 1550;
const BASE_SPEED = 255;
const MAX_SPEED = 370;
const SPEED_RAMP_S = 90;

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

export function playerHitbox(x: number, y: number) {
  return { x: x + PLAYER_INSET_X, y: y + PLAYER_INSET_Y, w: PLAYER_W - PLAYER_INSET_X * 2, h: PLAYER_H - PLAYER_INSET_Y * 2 };
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
