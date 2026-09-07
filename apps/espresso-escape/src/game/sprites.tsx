import { Image, StyleSheet, View } from "react-native";
import { kraftSource } from "./kraftAssets";
import type { HazardKind } from "./physics";

export type KitKind = HazardKind | "bean" | "player";

/** Craft cutouts. Cream sticker fills read as white boxes on device. */
export function BeanArt({ tone = "roast" }: { tone?: "roast" | "honey" }) {
  return (
    <View style={[sprite.fill, sprite.cutout]}>
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
    <View style={[sprite.fill, sprite.cutout]}>
      <Image
        source={src}
        style={sprite.img}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

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
  fill: { flex: 1, overflow: "hidden" },
  cutout: {
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  thumb: {
    overflow: "hidden",
    alignSelf: "center",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  honeyTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(164,124,89,0.2)",
  },
});
