import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";

/** Death → retry lock. Crossy/Flappy-fast, but long enough that the roast tap does not eat the next run. */
export const RETRY_LOCK_MS = 380;

/** Light hop — iOS impact, Android vibrate fallback. Never throws. */
export function hopTick(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    try {
      Vibration.vibrate(8);
    } catch {
      // Web / denied haptics should never stall a run.
    }
  });
}

export function beanTick(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {
    try {
      Vibration.vibrate(6);
    } catch {
      // ignore
    }
  });
}

export function roastTick(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
    try {
      Vibration.vibrate(36);
    } catch {
      // ignore
    }
  });
}
