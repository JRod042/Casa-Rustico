import { useEffect } from "react";
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Clamp 0–1 for Reanimated worklets. */
export function clamp01(value: number) {
  "worklet";
  return Math.min(1, Math.max(0, value));
}

/** Linear segment progress between start/end ms (Hallow / Appllama pattern). */
export function segment(timeMs: number, startMs: number, endMs: number) {
  "worklet";
  if (endMs <= startMs) {
    return timeMs >= endMs ? 1 : 0;
  }
  return clamp01((timeMs - startMs) / (endMs - startMs));
}

/** Authored linear timeline in milliseconds. */
export function useWelcomeTimeline(
  durationMs: number,
  autoplay: boolean,
  replayKey: number | string = 0
) {
  const time = useSharedValue(autoplay ? 0 : durationMs);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    cancelAnimation(time);
    if (!autoplay || reducedMotion) {
      time.value = durationMs;
      return;
    }
    time.value = 0;
    time.value = withTiming(durationMs, {
      duration: durationMs,
      easing: Easing.linear,
    });
  }, [autoplay, durationMs, reducedMotion, replayKey, time]);

  return time;
}

export function useInteractionGate(delayMs: number, autoplay = true) {
  const reducedMotion = useReducedMotion();
  const ready = useSharedValue(autoplay && !reducedMotion ? 0 : 1);

  useEffect(() => {
    if (!autoplay || reducedMotion) {
      ready.value = 1;
      return;
    }
    ready.value = 0;
    const id = setTimeout(() => {
      ready.value = 1;
    }, delayMs);
    return () => clearTimeout(id);
  }, [autoplay, delayMs, ready, reducedMotion]);

  return ready;
}
