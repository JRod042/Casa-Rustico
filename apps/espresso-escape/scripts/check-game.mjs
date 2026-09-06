#!/usr/bin/env node
/** Pure-logic checks for the runner — no IAP, no store, no checkout. */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function aabbHits(a, b, pad = 0) {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

const PLAYER_H = 38;
const JUMP_V = -880;
const GRAVITY_UP = 2200;
const BASE_SPEED = 280;
const MAX_SPEED = 400;
const MAX_DT = 1 / 30;
const INTRO_EMPTY_S = 2.3;

function speedForRun(time) {
  const t = Math.min(1, Math.max(0, time / 90));
  const eased = t * t * (3 - 2 * t);
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * eased;
}

const player = { x: 46, y: 205, w: 18, h: 24 };
const miss = { x: 120, y: 200, w: 42, h: 48 };
const hit = { x: 50, y: 210, w: 32, h: 40 };
if (aabbHits(player, miss)) throw new Error("false positive collision");
if (!aabbHits(player, hit)) throw new Error("missed collision");
if (aabbHits(player, { x: 40, y: 280, w: 20, h: 20 })) {
  throw new Error("ground bean should not collide with airborne player");
}

const groundY = 608;
const run = {
  playerY: groundY - PLAYER_H,
  vy: 0,
  paused: false,
  dead: false,
  jumped: false,
};
const onGround = run.playerY >= groundY - PLAYER_H - 1;
if (!onGround) throw new Error("spawn should be on the floor");
run.vy = JUMP_V;
run.jumped = true;
tickJump(run, 1 / 60);
if (run.playerY >= groundY - PLAYER_H) throw new Error("jump did not leave ground");
if (speedForRun(80) <= speedForRun(0)) throw new Error("speed should scale with time");
if (speedForRun(0) !== BASE_SPEED) throw new Error("opening speed must stay readable");
if (INTRO_EMPTY_S < 2) throw new Error("intro must leave a teach beat before the first kit");

const jumpH = (JUMP_V * JUMP_V) / (2 * GRAVITY_UP);
if (jumpH < 88) throw new Error("committed hop must clear a portafilter");

const roasted = { x: 70, y: 200, w: 18, h: 24 };
if (!aabbHits(roasted, { x: 70, y: 200, w: 32, h: 40 })) {
  throw new Error("overlap should roast the run");
}
if (Math.min(0.2, MAX_DT) !== MAX_DT) throw new Error("dt cap should clamp long hitches");

function tickJump(state, dt) {
  state.vy += GRAVITY_UP * dt;
  state.playerY += state.vy * dt;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|js|json)$/.test(name.name)) out.push(p);
  }
  return out;
}

const app = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
const desc = String(app.expo?.description ?? "");
if (!/mini-game/i.test(desc) || !/coffee/i.test(desc)) {
  throw new Error("app.json description must name a playable coffee mini-game");
}
if (!/in-app purchases/i.test(desc) || !/does not sell coffee/i.test(desc)) {
  throw new Error("app.json description must state no IAP and that the game does not sell coffee");
}
if (app.expo?.extra?.hasIap) {
  throw new Error("app.json extra.hasIap must be false");
}
if (!/Local high score/.test(String(app.expo?.extra?.privacyNote ?? ""))) {
  throw new Error("app.json extra.privacyNote must describe on-device storage only");
}
if (app.expo?.ios?.bundleIdentifier !== "com.jrod042.espressoescape") {
  throw new Error("iOS bundle must stay com.jrod042.espressoescape");
}

const sources = walk(join(root, "src"))
  .concat([join(root, "App.tsx"), join(root, "package.json")])
  .map((f) => readFileSync(f, "utf8"))
  .join("\n")
  .replace(/\s+/g, " ");

const banned = [
  "StoreKit",
  "RevenueCat",
  "expo-iap",
  "react-native-iap",
  "Purchases.",
  "buyProduct",
  "Checkout Kit",
  "Linking.openURL",
  "rusticopr.com/cart",
  "expo-store-review",
];
for (const token of banned) {
  if (sources.includes(token)) {
    throw new Error(`payments / shop API leaked into the game: ${token}`);
  }
}
if (!/does not sell coffee/.test(sources)) {
  throw new Error("About copy must state the game does not sell coffee");
}
if (!/requestAnimationFrame/.test(sources)) {
  throw new Error("play loop should use requestAnimationFrame");
}
if (!/testID="escape-privacy"/.test(sources)) {
  throw new Error("Privacy screen is required for a complete review demo");
}
if (!/testID="escape-how"/.test(sources) || !/Play Espresso Escape/.test(sources)) {
  throw new Error("How-to must offer a working Play path");
}
if (!/testID="escape-settings"/.test(sources)) {
  throw new Error("Settings screen is required");
}
if (!/MAGNET_R/.test(sources) || !/TELEGRAPH_S/.test(sources)) {
  throw new Error("pickup magnet and hazard telegraph must stay wired");
}
if (!/scriptBeat/.test(sources) || !/Grab the honey bean/.test(sources)) {
  throw new Error("first-run TAP→steam→bean micro-script must stay wired");
}
if (!/kraft\/runner\.png/.test(sources) || !/assets\/kraft/.test(sources)) {
  throw new Error("in-run art must use the Casa kraft PNG pack");
}
if (!/Meet the bar/.test(sources) || !/KitThumb/.test(sources)) {
  throw new Error("How-to must show café kits (grinder, portafilter, steam)");
}
if (!/CafeStage/.test(sources)) {
  throw new Error("Play field must use the linen café stage");
}
if (!/matterHitsHazard/.test(sources) || !/matter-js/.test(sources)) {
  throw new Error("Matter.js collision world must stay wired");
}
if (!/landTick/.test(sources) || !/life.value/.test(sources)) {
  throw new Error("handmade land juice and living café life loop must stay wired");
}
if (!/ESCAPE_WIRE_KRAFT/.test(readFileSync(join(root, "scripts/sync-kraft.mjs"), "utf8"))) {
  throw new Error("Creative drop-in must stay halted behind ESCAPE_WIRE_KRAFT");
}
if (!/onPressIn/.test(sources) || !/requestJump/.test(sources)) {
  throw new Error("jump must fire on touch-down, not release");
}
if (!/INTRO_EMPTY_S/.test(sources) || !/COYOTE_S/.test(sources) || !/HEEL_MERCY_S/.test(sources)) {
  throw new Error("feel systems (intro gap + coyote + heel mercy) must stay wired");
}
if (!/testID="escape-coach"/.test(sources)) {
  throw new Error("in-run coach is required so first-run is not a dead how-to wall");
}
if (!/hopTick/.test(sources) || !/expo-haptics/.test(sources)) {
  throw new Error("Apple-style hop haptics must stay wired");
}
if (!/#F7F3EC/.test(sources) || !/#A47C59/.test(sources) || !/#8D6C4F/.test(sources)) {
  throw new Error("kraft cream / kraft / dark kraft tokens must stay on the culture brief");
}
const retryLock = sources.match(/RETRY_LOCK_MS = (\d+)/);
if (!retryLock || Number(retryLock[1]) > 500) {
  throw new Error("death→retry lock must be named RETRY_LOCK_MS and stay ≤500ms");
}
if (!/if \(!seen\)/.test(sources) || !/setScreen\("play"\)/.test(sources)) {
  throw new Error("first-run must enter Play with the in-run coach, not a how-to wall");
}
if (!/MAX_DT = 1 \/ 30/.test(sources)) {
  throw new Error("frame hitch cap must stay at 1/30 so the loop can hold 60fps feel");
}

const play = spawnSync(process.execPath, [join(root, "scripts/playtest.mjs")], {
  encoding: "utf8",
});
if (play.status !== 0) {
  throw new Error(`playtest failed:\n${play.stdout}\n${play.stderr}`);
}

console.log("check-game: PASS");
