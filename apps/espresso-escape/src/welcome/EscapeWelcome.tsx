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
import { escapeWelcomeSlides } from "./slides";
import { SteamMark } from "./SteamMark";
import { escapeWelcomeTheme as t } from "./theme";

type Props = {
  onFinished: () => void;
};

const SPLASH_MS = 2400;

/**
 * Original Espresso Escape welcome.
 * Splash → pages motion studied from Appllama welcome-screen patterns;
 * branding and composition are Casa Rústico originals.
 */
export function EscapeWelcome({ onFinished }: Props) {
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
  const dash = useSharedValue(0);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (reducedMotion) {
      setPhase("pages");
      return;
    }
    progress.value = withTiming(1, {
      duration: SPLASH_MS,
      easing: Easing.linear,
    });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 360, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 360, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    dash.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.cubic) })
      ),
      -1,
      false
    );
    const id = setTimeout(() => setPhase("pages"), SPLASH_MS);
    return () => clearTimeout(id);
  }, [dash, fontsLoaded, progress, pulse, reducedMotion]);

  const splashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.8, 1], [1, 1, 0]),
  }));
  const barStyle = useAnimatedStyle(() => ({
    width: Math.max(4, progress.value * trackWidth),
  }));
  const steamPulse = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(pulse.value, [0, 1], [0, -6]) }],
    opacity: 0.75 + pulse.value * 0.25,
  }));
  const laneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(dash.value, [0, 1], [-18, 18]) }],
  }));

  if (!fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: t.bg }]} />;
  }

  const slide = escapeWelcomeSlides[page];
  const isLast = page >= escapeWelcomeSlides.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#3A2014", t.bg, "#0E0A07"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.playfield, { height: height * 0.4 }]}>
        <LinearGradient
          colors={["rgba(232,184,109,0.16)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.lane, laneStyle]}>
          <View style={styles.hazard} />
          <View style={[styles.hazard, styles.hazardB]} />
          <View style={[styles.beanChip, styles.beanA]} />
          <View style={[styles.beanChip, styles.beanB]} />
        </Animated.View>
      </View>

      {phase === "splash" ? (
        <Animated.View style={[styles.splash, splashStyle]}>
          <Animated.View style={steamPulse}>
            <SteamMark size={92} />
          </Animated.View>
          <Text style={styles.brandSplash}>CASA RÚSTICO</Text>
          <Text style={styles.brandSub}>Espresso Escape</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, barStyle]} />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.pages}>
          <Animated.Text
            key={`eye-${slide.id}`}
            entering={reducedMotion ? undefined : FadeIn.duration(260)}
            style={styles.eyebrow}
          >
            {slide.eyebrow}
          </Animated.Text>
          <Animated.Text
            key={`title-${slide.id}`}
            entering={
              reducedMotion ? undefined : FadeInDown.duration(400).springify()
            }
            style={styles.title}
          >
            {slide.title}
          </Animated.Text>
          <Animated.Text
            key={`body-${slide.id}`}
            entering={
              reducedMotion ? undefined : FadeInUp.duration(450).delay(70)
            }
            style={styles.body}
          >
            {slide.body}
          </Animated.Text>

          <View style={styles.pager}>
            {escapeWelcomeSlides.map((s, i) => (
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
              accessibilityLabel={isLast ? "Start Espresso Escape" : "Next"}
              onPress={() => {
                if (isLast) onFinished();
                else setPage((p) => p + 1);
              }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>
                {isLast ? "Start brewing" : "Continue"}
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
  playfield: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  lane: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 36,
    height: 120,
  },
  hazard: {
    position: "absolute",
    left: 20,
    top: 18,
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: t.danger,
    opacity: 0.85,
  },
  hazardB: {
    left: "auto",
    right: 28,
    top: 48,
    width: 40,
    height: 40,
    opacity: 0.65,
  },
  beanChip: {
    position: "absolute",
    width: 18,
    height: 26,
    borderRadius: 10,
    backgroundColor: t.glow,
  },
  beanA: { left: "42%", top: 28 },
  beanB: { left: "58%", top: 62, opacity: 0.75 },
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 36,
  },
  brandSplash: {
    marginTop: 26,
    color: t.brand,
    letterSpacing: 4,
    fontSize: 12,
    fontFamily: "SourceSans3_700Bold",
  },
  brandSub: {
    marginTop: 8,
    color: t.ink,
    fontSize: 34,
    fontFamily: "Fraunces_700Bold",
    textAlign: "center",
    paddingHorizontal: 16,
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
    backgroundColor: t.glow,
    borderRadius: 2,
  },
  pages: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  eyebrow: {
    color: t.glow,
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
  pageDotOn: { width: 22, backgroundColor: t.glow },
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
