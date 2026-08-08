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
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
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
import { goWelcomeSlides } from "./slides";
import { goWelcomeTheme as t } from "./theme";

type Props = {
  onFinished: () => void;
};

const SPLASH_MS = 2800;

/**
 * Original Casa Rústico welcome.
 * Motion language studied from Appllama top-welcome-screens
 * (splash dissolve + staggered reveal) — copy, colors, and visuals are ours.
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
  const { height, width } = useWindowDimensions();
  const trackWidth = Math.max(120, width - 80);
  const [phase, setPhase] = useState<"splash" | "pages">("splash");
  const [page, setPage] = useState(0);
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (reducedMotion) {
      setPhase("pages");
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: SPLASH_MS,
      easing: Easing.linear,
    });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    const id = setTimeout(() => setPhase("pages"), SPLASH_MS);
    return () => clearTimeout(id);
  }, [fontsLoaded, float, progress, pulse, reducedMotion]);

  const splashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.82, 1], [1, 1, 0]),
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: Math.max(4, progress.value * trackWidth),
  }));

  const dot0 = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.65,
    transform: [{ scale: 1 + pulse.value * 0.35 }],
  }));
  const dot1 = useAnimatedStyle(() => {
    const p = Math.sin((pulse.value + 0.33) * Math.PI);
    return {
      opacity: 0.35 + Math.abs(p) * 0.65,
      transform: [{ scale: 1 + Math.abs(p) * 0.35 }],
    };
  });
  const dot2 = useAnimatedStyle(() => {
    const p = Math.sin((pulse.value + 0.66) * Math.PI);
    return {
      opacity: 0.35 + Math.abs(p) * 0.65,
      transform: [{ scale: 1 + Math.abs(p) * 0.35 }],
    };
  });

  const stackStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -10]) },
      { rotate: `${interpolate(float.value, [0, 1], [-2, 2])}deg` },
    ],
  }));

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: t.bg }]} />;
  }

  const slide = goWelcomeSlides[page];
  const isLast = page >= goWelcomeSlides.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#2A1A12", t.bg, "#0C0907"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.atmosphere, { height: height * 0.42 }]}>
        <LinearGradient
          colors={["rgba(232,184,109,0.18)", "rgba(107,63,42,0.05)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.stack, stackStyle]}>
          <View style={[styles.panel, styles.panelBack]} />
          <View style={[styles.panel, styles.panelMid]} />
          <View style={[styles.panel, styles.panelFront]}>
            <Text style={styles.panelLabel}>Casa Rústico</Text>
            <Text style={styles.panelMeta}>Go · specialty</Text>
          </View>
        </Animated.View>
      </View>

      {phase === "splash" ? (
        <Animated.View style={[styles.splash, splashStyle]}>
          <BeanMark size={88} />
          <Text style={styles.brandSplash}>CASA RÚSTICO</Text>
          <Text style={styles.brandSub}>Go</Text>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot0]} />
            <Animated.View style={[styles.dot, dot1]} />
            <Animated.View style={[styles.dot, dot2]} />
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, barStyle]} />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.pages}>
          <Animated.Text
            key={`eye-${slide.id}`}
            entering={reducedMotion ? undefined : FadeIn.duration(280)}
            style={styles.eyebrow}
          >
            {slide.eyebrow}
          </Animated.Text>
          <Animated.Text
            key={`title-${slide.id}`}
            entering={
              reducedMotion ? undefined : FadeInDown.duration(420).springify()
            }
            style={styles.title}
          >
            {slide.title}
          </Animated.Text>
          <Animated.Text
            key={`body-${slide.id}`}
            entering={
              reducedMotion ? undefined : FadeInUp.duration(480).delay(80)
            }
            style={styles.body}
          >
            {slide.body}
          </Animated.Text>

          <View style={styles.pager}>
            {goWelcomeSlides.map((s, i) => (
              <View
                key={s.id}
                style={[styles.pageDot, i === page && styles.pageDotOn]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {!isLast ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip welcome"
                onPress={onFinished}
                style={styles.skip}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            ) : (
              <View style={styles.skip} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isLast ? "Enter Casa Rustico Go" : "Next"}
              onPress={() => {
                if (isLast) onFinished();
                else setPage((p) => p + 1);
              }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>
                {isLast ? "Enter the shop" : "Continue"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  stack: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 24,
    height: 170,
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.line,
    backgroundColor: t.panel,
  },
  panelBack: { top: 0, transform: [{ scale: 0.92 }], opacity: 0.45 },
  panelMid: { top: 22, transform: [{ scale: 0.96 }], opacity: 0.7 },
  panelFront: {
    top: 48,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: "#241C14",
    borderColor: t.brand,
  },
  panelLabel: {
    color: t.ink,
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
  },
  panelMeta: {
    marginTop: 6,
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 14,
  },
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  brandSplash: {
    marginTop: 28,
    color: t.brand,
    letterSpacing: 4,
    fontSize: 13,
    fontFamily: "SourceSans3_700Bold",
  },
  brandSub: {
    marginTop: 8,
    color: t.ink,
    fontSize: 44,
    fontFamily: "Fraunces_700Bold",
  },
  dots: { flexDirection: "row", gap: 10, marginTop: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.glow,
  },
  track: {
    position: "absolute",
    bottom: 48,
    left: 40,
    right: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: t.line,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: t.brand,
    borderRadius: 2,
  },
  pages: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  eyebrow: {
    color: t.brand,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: "SourceSans3_700Bold",
    marginBottom: 12,
  },
  title: {
    color: t.ink,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: "Fraunces_700Bold",
    marginBottom: 14,
  },
  body: {
    color: t.muted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "SourceSans3_400Regular",
    marginBottom: 28,
    maxWidth: 360,
  },
  pager: { flexDirection: "row", gap: 8, marginBottom: 22 },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.line,
  },
  pageDotOn: { width: 22, backgroundColor: t.brand },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skip: { minWidth: 64, paddingVertical: 14 },
  skipText: {
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 15,
  },
  cta: {
    flex: 1,
    backgroundColor: t.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFF8F0",
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
  },
});
