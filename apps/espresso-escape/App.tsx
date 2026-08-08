import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WelcomeGate } from "./src/welcome/WelcomeGate";

/**
 * Espresso Escape — Casa Rustico casual game shell.
 * Next: port loop patterns from references/Expo-Crossy-Road + frantic barista timing.
 */
function GameShell() {
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(
    "Tap BREW to dodge the grinders. Collect single-origin beans."
  );
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setScore(0);
    setRunning(true);
    setMessage("Run, bean, run — Casa Rustico awaits.");
    timer.current = setInterval(() => {
      setScore((s) => s + 1);
    }, 400);
  }, [stop]);

  const dodge = () => {
    if (!running) return;
    setScore((s) => s + 5);
    setMessage("Escaped the portafilter!");
  };

  const bust = () => {
    if (!running) return;
    stop();
    setMessage(`Roasted! Final score ${score}. Play again?`);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <Text style={styles.brand}>CASA RUSTICO</Text>
      <Text style={styles.title}>Espresso Escape</Text>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.msg}>{message}</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.btn, styles.primary]}
          onPress={running ? dodge : start}
        >
          <Text style={styles.btnText}>{running ? "DODGE" : "BREW"}</Text>
        </Pressable>
        {running ? (
          <Pressable style={[styles.btn, styles.danger]} onPress={bust}>
            <Text style={styles.btnText}>BUST</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.hint}>
        Prototype shell · game engine next (see references/Expo-Crossy-Road)
      </Text>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <WelcomeGate>
      <GameShell />
    </WelcomeGate>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1A120B",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    color: "#C4A484",
    letterSpacing: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#F5E6D3",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 8,
  },
  score: {
    color: "#E8B86D",
    fontSize: 56,
    fontWeight: "800",
    marginVertical: 24,
  },
  msg: {
    color: "#D4C4B0",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  row: { flexDirection: "row", gap: 12 },
  btn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primary: { backgroundColor: "#6B3F2A" },
  danger: { backgroundColor: "#8B2E2E" },
  btnText: { color: "#FFF8F0", fontWeight: "800", letterSpacing: 1 },
  hint: {
    position: "absolute",
    bottom: 36,
    color: "#6B5A4A",
    fontSize: 11,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
