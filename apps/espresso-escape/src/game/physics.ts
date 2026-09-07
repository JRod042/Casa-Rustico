export type Rect = { x: number; y: number; w: number; h: number };
export type HazardKind = "grinder" | "steam" | "portafilter";
export type Hazard = Rect & { id: number; kind: HazardKind; warned: boolean };
export type Bean = Rect & { id: number; taken: boolean };
export type World = { width: number; height: number; groundY: number };
export type Phase = 0 | 1 | 2 | 3;
export type CoachCue = "tap" | "tall" | "steam" | "bean" | null;
export type ScriptBeat = "tap" | "steam" | "bean" | "done";

export const PLAYER_W = 52;
export const PLAYER_H = 66;
export const PLAYER_INSET_X = 10;
export const PLAYER_INSET_Y = 12;
export const BEAN_W = 26;
export const BEAN_H = 32;
export const FEEL_QA_LOCKED = true;
export const CONTROL_FAIRNESS = true;
export const APPSTORE_CONTROLS_BRIEF = "2026-09-05-escape-appstore-controls-feel-hits";
export const JUMP_V = -820;
export const GRAVITY_UP = 1950;
export const GRAVITY_DOWN = 3400;
export const GRAVITY_HANG = 1550;
export const JUMP_AIR_S = 0.8;
export const MAX_FALL = 1100;
export const HEEL_MERCY_S = 0.1;
export const COYOTE_S = 0.13;
export const BUFFER_S = 0.15;
export const INTRO_EMPTY_S = 2.3;
export const TELEGRAPH_S = 0.62;
export const MAGNET_R = 56;
export const MAGNET_PULL = 260;
export const BASE_SPEED = 255;
export const MAX_SPEED = 370;
export const SPEED_RAMP_S = 90;
export const MAX_DT = 1 / 30;
export const MAX_HAZARDS = 6;
export const MAX_BEANS = 8;

export const GAP_S = {
  0: [1.55, 1.95],
  1: [1.18, 1.58],
  2: [0.96, 1.34],
  3: [0.8, 1.12],
};

export const KIND_CODE = {
  grinder: 0,
  portafilter: 1,
  steam: 2,
};

export * from "./physicsFns";
