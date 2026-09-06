import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";
import { bootSfx, muteSfx, playSfx } from "./sfx";

/** Death → retry lock. Crossy/Flappy-fast, but long enough that the roast tap does not eat the next run. */
export const RETRY_LOCK_MS = 320;

export type FeelPrefs = {
  haptics: boolean;
  sfx: boolean;
};

let prefs: FeelPrefs = { haptics: true, sfx: true };

export function setFeelPrefs(next: FeelPrefs): void {
  prefs = next;
  muteSfx(!next.sfx);
}

export function feelPrefs(): FeelPrefs {
  return prefs;
}

export function armFeel(): void {
  bootSfx();
}

function buzz(ms: number): void {
  try {
    Vibration.vibrate(ms);
  } catch {
    // Web / denied haptics should never stall a run.
  }
}

/** Light hop — iOS impact, Android vibrate fallback. Never throws. */
export function hopTick(): void {
  if (prefs.haptics) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      buzz(8);
    });
  }
  if (prefs.sfx) playSfx("hop");
}

export function beanTick(): void {
  if (prefs.haptics) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {
      buzz(6);
    });
  }
  if (prefs.sfx) playSfx("bean");
}

export function roastTick(): void {
  if (prefs.haptics) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
      buzz(36);
    });
  }
  if (prefs.sfx) playSfx("roast");
}

export function warnTick(): void {
  if (prefs.haptics) {
    void Haptics.selectionAsync().catch(() => {
      buzz(4);
    });
  }
  if (prefs.sfx) playSfx("warn");
}
