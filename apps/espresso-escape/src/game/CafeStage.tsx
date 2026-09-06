import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { escapeWelcomeTheme as t } from "../welcome/theme";

const SLAT = 56;

/** Kraft counter, cream linen, highlands mist — café line without tourist clutter. */
export function CafeStage({
  width,
  height,
  groundY,
  scroll,
}: {
  width: number;
  height: number;
  groundY: number;
  scroll: SharedValue<number>;
}) {
  const floorH = Math.max(80, height - groundY);
  const slatStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -((scroll.value % SLAT) + SLAT) }],
  }));
  const mistFar = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.12) % 180) + 40) }],
  }));
  const mistNear = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.22) % 160) + 20) }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[t.wood, t.bg, t.espressoDeep]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.mistBand,
          { top: groundY * 0.1, width: width + 220, opacity: 0.14 },
          mistFar,
        ]}
      />
      <Animated.View
        style={[
          styles.mistBand,
          {
            top: groundY * 0.26,
            width: width + 180,
            height: 36,
            opacity: 0.1,
          },
          mistNear,
        ]}
      />
      <View style={[styles.shelfRail, { top: groundY * 0.22 + 30, width }]} />
      <View style={[styles.backsplash, { top: groundY - 36, height: 36 }]} />
      <View style={[styles.counter, { top: groundY - 10 }]} />
      <View style={[styles.counterLip, { top: groundY - 2 }]} />
      <LinearGradient
        colors={[t.linen, "#E4D2B8", t.kraftDeep]}
        locations={[0, 0.38, 1]}
        style={[styles.floor, { top: groundY, height: floorH }]}
      />
      <Animated.View
        style={[
          styles.slatRow,
          { top: groundY + 10, width: width + SLAT * 4 },
          slatStyle,
        ]}
      >
        {Array.from({ length: 18 }, (_, i) => (
          <View key={`s${i}`} style={styles.slat} />
        ))}
      </Animated.View>
      <View style={[styles.plank, { top: groundY + floorH * 0.28 }]} />
      <View style={[styles.plank, { top: groundY + floorH * 0.55, opacity: 0.45 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mistBand: {
    position: "absolute",
    left: -40,
    height: 48,
    borderRadius: 999,
    backgroundColor: t.linen,
  },
  shelfRail: {
    position: "absolute",
    left: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: t.kraft,
    opacity: 0.35,
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
    height: 3,
    backgroundColor: t.kraft,
    opacity: 0.85,
  },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  slatRow: {
    position: "absolute",
    left: 0,
    height: 8,
    flexDirection: "row",
    gap: 40,
  },
  slat: {
    width: 16,
    height: 8,
    borderRadius: 2,
    backgroundColor: t.kraftDeep,
    opacity: 0.28,
  },
  plank: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: t.kraftDeep,
    opacity: 0.22,
  },
});
