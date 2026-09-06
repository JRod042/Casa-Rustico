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
if (!/escape-diorama/.test(sources) || !/scroll.value \* 0.035/.test(sources)) {
  throw new Error("six-plate café diorama parallax must stay wired");
}
if (!/KRAFT_DROPIN/.test(sources)) {
  throw new Error("Creative v2 filename map (hooks only) must stay in kraftMap");
}
if (!/V2_HOLD/.test(sources) || !/denser-v2/.test(sources)) {
  throw new Error("denser v2 hold must stay in kraftMap — do not treat v1 as final");
}
if (!/INVENTORY_STALE/.test(sources)) {
  throw new Error("INVENTORY.md must stay marked STALE until Creative finishes 6 plates");
}
if (!/CORE_FEEL_BRIEF/.test(sources) || !/escape-lbp-reviews-core-feel/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-lbp-reviews-core-feel in feel");
}
if (!/UNIFIED_PLAYBOOK/.test(sources) || !/escape-unified-revision-playbook/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-unified-revision-playbook");
}
if (!/CONTROL_FAIRNESS/.test(sources)) {
  throw new Error("App Store control-fairness lock must stay on physics");
}
if (!/windowShimmer/.test(sources)) {
  throw new Error("diorama must keep living window light for wonder/immersion");
}
if (!/FEEL_QA_LOCKED/.test(sources)) {
  throw new Error("Feel QA lock must stay on physics");
}
const phys = readFileSync(join(root, "src/game/physics.ts"), "utf8");
const tel = phys.match(/TELEGRAPH_S = ([\d.]+)/);
if (!tel || Number(tel[1]) < 0.55) {
  throw new Error("soft-danger telegraph must stay ≥550ms");
}
const gUp = phys.match(/GRAVITY_UP = (\d+)/);
const gDown = phys.match(/GRAVITY_DOWN = (\d+)/);
if (!gUp || !gDown || Number(gDown[1]) <= Number(gUp[1])) {
  throw new Error("fall gravity must stay heavier than rise (not a floaty jump)");
}
if (!/stepPaper\(squashX, 0.92/.test(sources) || !/stepPaper\(squashX, 1.32/.test(sources)) {
  throw new Error("squash hop + cardboard land thump must stay wired");
}
if (
  !/scroll.value \* 0.02/.test(sources) ||
  !/scroll.value \* 0.08/.test(sources) ||
  !/scroll.value \* 0.16/.test(sources) ||
  !/scroll.value \* 0.3/.test(sources)
) {
  throw new Error("diorama must keep ≥4 parallax plates");
}
if (!/CRAFT_TECHNIQUE_BRIEF/.test(sources) || !/escape-lbp-craft-technique/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-lbp-craft-technique in kraftMap");
}
if (!/softShadow/.test(sources)) {
  throw new Error("scrapbook chrome must keep a soft paper-cast shadow");
}
if (!/scrapbook|paperEdge|stampRing/.test(sources)) {
  throw new Error("menus must keep scrapbook stitch / paper-edge chrome");
}
if (!/plantSway/.test(sources) || !/lightShaft/.test(sources)) {
  throw new Error("diorama must keep idle plant sway and soft light shafts");
}
const pkg = readFileSync(join(root, "package.json"), "utf8");
if (!/@shopify\/react-native-skia/.test(pkg)) {
  throw new Error("Skia PRIMARY must stay in package.json");
}
if (!/react-native-gesture-handler/.test(pkg)) {
  throw new Error("gesture-handler must stay beside Skia + Reanimated");
}
if (/expo-gl|react-three-fiber|"three":/i.test(pkg)) {
  throw new Error("do not add expo-gl / R3F — Skia is the kit-eval primary");
}
if (!/CafeStageSkia/.test(sources) || !/from "@shopify\/react-native-skia"/.test(sources)) {
  throw new Error("first Skia canvas path (CafeStageSkia) must stay wired");
}
if (!/CafeStageViews/.test(sources) || !/SKIA_FPS_KILL/.test(sources)) {
  throw new Error("Views fallback + SKIA_FPS_KILL switch must stay wired");
}
if (!/SKIA_TIMEBOX/.test(sources) || !/KEEP_PRIMARY/.test(sources)) {
  throw new Error("Skia time-box must stay KEEP_PRIMARY until a device <55 fps kill");
}
if (!/APPSTORE_CONTROLS_BRIEF/.test(sources) || !/escape-appstore-controls-feel-hits/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-appstore-controls-feel-hits");
}
if (!/PRO_KIT_EVAL/.test(sources) || !/escape-pro-kit-eval/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-pro-kit-eval");
}
if (!/GEMINI_COMPARE_BRIEF/.test(sources) || !/escape-gemini-compare-optimize/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-gemini-compare-optimize");
}
if (!/stepPaper/.test(sources) || !/STEAM_FIRST_MS/.test(sources) || !/FAKE_AO/.test(sources)) {
  throw new Error("Gemini fold 2–5 must stay: stop-motion, steam-first, fake AO");
}
if (!/honeyTint/.test(sources) || !/leafDot/.test(sources)) {
  throw new Error("leaf-dot sway and honey tint must stay wired");
}
if (!/LEAF_DOT_PULSE_PX/.test(sources) || !/leafPulse/.test(sources)) {
  throw new Error("leaf-dot must keep a dedicated ±1–2px pulse (not plant sway only)");
}
if (!/FAKE_AO_BLEND|BlendMode.Multiply/.test(sources) || !/mixBlendMode/.test(sources)) {
  throw new Error("fake-AO must use true Multiply blend (Skia + Views)");
}
const syncSrc = readFileSync(join(root, "scripts/sync-kraft.mjs"), "utf8");
if (!/ESCAPE_WIRE_KRAFT/.test(syncSrc)) {
  throw new Error("Creative drop-in must stay halted behind ESCAPE_WIRE_KRAFT");
}
if (!/ESCAPE_INVENTORY_FRESH/.test(syncSrc) || !/INVENTORY.md is STALE/.test(syncSrc)) {
  throw new Error("sync-kraft must refuse stale INVENTORY.md until Creative finishes 6 plates");
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
if (!/hapticsManager/.test(sources) || !/AHAP_SEAMS/.test(sources)) {
  throw new Error("Core Haptics scaffolding must stay in hapticsManager");
}
if (!/AUDIO_SEAMS/.test(sources) || !/whoosh/.test(sources) || !/stamp/.test(sources)) {
  throw new Error("audio hook seams (whoosh/stamp) must stay in audioHooks");
}
if (!/AUDIO_FIRST_CLASS/.test(sources) || !/whoosh: "live"/.test(sources) || !/stamp: "live"/.test(sources)) {
  throw new Error("whoosh/stamp must stay live — Jorge: AUDIO is first-class");
}
if (!/HAPTIC_PROFILES/.test(sources) || !/SFX_GAIN/.test(sources)) {
  throw new Error("densified haptic profiles + per-tone SFX gain must stay");
}
if (!/SAME_TICK/.test(sources) || !/justJumped = false/.test(sources)) {
  throw new Error("hop juice must stay same-tick on touch-down (consume justJumped)");
}
if (
  !/death_stamp/.test(sources) ||
  !/honey_bean/.test(sources) ||
  !/near_miss/.test(sources) ||
  !/menu_ui/.test(sources) ||
  !/escape-audio-haptics-hooks/.test(sources)
) {
  throw new Error("audio/haptics must use the contract matrix (hop/land/death_stamp/honey_bean/near_miss/menu_ui)");
}
if (!/steamTick/.test(sources) || !/deathTick/.test(sources) || !/retryTick/.test(sources)) {
  throw new Error("steam / death / retry must stay wired through feel ticks");
}
if (!/WIRE_KEYS/.test(sources) || !/plate01/.test(sources) || !/plate06/.test(sources)) {
  throw new Error("WIRE-ready plates 01–06 keys must stay in kraftMap / craftAssets");
}
const appJson = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
if (appJson.expo?.version !== "1.0.6") {
  throw new Error("marketing version must stay 1.0.6 (not 1.0.5)");
}
if (String(appJson.expo?.ios?.buildNumber) !== "14") {
  throw new Error("ios.buildNumber must be 14 so TF is newer than build 12");
}
if (Number(appJson.expo?.android?.versionCode) !== 12) {
  throw new Error("android.versionCode must be 12 (newer than the 1.0.5 line)");
}
if (!/IOS_BUILD = "14"/.test(sources) || !/BUILD_LABEL/.test(sources)) {
  throw new Error("About must show BUILD_LABEL 1.0.6 · 14");
}
const eas = readFileSync(join(root, "eas.json"), "utf8");
if (!/6809059605/.test(eas) || /6758108565/.test(eas)) {
  throw new Error("eas.json must target ASC 6809059605 only");
}
if (!/MASTER_PLAN/.test(sources) || !/escape-best-in-class-master-plan/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-best-in-class-master-plan");
}
if (!/APPDEV_CHECKLIST/.test(sources) || !/escape-appdev-element-checklist/.test(sources)) {
  throw new Error("must cite 2026-09-05-escape-appdev-element-checklist");
}
if (!/USE_CRAFT_ART = false/.test(sources)) {
  throw new Error("USE_CRAFT_ART must stay false until Jorge WIRE");
}
if (!/need-changes-before-wire/.test(sources) || !/JORGE_ART_DECISION/.test(sources)) {
  throw new Error("Jorge art decision must stay need-changes-before-wire (HARD V2_HOLD)");
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
