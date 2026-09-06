import type { ImageSourcePropType } from "react-native";

/**
 * In-repo Casa kraft pack (playable now).
 * USE_CRAFT_ART=false until Jorge says WIRE — no new Creative PNG require().
 * Denser v2 box is HALTED (V2_HOLD).
 */
export const USE_CRAFT_ART = false;

export const KRAFT_PACK = {
  runner: require("../../assets/kraft/runner.png"),
  grinder: require("../../assets/kraft/grinder.png"),
  portafilter: require("../../assets/kraft/portafilter.png"),
  steam: require("../../assets/kraft/steam.png"),
  bean: require("../../assets/kraft/bean.png"),
  cafeBg: require("../../assets/kraft/cafe-bg.png"),
  menuPanel: require("../../assets/kraft/menu-panel.png"),
  /** v2 plate aliases — same file until Jorge wires denser art. */
  farHighland: require("../../assets/kraft/cafe-bg.png"),
  canopyMist: require("../../assets/kraft/cafe-bg.png"),
  midCafe: require("../../assets/kraft/cafe-bg.png"),
  nearCounter: require("../../assets/kraft/cafe-bg.png"),
  windowLight: require("../../assets/kraft/cafe-bg.png"),
  groundStrip: require("../../assets/kraft/cafe-bg.png"),
  titleBg: require("../../assets/kraft/cafe-bg.png"),
  /** WIRE_KEYS plates 01–06 — same stand-in until Cacique WIRE paste. */
  plate01: require("../../assets/kraft/cafe-bg.png"),
  plate02: require("../../assets/kraft/cafe-bg.png"),
  plate03: require("../../assets/kraft/cafe-bg.png"),
  plate04: require("../../assets/kraft/cafe-bg.png"),
  plate05: require("../../assets/kraft/cafe-bg.png"),
  plate06: require("../../assets/kraft/cafe-bg.png"),
} as const;

export type KraftSprite = keyof typeof KRAFT_PACK;

export function kraftSource(name: KraftSprite): ImageSourcePropType {
  return KRAFT_PACK[name];
}
