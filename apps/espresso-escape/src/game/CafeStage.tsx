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
  { left: 0.12, top: 0.18, s: 3, d: 0.07 },
  { left: 0.28, top: 0.32, s: 2, d: 0.11 },
  { left: 0.46, top: 0.14, s: 3, d: 0.09 },
  { left: 0.63, top: 0.26, s: 2, d: 0.13 },
  { left: 0.81, top: 0.2, s: 3, d: 0.08 },
  { left: 0.19, top: 0.42, s: 2, d: 0.1 },
];

/**
 * Living highland café diorama — paper planes, not a 3D jungle.
 * Far / mid / near / ground. Ambient steam, dust, idle props, soft light.
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
      withTiming(1, { duration: 6400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [life, reduce]);

  const farStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.05) % width)) }],
  }));
  const midStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.14) % width)) }],
  }));
  const nearStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -(((scroll.value * 0.28) % 160) + 20) }],
  }));
  const slatStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -((scroll.value % SLAT) + SLAT) }],
  }));
  const lightStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + life.value * 0.1,
  }));
  const steamA = useAnimatedStyle(() => ({
    opacity: 0.12 + life.value * 0.16,
    transform: [{ translateY: -6 * life.value }, { translateX: 8 * life.value }],
  }));
  const steamB = useAnimatedStyle(() => ({
    opacity: 0.08 + (1 - life.value) * 0.14,
    transform: [{ translateY: -10 * (1 - life.value) }, { translateX: -6 * life.value }],
  }));
  const propStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * life.value }, { rotate: `${-1.2 + life.value}deg` }],
  }));
  const dustStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -14 * life.value }, { translateX: 10 * life.value }],
    opacity: 0.18 + life.value * 0.2,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[t.wood, t.bg, t.espressoDeep]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.plane, { top: 0, height: groundY, width: width * 2 }, farStyle]}>
        <Image source={kraftSource("cafeBg")} style={{ width, height: groundY }} resizeMode="cover" />
        <Image source={kraftSource("cafeBg")} style={{ width, height: groundY }} resizeMode="cover" />
      </Animated.View>
      <View style={[styles.farWash, { height: groundY }]} />

      <Animated.View
        style={[styles.plane, { top: groundY * 0.08, height: groundY * 0.72, width: width * 2, opacity: 0.55 }, midStyle]}
      >
        <Image
          source={kraftSource("cafeBg")}
          style={{ width, height: groundY * 0.72 }}
          resizeMode="cover"
        />
        <Image
          source={kraftSource("cafeBg")}
          style={{ width, height: groundY * 0.72 }}
          resizeMode="cover"
        />
      </Animated.View>

      <Animated.View style={[styles.lightShift, { height: groundY }, lightStyle]} />

      <Animated.View
        style={[styles.steam, { top: groundY * 0.22, left: width * 0.62, width: 70, height: 54 }, steamA]}
      />
      <Animated.View
        style={[styles.steam, { top: groundY * 0.16, left: width * 0.18, width: 52, height: 40 }, steamB]}
      />

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

      <Animated.View style={[styles.prop, { top: groundY * 0.38, left: 18 }, propStyle]}>
        <View style={styles.sack} />
        <View style={styles.cup} />
      </Animated.View>
      <Animated.View
        style={[styles.prop, { top: groundY * 0.34, right: 22, left: undefined }, propStyle]}
      >
        <View style={[styles.sack, { backgroundColor: t.kraftDeep }]} />
      </Animated.View>

      <Animated.View
        style={[styles.mistBand, { top: groundY * 0.12, width: width + 220 }, nearStyle]}
      />

      <View style={[styles.shelfRail, { top: groundY * 0.22 + 30, width }]} />
      <View style={[styles.backsplash, { top: groundY - 36, height: 36 }]} />
      <View style={[styles.counter, { top: groundY - 12 }]} />
      <View style={[styles.counterLip, { top: groundY - 3 }]} />

      <LinearGradient
        colors={[t.cream, "#E4D2B8", t.kraftDeep]}
        locations={[0, 0.38, 1]}
        style={[styles.floor, { top: groundY, height: floorH }]}
      />
      <Animated.View
        style={[styles.slatRow, { top: groundY + 10, width: width + SLAT * 4 }, slatStyle]}
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
  plane: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
  },
  farWash: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(26,18,11,0.2)",
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
    height: 48,
    borderRadius: 999,
    backgroundColor: t.cream,
    opacity: 0.14,
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
    opacity: 0.35,
    borderTopWidth: 2,
    borderTopColor: t.kraftDeep,
  },
  counter: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: t.kraftDeep,
  },
  counterLip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
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
    opacity: 0.34,
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
