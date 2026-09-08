/**
 * Kit-eval PRIMARY: @shopify/react-native-skia + Reanimated 2.5D.
 * Briefs: `2026-09-05-escape-pro-kit-eval` and
 * `2026-09-05-escape-pro-stack-kits-physics` (ops files may be off-box).
 *
 * Time-box (2026-09-06): KEEP_PRIMARY. No mid-iPhone sample on this Linux
 * VM, so fps is unmeasured — not a <55 kill. One Skia canvas is the
 * cheaper path vs seven Image Views. Flip SKIA_FPS_KILL only after a
 * Casa TestFlight run shows sustained fps below 55; Views stay wired.
 */
export const PRO_KIT_EVAL = "2026-09-05-escape-pro-kit-eval";
export const PRO_STACK_KITS = "2026-09-05-escape-pro-stack-kits-physics";

export const SKIA_PRIMARY = true;
export const SKIA_FPS_KILL = false;
export const SKIA_KILL_REASON = "";
export const SKIA_TIMEBOX = {
  date: "2026-09-06",
  decision: "KEEP_PRIMARY",
  killThresholdFps: 55,
  measuredFps: null,
  rationale:
    "Linux build VM cannot run iPhone TestFlight. Skia PRIMARY stays; CafeStageViews is the fallback if a later device run holds under 55 fps.",
} as const;
