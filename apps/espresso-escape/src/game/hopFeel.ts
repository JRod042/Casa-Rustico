export const LBP_JUMP_V = -820;
export const LBP_GRAVITY_UP = 1950;
export const LBP_GRAVITY_DOWN = 3400;
export const LBP_GRAVITY_HANG = 1550;
export const LBP_PLAYER_W = 52;
export const LBP_PLAYER_H = 66;
export const LBP_MAX_FALL = 1100;

export function lbpGravity(vy: number, holding: boolean): number {
  if (vy < 0) return LBP_GRAVITY_UP;
  return holding ? LBP_GRAVITY_HANG : LBP_GRAVITY_DOWN;
}
