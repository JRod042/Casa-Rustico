/**
 * FUTURE denser v2 filename map — hooks / prep only.
 *
 * HARD STOP: do not copy or commit Creative binaries from
 * `/workspace/casa-brand/exports/escape-kraft/game/` (v1 first pack
 * or later) until Jorge explicitly says WIRE on **denser v2**.
 *
 * Jorge skipped v1 review. v1 is not final. A later drop-in overwrites
 * the live `require()` files in this table (one commit, no loader rewrite).
 */
export const V2_HOLD = true;
export const KRAFT_PACK_TARGET = "denser-v2";
/** Cacique: INVENTORY.md is STALE. Creative still finishing 6 parallax plates. */
export const INVENTORY_STALE = true;
/** Research lane — sackcloth / cardboard / scrapbook / parallax. No Sackboy IP. */
export const CRAFT_TECHNIQUE_BRIEF = "2026-09-05-escape-lbp-craft-technique";
export const UNIFIED_PLAYBOOK = "2026-09-05-escape-unified-revision-playbook";

export const CREATIVE_BOX = "/workspace/casa-brand/exports/escape-kraft/game";

/** Live Metro files. Distinct v2 plates still alias cafe-bg until WIRE. */
export const KRAFT_DROPIN: readonly {
  from: string;
  to: string;
  role: string;
}[] = [
  { from: "sprites/runner-01.png", to: "runner.png", role: "player frame 1" },
  { from: "sprites/runner-02.png", to: "runner.png", role: "player frame 2 (until frames split)" },
  { from: "sprites/runner-03.png", to: "runner.png", role: "player frame 3" },
  { from: "sprites/runner-04.png", to: "runner.png", role: "player frame 4" },
  { from: "sprites/runner-05.png", to: "runner.png", role: "player frame 5 (denser v2)" },
  { from: "sprites/runner-06.png", to: "runner.png", role: "player frame 6 (denser v2)" },
  { from: "sprites/hazard-grinder.png", to: "grinder.png", role: "low kit" },
  { from: "sprites/hazard-portafilter.png", to: "portafilter.png", role: "tall kit" },
  { from: "sprites/hazard-steam.png", to: "steam.png", role: "stay-low steam" },
  { from: "sprites/pickup-honey-bean.png", to: "bean.png", role: "honey bean" },
  { from: "ui/menu-panel.png", to: "menu-panel.png", role: "scrapbook chrome" },
  { from: "ui/title-bg.png", to: "cafe-bg.png", role: "title paper (until split)" },
  { from: "ui/wordmark-espresso-escape.png", to: "menu-panel.png", role: "wordmark overlay later" },
  { from: "ui/panel-game-over.png", to: "menu-panel.png", role: "roast sheet later" },
  { from: "ui/panel-best-run.png", to: "menu-panel.png", role: "best-run sheet later" },
  { from: "world/far-highland.png", to: "cafe-bg.png", role: "far highland plate (denser v2)" },
  { from: "world/scroll-backdrop.png", to: "cafe-bg.png", role: "far scroll plate" },
  { from: "world/canopy-mist.png", to: "cafe-bg.png", role: "canopy / mist plate (denser v2)" },
  { from: "world/kraft-cafe-backdrop.png", to: "cafe-bg.png", role: "mid café plate" },
  { from: "world/mid-cafe.png", to: "cafe-bg.png", role: "mid café (denser v2 alias)" },
  { from: "world/near-counter.png", to: "cafe-bg.png", role: "near counter plate (denser v2)" },
  { from: "world/window-light.png", to: "cafe-bg.png", role: "window / soft light (denser v2)" },
  { from: "world/ground-strip.png", to: "cafe-bg.png", role: "ground plate later" },
] as const;
