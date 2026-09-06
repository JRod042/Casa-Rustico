import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SteamMark } from "../welcome/SteamMark";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { type FeelPrefs, armFeel } from "./feel";
import { kraftSource } from "./kraftAssets";
import { PaperChip, PaperSheet, StickerButton } from "./MenuChrome";
import { PlayField } from "./PlayField";
import { KitThumb, type KitKind } from "./sprites";
import {
  clearFirstRun,
  loadBestScore,
  loadSeenFirstRun,
  loadSettings,
  markFirstRunSeen,
  saveSettings,
} from "./storage";

type Screen = "menu" | "how" | "about" | "privacy" | "settings" | "play";

const HOW: { title: string; body: string; kit: KitKind }[] = [
  { title: "Jump", body: "Tap when you want the hop. Cloth rise, cardboard land — not a floaty toy. Hold a beat only for high honey. Late taps still count if you just left the floor.", kit: "player" },
  { title: "Dodge", body: "Read the kits. Soft danger: grinders sit low, portafilters are tall, steam is a warm cardboard cloud. Stay on the linen.", kit: "grinder" },
  { title: "Collect", body: "Honey beans sit on the safe line. +5 each. The run itself scores as you go.", kit: "bean" },
  { title: "Brew again", body: "One soft roast ends the line. Tap to go again — the café invites another hop. Pause anytime and look around.", kit: "portafilter" },
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
  const [tutorial, setTutorial] = useState(false);
  const [prefs, setPrefs] = useState<FeelPrefs>({ haptics: true, sfx: true });

  useEffect(() => {
    armFeel();
    let alive = true;
    Promise.all([loadBestScore(), loadSeenFirstRun(), loadSettings()]).then(
      ([n, seen, nextPrefs]) => {
        if (!alive) return;
        setBest(n);
        setPrefs(nextPrefs);
        if (!seen) {
          void markFirstRunSeen();
          setTutorial(true);
          setScreen("play");
        }
        setBooted(true);
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  const onBest = useCallback((n: number) => setBest(n), []);

  const leaveHow = useCallback((next: Screen) => {
    void markFirstRunSeen();
    setTutorial(false);
    setScreen(next);
  }, []);

  const play = useCallback((firstBrew = false) => {
    void markFirstRunSeen();
    setTutorial(firstBrew);
    setScreen("play");
  }, []);

  const togglePref = useCallback(async (key: keyof FeelPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await saveSettings(next);
  }, [prefs]);

  const replayBrew = useCallback(async () => {
    await clearFirstRun();
    play(true);
  }, [play]);

  if (!booted) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style={screen === "play" ? "light" : "dark"} />
      {screen === "play" ? (
        <PlayField
          best={best}
          onBest={onBest}
          tutorial={tutorial}
          onMenu={() => setScreen("menu")}
        />
      ) : (
        <Menu
          screen={screen}
          best={best}
          prefs={prefs}
          onPlay={() => play(false)}
          onHow={() => setScreen("how")}
          onAbout={() => setScreen("about")}
          onPrivacy={() => setScreen("privacy")}
          onSettings={() => setScreen("settings")}
          onBack={() => leaveHow("menu")}
          onToggle={togglePref}
          onReplay={replayBrew}
        />
      )}
    </View>
  );
}

function Menu({
  screen,
  best,
  prefs,
  onPlay,
  onHow,
  onAbout,
  onPrivacy,
  onSettings,
  onBack,
  onToggle,
  onReplay,
}: {
  screen: Screen;
  best: number;
  prefs: FeelPrefs;
  onPlay: () => void;
  onHow: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
  onSettings: () => void;
  onBack: () => void;
  onToggle: (key: keyof FeelPrefs) => void;
  onReplay: () => void;
}) {
  if (screen === "how") {
    return (
      <SafeAreaView style={styles.safe} testID="escape-how">
        <ScrollView
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
        <PaperSheet>
        <Text style={styles.panelTitle}>How to play</Text>
        <Text style={styles.legendLabel}>Meet the bar</Text>
        <View style={styles.legend}>
          <View style={styles.stampRing} />
          {BAR.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <KitThumb kind={item.kit} size={40} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
        {HOW.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stampRing} />
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
        </PaperSheet>
        <StickerButton
          primary
          label="Play"
          accessibilityLabel="Play Espresso Escape"
          onPress={onPlay}
        />
        <StickerButton label="Menu" accessibilityLabel="Back to menu" onPress={onBack} />
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
        <PaperSheet>
        <Text style={styles.panelTitle}>About</Text>
        <View style={styles.copyCard}>
        <View style={styles.stampRing} />
        <Text style={styles.panelBody}>
          Espresso Escape is a free Casa Rústico coffee mini-game — a playable
          hop through a living highland café of cream paper and kraft kits.
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
        </PaperSheet>
        <StickerButton primary label="Back" accessibilityLabel="Back to menu" onPress={onBack} />
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
        <PaperSheet>
        <Text style={styles.panelTitle}>Privacy</Text>
        <View style={styles.copyCard}>
        <View style={styles.stampRing} />
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
        </PaperSheet>
        <StickerButton primary label="Back" accessibilityLabel="Back to menu" onPress={onBack} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (screen === "settings") {
    return (
      <SafeAreaView style={styles.safe} testID="escape-settings">
        <ScrollView
          contentContainerStyle={styles.menu}
          showsVerticalScrollIndicator={false}
        >
        <PaperSheet>
        <Text style={styles.panelTitle}>Settings</Text>
        <Text style={styles.tag}>Cloth hops, cardboard landings. Nothing to buy.</Text>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: prefs.haptics }}
          accessibilityLabel="Haptics"
          onPress={() => onToggle("haptics")}
          style={styles.toggleRow}
        >
          <View style={styles.stampRing} />
          <Text style={styles.toggleLabel}>Haptics</Text>
          <Text style={styles.toggleValue}>{prefs.haptics ? "On" : "Off"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: prefs.sfx }}
          accessibilityLabel="Sound"
          onPress={() => onToggle("sfx")}
          style={styles.toggleRow}
        >
          <View style={styles.stampRing} />
          <Text style={styles.toggleLabel}>Sound</Text>
          <Text style={styles.toggleValue}>{prefs.sfx ? "On" : "Off"}</Text>
        </Pressable>
        </PaperSheet>
        <StickerButton
          primary
          label="Replay first brew"
          accessibilityLabel="Replay first brew"
          onPress={onReplay}
        />
        <StickerButton label="About" accessibilityLabel="About this game" onPress={onAbout} />
        <StickerButton label="Privacy" accessibilityLabel="Privacy" onPress={onPrivacy} />
        <StickerButton label="Menu" accessibilityLabel="Back to menu" onPress={onBack} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} testID="escape-menu">
      <Image source={kraftSource("titleBg")} style={styles.titleBg} resizeMode="cover" />
      <View style={styles.titleWash} />
      <ScrollView
        contentContainerStyle={styles.menu}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.heroStack}>
        <View style={styles.heroBlot} />
        <View style={styles.heroMark}>
          <SteamMark size={88} />
        </View>
      </View>
      <Text style={styles.brand}>CASA RÚSTICO</Text>
      <Text style={styles.title}>Espresso Escape</Text>
      <Text style={styles.tag}>A handmade hop through a living highland café.</Text>
      <View style={styles.kitRow}>
        <KitThumb kind="player" size={42} />
        <KitThumb kind="bean" size={36} />
        <KitThumb kind="grinder" size={36} />
      </View>
      <PaperChip>Best run {best}</PaperChip>
      <StickerButton
        primary
        label="Play"
        accessibilityLabel="Play Espresso Escape"
        onPress={onPlay}
      />
      <StickerButton
        label="How to play"
        accessibilityLabel="How to play"
        onPress={onHow}
      />
      <StickerButton
        label="Settings"
        accessibilityLabel="Settings"
        onPress={onSettings}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.cream },
  safe: { flex: 1, backgroundColor: t.cream },
  titleBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.28,
  },
  titleWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(247,243,236,0.72)",
  },
  menu: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 20,
    gap: 10,
  },
  heroStack: {
    width: 128,
    height: 128,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBlot: {
    position: "absolute",
    left: 8,
    right: -4,
    top: 10,
    bottom: -4,
    backgroundColor: t.espresso,
    borderRadius: 20,
    opacity: 0.14,
    transform: [{ rotate: "1.2deg" }],
  },
  heroMark: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: t.cream,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-1.4deg" }],
    borderStyle: "dashed",
  },
  brand: {
    color: t.kraftDeep,
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
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  kitRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginVertical: 6,
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
  copyCard: {
    alignSelf: "stretch",
    backgroundColor: t.cream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 8,
    overflow: "hidden",
    transform: [{ rotate: "-0.3deg" }],
  },
  stampRing: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderWidth: 1,
    borderColor: t.kraft,
    borderStyle: "dashed",
    borderRadius: 8,
    opacity: 0.55,
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
    color: t.kraftDeep,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  legend: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: t.cream,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 4,
    overflow: "hidden",
    transform: [{ rotate: "0.4deg" }],
  },
  legendItem: { flex: 1, alignItems: "center", gap: 6 },
  legendText: {
    color: t.ink,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 11,
  },
  step: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: t.cream,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: t.kraftDeep,
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "hidden",
    transform: [{ rotate: "-0.25deg" }],
  },
  stepKit: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: t.kraftDeep,
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    width: 20,
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
  toggleRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: t.cream,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: t.kraftDeep,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    overflow: "hidden",
    transform: [{ rotate: "0.3deg" }],
  },
  toggleLabel: {
    color: t.ink,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
  },
  toggleValue: {
    color: t.kraftDeep,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
  },
});
