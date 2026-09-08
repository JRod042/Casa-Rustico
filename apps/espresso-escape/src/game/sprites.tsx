import { Image, StyleSheet, View } from "react-native";
import { GAME_ATLAS } from "./gameAtlas";
import type { HazardKind, SceneryKind } from "./physics";

export type KitKind = HazardKind | "bean" | "player" | "bubble";

function artForHazard(kind: HazardKind) {
  if (kind === "steam") return GAME_ATLAS.hazardSteam;
  if (kind === "portafilter") return GAME_ATLAS.hazardPortafilter;
  if (kind === "knockbox") return GAME_ATLAS.hazardKnockbox;
  if (kind === "tamper") return GAME_ATLAS.hazardTamper;
  if (kind === "cup") return GAME_ATLAS.hazardCupStack;
  return GAME_ATLAS.hazardGrinder;
}

const RUN = [GAME_ATLAS.runner01, GAME_ATLAS.runner02, GAME_ATLAS.runner03, GAME_ATLAS.runner04];
const HOP = [GAME_ATLAS.runnerHop01, GAME_ATLAS.runnerHop02, GAME_ATLAS.runnerHop03, GAME_ATLAS.runnerHop04];

/** Charm cutouts — no cream card, no fringe mat. */
export function BeanArt({
  tone = "roast",
  pose = "run",
  frame = 0,
}: {
  tone?: "roast" | "honey";
  pose?: "run" | "hop";
  frame?: number;
}) {
  const src =
    tone === "honey"
      ? GAME_ATLAS.honeyBean
      : pose === "hop"
        ? HOP[frame] ?? GAME_ATLAS.runnerHop
        : RUN[frame] ?? GAME_ATLAS.runner01;
  return (
    <View style={sprite.fill}>
      <Image
        source={src}
        style={sprite.img}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export function HazardArt({ kind }: { kind: HazardKind }) {
  return (
    <View style={sprite.fill}>
      <Image
        source={artForHazard(kind)}
        style={sprite.img}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export function BubbleArt({ prize = false }: { prize?: boolean }) {
  return (
    <View style={sprite.fill}>
      <Image
        source={prize ? GAME_ATLAS.prizeBubble : GAME_ATLAS.bubble}
        style={sprite.img}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export function SceneryArt({ kind }: { kind: SceneryKind }) {
  const src =
    kind === "palm"
      ? GAME_ATLAS.palm
      : kind === "banana"
        ? GAME_ATLAS.banana
        : kind === "coconuts"
          ? GAME_ATLAS.coconuts
          : kind === "flamboyan"
            ? GAME_ATLAS.flamboyan
            : kind === "plantain"
              ? GAME_ATLAS.plantain
              : kind === "pineapple"
                ? GAME_ATLAS.pineapple
                : kind === "cacao"
                  ? GAME_ATLAS.cacao
                  : kind === "dryingBed"
                    ? GAME_ATLAS.dryingBed
                    : kind === "tinaja"
                      ? GAME_ATLAS.tinaja
                      : GAME_ATLAS.coffeeTree;
  return (
    <View style={sprite.fill}>
      <Image source={src} style={sprite.img} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

/** Fixed-size kit for how-to, welcome, and HUD legends. */
export function KitThumb({
  kind,
  size = 44,
}: {
  kind: KitKind;
  size?: number;
}) {
  const tall = kind === "portafilter" || kind === "steam";
  const w =
    tall
      ? Math.round(size * 0.72)
      : kind === "bean" || kind === "player" || kind === "bubble"
        ? Math.round(size * 0.86)
        : size;
  const h = size;
  return (
    <View style={[sprite.thumb, { width: w, height: h }]}>
      {kind === "bean" ? (
        <BeanArt tone="honey" />
      ) : kind === "player" ? (
        <BeanArt tone="roast" />
      ) : kind === "bubble" ? (
        <BubbleArt />
      ) : (
        <HazardArt kind={kind} />
      )}
    </View>
  );
}

const sprite = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden", backgroundColor: "transparent" },
  thumb: {
    overflow: "hidden",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  img: {
    width: "100%",
    height: "100%",
  },
});
