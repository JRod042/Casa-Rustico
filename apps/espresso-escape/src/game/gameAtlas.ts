import type { ImageSourcePropType } from "react-native";

/**
 * assets/game/** require() atlas — Cacique GO.
 * Charm runner-01..04 + hop/land/death. Not tiny-eye. Not hazard-04/05/06.
 * Preview craft pack: crema bubbles, highland plants, cork/cardboard/shelf.
 */
export const USE_CRAFT_ART = true;
export const CHARM_RUNNER_PREFERRED = true;

export const GAME_ATLAS_PATHS = {
  runner01: "assets/game/sprites/runner-01.png",
  runner02: "assets/game/sprites/runner-02.png",
  runner03: "assets/game/sprites/runner-03.png",
  runner04: "assets/game/sprites/runner-04.png",
  runnerHop: "assets/game/sprites/runner-hop.png",
  runnerHop01: "assets/game/sprites/runner-hop-01.png",
  runnerHop02: "assets/game/sprites/runner-hop-02.png",
  runnerHop03: "assets/game/sprites/runner-hop-03.png",
  runnerHop04: "assets/game/sprites/runner-hop-04.png",
  runnerLand: "assets/game/sprites/runner-land.png",
  runnerDeath: "assets/game/sprites/runner-death.png",
  hazardCupStack: "assets/game/sprites/hazard-cup-stack.png",
  hazardGrinder: "assets/game/sprites/hazard-grinder.png",
  hazardKnockbox: "assets/game/sprites/hazard-knockbox.png",
  hazardPortafilter: "assets/game/sprites/hazard-portafilter.png",
  hazardSteam: "assets/game/sprites/hazard-steam.png",
  hazardTamper: "assets/game/sprites/hazard-tamper.png",
  honeyBean: "assets/game/sprites/pickup-honey-bean.png",
  bubble: "assets/game/sprites/bubble.png",
  prizeBubble: "assets/game/sprites/prize-bubble.png",
  coffeeTree: "assets/game/scenery/coffee-tree.png",
  palm: "assets/game/scenery/palm.png",
  banana: "assets/game/scenery/banana.png",
  coconuts: "assets/game/scenery/coconuts.png",
  cork: "assets/game/world/cork.jpg",
  cardboard: "assets/game/world/cardboard.jpg",
  shelf: "assets/game/world/shelf.jpg",
  parallax03: "assets/game/world/parallax-03.png",
} as const;

export const GAME_ATLAS: Record<keyof typeof GAME_ATLAS_PATHS, ImageSourcePropType> = {
  runner01: require("../../assets/game/sprites/runner-01.png"),
  runner02: require("../../assets/game/sprites/runner-02.png"),
  runner03: require("../../assets/game/sprites/runner-03.png"),
  runner04: require("../../assets/game/sprites/runner-04.png"),
  runnerHop: require("../../assets/game/sprites/runner-hop.png"),
  runnerHop01: require("../../assets/game/sprites/runner-hop-01.png"),
  runnerHop02: require("../../assets/game/sprites/runner-hop-02.png"),
  runnerHop03: require("../../assets/game/sprites/runner-hop-03.png"),
  runnerHop04: require("../../assets/game/sprites/runner-hop-04.png"),
  runnerLand: require("../../assets/game/sprites/runner-land.png"),
  runnerDeath: require("../../assets/game/sprites/runner-death.png"),
  hazardCupStack: require("../../assets/game/sprites/hazard-cup-stack.png"),
  hazardGrinder: require("../../assets/game/sprites/hazard-grinder.png"),
  hazardKnockbox: require("../../assets/game/sprites/hazard-knockbox.png"),
  hazardPortafilter: require("../../assets/game/sprites/hazard-portafilter.png"),
  hazardSteam: require("../../assets/game/sprites/hazard-steam.png"),
  hazardTamper: require("../../assets/game/sprites/hazard-tamper.png"),
  honeyBean: require("../../assets/game/sprites/pickup-honey-bean.png"),
  bubble: require("../../assets/game/sprites/bubble.png"),
  prizeBubble: require("../../assets/game/sprites/prize-bubble.png"),
  coffeeTree: require("../../assets/game/scenery/coffee-tree.png"),
  palm: require("../../assets/game/scenery/palm.png"),
  banana: require("../../assets/game/scenery/banana.png"),
  coconuts: require("../../assets/game/scenery/coconuts.png"),
  cork: require("../../assets/game/world/cork.jpg"),
  cardboard: require("../../assets/game/world/cardboard.jpg"),
  shelf: require("../../assets/game/world/shelf.jpg"),
  parallax03: require("../../assets/game/world/parallax-03.png"),
};
