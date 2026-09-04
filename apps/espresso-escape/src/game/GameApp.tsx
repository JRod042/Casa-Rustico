import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SteamMark } from "../welcome/SteamMark";
import { escapeWelcomeTheme as t } from "../welcome/theme";
import {
  type Bean,
  type Hazard,
  type World,
  GRAVITY,
  JUMP_V,
  PLAYER_H,
  PLAYER_W,
  aabbHits,
  makeBean,
  makeHazard,
  pickHazardKind,
  playerRect,
  spawnGapForSpeed,
  speedForScore,
} from "./physics";
import { loadBestScore, saveBestScore } from "./storage";

type Screen = "menu" | "how" | "about" | "play";

const TICK_MS = 16;

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
      <Panel
        title="How to play"
        onBack={onBack}
        body={
          "Tap the café floor to jump.\n\nDodge grinders, steam wands, and portafilters.\n\nCollect gold beans for points. The line speeds up the longer you last.\n\nOne hit ends the run. No lives to buy — just brew again."
        }
      />
    );
  }
  if (screen === "about") {
    return (
      <Panel
        title="About"
        onBack={onBack}
        body={
          "Espresso Escape is a free Casa Rústico game.\n\nNo accounts. No ads. No in-app purchases. This game does not sell coffee or take payments.\n\nBags and café orders live in Casa Rustico Go and Hacienda — not here."
        }
      />
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

function Panel({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.menu}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
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

function PlayField({
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
  const worldRef = useRef<World>({ width, height, groundY });
  worldRef.current = { width, height, groundY };

  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [playerY, setPlayerY] = useState(groundY - PLAYER_H);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);

  const vy = useRef(0);
  const yRef = useRef(groundY - PLAYER_H);
  const hazardsRef = useRef<Hazard[]>([]);
  const beansRef = useRef<Bean[]>([]);
  const scoreRef = useRef(0);
  const nextId = useRef(1);
  const spawnIn = useRef(700);
  const beanIn = useRef(900);
  const pausedRef = useRef(false);
  const deadRef = useRef(false);

  const reset = useCallback(() => {
    vy.current = 0;
    yRef.current = groundY - PLAYER_H;
    hazardsRef.current = [];
    beansRef.current = [];
    scoreRef.current = 0;
    nextId.current = 1;
    spawnIn.current = 700;
    beanIn.current = 900;
    pausedRef.current = false;
    deadRef.current = false;
    setScore(0);
    setPaused(false);
    setDead(false);
    setPlayerY(groundY - PLAYER_H);
    setHazards([]);
    setBeans([]);
  }, [groundY]);

  useEffect(() => {
    reset();
  }, [reset]);

  const jump = useCallback(() => {
    if (pausedRef.current || deadRef.current) return;
    const onGround = yRef.current >= groundY - PLAYER_H - 1;
    if (onGround) vy.current = JUMP_V;
  }, [groundY]);

  const finish = useCallback(
    async (finalScore: number) => {
      deadRef.current = true;
      setDead(true);
      const next = await saveBestScore(finalScore);
      onBest(next);
    },
    [onBest]
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || deadRef.current) return;
      const dt = TICK_MS / 1000;
      const speed = speedForScore(scoreRef.current);

      vy.current += GRAVITY * dt;
      yRef.current += vy.current * dt;
      const floor = groundY - PLAYER_H;
      if (yRef.current >= floor) {
        yRef.current = floor;
        vy.current = 0;
      }

      spawnIn.current -= speed * dt * 100;
      if (spawnIn.current <= 0) {
        const kind = pickHazardKind(scoreRef.current);
        hazardsRef.current = [
          ...hazardsRef.current,
          makeHazard(nextId.current++, worldRef.current, kind),
        ];
        spawnIn.current = spawnGapForSpeed(speed);
      }

      beanIn.current -= speed * dt * 100;
      if (beanIn.current <= 0) {
        beansRef.current = [
          ...beansRef.current,
          makeBean(nextId.current++, worldRef.current, scoreRef.current % 2 === 0),
        ];
        beanIn.current = 1100 + (scoreRef.current % 5) * 80;
      }

      hazardsRef.current = hazardsRef.current
        .map((h) => ({ ...h, x: h.x - speed * dt }))
        .filter((h) => h.x + h.w > -40);
      beansRef.current = beansRef.current
        .map((b) => ({ ...b, x: b.x - speed * dt }))
        .filter((b) => !b.taken && b.x + b.w > -20);

      const me = playerRect(playerX, yRef.current);
      let gained = 0;
      beansRef.current = beansRef.current.map((b) => {
        if (!b.taken && aabbHits(me, b, 0)) {
          gained += 5;
          return { ...b, taken: true };
        }
        return b;
      });
      if (gained) scoreRef.current += gained;
      else scoreRef.current += dt * 2.4;

      const hit = hazardsRef.current.some((h) => aabbHits(me, h));
      setPlayerY(yRef.current);
      setHazards(hazardsRef.current);
      setBeans(beansRef.current.filter((b) => !b.taken));
      setScore(Math.floor(scoreRef.current));
      if (hit) void finish(Math.floor(scoreRef.current));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [finish, groundY, playerX]);

  const togglePause = () => {
    if (deadRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  return (
    <View style={styles.play} testID="escape-play">
      <View style={styles.hud}>
        <Text style={styles.hudScore}>{Math.floor(score)}</Text>
        <Text style={styles.hudBest}>Best {best}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? "Resume" : "Pause"}
          onPress={togglePause}
          style={styles.hudBtn}
        >
          <Text style={styles.hudBtnText}>{paused ? "Resume" : "Pause"}</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jump"
        onPress={jump}
        style={styles.stage}
      >
        <View style={[styles.ground, { top: groundY }]} />
        <View
          style={[
            styles.bean,
            { left: playerX, top: playerY, width: PLAYER_W, height: PLAYER_H },
          ]}
        />
        {hazards.map((h) => (
          <View
            key={h.id}
            style={[
              styles.hazard,
              h.kind === "steam" && styles.steam,
              h.kind === "portafilter" && styles.porta,
              { left: h.x, top: h.y, width: h.w, height: h.h },
            ]}
          />
        ))}
        {beans.map((b) => (
          <View
            key={b.id}
            style={[styles.gold, { left: b.x, top: b.y, width: b.w, height: b.h }]}
          />
        ))}
        <Text style={[styles.hint, { top: groundY + 18 }]}>
          Tap to jump · collect beans · dodge the bar
        </Text>
      </Pressable>

      {paused && !dead ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Paused</Text>
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
          <Text style={styles.overlayScore}>Score {Math.floor(score)}</Text>
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
    fontWeight: "700",
    marginTop: 8,
  },
  title: {
    color: t.ink,
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  tag: {
    color: t.glow,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  best: { color: t.muted, fontSize: 15, marginBottom: 10 },
  primary: {
    alignSelf: "stretch",
    backgroundColor: t.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },
  primaryText: { color: "#FFF8F0", fontSize: 17, fontWeight: "800" },
  ghost: {
    alignSelf: "stretch",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.line,
  },
  ghostText: { color: t.ink, fontSize: 16, fontWeight: "700" },
  panelTitle: {
    color: t.ink,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  panelBody: {
    color: t.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  play: { flex: 1 },
  hud: {
    paddingTop: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudScore: { color: t.glow, fontSize: 36, fontWeight: "800", minWidth: 72 },
  hudBest: { color: t.muted, fontSize: 14, flex: 1, marginLeft: 8 },
  hudBtn: {
    borderWidth: 1,
    borderColor: t.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hudBtnText: { color: t.ink, fontWeight: "700" },
  stage: { flex: 1 },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: t.line,
  },
  bean: {
    position: "absolute",
    borderRadius: 14,
    backgroundColor: t.glow,
  },
  gold: {
    position: "absolute",
    borderRadius: 10,
    backgroundColor: "#F0C56A",
  },
  hazard: {
    position: "absolute",
    borderRadius: 10,
    backgroundColor: t.danger,
  },
  steam: { backgroundColor: "#C4A484", opacity: 0.85, borderRadius: 8 },
  porta: { backgroundColor: "#6B3F2A", borderRadius: 8 },
  hint: {
    position: "absolute",
    left: 20,
    right: 20,
    color: "#6B5A4A",
    fontSize: 12,
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10,7,5,0.78)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  overlayTitle: { color: t.ink, fontSize: 36, fontWeight: "800" },
  overlayScore: { color: t.glow, fontSize: 22, fontWeight: "700", marginBottom: 8 },
});
