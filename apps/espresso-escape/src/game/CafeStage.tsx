import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { KitThumb } from "./sprites";

/** Linen floor, kraft counter, espresso wall — the café line behind the run. */
export function CafeStage({
  width,
  height,
  groundY,
}: {
  width: number;
  height: number;
  groundY: number;
}) {
  const floorH = Math.max(80, height - groundY);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[t.wood, t.bg, t.espressoDeep]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.shelf, { top: groundY * 0.22 }]}>
        <KitThumb kind="grinder" size={28} />
        <KitThumb kind="portafilter" size={28} />
        <KitThumb kind="steam" size={28} />
        <KitThumb kind="bean" size={22} />
      </View>
      <View style={[styles.shelfRail, { top: groundY * 0.22 + 30, width }]} />
      <View style={[styles.backsplash, { top: groundY - 36, height: 36 }]} />
      <View style={[styles.counter, { top: groundY - 10 }]} />
      <View style={[styles.counterLip, { top: groundY - 2 }]} />
      <LinearGradient
        colors={[t.linenDim, "#D8C4A4", t.wood]}
        locations={[0, 0.35, 1]}
        style={[styles.floor, { top: groundY, height: floorH }]}
      />
      <View style={[styles.plank, { top: groundY + floorH * 0.28 }]} />
      <View style={[styles.plank, { top: groundY + floorH * 0.55, opacity: 0.45 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    position: "absolute",
    left: 28,
    right: 28,
    height: 32,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    opacity: 0.38,
  },
  shelfRail: {
    position: "absolute",
    left: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: t.kraft,
    opacity: 0.55,
  },
  backsplash: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: t.espresso,
    opacity: 0.55,
    borderTopWidth: 1,
    borderTopColor: t.line,
  },
  counter: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: t.kraftDeep,
  },
  counterLip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: t.glow,
    opacity: 0.55,
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  plank: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: t.kraftDeep,
    opacity: 0.28,
  },
});
