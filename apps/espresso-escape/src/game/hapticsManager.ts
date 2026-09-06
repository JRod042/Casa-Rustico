import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Core Haptics scaffold — master plan §10 / appdev checklist.
 * Profiles only. AHAP files are seams (null until shipped). No new system.
 * Fallback: Expo Haptics, then Vibration (AudioServices-class buzz).
 */
export const MASTER_PLAN = "2026-09-05-escape-best-in-class-master-plan";
export const APPDEV_CHECKLIST = "2026-09-05-escape-appdev-element-checklist";

export type HapticProfile = "hop" | "land" | "death" | "bean";

/** AHAP-ready paths — do not require() missing files. */
export const AHAP_SEAMS: Record<HapticProfile, string | null> = {
  hop: null,
  land: null,
  death: null,
  bean: null,
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
    profile === "land"
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      : profile === "death"
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  const fallback = profile === "land" ? 14 : profile === "death" ? 36 : profile === "bean" ? 6 : 8;
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
