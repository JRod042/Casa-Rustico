import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Death → retry lock. Crossy/Flappy-fast.
 * 1.0.5 used 380ms — still ate the first “brew again” tap. Punchier now.
 */
export const RETRY_LOCK_MS = 220;

/** Stretch on hop — 1.0.5 was 0.9 / 1.1 (invisible on a 30px bean). */
export const SQUASH_JUMP_X = 0.66;
export const SQUASH_JUMP_Y = 1.48;
export const SQUASH_JUMP_MS = 170;

/** Pancake on land — 1.0.5 was 1.12 / 0.86. */
export const SQUASH_LAND_X = 1.48;
export const SQUASH_LAND_Y = 0.55;
export const SQUASH_LAND_MS = 140;

/** Floor-mark telegraph. 1.0.5: 7px, 0.28 far / 0.85 near, 210px window. */
export const MARK_H = 16;
export const MARK_FAR = 0.62;
export const MARK_NEAR = 1;
export const MARK_IMMINENT = 160;
export const MARK_WINDOW = 360;

/** Same-tick hop — Rigid reads on-device; Light did not. */
export function hopTick(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {
    try {
      Vibration.vibrate(16);
    } catch {
      // Web / denied haptics should never stall a run.
    }
  });
}

/** Land thump — 1.0.5 had squash only, no haptic. */
export function landTick(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
    try {
      Vibration.vibrate(20);
    } catch {
      // ignore
    }
  });
}

export function beanTick(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {
    try {
      Vibration.vibrate(8);
    } catch {
      // ignore
    }
  });
}

export function roastTick(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
    try {
      Vibration.vibrate(55);
    } catch {
      // ignore
    }
  });
}
