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
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import { CafeStage } from "./CafeStage";
import { PaperChip, PaperSheet, StickerButton } from "./MenuChrome";
import { beanTick, hopTick, landTick, retryTick, roastTick, steamTick, warnTick, RETRY_LOCK_MS } from "./feel";
import { stepPaper } from "./juice";
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
  type SceneryKind,
  KIND_CODE,
  MAX_BEANS,
  MAX_BUBBLES,
  MAX_HAZARDS,
  MAX_SCENERY,
  PLAYER_H,
  PLAYER_W,
} from "./physics";
import { BeanArt, BubbleArt, HazardArt, SceneryArt } from "./sprites";
import { saveBestScore } from "./storage";

type Slot = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  on: SharedValue<number>;
  kind: SharedValue<number>;
  warn: SharedValue<number>;
};

type Floater = { id: number; x: number; y: number; pts: number };

const CUE: Record<Exclude<CoachCue, null>, string> = {
  tap: "Tap to hop",
  tall: "Tall kit — hop both",
  steam: "Steam — stay low",
  bean: "Grab the honey bean",
};

const SCENERY_CODE: Record<SceneryKind, number> = {
  coffeeTree: 0,
  palm: 1,
  banana: 2,
  coconuts: 3,
  flamboyan: 4,
  plantain: 5,
  pineapple: 6,
  cacao: 7,
  dryingBed: 8,
  tinaja: 9,
};

const ROAST: Record<DeathKind, string> = {
  grinder: "The grinder nicked the roast — a soft bump, not a cheap wall. Hop the low kits.",
  portafilter: "A tall portafilter filled the line. Hop both. The paper has weight.",
  steam: "Warm steam, not a spike. Stay on the linen under the cloud.",
  knockbox: "The knockbox clipped a heel. Hop the low kits.",
  tamper: "A tamper took the line. Hop the mid kits.",
  cup: "The cup stack held the roast. Hop the stack.",
};

function makeSlots(n: number): Slot[] {
  return Array.from({ length: n }, () => ({
    x: makeMutable(-80),
    y: makeMutable(0),
    w: makeMutable(20),
    h: makeMutable(20),
    on: makeMutable(0),
    kind: makeMutable(0),
    warn: makeMutable(0),
  }));
}

function writeSlots(
  slots: Slot[],
  items: { x: number; y: number; w: number; h: number; kind?: HazardKind; warned?: boolean }[]
): void {
  for (let i = 0; i < slots.length; i += 1) {
    const item = items[i];
    const slot = slots[i];
    if (!item) {
      slot.on.value = 0;
      slot.warn.value = 0;
      continue;
    }
    slot.x.value = item.x;
    slot.y.value = item.y;
    slot.w.value = item.w;
    slot.h.value = item.h;
    slot.kind.value = item.kind ? KIND_CODE[item.kind] : 0;
    slot.on.value = 1;
    slot.warn.value = item.warned ? 1 : 0;
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
    const approach = Math.max(0, Math.min(1, 1 - (slot.x.value - playerX) / 280));
    const near = 0.9 + approach * 0.14;
    return {
      transform: [
        { translateX: slot.x.value },
        { translateY: slot.y.value },
        { scale: slot.warn.value ? near * 1.06 : near },
      ],
      width: slot.w.value,
      height: slot.h.value,
      opacity: slot.on.value * (0.72 + approach * 0.28),
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
  const k = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 3 ? 1 : 0),
  }));
  const tm = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 4 ? 1 : 0),
  }));
  const c = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 5 ? 1 : 0),
  }));
  const mark = useAnimatedStyle(() => {
    const near = slot.x.value < playerX + 210 && slot.x.value > playerX - 10;
    const steam = slot.kind.value === 2;
    const hot = slot.warn.value > 0;
    return {
      transform: [{ translateX: slot.x.value - 4 }, { translateY: groundY - 10 }],
      width: Math.max(22, slot.w.value + 8),
      height: hot ? 11 : 7,
      opacity: slot.on.value * (hot ? 1 : near ? 0.85 : 0.28),
      backgroundColor: steam ? t.linenDim : hot ? t.kraft : t.espresso,
    };
  });
  const kit = useAnimatedStyle(() => ({
    borderColor: "transparent",
    borderWidth: 0,
  }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.floorMark, mark]} />
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
        <Animated.View style={[styles.artFill, k]}>
          <HazardArt kind="knockbox" />
        </Animated.View>
        <Animated.View style={[styles.artFill, tm]}>
          <HazardArt kind="tamper" />
        </Animated.View>
        <Animated.View style={[styles.artFill, c]}>
          <HazardArt kind="cup" />
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
      { scale: slot.on.value ? 1 + 0.06 * Math.sin(slot.x.value / 18) : 1 },
    ],
    width: slot.w.value,
    height: slot.h.value,
    opacity: slot.on.value,
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, styles.cutout, anim]}>
      <BeanArt tone="honey" />
    </Animated.View>
  );
});

const BubbleSprite = memo(function BubbleSprite({ slot }: { slot: Slot }) {
  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateX: slot.x.value },
      { translateY: slot.y.value + Math.sin(slot.x.value / 22) * 5 },
      { scale: slot.on.value ? 1 + 0.08 * Math.sin(slot.x.value / 14) : 1 },
    ],
    width: slot.w.value,
    height: slot.h.value,
    opacity: slot.on.value,
  }));
  const score = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 0 ? 1 : 0),
  }));
  const prize = useAnimatedStyle(() => ({
    opacity: slot.on.value * (slot.kind.value === 1 ? 1 : 0),
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, styles.cutout, anim]}>
      <Animated.View style={[styles.artFill, score]}>
        <BubbleArt />
      </Animated.View>
      <Animated.View style={[styles.artFill, prize]}>
        <BubbleArt prize />
      </Animated.View>
    </Animated.View>
  );
});

const ScenerySprite = memo(function ScenerySprite({ slot }: { slot: Slot }) {
  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateX: slot.x.value },
      { translateY: slot.y.value },
    ],
    width: slot.w.value,
    height: slot.h.value,
    opacity: slot.on.value * 0.94,
  }));
  const tree = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 0 ? 1 : 0) }));
  const palm = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 1 ? 1 : 0) }));
  const banana = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 2 ? 1 : 0) }));
  const nuts = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 3 ? 1 : 0) }));
  const flamboyan = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 4 ? 1 : 0) }));
  const plantain = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 5 ? 1 : 0) }));
  const pineapple = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 6 ? 1 : 0) }));
  const cacao = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 7 ? 1 : 0) }));
  const dryingBed = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 8 ? 1 : 0) }));
  const tinaja = useAnimatedStyle(() => ({ opacity: slot.on.value * (slot.kind.value === 9 ? 1 : 0) }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, styles.cutout, anim]}>
      <Animated.View style={[styles.artFill, tree]}>
        <SceneryArt kind="coffeeTree" />
      </Animated.View>
      <Animated.View style={[styles.artFill, palm]}>
        <SceneryArt kind="palm" />
      </Animated.View>
      <Animated.View style={[styles.artFill, banana]}>
        <SceneryArt kind="banana" />
      </Animated.View>
      <Animated.View style={[styles.artFill, nuts]}>
        <SceneryArt kind="coconuts" />
      </Animated.View>
      <Animated.View style={[styles.artFill, flamboyan]}>
        <SceneryArt kind="flamboyan" />
      </Animated.View>
      <Animated.View style={[styles.artFill, plantain]}>
        <SceneryArt kind="plantain" />
      </Animated.View>
      <Animated.View style={[styles.artFill, pineapple]}>
        <SceneryArt kind="pineapple" />
      </Animated.View>
      <Animated.View style={[styles.artFill, cacao]}>
        <SceneryArt kind="cacao" />
      </Animated.View>
      <Animated.View style={[styles.artFill, dryingBed]}>
        <SceneryArt kind="dryingBed" />
      </Animated.View>
      <Animated.View style={[styles.artFill, tinaja]}>
        <SceneryArt kind="tinaja" />
      </Animated.View>
    </Animated.View>
  );
});

export function PlayField({
  best,
  onBest,
  onMenu,
  tutorial = false,
}: {
  best: number;
  onBest: (n: number) => void;
  onMenu: () => void;
  tutorial?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const groundY = Math.round(height * 0.72);
  const playerX = Math.round(width * 0.18);
  const world = useMemo(
    () => ({ width, height, groundY }),
    [width, height, groundY]
  );

  const runRef = useRef<Run>(createRun(world, playerX, Date.now(), { tutorial }));
  const playerY = useRef(makeMutable(world.groundY - PLAYER_H)).current;
  const squashX = useRef(makeMutable(1)).current;
  const squashY = useRef(makeMutable(1)).current;
  const bob = useRef(makeMutable(1)).current;
  const lean = useRef(makeMutable(0)).current;
  const flash = useRef(makeMutable(0)).current;
  const scroll = useRef(makeMutable(0)).current;
  const hazardSlots = useRef(makeSlots(MAX_HAZARDS)).current;
  const beanSlots = useRef(makeSlots(MAX_BEANS)).current;
  const bubbleSlots = useRef(makeSlots(MAX_BUBBLES)).current;
  const scenerySlots = useRef(makeSlots(MAX_SCENERY)).current;
  const last = useRef(0);
  const raf = useRef(0);
  const finishing = useRef(false);
  const retryAt = useRef(0);
  const floaterId = useRef(1);
  const floaterTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tutorialRef = useRef(tutorial);

  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [deathKind, setDeathKind] = useState<DeathKind | null>(null);
  const [cue, setCue] = useState<CoachCue>("tap");
  const [hopping, setHopping] = useState(false);
  const [poseFrame, setPoseFrame] = useState(0);
  const [mult, setMult] = useState(1);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const scoreRef = useRef(0);
  const cueRef = useRef<CoachCue>("tap");
  const hopRef = useRef(false);

  const playerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: playerX },
      { translateY: playerY.value },
      { rotate: `${lean.value}rad` },
      { scaleX: squashX.value },
      { scaleY: squashY.value * bob.value },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() => {
    const lift = Math.max(0, groundY - PLAYER_H - playerY.value);
    const s = Math.max(0.36, 1 - lift / 160);
    return {
      transform: [
        { translateX: playerX - 2 },
        { translateY: groundY - 6 },
        { scaleX: s },
      ],
      opacity: 0.22 + s * 0.3,
      width: PLAYER_W + 6,
    };
  });
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const syncVisual = useCallback(
    (run: Run) => {
      playerY.value = run.playerY;
      scroll.value = run.distance;
      lean.value = run.lean;
      bob.value =
        run.airborne || reduceMotion
          ? 1
          : 1 + (Math.sin(run.distance / 16) > 0 ? 0.04 : 0);
      writeSlots(hazardSlots, run.hazards);
      writeSlots(beanSlots, run.beans);
      writeSlots(
        bubbleSlots,
        run.bubbles.map((b) => ({ ...b, kind: b.kind === "prize" ? "portafilter" : "grinder" }))
      );
      writeSlots(
        scenerySlots,
        run.scenery.map((s) => ({
          x: s.x,
          y: s.y,
          w: s.w,
          h: s.h,
          kind: (["grinder", "portafilter", "steam", "knockbox"] as HazardKind[])[SCENERY_CODE[s.kind]] ?? "grinder",
        }))
      );
    },
    [beanSlots, bubbleSlots, hazardSlots, scenerySlots, playerY, scroll, bob, lean, reduceMotion]
  );

  const reset = useCallback(() => {
    finishing.current = false;
    retryAt.current = 0;
    runRef.current = createRun(world, playerX, Date.now(), {
      tutorial: tutorialRef.current,
    });
    squashX.value = 1;
    squashY.value = 1;
    bob.value = 1;
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
  }, [bob, flash, playerX, squashX, squashY, syncVisual, world]);

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
      tutorialRef.current = false;
      setDead(true);
      setDeathKind(kind);
      if (!reduceMotion) {
        flash.value = withSequence(
          withTiming(0.22, { duration: 0 }),
          withTiming(0.22, { duration: 80 }),
          withTiming(0.1, { duration: 0 }),
          withTiming(0, { duration: 200 })
        );
        stepPaper(squashX, 1.22, 1.1);
        stepPaper(squashY, 1 / 1.22, 0.92);
      }
      const next = await saveBestScore(finalScore);
      onBest(next);
    },
    [flash, onBest, reduceMotion, squashX, squashY]
  );

  useEffect(() => {
    last.current = 0;
    const loop = (now: number) => {
      const run = runRef.current;
      if (!last.current) last.current = now;
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      const beforeDead = run.dead;
      const pendingHop = run.justJumped;
      const pendingLand = run.justLanded;
      const pendingBean = run.justBean;
      const pendingBubble = run.justBubble;
      const pendingWarn = run.justTelegraph;
      tick(run, dt);
      syncVisual(run);
      const hopped = run.justJumped || pendingHop;
      const landed = run.justLanded || pendingLand;
      const beans = run.justBean || pendingBean;
      const bubbles = run.justBubble || pendingBubble;
      const warned = run.justTelegraph || pendingWarn;
      const pose =
        run.hopping && run.airborne
          ? run.vy < -140
            ? 1
            : run.vy < 70
              ? 2
              : 3
          : run.plantT > 0
            ? 3
            : run.vy < -80
              ? 0
              : run.vy < 0
                ? 1
                : run.vy < 90
                  ? 2
                  : 3;
      setPoseFrame(pose);
      if (run.mult !== 1) setMult(run.mult);
      else setMult(1);
      if (hopped) {
        hopTick();
        if (!reduceMotion) {
          stepPaper(squashX, 0.92, 0.96);
          stepPaper(squashY, 1 / 0.92, 1.04);
        }
      } else if (landed) {
        if (run.landFromHop) {
          landTick();
          if (!reduceMotion) {
            stepPaper(squashX, 1.32, 1.16);
            stepPaper(squashY, 1 / 1.32, 0.88);
          }
        } else if (!reduceMotion) {
          stepPaper(squashX, 1.08, 1.02);
          stepPaper(squashY, 0.94, 0.98);
        }
      }
      if (beans) {
        const pts = beans;
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
        if (!reduceMotion) {
          stepPaper(squashX, 1.14, 1.06);
          stepPaper(squashY, 0.94, 0.98);
        }
      }
      if (bubbles) {
        const pts = bubbles;
        const id = floaterId.current++;
        setFloaters((prev) => {
          const next = [...prev, { id, x: playerX, y: run.playerY - 18, pts }];
          return next.length > 5 ? next.slice(next.length - 5) : next;
        });
        const timer = setTimeout(() => {
          setFloaters((prev) => prev.filter((f) => f.id !== id));
        }, 620);
        floaterTimers.current.push(timer);
        beanTick();
        if (!reduceMotion) {
          stepPaper(squashX, 0.9, 0.96);
          stepPaper(squashY, 1.1, 1.04);
        }
      }
      if (warned && !run.dead) {
        if (!reduceMotion) {
          flash.value = withSequence(withTiming(0.08, { duration: 70 }), withTiming(0, { duration: 220 }));
        }
        if (warned === "steam") steamTick();
        else warnTick();
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
      if (run.hopping !== hopRef.current) {
        hopRef.current = run.hopping;
        setHopping(run.hopping);
      }
      if (run.dead && !beforeDead) {
        roastTick();
        void finish(nextScore, run.deathKind);
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      for (const id of floaterTimers.current) clearTimeout(id);
      floaterTimers.current = [];
    };
  }, [finish, flash, playerX, reduceMotion, squashX, squashY, syncVisual]);

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
    const run = runRef.current;
    if (!requestJump(run)) return;
    hopTick();
    if (!reduceMotion) {
      stepPaper(squashX, 0.92, 0.96);
      stepPaper(squashY, 1.08, 1.04);
    }
    run.justJumped = false;
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
    retryTick();
    reset();
  };

  const newBest = dead && score > 0 && score >= best;

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
          <Text style={styles.hudBest}>
            Best {best}
            {mult > 1 ? ` · ${mult}×` : ""}
          </Text>
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
        accessibilityHint="Tap to hop grinders and portafilters. Stay low under steam. Pop crema bubbles. Collect honey beans."
        onPressIn={onJumpDown}
        onPressOut={onJumpUp}
        style={styles.stage}
      >
        <Animated.View pointerEvents="none" style={[styles.shadow, shadowStyle]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bean,
            { width: PLAYER_W, height: PLAYER_H },
            playerStyle,
          ]}
        >
          <BeanArt tone="roast" pose={hopping ? "hop" : "run"} frame={poseFrame} />
        </Animated.View>
        {scenerySlots.map((slot, i) => (
          <ScenerySprite key={`s${i}`} slot={slot} />
        ))}
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
        {bubbleSlots.map((slot, i) => (
          <BubbleSprite key={`u${i}`} slot={slot} />
        ))}
        {floaters.map((f) => (
          <View key={f.id} pointerEvents="none" style={[styles.floater, { left: f.x, top: f.y }]}>
            <Text style={styles.floaterText}>+{f.pts}</Text>
          </View>
        ))}
        {cue && !dead && !paused ? (
          <View style={[styles.hintWrap, { top: groundY + 16 }]} testID="escape-coach">
            <Text style={styles.hint}>{CUE[cue]}</Text>
          </View>
        ) : null}
      </Pressable>

      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

      {paused && !dead ? (
        <View style={styles.overlay} testID="escape-paused">
          <PaperSheet>
            <Text style={styles.overlayTitle}>Paused</Text>
            <Text style={styles.overlayBody}>
              The café holds still. Look around the paper diorama — then hop again. Nothing is for sale here.
            </Text>
            <StickerButton
              primary
              label="Resume"
              accessibilityLabel="Resume run"
              onPress={togglePause}
            />
            <StickerButton
              label="Menu"
              accessibilityLabel="Leave run"
              onPress={onMenu}
            />
          </PaperSheet>
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
          <PaperSheet>
            <PaperChip ink>{newBest ? "Best Run" : "Roasted"}</PaperChip>
            <Text style={styles.overlayTitle}>{newBest ? "Best Run" : "Roasted"}</Text>
            <Text style={styles.overlayScore}>Score {score}</Text>
            <Text style={styles.tag}>Best {best}</Text>
            <Text style={styles.overlayBody}>
              {deathKind ? ROAST[deathKind] : "The line caught the roast."} Tap to brew again.
            </Text>
            <StickerButton
              primary
              quiet
              label="Brew again"
              accessibilityLabel="Play again"
              onPress={onRetry}
            />
            <StickerButton
              label="Menu"
              accessibilityLabel="Back to menu"
              onPress={onMenu}
            />
          </PaperSheet>
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
    color: t.cream,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: t.kraft,
    backgroundColor: "rgba(247,243,236,0.18)",
  },
  hudBtnText: {
    color: t.cream,
    fontFamily: "SourceSans3_600SemiBold",
    fontWeight: "600",
  },
  stage: { flex: 1 },
  sprite: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
  kit: {
    borderRadius: 0,
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  cutout: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  artFill: {
    ...StyleSheet.absoluteFill,
  },
  bean: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  gold: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  shadow: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 10,
    borderRadius: 999,
    backgroundColor: t.espresso,
    mixBlendMode: "multiply",
  },
  floorMark: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.danger,
  },
  floater: {
    position: "absolute",
    paddingHorizontal: 6,
  },
  floaterText: {
    color: t.cream,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 18,
    fontWeight: "800",
  },
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: t.kraftDeep,
  },
  hintWrap: {
    position: "absolute",
    left: 40,
    right: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(247,243,236,0.9)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: t.kraftDeep,
    transform: [{ rotate: "-0.4deg" }],
  },
  hint: {
    color: t.ink,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 15,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(42,24,16,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  overlayTitle: {
    color: t.ink,
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
    color: t.kraftDeep,
    fontFamily: "SourceSans3_700Bold",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  tag: {
    color: t.ink,
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
});
