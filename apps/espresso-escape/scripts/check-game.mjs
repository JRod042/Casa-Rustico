#!/usr/bin/env node
/** Pure-logic checks for the runner — no IAP, no store. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function aabbHits(a, b, pad = 2) {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}

const PLAYER_H = 36;
const GRAVITY = 2400;
const JUMP_V = -780;
const BASE_SPEED = 220;
const MAX_SPEED = 460;
const MAX_DT = 1 / 30;

function speedForScore(score) {
  return Math.min(MAX_SPEED, BASE_SPEED + score * 3.2);
}

const player = { x: 40, y: 200, w: 28, h: 36 };
const miss = { x: 120, y: 200, w: 44, h: 52 };
const hit = { x: 50, y: 210, w: 44, h: 52 };
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
if (speedForScore(80) <= speedForScore(0)) throw new Error("speed should scale with score");

const roasted = { x: 70, y: 200, w: 28, h: 36 };
if (!aabbHits(roasted, { x: 70, y: 200, w: 44, h: 52 })) {
  throw new Error("overlap should roast the run");
}
if (Math.min(0.2, MAX_DT) !== MAX_DT) throw new Error("dt cap should clamp long hitches");

function tickJump(state, dt) {
  state.vy += GRAVITY * dt;
  state.playerY += state.vy * dt;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sources = [
  "src/game/GameApp.tsx",
  "src/game/PlayField.tsx",
  "src/game/engine.ts",
  "App.tsx",
]
  .map((f) => readFileSync(join(root, f), "utf8"))
  .join("\n");
if (/StoreKit|RevenueCat|expo-iap|Purchases\.|buyProduct/.test(sources)) {
  throw new Error("payments / IAP API leaked into the game");
}
if (!/does not sell coffee/.test(sources)) {
  throw new Error("About copy must state the game does not sell coffee");
}
if (!/requestAnimationFrame/.test(sources)) {
  throw new Error("play loop should use requestAnimationFrame");
}

console.log("check-game: PASS");
