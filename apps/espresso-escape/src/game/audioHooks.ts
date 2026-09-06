import { AUDIO_HAPTICS_CONTRACT, type FeelEventId } from "./feelEvents";
import { playSfx, type Tone } from "./sfx";

/**
 * Jorge: AUDIO is first-class. Contract IDs from
 * `2026-09-05-escape-audio-haptics-hooks`. Casa sound owns P0 wavs —
 * in-repo files are placeholders. whoosh / stamp stay hop/land layers.
 */
export const AUDIO_FIRST_CLASS = true;
export { AUDIO_HAPTICS_CONTRACT };

export type AudioHook = FeelEventId | Tone;

export const AUDIO_SEAMS: Record<AudioHook, "live" | "hook"> = {
  hop: "live",
  land: "live",
  death_stamp: "live",
  honey_bean: "live",
  near_miss: "live",
  menu_ui: "live",
  bean: "live",
  steam: "live",
  death: "live",
  retry: "live",
  roast: "live",
  warn: "live",
  whoosh: "live",
  stamp: "live",
};

const ALIAS: Partial<Record<AudioHook, FeelEventId>> = {
  bean: "honey_bean",
  death: "death_stamp",
  roast: "death_stamp",
  steam: "near_miss",
  warn: "near_miss",
  retry: "menu_ui",
};

export function playAudio(name: AudioHook): void {
  if (AUDIO_SEAMS[name] === "hook") return;
  const id = ALIAS[name] ?? name;
  playSfx(id);
}
