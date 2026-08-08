import { useEffect, useState } from "react";
import {
  Linking,
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
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from "@expo-google-fonts/source-sans-3";
import { BeanMark } from "./BeanMark";
import { segment, useWelcomeTimeline } from "./motion";
import { goWelcomeTheme as t } from "./theme";

type Props = {
  onFinished: () => void;
};

/** Hallow study timing: loader dissolve completes ~3.0s (docs/MOTION_SPEC). */
const DURATION_MS = 4500;
const INTERACT_MS = 3033;

/**
 * Casa Rústico Go welcome — Hallow-inspired motion (Appllama study).
 * Original brand scene, copy, and CTAs. No third-party identity.
 */
export function CasaWelcome({ onFinished }: Props) {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });
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
      ["#3A2418", "#2A1A12"]
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
    opacity: interpolate(
      segment(time.value, 2767, 3200),
      [0, 1],
      [0, 1]
    ),
  }));

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: t.bg }]} />;
  }

  return (
    <View style={styles.root} testID="welcome-casa-hallow">
      <StatusBar style="light" />

      {/* Final welcome surface */}
      <Animated.View style={[StyleSheet.absoluteFill, finalStyle]}>
        <LinearGradient
          colors={["#4A2C1A", "#1A120C", "#0C0907"]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["transparent", "rgba(20,16,12,0.55)", "#140F0C"]}
          locations={[0.35, 0.62, 1]}
          style={[styles.floor, { height: height * 0.55, bottom: 0 }]}
        />

        <View style={[styles.sceneStack, { top: height * 0.14 }]}>
          <View style={styles.bagBack} />
          <View style={styles.bagMid} />
          <View style={styles.bagFront}>
            <BeanMark size={56} />
            <Text style={styles.bagLabel}>Single origin</Text>
          </View>
        </View>

        <Text style={styles.wordmark}>Casa Rústico</Text>
        <Text style={styles.tagline}>Specialty coffee · ship ready</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter Casa Rustico Go"
            disabled={!canInteract}
            onPress={onFinished}
            style={[styles.primary, !canInteract && styles.disabled]}
          >
            <Text style={styles.primaryText}>Enter the shop</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open rusticopr.com"
            disabled={!canInteract}
            onPress={() => Linking.openURL("https://rusticopr.com")}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Visit rusticopr.com</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Splash loader (Hallow-style dissolve) */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.loader, loaderStyle]}
      >
        <View style={styles.glyphWrap}>
          <BeanMark size={96} />
        </View>
        <Animated.View style={[styles.dots, dotsStyle]}>
          <Animated.View style={[styles.dot, leftDotStyle]} />
          <Animated.View style={[styles.dot, middleDotStyle]} />
          <Animated.View style={[styles.dot, rightDotStyle]} />
        </Animated.View>
        <Animated.Text style={[styles.version, versionStyle]}>
          Casa Rústico Go
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  floor: { position: "absolute", left: 0, right: 0 },
  sceneStack: {
    position: "absolute",
    left: 36,
    right: 36,
    height: 200,
    alignItems: "center",
  },
  bagBack: {
    position: "absolute",
    top: 0,
    width: "78%",
    height: 140,
    borderRadius: 20,
    backgroundColor: "#2A1C14",
    opacity: 0.5,
    transform: [{ scale: 0.92 }],
  },
  bagMid: {
    position: "absolute",
    top: 24,
    width: "86%",
    height: 140,
    borderRadius: 20,
    backgroundColor: "#322418",
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  bagFront: {
    position: "absolute",
    top: 48,
    width: "94%",
    height: 150,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.brand,
    backgroundColor: "#24180F",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  bagLabel: {
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  wordmark: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 248,
    color: t.ink,
    fontFamily: "Fraunces_700Bold",
    fontSize: 42,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  tagline: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 208,
    color: t.brand,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  actions: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 48,
    gap: 12,
  },
  primary: {
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
  secondary: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 15,
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
