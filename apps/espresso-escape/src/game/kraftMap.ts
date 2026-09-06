/**
 * Creative v2 filename map — hooks only.
 * HALTED: do not copy `/workspace/casa-brand/exports/escape-kraft/game/`
 * until Jorge says WIRE. Later drop-in overwrites the live pack files
 * in this table (one commit, no loader rewrite).
 */
export const CREATIVE_BOX = "/workspace/casa-brand/exports/escape-kraft/game";

export const KRAFT_DROPIN: readonly {
  from: string;
  to: string;
  role: string;
}[] = [
  { from: "sprites/runner-01.png", to: "runner.png", role: "player frame 1" },
  { from: "sprites/runner-02.png", to: "runner.png", role: "player frame 2 (same file until frames land)" },
  { from: "sprites/runner-03.png", to: "runner.png", role: "player frame 3" },
  { from: "sprites/runner-04.png", to: "runner.png", role: "player frame 4" },
  { from: "sprites/hazard-grinder.png", to: "grinder.png", role: "low kit" },
  { from: "sprites/hazard-portafilter.png", to: "portafilter.png", role: "tall kit" },
  { from: "sprites/hazard-steam.png", to: "steam.png", role: "stay-low steam" },
  { from: "sprites/pickup-honey-bean.png", to: "bean.png", role: "honey bean" },
  { from: "ui/menu-panel.png", to: "menu-panel.png", role: "menu chrome" },
  { from: "ui/title-bg.png", to: "cafe-bg.png", role: "title / far plate (until world plates split)" },
  { from: "ui/wordmark-espresso-escape.png", to: "menu-panel.png", role: "wordmark overlay later" },
  { from: "ui/panel-game-over.png", to: "menu-panel.png", role: "roast sheet later" },
  { from: "ui/panel-best-run.png", to: "menu-panel.png", role: "best-run sheet later" },
  { from: "world/kraft-cafe-backdrop.png", to: "cafe-bg.png", role: "mid café plate" },
  { from: "world/scroll-backdrop.png", to: "cafe-bg.png", role: "far highland plate" },
  { from: "world/ground-strip.png", to: "cafe-bg.png", role: "ground plate later" },
] as const;
