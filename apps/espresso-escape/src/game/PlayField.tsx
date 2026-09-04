import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  type AppStateStatus,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  makeMutable,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { createRun, jump, MAX_BEANS, MAX_HAZARDS, resizeRun, tick, type Run } from "./engine";
import { type HazardKind, PLAYER_H, PLAYER_W } from "./physics";
import { BeanArt, HazardArt } from "./sprites";
import { saveBestScore } from "./storage";

type Slot = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  on: SharedValue<number>;
};

function makeSlots(n: number): Slot[] {
  return Array.from({ length: n }, () => ({
    x: makeMutable(-80),
    y: makeMutable(0),
    w: makeMutable(20),
    h: makeMutable(20),
    on: makeMutable(0),
  }));
}

function writeSlots(
  slots: Slot[],
  items: { x: number; y: number; w: number; h: number }[]
): void {
  for (let i = 0; i < slots.length; i += 1) {
    const item = items[i];
    const slot = slots[i];
    if (!item) {
      slot.on.value = 0;
      continue;
    }
    slot.x.value = item.x;
    slot.y.value = item.y;
    slot.w.value = item.w;
    slot.h.value = item.h;
    slot.on.value = 1;
  }
}

function kindsKey(items: { kind?: HazardKind; id: number }[]): string {
  let key = "";
  for (let i = 0; i < items.length; i += 1) {
    key += items[i].id;
    key += items[i].kind ?? "b";
    key += ",";
  }
  return key;
}

const Sprite = memo(function Sprite({
  slot,
  tone,
}: {
  slot: Slot;
  tone: "gold" | HazardKind;
}) {
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: slot.x.value }, { translateY: slot.y.value }],
    width: slot.w.value,
    height: slot.h.value,
    opacity: slot.on.value,
  }));
  const look =
    tone === "gold"
      ? styles.gold
      : tone === "steam"
        ? styles.steam
        : tone === "portafilter"
          ? styles.porta
          : styles.hazard;
  return (
    <Animated.View pointerEvents="none" style={[look, styles.sprite, anim]}>
      {tone === "gold" ? <BeanArt /> : <HazardArt kind={tone} />}
    </Animated.View>
  );
});

export function PlayField({
  best,
  onBest,
  onMenu,
}: {
  best: number;
  onBest: (n: number) => void;
  onMenu: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const groundY = Math.round(height * 0.72);
  const playerX = Math.round(width * 0.18);
  const world = useMemo(
    () => ({ width, height, groundY }),
    [width, height, groundY]
  );

  const runRef = useRef<Run>(createRun(world, playerX));
  const playerY = useRef(makeMutable(world.groundY - PLAYER_H)).current;
  const hazardSlots = useRef(makeSlots(MAX_HAZARDS)).current;
  const beanSlots = useRef(makeSlots(MAX_BEANS)).current;
  const last = useRef(0);
  const raf = useRef(0);
  const finishing = useRef(false);

  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hazardMeta, setHazardMeta] = useState<HazardKind[]>([]);
  const scoreRef = useRef(0);
  const hintRef = useRef(true);

  const playerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playerX }, { translateY: playerY.value }],
  }));

  const syncVisual = useCallback(
    (run: Run) => {
      playerY.value = run.playerY;
      writeSlots(hazardSlots, run.hazards);
      writeSlots(beanSlots, run.beans);
    },
    [beanSlots, hazardSlots, playerY]
  );

  const reset = useCallback(() => {
    finishing.current = false;
    runRef.current = createRun(world, playerX);
    syncVisual(runRef.current);
    scoreRef.current = 0;
    hintRef.current = true;
    setScore(0);
    setPaused(false);
    setDead(false);
    setShowHint(true);
    setHazardMeta([]);
  }, [playerX, syncVisual, world]);

  useEffect(() => {
    resizeRun(runRef.current, world, playerX);
    if (!runRef.current.dead && runRef.current.score === 0 && !runRef.current.jumped) {
      runRef.current.playerY = world.groundY - PLAYER_H;
    }
    syncVisual(runRef.current);
  }, [playerX, syncVisual, world]);

  const finish = useCallback(
    async (finalScore: number) => {
      if (finishing.current) return;
      finishing.current = true;
      setDead(true);
      const next = await saveBestScore(finalScore);
      onBest(next);
    },
    [onBest]
  );

  useEffect(() => {
    last.current = 0;
    const loop = (now: number) => {
      const run = runRef.current;
      if (!last.current) last.current = now;
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      const beforeDead = run.dead;
      const beforeIds = kindsKey(run.hazards);
      tick(run, dt);
      syncVisual(run);
      const nextScore = Math.floor(run.score);
      if (nextScore !== scoreRef.current) {
        scoreRef.current = nextScore;
        setScore(nextScore);
      }
      if (run.jumped && hintRef.current) {
        hintRef.current = false;
        setShowHint(false);
      }
      if (kindsKey(run.hazards) !== beforeIds) {
        setHazardMeta(run.hazards.map((h) => h.kind));
      }
      if (run.dead && !beforeDead) void finish(nextScore);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [finish, syncVisual]);

  useEffect(() => {
    const onApp = (state: AppStateStatus) => {
      if (state !== "active" && !runRef.current.dead) {
        runRef.current.paused = true;
        setPaused(true);
      }
    };
    const sub = AppState.addEventListener("change", onApp);
    return () => sub.remove();
  }, []);

  const onJump = () => {
    jump(runRef.current);
  };

  const togglePause = () => {
    const run = runRef.current;
    if (run.dead) return;
    run.paused = !run.paused;
    setPaused(run.paused);
    last.current = 0;
  };

  return (
    <View style={styles.play} testID="escape-play">
      <SafeAreaView style={styles.hud}>
        <Text style={styles.hudScore} accessibilityRole="text">
          {score}
        </Text>
        <Text style={styles.hudBest}>Best {best}</Text>
        {dead ? (
          <View style={styles.hudBtn}>
            <Text style={styles.hudBtnText}>Ended</Text>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? "Resume" : "Pause"}
            onPress={togglePause}
            style={styles.hudBtn}
          >
            <Text style={styles.hudBtnText}>{paused ? "Resume" : "Pause"}</Text>
          </Pressable>
        )}
      </SafeAreaView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jump"
        accessibilityHint="Tap the floor to jump over grinders and collect beans"
        onPress={onJump}
        style={styles.stage}
      >
        <View style={[styles.ground, { top: groundY }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bean,
            { width: PLAYER_W, height: PLAYER_H },
            playerStyle,
          ]}
        >
          <BeanArt />
        </Animated.View>
        {hazardSlots.map((slot, i) => (
          <Sprite key={`h${i}`} slot={slot} tone={hazardMeta[i] ?? "grinder"} />
        ))}
        {beanSlots.map((slot, i) => (
          <Sprite key={`b${i}`} slot={slot} tone="gold" />
        ))}
        {showHint ? (
          <Text style={[styles.hint, { top: groundY + 18 }]}>
            Tap to jump · collect beans · dodge the bar
          </Text>
        ) : null}
      </Pressable>

      {paused && !dead ? (
        <View style={styles.overlay} testID="escape-paused">
          <Text style={styles.overlayTitle}>Paused</Text>
          <Text style={styles.overlayBody}>
            The line holds. Resume when you are ready — nothing is for sale here.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resume run"
            onPress={togglePause}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>Resume</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Leave run"
            onPress={onMenu}
            style={styles.ghost}
          >
            <Text style={styles.ghostText}>Menu</Text>
          </Pressable>
        </View>
      ) : null}

      {dead ? (
        <View style={styles.overlay} testID="escape-gameover">
          <Text style={styles.overlayTitle}>Roasted</Text>
          <Text style={styles.overlayScore}>Score {score}</Text>
          <Text style={styles.tag}>Best {best}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Play again"
            onPress={reset}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>Brew again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to menu"
            onPress={onMenu}
            style={styles.ghost}
          >
            <Text style={styles.ghostText}>Menu</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  play: { flex: 1 },
  hud: {
    paddingTop: 8,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudScore: {
    color: t.glow,
    fontFamily: "Fraunces_700Bold",
    fontSize: 36,
    fontWeight: "800",
    minWidth: 72,
  },
  hudBest: {
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  hudBtn: {
    minHeight: 44,
    minWidth: 88,
    borderWidth: 1,
    borderColor: t.brand,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hudBtnText: {
    color: t.ink,
    fontFamily: "SourceSans3_700Bold",
    fontWeight: "700",
  },
  stage: { flex: 1 },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: t.brand,
  },
  sprite: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
  bean: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 14,
    backgroundColor: t.glow,
    overflow: "hidden",
  },
  gold: {
    borderRadius: 10,
    backgroundColor: "#F0C56A",
    overflow: "hidden",
  },
  hazard: {
    borderRadius: 10,
    backgroundColor: t.danger,
    overflow: "hidden",
  },
  steam: { backgroundColor: "#D4B89A", borderRadius: 8, overflow: "hidden" },
  porta: { backgroundColor: t.kraft, borderRadius: 8, overflow: "hidden" },
  hint: {
    position: "absolute",
    left: 20,
    right: 20,
    color: t.muted,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 14,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10,7,5,0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  overlayTitle: {
    color: t.ink,
    fontFamily: "Fraunces_700Bold",
    fontSize: 36,
    fontWeight: "800",
  },
  overlayBody: {
    color: t.muted,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  overlayScore: {
    color: t.glow,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  tag: {
    color: t.glow,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
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
});
