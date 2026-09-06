import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { kraftSource } from "./kraftAssets";

const SLAT = 56;
const DUST = [
  { left: 0.1, top: 0.16, s: 3, d: 0.07 },
  { left: 0.24, top: 0.3, s: 2, d: 0.11 },
  { left: 0.4, top: 0.12, s: 3, d: 0.09 },
  { left: 0.58, top: 0.24, s: 2, d: 0.13 },
  { left: 0.74, top: 0.18, s: 3, d: 0.08 },
  { left: 0.88, top: 0.34, s: 2, d: 0.1 },
  { left: 0.16, top: 0.44, s: 2, d: 0.09 },
  { left: 0.67, top: 0.4, s: 3, d: 0.07 },
];

/**
 * Six-plate highland café diorama.
 * Depth language only (layered paper, not a jungle reskin).
 * v2 world plates hook the same cafe-bg until Jorge wires Creative.
 */
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
  const reduce = useReducedMotion();
  const life = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      life.value = 0.5;
      return;
    }
    life.value = withRepeat(
      withTiming(1, { duration: 7200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [life, reduce]);

  const farSky = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.035) % width)) }],
  }));
  const highland = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.08) % width)) }],
  }));
  const cafeMid = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.16) % width)) }],
  }));
  const shelfNear = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.3) % width)) }],
  }));
  const mistStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.22) % 180) + 24) }],
  }));
  const groundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -((scroll.value % SLAT) + SLAT) }],
  }));
  const nearSlat = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 1.12) % SLAT) + SLAT) }],
  }));
  const lightStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + life.value * 0.12,
  }));
  const steamA = useAnimatedStyle(() => ({
    opacity: 0.14 + life.value * 0.18,
    transform: [{ translateY: -8 * life.value }, { translateX: 10 * life.value }, { scale: 1 + life.value * 0.08 }],
  }));
  const steamB = useAnimatedStyle(() => ({
    opacity: 0.1 + (1 - life.value) * 0.16,
    transform: [{ translateY: -12 * (1 - life.value) }, { translateX: -8 * life.value }],
  }));
  const steamC = useAnimatedStyle(() => ({
    opacity: 0.08 + life.value * 0.1,
    transform: [{ translateY: -5 * life.value }, { translateX: 4 * (1 - life.value) }],
  }));
  const propFar = useAnimatedStyle(() => ({
    transform: [
      { translateX: -((scroll.value * 0.3) % 40) },
      { translateY: -2 * life.value },
      { rotate: `${-1.4 + life.value * 0.8}deg` },
    ],
  }));
  const propNear = useAnimatedStyle(() => ({
    transform: [
      { translateX: -((scroll.value * 0.42) % 28) },
      { translateY: -4 * life.value },
    ],
  }));
  const dustStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -18 * life.value }, { translateX: 12 * life.value }],
    opacity: 0.16 + life.value * 0.22,
  }));

  const bg = kraftSource("cafeBg");

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="escape-diorama">
      <LinearGradient
        colors={[t.wood, t.bg, t.espressoDeep]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.plane, { top: 0, height: groundY, width: width * 2, opacity: 0.42 }, farSky]}>
        <Image source={bg} style={{ width, height: groundY }} resizeMode="cover" />
        <Image source={bg} style={{ width, height: groundY }} resizeMode="cover" />
      </Animated.View>
      <View style={[styles.haze, { height: groundY * 0.45, backgroundColor: "rgba(26,18,11,0.28)" }]} />

      <Animated.View
        style={[styles.plane, { top: groundY * 0.06, height: groundY * 0.78, width: width * 2, opacity: 0.5 }, highland]}
      >
        <Image source={bg} style={{ width, height: groundY * 0.78 }} resizeMode="cover" />
        <Image source={bg} style={{ width, height: groundY * 0.78 }} resizeMode="cover" />
      </Animated.View>
      <View style={[styles.haze, { top: groundY * 0.2, height: 36, backgroundColor: "rgba(247,243,236,0.08)" }]} />

      <Animated.View
        style={[styles.plane, { top: groundY * 0.14, height: groundY * 0.7, width: width * 2, opacity: 0.62 }, cafeMid]}
      >
        <Image source={bg} style={{ width, height: groundY * 0.7 }} resizeMode="cover" />
        <Image source={bg} style={{ width, height: groundY * 0.7 }} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[styles.lightShift, { height: groundY }, lightStyle]} />

      <Animated.View style={[styles.steam, { top: groundY * 0.2, left: width * 0.64, width: 78, height: 58 }, steamA]} />
      <Animated.View style={[styles.steam, { top: groundY * 0.14, left: width * 0.16, width: 56, height: 42 }, steamB]} />
      <Animated.View style={[styles.steam, { top: groundY * 0.28, left: width * 0.42, width: 40, height: 30 }, steamC]} />

      <Animated.View style={[StyleSheet.absoluteFill, dustStyle]}>
        {DUST.map((d, i) => (
          <View
            key={`d${i}`}
            style={[
              styles.mote,
              {
                left: width * d.left,
                top: groundY * d.top,
                width: d.s,
                height: d.s,
                opacity: d.d + 0.12,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.prop, { top: groundY * 0.36, left: 14 }, propFar]}>
        <View style={styles.sack} />
        <View style={styles.cup} />
      </Animated.View>
      <Animated.View style={[styles.prop, { top: groundY * 0.4, right: 18, left: undefined }, propNear]}>
        <View style={[styles.sack, { width: 26, height: 32, backgroundColor: t.kraftDeep }]} />
      </Animated.View>

      <Animated.View style={[styles.mistBand, { top: groundY * 0.1, width: width + 240 }, mistStyle]} />
      <Animated.View
        style={[styles.plane, { top: groundY * 0.48, height: groundY * 0.28, width: width * 2, opacity: 0.28 }, shelfNear]}
      >
        <Image source={bg} style={{ width, height: groundY * 0.28 }} resizeMode="cover" />
        <Image source={bg} style={{ width, height: groundY * 0.28 }} resizeMode="cover" />
      </Animated.View>

      <View style={[styles.shelfRail, { top: groundY * 0.22 + 30, width }]} />
      <View style={[styles.backsplash, { top: groundY - 40, height: 40 }]} />
      <View style={[styles.counter, { top: groundY - 14 }]} />
      <View style={[styles.counterLip, { top: groundY - 4 }]} />

      <LinearGradient
        colors={[t.cream, "#E4D2B8", t.kraftDeep]}
        locations={[0, 0.34, 1]}
        style={[styles.floor, { top: groundY, height: floorH }]}
      />
      <Animated.View style={[styles.slatRow, { top: groundY + 8, width: width + SLAT * 4 }, groundStyle]}>
        {Array.from({ length: 18 }, (_, i) => (
          <View key={`s${i}`} style={styles.slat} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.slatRow, { top: groundY + 22, width: width + SLAT * 4, opacity: 0.45 }, nearSlat]}>
        {Array.from({ length: 18 }, (_, i) => (
          <View key={`n${i}`} style={[styles.slat, { height: 6, width: 12 }]} />
        ))}
      </Animated.View>
      <View style={[styles.plank, { top: groundY + floorH * 0.28 }]} />
      <View style={[styles.plank, { top: groundY + floorH * 0.55, opacity: 0.45 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  plane: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
  },
  haze: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  lightShift: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: t.cream,
  },
  steam: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: t.cream,
  },
  mote: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: t.cream,
  },
  prop: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  sack: {
    width: 22,
    height: 28,
    borderRadius: 6,
    backgroundColor: t.kraft,
    borderWidth: 1,
    borderColor: t.kraftDeep,
  },
  cup: {
    width: 12,
    height: 14,
    borderRadius: 3,
    backgroundColor: t.cream,
    borderWidth: 1,
    borderColor: t.kraft,
  },
  mistBand: {
    position: "absolute",
    left: -40,
    height: 52,
    borderRadius: 999,
    backgroundColor: t.cream,
    opacity: 0.15,
  },
  shelfRail: {
    position: "absolute",
    left: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: t.kraft,
    opacity: 0.45,
  },
  backsplash: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: t.espresso,
    opacity: 0.38,
    borderTopWidth: 2,
    borderTopColor: t.kraftDeep,
  },
  counter: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: t.kraftDeep,
  },
  counterLip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: t.kraft,
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
    opacity: 0.36,
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
