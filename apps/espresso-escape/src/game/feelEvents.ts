/**
 * Audio/haptics contract `2026-09-05-escape-audio-haptics-hooks`.
 * Casa sound P0 keys: hop | land | bean | whoosh | stamp | steam.
 * Cacique map: death→stamp, retry→whoosh.
 */
export const AUDIO_HAPTICS_CONTRACT = "2026-09-05-escape-audio-haptics-hooks";
export const CASA_P0_BOX = "/workspace/casa-brand/exports/escape-kraft/audio-kit/p0-for-pr21";

export const P0_KEYS = ["hop", "land", "bean", "whoosh", "stamp", "steam"] as const;
export type P0Key = (typeof P0_KEYS)[number];

export const FEEL_EVENTS = [
  "hop",
  "land",
  "death_stamp",
  "honey_bean",
  "near_miss",
  "menu_ui",
] as const;

export type FeelEventId = (typeof FEEL_EVENTS)[number];

/** Contract event → P0 kit file key. */
export const P0_FOR_EVENT: Record<FeelEventId, P0Key> = {
  hop: "hop",
  land: "land",
  death_stamp: "stamp",
  honey_bean: "bean",
  near_miss: "steam",
  menu_ui: "whoosh",
};
