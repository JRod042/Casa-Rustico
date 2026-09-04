import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";
import { segment, useWelcomeTimeline } from "./motion";
import { SteamMark } from "./SteamMark";
import { escapeWelcomeTheme as t } from "./theme";

type Props = {
  onFinished: () => void;
};

const DURATION_MS = 4500;
const INTERACT_MS = 3033;

/**
 * Espresso Escape welcome — Hallow-inspired motion (Appllama study).
 * Game-forward Casa branding; no third-party identity.
 */
export function EscapeWelcome({ onFinished }: Props) {
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const time = useWelcomeTimeline(DURATION_MS, true);
  const [canInteract, setCanInteract] = useState(!!reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setCanInteract(true);
      return;
    }
    const id = setTimeout(() => setCanInteract(true), INTERACT_MS);
    return () => clearTimeout(id);
  }, [reducedMotion]);

  const loaderStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      time.value,
      [233, 467],
      ["#4A2818", "#2A1810"]
    ),
    opacity: 1 - Easing.inOut(Easing.cubic)(segment(time.value, 2767, 3033)),
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: time.value >= 1233 ? 1 : 0,
  }));

  const leftDotStyle = useAnimatedStyle(() => {
    const pulse = Math.sin(segment(time.value, 1633, 2100) * Math.PI);
    return { transform: [{ scale: 1 + pulse * 0.5 }] };
  });
  const middleDotStyle = useAnimatedStyle(() => {
    const pulse = Math.sin(segment(time.value, 1800, 2267) * Math.PI);
    return { transform: [{ scale: 1 + pulse * 0.5 }] };
  });
  const rightDotStyle = useAnimatedStyle(() => {
    const pulse = Math.sin(segment(time.value, 1933, 2400) * Math.PI);
    return { transform: [{ scale: 1 + pulse * 0.5 }] };
  });

  const versionStyle = useAnimatedStyle(() => ({
    opacity: segment(time.value, 1400, 1467),
  }));

  const finalStyle = useAnimatedStyle(() => ({
    opacity: interpolate(segment(time.value, 2767, 3200), [0, 1], [0, 1]),
  }));

  return (
    <View style={styles.root} testID="welcome-escape-hallow">
      <StatusBar style="light" />

      <Animated.View style={[StyleSheet.absoluteFill, finalStyle]}>
        <LinearGradient
          colors={["#5A3018", t.bg, "#0A0705"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["transparent", "rgba(26,18,11,0.7)", "#1A120B"]}
          locations={[0.3, 0.6, 1]}
          style={[styles.floor, { height: height * 0.55 }]}
        />

        <View style={[styles.playArt, { top: height * 0.16 }]}>
          <View style={styles.hazard} />
          <View style={[styles.hazard, styles.hazardB]} />
          <View style={styles.bean} />
          <SteamMark size={72} />
        </View>

        <Text style={styles.wordmark}>Espresso Escape</Text>
        <Text style={styles.tagline}>Dodge the grinders. Chase the beans.</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Espresso Escape"
            disabled={!canInteract}
            onPress={onFinished}
            style={[styles.primary, !canInteract && styles.disabled]}
          >
            <Text style={styles.primaryText}>Start brewing</Text>
          </Pressable>
          <Text style={styles.house}>A Casa Rústico game</Text>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.loader, loaderStyle]}
      >
        <View style={styles.glyphWrap}>
          <SteamMark size={100} />
        </View>
        <Animated.View style={[styles.dots, dotsStyle]}>
          <Animated.View style={[styles.dot, leftDotStyle]} />
          <Animated.View style={[styles.dot, middleDotStyle]} />
          <Animated.View style={[styles.dot, rightDotStyle]} />
        </Animated.View>
        <Animated.Text style={[styles.version, versionStyle]}>
          Espresso Escape
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  floor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  playArt: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  hazard: {
    position: "absolute",
    left: 48,
    top: 40,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: t.danger,
    opacity: 0.8,
  },
  hazardB: {
    left: "auto",
    right: 56,
    top: 70,
    width: 36,
    height: 36,
    opacity: 0.55,
  },
  bean: {
    position: "absolute",
    right: 110,
    top: 36,
    width: 16,
    height: 24,
    borderRadius: 10,
    backgroundColor: t.glow,
  },
  wordmark: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 236,
    color: t.ink,
    fontFamily: "Fraunces_700Bold",
    fontSize: 38,
    textAlign: "center",
  },
  tagline: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 196,
    color: t.glow,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  actions: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 48,
    gap: 14,
    alignItems: "center",
  },
  primary: {
    alignSelf: "stretch",
    backgroundColor: t.accent,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFF8F0",
    fontFamily: "SourceSans3_700Bold",
    fontSize: 17,
  },
  house: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 14,
  },
  disabled: { opacity: 0.55 },
  loader: {
    alignItems: "center",
    justifyContent: "center",
  },
  glyphWrap: { marginBottom: 28 },
  dots: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF8F0",
  },
  version: {
    position: "absolute",
    bottom: 56,
    color: "rgba(245,230,211,0.7)",
    fontFamily: "SourceSans3_400Regular",
    fontSize: 15,
  },
});
