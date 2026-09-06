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
  useReducedMotion,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { CafeStage } from "./CafeStage";
import {
  beanTick,
  hopTick,
  landTick,
  roastTick,
  MARK_FAR,
  MARK_H,
  MARK_IMMINENT,
  MARK_NEAR,
  MARK_WINDOW,
  RETRY_LOCK_MS,
  SQUASH_JUMP_MS,
  SQUASH_JUMP_X,
  SQUASH_JUMP_Y,
  SQUASH_LAND_MS,
  SQUASH_LAND_X,
  SQUASH_LAND_Y,
} from "./feel";
import {
  createRun,
  releaseJump,
  requestJump,
  resizeRun,
  tick,
  type DeathKind,
  type Run,
} from "./engine";
import {
  type CoachCue,
  type HazardKind,
  KIND_CODE,
  MAX_BEANS,
  MAX_HAZARDS,
  PLAYER_H,
  PLAYER_W,
} from "./physics";
import { BeanArt, HazardArt } from "./sprites";
import { saveBestScore } from "./storage";

type Slot = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  on: SharedValue<number>;
  kind: SharedValue<number>;
};

type Floater = { id: number; x: number; y: number; pts: number };

const CUE: Record<Exclude<CoachCue, null>, string> = {
  tap: "TAP TO HOP",
  tall: "TALL KIT — HOP",
  steam: "STEAM — STAY LOW",
};

const ROAST: Record<DeathKind, string> = {
  grinder: "A grinder caught the roast. Hop the low kits.",
  portafilter: "A portafilter blocked the line. Hop the tall ones.",
  steam: "Steam scalded the leap. Stay low under the cloud.",
};

function makeSlots(n: number): Slot[] {
  return Array.from({ length: n }, () => ({
    x: makeMutable(-80),
    y: makeMutable(0),
    w: makeMutable(20),
    h: makeMutable(20),
    on: makeMutable(0),
    kind: makeMutable(0),
  }));
}

function writeSlots(
  slots: Slot[],
  items: { x: number; y: number; w: number; h: number; kind?: HazardKind }[]
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
    slot.kind.value = item.kind ? KIND_CODE[item.kind] : 0;
    slot.on.value = 1;
  }
}

const HazardSprite = memo(function HazardSprite({
  slot,
  groundY,
  playerX,
}: {
  slot: Slot;
  groundY: number;
  playerX: number;
}) {
  const anim = useAnimatedStyle(() => {
    const dist = slot.x.value - playerX;
    const imminent = dist < MARK_IMMINENT && dist > -10;
    return {
      transform: [
        { translateX: slot.x.value },
        { translateY: slot.y.value },
        { scale: slot.on.value && imminent ? 1.08 : 1 },
      ],
      width: slot.w.value,
      height: slot.h.value,
      opacity: slot.on.value,
    };
  });
  const g = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 0 ? 1 : 0),
  }));
  const p = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 1 ? 1 : 0),
  }));
  const s = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 2 ? 1 : 0),
  }));
  const mark = useAnimatedStyle(() => {
    const dist = slot.x.value - playerX;
    const incoming = dist < MARK_WINDOW && dist > -16;
    const imminent = dist < MARK_IMMINENT && dist > -10;
    const steam = slot.kind.value === 2;
    return {
      transform: [
        { translateX: slot.x.value - 6 },
        { translateY: groundY - MARK_H },
        { scaleX: imminent ? 1.55 : incoming ? 1.2 : 1 },
      ],
      width: Math.max(32, slot.w.value + 12),
      height: MARK_H,
      opacity: slot.on.value * (imminent ? MARK_NEAR : incoming ? 0.9 : MARK_FAR),
      backgroundColor: steam ? "#D5E1EA" : t.danger,
    };
  });
  const hopGlyph = useAnimatedStyle(() => {
    const dist = slot.x.value - playerX;
    const incoming = dist < MARK_WINDOW && dist > -16;
    const hop = slot.kind.value !== 2;
    return {
      transform: [
        { translateX: slot.x.value + 4 },
        { translateY: groundY - MARK_H - 22 },
      ],
      opacity: slot.on.value * (hop ? (incoming ? 1 : 0.55) : 0),
    };
  });
  const stayGlyph = useAnimatedStyle(() => {
    const dist = slot.x.value - playerX;
    const incoming = dist < MARK_WINDOW && dist > -16;
    const steam = slot.kind.value === 2;
    return {
      transform: [
        { translateX: slot.x.value + 2 },
        { translateY: groundY - MARK_H - 22 },
      ],
      opacity: slot.on.value * (steam ? (incoming ? 1 : 0.55) : 0),
    };
  });
  const kit = useAnimatedStyle(() => {
    const dist = slot.x.value - playerX;
    const imminent = dist < MARK_IMMINENT && dist > -10;
    const steam = slot.kind.value === 2;
    return {
      borderColor: steam ? "#D5E1EA" : imminent ? "#F3C56B" : t.glow,
      borderWidth: imminent ? 3 : 2,
    };
  });
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.floorMark, mark]} />
      <Animated.Text pointerEvents="none" style={[styles.hopGlyph, hopGlyph]}>
        ▲
      </Animated.Text>
      <Animated.Text pointerEvents="none" style={[styles.stayGlyph, stayGlyph]}>
        ▬
      </Animated.Text>
      <Animated.View pointerEvents="none" style={[styles.sprite, styles.kit, anim, kit]}>
        <Animated.View style={[styles.artFill, g]}>
          <HazardArt kind="grinder" />
        </Animated.View>
        <Animated.View style={[styles.artFill, p]}>
          <HazardArt kind="portafilter" />
        </Animated.View>
        <Animated.View style={[styles.artFill, s]}>
          <HazardArt kind="steam" />
        </Animated.View>
      </Animated.View>
    </>
  );
});

const BeanSprite = memo(function BeanSprite({ slot }: { slot: Slot }) {
  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateX: slot.x.value },
      { translateY: slot.y.value },
      { scale: slot.on.value ? 1 + 0.05 * Math.sin(slot.x.value / 20) : 1 },
    ],
    width: slot.w.value,
    height: slot.h.value,
    opacity: slot.on.value,
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, styles.gold, anim]}>
      <BeanArt tone="honey" />
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
  const reduceMotion = useReducedMotion();
  const groundY = Math.round(height * 0.72);
  const playerX = Math.round(width * 0.18);
  const world = useMemo(
    () => ({ width, height, groundY }),
    [width, height, groundY]
  );

  const runRef = useRef<Run>(createRun(world, playerX));
  const playerY = useRef(makeMutable(world.groundY - PLAYER_H)).current;
  const squashX = useRef(makeMutable(1)).current;
  const squashY = useRef(makeMutable(1)).current;
  const bob = useRef(makeMutable(1)).current;
  const hopRing = useRef(makeMutable(0)).current;
  const landRing = useRef(makeMutable(0)).current;
  const coachPulse = useRef(makeMutable(1)).current;
  const flash = useRef(makeMutable(0)).current;
  const scroll = useRef(makeMutable(0)).current;
  const hazardSlots = useRef(makeSlots(MAX_HAZARDS)).current;
  const beanSlots = useRef(makeSlots(MAX_BEANS)).current;
  const last = useRef(0);
  const raf = useRef(0);
  const finishing = useRef(false);
  const retryAt = useRef(0);
  const floaterId = useRef(1);
  const floaterTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [deathKind, setDeathKind] = useState<DeathKind | null>(null);
  const [cue, setCue] = useState<CoachCue>("tap");
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const scoreRef = useRef(0);
  const cueRef = useRef<CoachCue>("tap");

  const playerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerX },
      { translateY: playerY.value },
      { scaleX: squashX.value },
      { scaleY: squashY.value * bob.value },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() => {
    const lift = Math.max(0, groundY - PLAYER_H - playerY.value);
    const s = Math.max(0.35, 1 - lift / 150);
    return {
      transform: [
        { translateX: playerX + 2 },
        { translateY: groundY - 8 },
        { scaleX: s },
      ],
      opacity: 0.32 + s * 0.36,
      width: PLAYER_W,
    };
  });
  const hopRingStyle = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - hopRing.value),
    transform: [
      { translateX: playerX + PLAYER_W / 2 - 24 },
      { translateY: groundY - 20 },
      { scale: 0.4 + hopRing.value * 2.15 },
    ],
  }));
  const landRingStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - landRing.value),
    transform: [
      { translateX: playerX + PLAYER_W / 2 - 30 },
      { translateY: groundY - 12 },
      { scaleX: 0.55 + landRing.value * 2.4 },
      { scaleY: 0.45 + landRing.value * 1.15 },
    ],
  }));
  const coachStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coachPulse.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const playHopJuice = useCallback(() => {
    if (!reduceMotion) {
      squashX.value = SQUASH_JUMP_X;
      squashY.value = SQUASH_JUMP_Y;
      squashX.value = withTiming(1, { duration: SQUASH_JUMP_MS });
      squashY.value = withTiming(1, { duration: SQUASH_JUMP_MS });
      hopRing.value = 0;
      hopRing.value = withTiming(1, { duration: 240 });
    }
    hopTick();
  }, [hopRing, reduceMotion, squashX, squashY]);

  const playLandJuice = useCallback(() => {
    if (!reduceMotion) {
      squashX.value = SQUASH_LAND_X;
      squashY.value = SQUASH_LAND_Y;
      squashX.value = withTiming(1, { duration: SQUASH_LAND_MS });
      squashY.value = withTiming(1, { duration: SQUASH_LAND_MS });
      landRing.value = 0;
      landRing.value = withTiming(1, { duration: 220 });
    }
    landTick();
  }, [landRing, reduceMotion, squashX, squashY]);

  const syncVisual = useCallback(
    (run: Run) => {
      playerY.value = run.playerY;
      scroll.value = run.distance;
      bob.value = run.airborne || reduceMotion ? 1 : 1 + Math.sin(run.distance / 14) * 0.07;
      writeSlots(hazardSlots, run.hazards);
      writeSlots(beanSlots, run.beans);
    },
    [beanSlots, hazardSlots, playerY, scroll, bob, reduceMotion]
  );

  const reset = useCallback(() => {
    finishing.current = false;
    retryAt.current = 0;
    runRef.current = createRun(world, playerX);
    squashX.value = 1;
    squashY.value = 1;
    bob.value = 1;
    hopRing.value = 0;
    landRing.value = 0;
    flash.value = 0;
    syncVisual(runRef.current);
    scoreRef.current = 0;
    cueRef.current = "tap";
    setScore(0);
    setPaused(false);
    setDead(false);
    setDeathKind(null);
    setCue("tap");
    setFloaters([]);
    for (const id of floaterTimers.current) clearTimeout(id);
    floaterTimers.current = [];
  }, [bob, flash, hopRing, landRing, playerX, squashX, squashY, syncVisual, world]);

  useEffect(() => {
    resizeRun(runRef.current, world, playerX);
    if (!runRef.current.dead && runRef.current.score === 0 && !runRef.current.jumped) {
      runRef.current.playerY = world.groundY - PLAYER_H;
    }
    syncVisual(runRef.current);
  }, [playerX, syncVisual, world]);

  const finish = useCallback(
    async (finalScore: number, kind: DeathKind | null) => {
      if (finishing.current) return;
      finishing.current = true;
      retryAt.current = Date.now() + RETRY_LOCK_MS;
      setDead(true);
      setDeathKind(kind);
      if (!reduceMotion) {
        flash.value = withSequence(withTiming(0.72, { duration: 55 }), withTiming(0, { duration: 320 }));
      }
      roastTick();
      const next = await saveBestScore(finalScore);
      onBest(next);
    },
    [flash, onBest, reduceMotion]
  );

  useEffect(() => {
    last.current = 0;
    const loop = (now: number) => {
      const run = runRef.current;
      if (!last.current) last.current = now;
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      const beforeDead = run.dead;
      tick(run, dt);
      syncVisual(run);
      if (run.justJumped) {
        playHopJuice();
      } else if (run.justLanded) {
        playLandJuice();
      }
      if (run.justBean) {
        const pts = run.justBean;
        const id = floaterId.current++;
        setFloaters((prev) => {
          const next = [...prev, { id, x: playerX, y: run.playerY - 12, pts }];
          return next.length > 5 ? next.slice(next.length - 5) : next;
        });
        const timer = setTimeout(() => {
          setFloaters((prev) => prev.filter((f) => f.id !== id));
        }, 620);
        floaterTimers.current.push(timer);
        beanTick();
      }
      const nextScore = Math.floor(run.score);
      if (nextScore !== scoreRef.current) {
        scoreRef.current = nextScore;
        setScore(nextScore);
      }
      if (run.cue !== cueRef.current) {
        cueRef.current = run.cue;
        setCue(run.cue);
      }
      if (run.dead && !beforeDead) void finish(nextScore, run.deathKind);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      for (const id of floaterTimers.current) clearTimeout(id);
      floaterTimers.current = [];
    };
  }, [finish, playHopJuice, playLandJuice, playerX, syncVisual]);

  useEffect(() => {
    if (reduceMotion) {
      coachPulse.value = 1;
      return;
    }
    coachPulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 320 }), withTiming(1, { duration: 320 })),
      -1,
      false
    );
  }, [coachPulse, reduceMotion]);

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

  const onJumpDown = () => {
    if (requestJump(runRef.current)) {
      playHopJuice();
      runRef.current.justJumped = false;
    }
  };
  const onJumpUp = () => {
    releaseJump(runRef.current);
  };

  const togglePause = () => {
    const run = runRef.current;
    if (run.dead) return;
    run.paused = !run.paused;
    run.holding = false;
    setPaused(run.paused);
    last.current = 0;
  };

  const onRetry = () => {
    if (Date.now() < retryAt.current) return;
    reset();
  };

  return (
    <View style={styles.play} testID="escape-play">
      <CafeStage width={width} height={height} groundY={groundY} scroll={scroll} />
      <SafeAreaView style={styles.hud}>
        <View style={styles.scoreChip}>
          <Text style={styles.hudScore} accessibilityRole="text">
            {score}
          </Text>
        </View>
        <View style={styles.bestChip}>
          <Text style={styles.hudBest}>Best {best}</Text>
        </View>
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
        accessibilityHint="Tap to hop grinders and portafilters. Stay low under steam. Collect honey beans."
        onPressIn={onJumpDown}
        onPressOut={onJumpUp}
        style={styles.stage}
      >
        <Animated.View pointerEvents="none" style={[styles.shadow, shadowStyle]} />
        <Animated.View pointerEvents="none" style={[styles.hopRing, hopRingStyle]} />
        <Animated.View pointerEvents="none" style={[styles.landRing, landRingStyle]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bean,
            { width: PLAYER_W, height: PLAYER_H },
            playerStyle,
          ]}
        >
          <BeanArt tone="roast" />
        </Animated.View>
        {hazardSlots.map((slot, i) => (
          <HazardSprite
            key={`h${i}`}
            slot={slot}
            groundY={groundY}
            playerX={playerX}
          />
        ))}
        {beanSlots.map((slot, i) => (
          <BeanSprite key={`b${i}`} slot={slot} />
        ))}
        {floaters.map((f) => (
          <View key={f.id} pointerEvents="none" style={[styles.floater, { left: f.x, top: f.y }]}>
            <Text style={styles.floaterText}>+{f.pts}</Text>
          </View>
        ))}
        {cue && !dead && !paused ? (
          <Animated.View
            style={[styles.hintWrap, coachStyle, { top: groundY + 18 }]}
            testID="escape-coach"
          >
            <Text style={styles.hint}>{CUE[cue]}</Text>
          </Animated.View>
        ) : null}
      </Pressable>

      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

      {paused && !dead ? (
        <View style={styles.overlay} testID="escape-paused">
          <View style={styles.sheet}>
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
        </View>
      ) : null}

      {dead ? (
        <View style={styles.overlay} testID="escape-gameover">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Brew again"
            onPress={onRetry}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sheet}>
            <Text style={styles.overlayTitle}>Roasted</Text>
            <Text style={styles.overlayScore}>Score {score}</Text>
            <Text style={styles.tag}>Best {best}</Text>
            <Text style={styles.overlayBody}>
              {deathKind ? ROAST[deathKind] : "The line caught the roast."} Tap to brew again.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Play again"
              onPress={onRetry}
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
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  play: { flex: 1 },
  hud: {
    paddingTop: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreChip: {
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  hudScore: {
    color: t.linen,
    fontFamily: "Fraunces_700Bold",
    fontSize: 34,
    fontWeight: "800",
  },
  bestChip: {
    flex: 1,
  },
  hudBest: {
    color: t.linenDim,
    fontFamily: "SourceSans3_400Regular",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  hudBtn: {
    minHeight: 44,
    minWidth: 72,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.kraft,
    backgroundColor: "rgba(36,24,15,0.45)",
  },
  hudBtnText: {
    color: t.linen,
    fontFamily: "SourceSans3_600SemiBold",
    fontWeight: "600",
  },
  stage: { flex: 1 },
  sprite: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
  kit: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: t.glow,
    overflow: "hidden",
    backgroundColor: t.espressoDeep,
  },
  artFill: {
    ...StyleSheet.absoluteFill,
  },
  bean: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: t.kraft,
  },
  gold: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF1C2",
  },
  shadow: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#140E0A",
  },
  hopRing: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: t.glow,
    backgroundColor: "transparent",
  },
  landRing: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 60,
    height: 16,
    borderRadius: 999,
    backgroundColor: t.kraft,
  },
  floorMark: {
    position: "absolute",
    left: 0,
    top: 0,
    height: MARK_H,
    borderRadius: 6,
    backgroundColor: t.danger,
    borderWidth: 1,
    borderColor: "#F3C56B",
  },
  hopGlyph: {
    position: "absolute",
    left: 0,
    top: 0,
    color: t.glow,
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "#1A120B",
    textShadowRadius: 4,
  },
  stayGlyph: {
    position: "absolute",
    left: 0,
    top: 0,
    color: "#D5E1EA",
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "#1A120B",
    textShadowRadius: 4,
  },
  floater: {
    position: "absolute",
    paddingHorizontal: 6,
  },
  floaterText: {
    color: t.glow,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 18,
    fontWeight: "800",
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#C45C4A",
  },
  hintWrap: {
    position: "absolute",
    left: 36,
    right: 36,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: t.kraft,
    borderWidth: 2,
    borderColor: t.glow,
  },
  hint: {
    color: t.cream,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 20,
    letterSpacing: 1.2,
    fontWeight: "800",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10,7,5,0.72)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    alignSelf: "stretch",
    backgroundColor: t.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.kraft,
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 10,
  },
  overlayTitle: {
    color: t.linen,
    fontFamily: "Fraunces_700Bold",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
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
    textAlign: "center",
  },
  tag: {
    color: t.linenDim,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
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
    minHeight: 48,
    justifyContent: "center",
  },
  ghostText: {
    color: t.linen,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
});
