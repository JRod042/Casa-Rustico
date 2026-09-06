import { playSfx } from "./sfx";

/**
 * Audio hooks — research/scaffold only (master plan §10).
 * Existing tiny wavs: hop / land / bean / roast / warn.
 * whoosh / stamp / steam are seams — no packs, no require() of missing files.
 */
export type AudioHook = "hop" | "land" | "bean" | "whoosh" | "stamp" | "steam" | "roast" | "warn";

export const AUDIO_SEAMS: Record<AudioHook, "live" | "hook"> = {
  hop: "live",
  land: "live",
  bean: "live",
  roast: "live",
  warn: "live",
  whoosh: "hook",
  stamp: "hook",
  steam: "hook",
};

export function playAudio(name: AudioHook): void {
  if (AUDIO_SEAMS[name] === "hook") return;
  if (name === "whoosh" || name === "stamp" || name === "steam") return;
  playSfx(name);
}
