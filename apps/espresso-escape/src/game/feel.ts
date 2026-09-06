import { playAudio } from "./audioHooks";
import { playHaptic } from "./hapticsManager";
import { bootSfx, muteSfx } from "./sfx";

/**
 * Core feelings from `2026-09-05-escape-lbp-reviews-core-feel`
 * (file may live on the ops box; names stay in-repo).
 * Handmade warmth → wonder → tactile honesty → soft danger → playful
 * weight → charm → invitation → cozy craft → diorama depth → soft-chaos joy.
 * Juice is cloth hop + cardboard land thump — not a floaty toy jump.
 */
export const CORE_FEEL_BRIEF = "2026-09-05-escape-lbp-reviews-core-feel";
export const UNIFIED_PLAYBOOK = "2026-09-05-escape-unified-revision-playbook";

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

function tick(haptic: Parameters<typeof playHaptic>[0], audio: Parameters<typeof playAudio>[0]): void {
  if (prefs.haptics) playHaptic(haptic);
  if (prefs.sfx) playAudio(audio);
}

/** Light hop — haptic + hop click + whoosh air. Never throws. */
export function hopTick(): void {
  tick("hop", "hop");
  if (prefs.sfx) playAudio("whoosh");
}

/** Cardboard thud — haptic + land + stamp. */
export function landTick(): void {
  tick("land", "land");
  if (prefs.sfx) playAudio("stamp");
}

export function beanTick(): void {
  tick("bean", "bean");
}

/** Stay-low steam cloud — soft puff, not a roast. */
export function steamTick(): void {
  tick("steam", "steam");
}

export function deathTick(): void {
  tick("death", "death");
}

/** Roast alias — death path stays named for PlayField. */
export function roastTick(): void {
  deathTick();
}

export function retryTick(): void {
  tick("retry", "retry");
}

export function warnTick(): void {
  tick("warn", "warn");
}
