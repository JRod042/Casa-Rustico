import type { ImageSourcePropType } from "react-native";

/**
 * In-repo Casa kraft pack (playable now).
 * Denser v2 box is HALTED (V2_HOLD) until Jorge says WIRE.
 * Extra plate names alias cafe-bg so a later overwrite is one commit.
 * See kraftMap.ts — do not treat v1 first pack as final.
 */
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
} as const;

export type KraftSprite = keyof typeof KRAFT_PACK;

export function kraftSource(name: KraftSprite): ImageSourcePropType {
  return KRAFT_PACK[name];
}
