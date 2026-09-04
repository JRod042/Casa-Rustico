import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SteamMark } from "../welcome/SteamMark";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { PlayField } from "./PlayField";
import { loadBestScore } from "./storage";

type Screen = "menu" | "how" | "about" | "play";

const HOW: { title: string; body: string }[] = [
  { title: "Jump", body: "Tap the café floor. One tap, one hop — only from the ground." },
  { title: "Dodge", body: "Grinders stay low. Portafilters are taller. Steam hangs mid-air." },
  { title: "Collect", body: "Gold beans are +5. Surviving the line also adds to your run." },
  { title: "Brew again", body: "One hit ends the run. No lives to buy. Pause anytime." },
];

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [best, setBest] = useState(0);

  useEffect(() => {
    let alive = true;
    loadBestScore().then((n) => {
      if (alive) setBest(n);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onBest = useCallback((n: number) => setBest(n), []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#5A3018", t.bg, "#0A0705"]}
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
          onPlay={() => setScreen("play")}
          onHow={() => setScreen("how")}
          onAbout={() => setScreen("about")}
          onBack={() => setScreen("menu")}
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
  onBack,
}: {
  screen: Screen;
  best: number;
  onPlay: () => void;
  onHow: () => void;
  onAbout: () => void;
  onBack: () => void;
}) {
  if (screen === "how") {
    return (
      <View style={styles.menu} testID="escape-how">
        <Text style={styles.panelTitle}>How to play</Text>
        {HOW.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to menu"
          onPress={onBack}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>Back</Text>
        </Pressable>
      </View>
    );
  }
  if (screen === "about") {
    return (
      <View style={styles.menu} testID="escape-about">
        <Text style={styles.panelTitle}>About</Text>
        <Text style={styles.panelBody}>
          Espresso Escape is a free Casa Rústico game.
        </Text>
        <Text style={styles.panelBody}>
          No accounts. No ads. No in-app purchases. This game does not sell coffee
          or take payments.
        </Text>
        <Text style={styles.panelBody}>
          Bags and café orders live in Casa Rustico Go and Hacienda — not here.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to menu"
          onPress={onBack}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>Back</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.menu} testID="escape-menu">
      <SteamMark size={88} />
      <Text style={styles.brand}>CASA RÚSTICO</Text>
      <Text style={styles.title}>Espresso Escape</Text>
      <Text style={styles.tag}>Dodge the grinders. Chase the beans.</Text>
      <Text style={styles.best}>Best run {best}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  menu: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
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
    color: t.ink,
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
    marginBottom: 8,
  },
  best: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 16,
    marginBottom: 10,
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
    color: "#FFF8F0",
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
    minHeight: 48,
    justifyContent: "center",
  },
  ghostText: {
    color: t.ink,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  panelTitle: {
    color: t.ink,
    fontFamily: "Fraunces_700Bold",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    alignSelf: "stretch",
    textAlign: "center",
  },
  panelBody: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 4,
  },
  step: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 12,
    backgroundColor: t.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepNum: {
    color: t.kraft,
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    width: 24,
    textAlign: "center",
  },
  stepCopy: { flex: 1, gap: 2 },
  stepTitle: {
    color: t.ink,
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
