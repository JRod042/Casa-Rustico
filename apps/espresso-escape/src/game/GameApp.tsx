import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SteamMark } from "../welcome/SteamMark";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { PlayField } from "./PlayField";
import { KitThumb, type KitKind } from "./sprites";
import { loadBestScore, loadSeenFirstRun, markFirstRunSeen } from "./storage";

type Screen = "menu" | "how" | "about" | "privacy" | "play";

const HOW: { title: string; body: string; kit: KitKind }[] = [
  { title: "Jump", body: "Tap the linen floor. One tap, one hop — only from the ground.", kit: "player" },
  { title: "Dodge", body: "Grinders stay low. Portafilters are taller. Steam hangs mid-air.", kit: "grinder" },
  { title: "Collect", body: "Honey beans are +5. Surviving the line also adds to your run.", kit: "bean" },
  { title: "Brew again", body: "One hit ends the run. No lives to buy. Pause anytime.", kit: "portafilter" },
];

const BAR: { kit: KitKind; label: string }[] = [
  { kit: "grinder", label: "Grinder" },
  { kit: "portafilter", label: "Portafilter" },
  { kit: "steam", label: "Steam" },
];

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [best, setBest] = useState(0);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([loadBestScore(), loadSeenFirstRun()]).then(([n, seen]) => {
      if (!alive) return;
      setBest(n);
      if (!seen) setScreen("how");
      setBooted(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onBest = useCallback((n: number) => setBest(n), []);

  const leaveHow = useCallback((next: Screen) => {
    void markFirstRunSeen();
    setScreen(next);
  }, []);

  if (!booted) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[t.wood, t.bg, t.espressoDeep]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      {screen === "play" ? (
        <PlayField
          best={best}
          onBest={onBest}
          onMenu={() => setScreen("menu")}
        />
      ) : (
        <Menu
          screen={screen}
          best={best}
          onPlay={() => leaveHow("play")}
          onHow={() => setScreen("how")}
          onAbout={() => setScreen("about")}
          onPrivacy={() => setScreen("privacy")}
          onBack={() => leaveHow("menu")}
        />
      )}
    </View>
  );
}

function Menu({
  screen,
  best,
  onPlay,
  onHow,
  onAbout,
  onPrivacy,
  onBack,
}: {
  screen: Screen;
  best: number;
  onPlay: () => void;
  onHow: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
  onBack: () => void;
}) {
  if (screen === "how") {
    return (
      <SafeAreaView style={styles.safe} testID="escape-how">
        <ScrollView
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.panelTitle}>How to play</Text>
        <Text style={styles.legendLabel}>Meet the bar</Text>
        <View style={styles.legend}>
          {BAR.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <KitThumb kind={item.kit} size={40} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
        {HOW.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepKit}>
              <KitThumb kind={step.kit} size={36} />
            </View>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play Espresso Escape"
          onPress={onPlay}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>Play</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to menu"
          onPress={onBack}
          style={styles.ghost}
        >
          <Text style={styles.ghostText}>Menu</Text>
        </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (screen === "about") {
    return (
      <SafeAreaView style={styles.safe} testID="escape-about">
        <ScrollView
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.panelTitle}>About</Text>
        <View style={styles.copyCard}>
        <Text style={styles.panelBody}>
          Espresso Escape is a free Casa Rústico coffee mini-game — a playable
          run through the café line.
        </Text>
        <Text style={styles.panelBody}>
          No accounts. No ads. No in-app purchases. This game does not sell coffee
          or take payments.
        </Text>
        <Text style={styles.panelBodyLast}>
          Physical bags stay in the Casa Rústico shop. This app is only the
          game — there is no checkout here.
        </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to menu"
          onPress={onBack}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>Back</Text>
        </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (screen === "privacy") {
    return (
      <SafeAreaView style={styles.safe} testID="escape-privacy">
        <ScrollView
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.panelTitle}>Privacy</Text>
        <View style={styles.copyCard}>
        <Text style={styles.panelBody}>
          Espresso Escape keeps a high score and a welcome flag on this device.
        </Text>
        <Text style={styles.panelBody}>
          No account. No location. No tracking. No payments. Nothing is sent
          to a store or payment service.
        </Text>
        <Text style={styles.panelBodyLast}>
          Local high score and welcome flag only. No accounts, ads, or
          payments.
        </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to menu"
          onPress={onBack}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>Back</Text>
        </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} testID="escape-menu">
      <ScrollView
        contentContainerStyle={styles.menu}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.heroMark}>
        <SteamMark size={88} />
      </View>
      <Text style={styles.brand}>CASA RÚSTICO</Text>
      <Text style={styles.title}>Espresso Escape</Text>
      <Text style={styles.tag}>Dodge the grinders. Chase the beans.</Text>
      <View style={styles.bestChip}>
        <Text style={styles.best}>Best run {best}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Play Espresso Escape"
        onPress={onPlay}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>Play</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="How to play"
        onPress={onHow}
        style={styles.ghost}
      >
        <Text style={styles.ghostText}>How to play</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="About this game"
        onPress={onAbout}
        style={styles.ghost}
      >
        <Text style={styles.ghostText}>About</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Privacy"
        onPress={onPrivacy}
        style={styles.ghost}
      >
        <Text style={styles.ghostText}>Privacy</Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  safe: { flex: 1 },
  menu: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 20,
    gap: 10,
  },
  heroMark: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: t.espresso,
    borderWidth: 1,
    borderColor: t.kraft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brand: {
    color: t.brand,
    letterSpacing: 4,
    fontSize: 12,
    fontFamily: "SourceSans3_700Bold",
    fontWeight: "700",
    marginTop: 8,
  },
  title: {
    color: t.linen,
    fontFamily: "Fraunces_700Bold",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  tag: {
    color: t.glow,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  bestChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(245,234,216,0.1)",
    borderWidth: 1,
    borderColor: t.line,
    marginBottom: 8,
  },
  best: {
    color: t.linenDim,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 16,
  },
  primary: {
    alignSelf: "stretch",
    backgroundColor: t.kraft,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryText: {
    color: t.cream,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 17,
    fontWeight: "800",
  },
  ghost: {
    alignSelf: "stretch",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.brand,
    backgroundColor: "rgba(36,24,15,0.55)",
    minHeight: 48,
    justifyContent: "center",
  },
  ghostText: {
    color: t.linen,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  panelTitle: {
    color: t.linen,
    fontFamily: "Fraunces_700Bold",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    alignSelf: "stretch",
    textAlign: "center",
  },
  copyCard: {
    alignSelf: "stretch",
    backgroundColor: t.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 8,
  },
  panelBody: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  panelBodyLast: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 0,
  },
  legendLabel: {
    alignSelf: "stretch",
    color: t.brand,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  legend: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: t.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.kraft,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 4,
  },
  legendItem: { flex: 1, alignItems: "center", gap: 6 },
  legendText: {
    color: t.linenDim,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 11,
  },
  step: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: t.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  stepKit: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: t.kraft,
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    width: 20,
    textAlign: "center",
  },
  stepCopy: { flex: 1, gap: 2 },
  stepTitle: {
    color: t.linen,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
  },
  stepBody: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
});
