import type { ImageSourcePropType } from "react-native";

/**
 * In-repo Casa kraft pack (playable now).
 * Creative box `/workspace/casa-brand/exports/escape-kraft/game/` is
 * HALTED until Jorge says WIRE — then `npm run sync:kraft` with
 * ESCAPE_WIRE_KRAFT=1. See assets/kraft/README.md.
 */
export const KRAFT_PACK = {
  runner: require("../../assets/kraft/runner.png"),
  grinder: require("../../assets/kraft/grinder.png"),
  portafilter: require("../../assets/kraft/portafilter.png"),
  steam: require("../../assets/kraft/steam.png"),
  bean: require("../../assets/kraft/bean.png"),
  cafeBg: require("../../assets/kraft/cafe-bg.png"),
  menuPanel: require("../../assets/kraft/menu-panel.png"),
} as const;

export type KraftSprite = keyof typeof KRAFT_PACK;

export function kraftSource(name: KraftSprite): ImageSourcePropType {
  return KRAFT_PACK[name];
}
