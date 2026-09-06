/**
 * Audio/haptics contract `2026-09-05-escape-audio-haptics-hooks`.
 * Event IDs only. Casa sound owns P0 SFX. Placeholders until that drop.
 */
export const AUDIO_HAPTICS_CONTRACT = "2026-09-05-escape-audio-haptics-hooks";

export const FEEL_EVENTS = [
  "hop",
  "land",
  "death_stamp",
  "honey_bean",
  "near_miss",
  "menu_ui",
] as const;

export type FeelEventId = (typeof FEEL_EVENTS)[number];
