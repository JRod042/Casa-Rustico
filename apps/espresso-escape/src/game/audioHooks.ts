import { playSfx, type Tone } from "./sfx";

/**
 * Jorge: AUDIO is first-class. Full hop/land/bean/steam/death/retry/whoosh/stamp
 * live through this module (tiny placeholders OK). No art PNG wire.
 */
export const AUDIO_FIRST_CLASS = true;

export type AudioHook = Tone;

export const AUDIO_SEAMS: Record<AudioHook, "live" | "hook"> = {
  hop: "live",
  land: "live",
  bean: "live",
  steam: "live",
  death: "live",
  retry: "live",
  roast: "live",
  warn: "live",
  whoosh: "live",
  stamp: "live",
};

export function playAudio(name: AudioHook): void {
  if (AUDIO_SEAMS[name] === "hook") return;
  playSfx(name);
}
