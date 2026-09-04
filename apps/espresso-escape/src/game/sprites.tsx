import { StyleSheet, View } from "react-native";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import type { HazardKind } from "./physics";

export type KitKind = HazardKind | "bean" | "player";

/** Oval bean — roast for the runner, honey for pickups. */
export function BeanArt({ tone = "roast" }: { tone?: "roast" | "honey" }) {
  const fill = tone === "honey" ? t.glow : t.roast;
  const crease = tone === "honey" ? t.accent : "#3A2418";
  const sheen = tone === "honey" ? "#FFF1C2" : t.glow;
  return (
    <View style={[sprite.beanFill, { backgroundColor: fill }]}>
      <View style={[sprite.beanSheen, { backgroundColor: sheen }]} />
      <View style={[sprite.beanCrease, { backgroundColor: crease }]} />
    </View>
  );
}

/** Café-floor kits: hopper grinder, steam wand, portafilter. */
export function HazardArt({ kind }: { kind: HazardKind }) {
  if (kind === "steam") {
    return (
      <View style={sprite.fill}>
        <View style={sprite.wand} />
        <View style={[sprite.puff, sprite.puffTop]} />
        <View style={[sprite.puff, sprite.puffMid]} />
        <View style={[sprite.puff, sprite.puffLow]} />
      </View>
    );
  }
  if (kind === "portafilter") {
    return (
      <View style={sprite.fill}>
        <View style={sprite.portaRim} />
        <View style={sprite.portaBasket} />
        <View style={sprite.portaSpoutL} />
        <View style={sprite.portaSpoutR} />
        <View style={sprite.portaNeck} />
        <View style={sprite.portaHandle} />
        <View style={sprite.portaPommel} />
      </View>
    );
  }
  return (
    <View style={sprite.fill}>
      <View style={sprite.hopper} />
      <View style={sprite.hopperLip} />
      <View style={sprite.collar} />
      <View style={sprite.grinderBody} />
      <View style={sprite.grinderBand} />
      <View style={sprite.grinderDial} />
      <View style={sprite.chute} />
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
  const w = tall ? Math.round(size * 0.52) : kind === "bean" || kind === "player" ? Math.round(size * 0.72) : size;
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
  thumb: {
    overflow: "hidden",
    alignSelf: "center",
  },
  beanFill: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  beanSheen: {
    position: "absolute",
    left: "14%",
    top: "16%",
    width: "28%",
    height: "42%",
    borderRadius: 999,
    opacity: 0.45,
  },
  beanCrease: {
    position: "absolute",
    left: "44%",
    top: "14%",
    width: 3,
    height: "72%",
    borderRadius: 2,
    opacity: 0.55,
  },
  wand: {
    position: "absolute",
    left: "8%",
    top: "4%",
    width: "22%",
    height: "92%",
    borderRadius: 3,
    backgroundColor: t.linenDim,
  },
  puff: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: t.linen,
  },
  puffTop: {
    left: "28%",
    top: "6%",
    width: "62%",
    height: "24%",
    opacity: 0.92,
  },
  puffMid: {
    left: "22%",
    top: "34%",
    width: "74%",
    height: "28%",
    backgroundColor: t.linenDim,
    opacity: 0.88,
  },
  puffLow: {
    left: "34%",
    top: "66%",
    width: "54%",
    height: "22%",
    backgroundColor: t.brand,
    opacity: 0.75,
  },
  portaRim: {
    position: "absolute",
    left: "4%",
    top: "2%",
    width: "92%",
    height: "16%",
    borderRadius: 7,
    backgroundColor: t.glow,
  },
  portaBasket: {
    position: "absolute",
    left: "10%",
    top: "8%",
    width: "80%",
    height: "18%",
    borderRadius: 6,
    backgroundColor: t.espresso,
  },
  portaSpoutL: {
    position: "absolute",
    left: "28%",
    top: "24%",
    width: "14%",
    height: "10%",
    borderRadius: 2,
    backgroundColor: t.metal,
  },
  portaSpoutR: {
    position: "absolute",
    right: "28%",
    top: "24%",
    width: "14%",
    height: "10%",
    borderRadius: 2,
    backgroundColor: t.metal,
  },
  portaNeck: {
    position: "absolute",
    left: "32%",
    top: "32%",
    width: "36%",
    height: "14%",
    backgroundColor: t.kraft,
  },
  portaHandle: {
    position: "absolute",
    left: "24%",
    top: "44%",
    width: "52%",
    height: "42%",
    borderRadius: 7,
    backgroundColor: t.wood,
  },
  portaPommel: {
    position: "absolute",
    left: "28%",
    top: "82%",
    width: "44%",
    height: "14%",
    borderRadius: 8,
    backgroundColor: t.kraftDeep,
  },
  hopper: {
    position: "absolute",
    left: "24%",
    top: "2%",
    width: "52%",
    height: "26%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: t.espresso,
  },
  hopperLip: {
    position: "absolute",
    left: "20%",
    top: "2%",
    width: "60%",
    height: "8%",
    borderRadius: 3,
    backgroundColor: t.metal,
  },
  collar: {
    position: "absolute",
    left: "16%",
    top: "26%",
    width: "68%",
    height: "10%",
    borderRadius: 3,
    backgroundColor: t.glow,
  },
  grinderBody: {
    position: "absolute",
    left: "10%",
    top: "34%",
    width: "80%",
    height: "48%",
    borderRadius: 8,
    backgroundColor: t.danger,
  },
  grinderBand: {
    position: "absolute",
    left: "10%",
    top: "52%",
    width: "80%",
    height: "8%",
    backgroundColor: t.kraftDeep,
  },
  grinderDial: {
    position: "absolute",
    left: "38%",
    top: "40%",
    width: "24%",
    height: "16%",
    borderRadius: 999,
    backgroundColor: t.glow,
  },
  chute: {
    position: "absolute",
    left: "34%",
    top: "80%",
    width: "32%",
    height: "16%",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: t.metal,
  },
});
