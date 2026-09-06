import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Core Haptics — master plan §10 / appdev checklist.
 * hop / land / bean / steam / death / retry. AHAP files are seams (null).
 * Fallback: Expo Haptics, then Vibration (AudioServices-class buzz).
 */
export const MASTER_PLAN = "2026-09-05-escape-best-in-class-master-plan";
export const APPDEV_CHECKLIST = "2026-09-05-escape-appdev-element-checklist";

export type HapticProfile = "hop" | "land" | "bean" | "steam" | "death" | "retry";

/** AHAP-ready paths — do not require() missing files. */
export const AHAP_SEAMS: Record<HapticProfile, string | null> = {
  hop: null,
  land: null,
  bean: null,
  steam: null,
  death: null,
  retry: null,
};

function audioServicesBuzz(ms: number): void {
  try {
    Vibration.vibrate(ms);
  } catch {
    // Web / denied — never stall a hop.
  }
}

/** Core Haptics AHAP play — stub until a .ahap lands. */
export async function playAhap(_profile: HapticProfile): Promise<boolean> {
  return false;
}

function expoProfile(profile: HapticProfile): void {
  const run =
    profile === "land" || profile === "retry"
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      : profile === "death"
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  const fallback =
    profile === "death" ? 36 : profile === "land" ? 14 : profile === "retry" ? 12 : profile === "steam" ? 7 : profile === "bean" ? 6 : 8;
  void run.catch(() => {
    audioServicesBuzz(fallback);
  });
}

export function playHaptic(profile: HapticProfile): void {
  void playAhap(profile).then((played) => {
    if (played) return;
    expoProfile(profile);
  });
}
