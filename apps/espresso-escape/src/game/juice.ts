import { withSequence, withTiming, type SharedValue } from "react-native-reanimated";

/**
 * Gemini compare fold `2026-09-05-escape-gemini-compare-optimize`.
 * Visual juice only — never changes coyote / buffer / hurtbox / telegraph / retry.
 * Stop-motion paper frames: snap-hold-snap, not a smooth arcade tween.
 */
export const GEMINI_COMPARE_BRIEF = "2026-09-05-escape-gemini-compare-optimize";
export const STEAM_FIRST_MS = 3000;
export const FAKE_AO = true;

export function stepPaper(
  target: SharedValue<number>,
  a: number,
  b: number,
  rest = 1
): void {
  target.value = withSequence(
    withTiming(a, { duration: 0 }),
    withTiming(a, { duration: 70 }),
    withTiming(b, { duration: 0 }),
    withTiming(b, { duration: 70 }),
    withTiming(rest, { duration: 0 })
  );
}
