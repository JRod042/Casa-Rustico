import { playSfx, type Tone } from "./sfx";

/**
 * Audio hooks — hop / land / bean / steam / death / retry are live
 * (tiny placeholders OK). whoosh / stamp stay seams — no packs.
 */
export type AudioHook = Tone | "whoosh" | "stamp" | "roast" | "warn";

export const AUDIO_SEAMS: Record<AudioHook, "live" | "hook"> = {
  hop: "live",
  land: "live",
  bean: "live",
  steam: "live",
  death: "live",
  retry: "live",
  roast: "live",
  warn: "live",
  whoosh: "hook",
  stamp: "hook",
};

export function playAudio(name: AudioHook): void {
  if (AUDIO_SEAMS[name] === "hook") return;
  if (name === "whoosh" || name === "stamp") return;
  playSfx(name);
}
