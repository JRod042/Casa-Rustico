import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";
import { AUDIO_HAPTICS_CONTRACT, P0_FOR_EVENT, type FeelEventId, type P0Key } from "./feelEvents";

/**
 * Core Haptics — contract matrix, same-tick first transient.
 * hop / land / death_stamp / honey_bean / near_miss / menu_ui.
 * AHAP files stay null — intensity/sharpness is the ready seam.
 */
export const MASTER_PLAN = "2026-09-05-escape-best-in-class-master-plan";
export const APPDEV_CHECKLIST = "2026-09-05-escape-appdev-element-checklist";
export const SAME_TICK = true;
export { AUDIO_HAPTICS_CONTRACT };

export type HapticProfile = FeelEventId;

export type HapticStep = {
  kind: "impact" | "notify" | "select";
  impact?: Haptics.ImpactFeedbackStyle;
  notify?: Haptics.NotificationFeedbackType;
  buzzMs: number;
  waitMs: number;
};

/** AHAP-shaped table keyed to the contract matrix. */
export const HAPTIC_PROFILES: Record<
  HapticProfile,
  { intensity: number; sharpness: number; steps: HapticStep[] }
> = {
  hop: {
    intensity: 0.28,
    sharpness: 0.22,
    steps: [{ kind: "impact", impact: Haptics.ImpactFeedbackStyle.Soft, buzzMs: 8, waitMs: 0 }],
  },
  land: {
    intensity: 0.72,
    sharpness: 0.38,
    steps: [
      { kind: "impact", impact: Haptics.ImpactFeedbackStyle.Rigid, buzzMs: 16, waitMs: 0 },
      { kind: "impact", impact: Haptics.ImpactFeedbackStyle.Medium, buzzMs: 10, waitMs: 28 },
    ],
  },
  death_stamp: {
    intensity: 0.86,
    sharpness: 0.44,
    steps: [
      { kind: "notify", notify: Haptics.NotificationFeedbackType.Warning, buzzMs: 36, waitMs: 0 },
      { kind: "impact", impact: Haptics.ImpactFeedbackStyle.Heavy, buzzMs: 18, waitMs: 40 },
    ],
  },
  honey_bean: {
    intensity: 0.22,
    sharpness: 0.55,
    steps: [{ kind: "select", buzzMs: 6, waitMs: 0 }],
  },
  near_miss: {
    intensity: 0.26,
    sharpness: 0.4,
    steps: [{ kind: "impact", impact: Haptics.ImpactFeedbackStyle.Light, buzzMs: 8, waitMs: 0 }],
  },
  menu_ui: {
    intensity: 0.42,
    sharpness: 0.3,
    steps: [{ kind: "impact", impact: Haptics.ImpactFeedbackStyle.Medium, buzzMs: 12, waitMs: 0 }],
  },
};

/** P0 AHAP paths — do not require() until sync:audio copies the box. */
export const AHAP_SEAMS: Record<P0Key, string> = {
  hop: "assets/ahap/hop.ahap",
  land: "assets/ahap/land.ahap",
  bean: "assets/ahap/bean.ahap",
  whoosh: "assets/ahap/whoosh.ahap",
  stamp: "assets/ahap/stamp.ahap",
  steam: "assets/ahap/steam.ahap",
};

function audioServicesBuzz(ms: number): void {
  try {
    Vibration.vibrate(ms);
  } catch {
    // Web / denied — never stall a hop.
  }
}

export async function playAhap(profile: HapticProfile): Promise<boolean> {
  const key = P0_FOR_EVENT[profile];
  if (!AHAP_SEAMS[key]) return false;
  // Bundle is copied by sync:audio. Native CHHapticEngine play lands with the files.
  return false;
}

function runStep(step: HapticStep): void {
  const run =
    step.kind === "notify" && step.notify
      ? Haptics.notificationAsync(step.notify)
      : step.kind === "select"
        ? Haptics.selectionAsync()
        : Haptics.impactAsync(step.impact ?? Haptics.ImpactFeedbackStyle.Soft);
  void run.catch(() => {
    audioServicesBuzz(step.buzzMs);
  });
}

function expoProfile(profile: HapticProfile): void {
  const { steps } = HAPTIC_PROFILES[profile];
  const first = steps[0];
  if (first) runStep(first);
  if (steps.length < 2) return;
  void (async () => {
    for (let i = 1; i < steps.length; i += 1) {
      const step = steps[i];
      if (step.waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, step.waitMs));
      }
      runStep(step);
    }
  })();
}

/** First transient fires on this call — not after a resolved AHAP promise. */
export function playHaptic(profile: HapticProfile): void {
  expoProfile(profile);
  void playAhap(profile);
}
