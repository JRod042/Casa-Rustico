import { AUDIO_HAPTICS_CONTRACT, P0_FOR_EVENT, type FeelEventId, type P0Key } from "./feelEvents";
import { playSfx, type Tone } from "./sfx";

/**
 * Casa sound P0 — hop|land|bean|whoosh|stamp|steam.
 * death→stamp, retry→whoosh. Real wavs via expo-av when sync:audio copies the box.
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

const ALIAS: Partial<Record<AudioHook, P0Key>> = {
  death: "stamp",
  roast: "stamp",
  death_stamp: "stamp",
  retry: "whoosh",
  menu_ui: "whoosh",
  honey_bean: "bean",
  near_miss: "steam",
  warn: "steam",
};

export function playAudio(name: AudioHook): void {
  if (AUDIO_SEAMS[name] === "hook") return;
  if (name in P0_FOR_EVENT) {
    playSfx(P0_FOR_EVENT[name as FeelEventId]);
    return;
  }
  playSfx(ALIAS[name] ?? name);
}
