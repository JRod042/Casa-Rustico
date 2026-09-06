import { Image, StyleSheet, View } from "react-native";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { kraftSource } from "./kraftAssets";
import type { HazardKind } from "./physics";

export type KitKind = HazardKind | "bean" | "player";

/**
 * Kraft sticker sprites. Creative PNGs win; paper-cut Views stay as
 * a readable silhouette if a drop is late.
 */
export function BeanArt({ tone = "roast" }: { tone?: "roast" | "honey" }) {
  return (
    <View style={[sprite.fill, sprite.sticker]}>
      <Image
        source={tone === "honey" ? kraftSource("bean") : kraftSource("runner")}
        style={sprite.img}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {tone === "honey" ? <View pointerEvents="none" style={sprite.honeyTint} /> : null}
    </View>
  );
}

export function HazardArt({ kind }: { kind: HazardKind }) {
  const src =
    kind === "steam"
      ? kraftSource("steam")
      : kind === "portafilter"
        ? kraftSource("portafilter")
        : kraftSource("grinder");
  return (
    <View style={[sprite.fill, sprite.sticker]}>
      {kind === "steam" ? <View pointerEvents="none" style={sprite.steamRim} /> : null}
      <Image
        source={src}
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
    <View style={[sprite.thumb, sprite.sticker, { width: w, height: h }]}>
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
  fill: { flex: 1, overflow: "hidden" },
  sticker: {
    backgroundColor: t.cream,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumb: {
    overflow: "hidden",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: t.kraftDeep,
  },
  img: {
    width: "100%",
    height: "100%",
  },
  honeyTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(164,124,89,0.2)",
  },
  steamRim: {
    ...StyleSheet.absoluteFill,
    margin: -2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(247,243,236,0.45)",
  },
});
