import { StyleSheet, View } from "react-native";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import type { HazardKind } from "./physics";

/** Oval bean with a crease — readable as coffee, not a placeholder square. */
export function BeanArt() {
  return (
    <View style={sprite.beanFill}>
      <View style={sprite.beanCrease} />
    </View>
  );
}

/** Café-floor hazards: hopper grinder, steam puffs, portafilter basket. */
export function HazardArt({ kind }: { kind: HazardKind }) {
  if (kind === "steam") {
    return (
      <View style={sprite.fill}>
        <View style={[sprite.puff, sprite.puffTop]} />
        <View style={[sprite.puff, sprite.puffMid]} />
        <View style={[sprite.puff, sprite.puffLow]} />
      </View>
    );
  }
  if (kind === "portafilter") {
    return (
      <View style={sprite.fill}>
        <View style={sprite.portaHead} />
        <View style={sprite.portaNeck} />
        <View style={sprite.portaHandle} />
      </View>
    );
  }
  return (
    <View style={sprite.fill}>
      <View style={sprite.hopper} />
      <View style={sprite.grinderBody} />
      <View style={sprite.grinderDial} />
    </View>
  );
}

const sprite = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  beanFill: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: t.glow,
    overflow: "hidden",
  },
  beanCrease: {
    position: "absolute",
    left: "42%",
    top: "14%",
    width: 3,
    height: "72%",
    borderRadius: 2,
    backgroundColor: t.accent,
    opacity: 0.5,
  },
  puff: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#E8D4BE",
  },
  puffTop: {
    left: "18%",
    top: "6%",
    width: "64%",
    height: "28%",
    opacity: 0.95,
  },
  puffMid: {
    left: "8%",
    top: "36%",
    width: "84%",
    height: "30%",
    backgroundColor: "#D4B89A",
    opacity: 0.85,
  },
  puffLow: {
    left: "22%",
    top: "68%",
    width: "56%",
    height: "24%",
    backgroundColor: t.brand,
    opacity: 0.7,
  },
  portaHead: {
    position: "absolute",
    left: "6%",
    top: "4%",
    width: "88%",
    height: "34%",
    borderRadius: 7,
    backgroundColor: "#2A1810",
  },
  portaNeck: {
    position: "absolute",
    left: "30%",
    top: "34%",
    width: "40%",
    height: "22%",
    backgroundColor: t.kraft,
  },
  portaHandle: {
    position: "absolute",
    left: "22%",
    top: "52%",
    width: "56%",
    height: "42%",
    borderRadius: 6,
    backgroundColor: t.brand,
  },
  hopper: {
    position: "absolute",
    left: "26%",
    top: "2%",
    width: "48%",
    height: "30%",
    borderRadius: 4,
    backgroundColor: "#3A2418",
  },
  grinderBody: {
    position: "absolute",
    left: "8%",
    top: "28%",
    width: "84%",
    height: "66%",
    borderRadius: 8,
    backgroundColor: t.danger,
  },
  grinderDial: {
    position: "absolute",
    left: "38%",
    top: "48%",
    width: "24%",
    height: "18%",
    borderRadius: 999,
    backgroundColor: t.glow,
    opacity: 0.85,
  },
});
