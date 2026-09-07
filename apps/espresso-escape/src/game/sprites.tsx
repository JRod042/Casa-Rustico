import { Image, StyleSheet, View } from "react-native";
import { GAME_ATLAS } from "./gameAtlas";
import type { HazardKind } from "./physics";

export type KitKind = HazardKind | "bean" | "player";

function artForHazard(kind: HazardKind) {
  if (kind === "steam") return GAME_ATLAS.hazardSteam;
  if (kind === "portafilter") return GAME_ATLAS.hazardPortafilter;
  if (kind === "knockbox") return GAME_ATLAS.hazardKnockbox;
  if (kind === "tamper") return GAME_ATLAS.hazardTamper;
  if (kind === "cup") return GAME_ATLAS.hazardCupStack;
  return GAME_ATLAS.hazardGrinder;
}

/** Charm cutouts — no cream card, no fringe mat. */
export function BeanArt({
  tone = "roast",
  pose = "run",
}: {
  tone?: "roast" | "honey";
  pose?: "run" | "hop";
}) {
  const src =
    tone === "honey"
      ? GAME_ATLAS.honeyBean
      : pose === "hop"
        ? GAME_ATLAS.runnerHop
        : GAME_ATLAS.runner01;
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
      : kind === "bean" || kind === "player"
        ? Math.round(size * 0.86)
        : size;
  const h = size;
  return (
    <View style={[sprite.thumb, { width: w, height: h }]}>
      {kind === "bean" ? (
        <BeanArt tone="honey" />
      ) : kind === "player" ? (
        <BeanArt tone="roast" />
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
