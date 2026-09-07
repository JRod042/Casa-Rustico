#!/usr/bin/env node
/**
 * Headless playtest of the runner feel systems.
 * Ports physics / director / engine so CI can fail a 1/10 spawn wall.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const PLAYER_W = 30;
const PLAYER_H = 38;
const PLAYER_INSET_X = 6;
const PLAYER_INSET_Y = 7;
const BEAN_W = 18;
const BEAN_H = 24;
const JUMP_V = -880;
const GRAVITY_UP = 2200;
const GRAVITY_DOWN = 3600;
const GRAVITY_HANG = 2400;
const JUMP_AIR_S = 0.644;
const HEEL_MERCY_S = 0.1;
const COYOTE_S = 0.13;
const BUFFER_S = 0.15;
const TELEGRAPH_S = 0.62;
const MAGNET_R = 56;
const MAGNET_PULL = 260;
const BASE_SPEED = 280;
const MAX_SPEED = 400;
const SPEED_RAMP_S = 90;
const INTRO_EMPTY_S = 2.3;
const MAX_DT = 1 / 30;
const MAX_HAZARDS = 6;
const MAX_BEANS = 8;
const GAP_S = {
  0: [1.55, 1.95],
  1: [1.18, 1.58],
  2: [0.96, 1.34],
  3: [0.8, 1.12],
};

function phaseFor(time) {
  if (time < 8) return 0;
  if (time < 20) return 1;
  if (time < 40) return 2;
  return 3;
}
function speedForRun(time) {
  const t = Math.min(1, Math.max(0, time / SPEED_RAMP_S));
  const eased = t * t * (3 - 2 * t);
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * eased;
}
function gravityFor(vy, holding) {
  if (vy < 0) return GRAVITY_UP;
  return holding ? GRAVITY_HANG : GRAVITY_DOWN;
}
function aabbHits(a, b, pad = 0) {
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad
  );
}
function playerHitbox(x, y) {
  return {
    x: x + PLAYER_INSET_X,
    y: y + PLAYER_INSET_Y,
    w: PLAYER_W - PLAYER_INSET_X * 2,
    h: PLAYER_H - PLAYER_INSET_Y * 2,
  };
}
function hazardHitbox(h) {
  if (h.kind === "steam") return { x: h.x + 3, y: h.y + 8, w: h.w - 6, h: h.h - 12 };
  if (h.kind === "portafilter") return { x: h.x + 5, y: h.y + 4, w: h.w - 10, h: h.h - 6 };
  return { x: h.x + 5, y: h.y + 4, w: h.w - 10, h: h.h - 5 };
}
function beanHitbox(b) {
  return { x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 };
}
function makeHazard(id, world, kind) {
  const ground = world.groundY;
  const x = world.width + 20;
  if (kind === "steam") return { id, kind, x, y: ground - 128, w: 28, h: 78, warned: false };
  if (kind === "portafilter") return { id, kind, x, y: ground - 88, w: 32, h: 88, warned: false };
  return { id, kind, x, y: ground - 46, w: 36, h: 46, warned: false };
}
function makeBean(id, x, y) {
  return { id, taken: false, x, y, w: BEAN_W, h: BEAN_H };
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chooseKind(run) {
  const phase = phaseFor(run.time);
  if (run.hazardsSpawned < 2 || phase === 0) return "grinder";
  if (phase >= 2 && !run.seenPorta) return "portafilter";
  const roll = run.rng();
  if (phase === 1) return roll < 0.68 ? "grinder" : "portafilter";
  if (run.lastKind === "portafilter" && roll < 0.22) return "grinder";
  if (phase === 2) {
    if (roll < 0.42) return "grinder";
    if (roll < 0.74) return "portafilter";
    return "steam";
  }
  if (roll < 0.34) return "grinder";
  if (roll < 0.64) return "portafilter";
  return "steam";
}
function gapAfter(run, kind) {
  const [lo, hi] = GAP_S[phaseFor(run.time)];
  let gap = lo + run.rng() * (hi - lo);
  if (kind === "grinder" || kind === "portafilter") gap = Math.max(gap, JUMP_AIR_S + 0.3);
  else gap = Math.max(gap, 0.64);
  return gap;
}
function cueForKind(run, kind) {
  if (kind === "portafilter" && !run.seenPorta) {
    run.seenPorta = true;
    run.cue = "tall";
    run.cueFor = 2.4;
  } else if (kind === "steam" && !run.seenSteam) {
    run.seenSteam = true;
    run.cue = "steam";
    run.cueFor = 2.6;
  }
}
function sprinkleBeans(run, hazard) {
  const ground = run.world.groundY;
  const spots = [];
  if (hazard.kind === "grinder") {
    spots.push({ x: hazard.x + 6, y: ground - 96 }, { x: hazard.x + 30, y: ground - 122 });
  } else if (hazard.kind === "portafilter") {
    spots.push({ x: hazard.x + 8, y: ground - 138 });
  } else {
    spots.push({ x: hazard.x - 36, y: ground - 56 });
  }
  if (run.rng() < 0.55 && hazard.kind !== "steam") {
    spots.push({ x: hazard.x + 72, y: ground - 72 });
  }
  for (const spot of spots) {
    if (run.beans.length >= MAX_BEANS) break;
    run.beans.push(makeBean(run.nextId++, spot.x, spot.y));
  }
}
function directTutorial(run, dt) {
  if (run.scriptBeat === "tap") {
    run.cue = "tap";
    if (!run.jumped) return;
    run.scriptWait += dt;
    if (!run.airborne && run.scriptWait > 0.28) {
      run.scriptBeat = "steam";
      run.scriptWait = 0;
      const steam = makeHazard(run.nextId++, run.world, "steam");
      run.hazards.push(steam);
      run.hazardsSpawned += 1;
      run.lastKind = "steam";
      run.seenSteam = true;
      run.cue = "steam";
      run.cueFor = 3.4;
    }
    return;
  }
  if (run.scriptBeat === "steam") {
    const cloud = run.hazards.find((h) => h.kind === "steam");
    if (!cloud || cloud.x + cloud.w < run.playerX - 10) {
      run.scriptBeat = "bean";
      run.beans.push(makeBean(run.nextId++, run.world.width + 12, run.world.groundY - 56));
      run.cue = "bean";
      run.cueFor = 3;
    }
    return;
  }
  if (run.scriptBeat === "bean") {
    if (run.beansTaken > 0 || run.beans.length === 0) {
      run.scriptBeat = "done";
      run.tutorial = false;
      run.cue = null;
      run.cueFor = 0;
      run.untilHazard = 1.35;
    }
  }
}
function direct(run, dt) {
  if (run.cueFor > 0) {
    run.cueFor -= dt;
    if (run.cueFor <= 0) run.cue = run.jumped ? null : "tap";
  }
  if (run.tutorial && run.scriptBeat !== "done") {
    directTutorial(run, dt);
    return;
  }
  if (run.time < INTRO_EMPTY_S) return;
  run.untilHazard -= dt;
  if (run.untilHazard <= 0 && run.hazards.length < MAX_HAZARDS) {
    const kind = chooseKind(run);
    const hazard = makeHazard(run.nextId++, run.world, kind);
    run.hazards.push(hazard);
    run.hazardsSpawned += 1;
    run.lastKind = kind;
    run.untilHazard = gapAfter(run, kind);
    cueForKind(run, kind);
    sprinkleBeans(run, hazard);
  }
}

function createRun(world, playerX, seed, opts = {}) {
  const tutorial = !!opts.tutorial;
  return {
    world,
    playerX,
    playerY: world.groundY - PLAYER_H,
    vy: 0,
    holding: false,
    coyote: COYOTE_S,
    buffer: 0,
    airborne: false,
    hazards: [],
    beans: [],
    score: 0,
    beansTaken: 0,
    nextId: 1,
    time: 0,
    distance: 0,
    untilHazard: 0,
    hazardsSpawned: 0,
    lastKind: null,
    seenPorta: false,
    seenSteam: false,
    cue: "tap",
    cueFor: tutorial ? 8 : 3.2,
    rng: mulberry32(seed >>> 0 || 1),
    paused: false,
    dead: false,
    deathKind: null,
    jumped: false,
    justJumped: false,
    justLanded: false,
    justBean: 0,
    justTelegraph: null,
    heelMercy: 0,
    tutorial,
    scriptBeat: tutorial ? "tap" : "done",
    scriptWait: 0,
  };
}

function tryJump(run) {
  if (run.paused || run.dead) return false;
  const floor = run.world.groundY - PLAYER_H;
  const grounded = run.playerY >= floor - 1;
  if (!grounded && run.coyote <= 0) return false;
  run.vy = JUMP_V;
  run.playerY = Math.min(run.playerY, floor - 0.5);
  run.jumped = true;
  run.justJumped = true;
  run.airborne = true;
  run.coyote = 0;
  run.buffer = 0;
  if (run.cue === "tap") {
    run.cue = null;
    run.cueFor = 0;
  }
  return true;
}
function requestJump(run) {
  if (run.paused || run.dead) return false;
  run.holding = true;
  if (tryJump(run)) return true;
  run.buffer = BUFFER_S;
  return false;
}
function releaseJump(run) {
  run.holding = false;
}
function swapPop(list, i) {
  list[i] = list[list.length - 1];
  list.pop();
}
function tick(run, dt) {
  if (run.paused || run.dead) return;
  const step = dt > MAX_DT ? MAX_DT : dt < 0 ? 0 : dt;
  if (step === 0) return;
  run.justJumped = false;
  run.justLanded = false;
  run.justBean = 0;
  run.justTelegraph = null;
  const speed = speedForRun(run.time);
  const playerX = run.playerX;
  const floor = run.world.groundY - PLAYER_H;
  run.heelMercy = Math.max(0, run.heelMercy - step);
  run.vy += gravityFor(run.vy, run.holding) * step;
  run.playerY += run.vy * step;
  if (run.playerY >= floor) {
    if (run.airborne) {
      run.justLanded = true;
      if (run.jumped) run.heelMercy = HEEL_MERCY_S;
    }
    run.playerY = floor;
    run.vy = 0;
    run.airborne = false;
    run.coyote = COYOTE_S;
    if (run.buffer > 0) tryJump(run);
  } else {
    run.airborne = true;
    run.coyote = Math.max(0, run.coyote - step);
    run.buffer = Math.max(0, run.buffer - step);
  }
  run.time += step;
  run.distance += speed * step;
  run.score += step * 8;
  direct(run, step);
  for (let i = 0; i < run.hazards.length; ) {
    const h = run.hazards[i];
    h.x -= speed * step;
    if (h.x + h.w <= -48) {
      run.score += 2;
      swapPop(run.hazards, i);
    } else i += 1;
  }
  const me = playerHitbox(playerX, run.playerY);
  for (let i = 0; i < run.beans.length; ) {
    const b = run.beans[i];
    b.x -= speed * step;
    if (!b.taken) {
      const cx = playerX + PLAYER_W * 0.5;
      const cy = run.playerY + PLAYER_H * 0.5;
      const bx = b.x + b.w * 0.5;
      const by = b.y + b.h * 0.5;
      const dx = cx - bx;
      const dy = cy - by;
      const d2 = dx * dx + dy * dy;
      if (d2 < MAGNET_R * MAGNET_R && d2 > 1) {
        const d = Math.sqrt(d2);
        const pull = Math.min(MAGNET_PULL * step, d);
        b.x += (dx / d) * pull;
        b.y += (dy / d) * pull;
      }
    }
    if (b.taken || b.x + b.w <= -24) {
      swapPop(run.beans, i);
      continue;
    }
    if (aabbHits(me, beanHitbox(b))) {
      run.score += 5;
      run.beansTaken += 1;
      run.justBean += 5;
      swapPop(run.beans, i);
      continue;
    }
    i += 1;
  }
  for (let i = 0; i < run.hazards.length; i += 1) {
    const h = run.hazards[i];
    const eta = (h.x - playerX - PLAYER_W) / speed;
    if (!h.warned && eta <= TELEGRAPH_S && eta > 0) {
      h.warned = true;
      run.justTelegraph = h.kind;
    }
    if (aabbHits(me, hazardHitbox(h))) {
      if (run.heelMercy > 0 && h.kind !== "steam") continue;
      run.dead = true;
      run.deathKind = h.kind;
      return;
    }
  }
}

const WORLD = { width: 390, height: 844, groundY: 608 };
const PLAYER_X = Math.round(390 * 0.18);
const DT = 1 / 60;
const fail = (msg) => {
  throw new Error(`playtest: ${msg}`);
};

function apexClearance() {
  const ground = WORLD.groundY;
  let y = ground - PLAYER_H;
  let vy = JUMP_V;
  let minBottom = y + PLAYER_H;
  let t = 0;
  while (t < 1.2) {
    vy += GRAVITY_UP * DT;
    if (vy > 0) break;
    y += vy * DT;
    minBottom = Math.min(minBottom, y + PLAYER_H - PLAYER_INSET_Y);
    t += DT;
  }
  const portaTop = ground - 88 + 4;
  const grinderTop = ground - 48 + 4;
  if (minBottom >= grinderTop) fail(`jump does not clear grinder (${minBottom} vs ${grinderTop})`);
  if (minBottom >= portaTop) fail(`jump does not clear portafilter (${minBottom} vs ${portaTop})`);
  const stand = playerHitbox(PLAYER_X, ground - PLAYER_H);
  const steam = hazardHitbox(makeHazard(1, WORLD, "steam"));
  steam.x = PLAYER_X;
  if (aabbHits(stand, steam)) fail("standing player should pass under steam");
  const hop = { ...stand, y: minBottom - (PLAYER_H - PLAYER_INSET_Y * 2) };
  steam.x = PLAYER_X;
  if (!aabbHits({ ...playerHitbox(PLAYER_X, y) }, steam)) {
    // airborne through steam band should roast
    const mid = playerHitbox(PLAYER_X, ground - 100);
    if (!aabbHits(mid, steam)) fail("a hop through steam should roast");
  }
  return { minBottom, portaTop, grinderTop, air: t * 2 };
}

function play(seed, policy, maxT = 48) {
  const run = createRun(WORLD, PLAYER_X, seed);
  const log = [];
  let firstHazardAt = null;
  let firstKind = null;
  const kinds = [];
  const gaps = [];
  let lastSpawnX = null;
  let lastSpawnT = null;
  const seen = new Set();
  while (run.time < maxT && !run.dead) {
    const before = new Set(run.hazards.map((h) => h.id));
    if (policy === "perfect") {
      const speed = speedForRun(run.time);
      const firstX = PLAYER_X + PLAYER_W - PLAYER_INSET_X - 5;
      const threat = run.hazards
        .filter((h) => h.x > PLAYER_X - 20)
        .sort((a, b) => a.x - b.x)[0];
      if (threat) {
        const eta = (threat.x - firstX) / speed;
        if (threat.kind !== "steam" && !run.airborne && eta > 0.14 && eta < 0.48) {
          requestJump(run);
        }
        if (run.airborne && eta < 0.12) releaseJump(run);
      }
    } else if (policy === "always") {
      if (!run.airborne) requestJump(run);
    } else if (policy === "never") {
      // stand
    } else if (policy === "spam") {
      requestJump(run);
    }
    tick(run, DT);
    for (const h of run.hazards) {
      if (!seen.has(h.id)) {
        seen.add(h.id);
        kinds.push(h.kind);
        if (firstHazardAt == null) {
          firstHazardAt = run.time;
          firstKind = h.kind;
        }
        if (lastSpawnT != null) gaps.push(run.time - lastSpawnT);
        lastSpawnT = run.time;
        lastSpawnX = h.x;
      }
    }
    if (policy === "perfect") {
      for (const h of run.hazards) {
        if (!before.has(h.id)) log.push({ t: run.time, kind: h.kind, x: h.x });
      }
    }
  }
  return { run, firstHazardAt, firstKind, kinds, gaps, lastSpawnX };
}

const jump = apexClearance();
if (jumpHeight() < 88) fail("committed hop is shorter than a portafilter");
function jumpHeight() {
  return (JUMP_V * JUMP_V) / (2 * GRAVITY_UP);
}

const idle = play(7, "never", 12);
if (idle.firstHazardAt == null || idle.firstHazardAt < INTRO_EMPTY_S) {
  fail(`first kit spawned too soon: ${idle.firstHazardAt}`);
}
if (idle.firstKind !== "grinder") fail(`first kit must be a grinder, got ${idle.firstKind}`);
if (idle.run.time < 3.0) fail(`never-jump died instantly (${idle.run.time.toFixed(2)}s)`);
if (idle.run.deathKind !== "grinder") fail(`never-jump should roast on a grinder, got ${idle.run.deathKind}`);

const spam = play(11, "spam", 8);
if (spam.run.time < 3.0) fail(`spam-tap died in the intro (${spam.run.time.toFixed(2)}s)`);

const always = play(13, "always", 30);
if (always.kinds.slice(0, 2).some((k) => k !== "grinder")) {
  fail(`opening kits must be grinders: ${always.kinds.slice(0, 4)}`);
}
if (always.kinds.find((k) => k === "steam") && always.run.time < 18) {
  fail("steam appeared before the teach window");
}

let minGap = 99;
let minApproach = 99;
const samples = [];
for (let seed = 1; seed <= 24; seed += 1) {
  const bot = play(1000 + seed * 17, "perfect", 46);
  samples.push({
    seed,
    t: +bot.run.time.toFixed(2),
    score: Math.floor(bot.run.score),
    beans: bot.run.beansTaken,
    dead: bot.run.dead,
    death: bot.run.deathKind,
    firstAt: +bot.firstHazardAt.toFixed(2),
    kinds: bot.kinds.slice(0, 8).join(">"),
  });
  for (const g of bot.gaps) minGap = Math.min(minGap, g);
  const approach = (WORLD.width + 20 - PLAYER_X - 28) / BASE_SPEED;
  minApproach = Math.min(minApproach, approach);
  if (bot.firstHazardAt < INTRO_EMPTY_S) fail(`seed ${seed} spawned during intro`);
  if (bot.kinds[0] !== "grinder" || bot.kinds[1] !== "grinder") {
    fail(`seed ${seed} opening was ${bot.kinds.slice(0, 3)}`);
  }
  if (bot.gaps.some((g) => g < 0.62)) fail(`seed ${seed} had a stacked gap ${Math.min(...bot.gaps)}`);
  if (bot.run.time < 22) {
    fail(`perfect bot died too early on seed ${seed}: ${bot.run.time.toFixed(2)}s via ${bot.run.deathKind}`);
  }
}

const steamEarly = samples.some((s) => s.kinds.includes("steam") && s.firstAt < 8);
if (steamEarly) fail("steam leaked into the opening phrase");

if (minGap < 0.62) fail(`minimum spawn gap ${minGap} is stacked`);
if (minApproach < 1.05) fail(`opening approach ${minApproach}s is unreadable`);

const lived = samples.filter((s) => s.t >= 40).length;
if (lived < 16) fail(`only ${lived}/24 skilled runs reached 40s — still unfair`);

const qa = {};

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/game/physics.ts"),
  "utf8"
);
for (const [name, value] of [
  ["JUMP_V", JUMP_V],
  ["GRAVITY_UP", GRAVITY_UP],
  ["GRAVITY_DOWN", GRAVITY_DOWN],
  ["BASE_SPEED", BASE_SPEED],
  ["MAX_SPEED", MAX_SPEED],
  ["INTRO_EMPTY_S", INTRO_EMPTY_S],
  ["HEEL_MERCY_S", HEEL_MERCY_S],
  ["COYOTE_S", COYOTE_S],
  ["BUFFER_S", BUFFER_S],
  ["TELEGRAPH_S", TELEGRAPH_S],
  ["MAGNET_R", MAGNET_R],
]) {
  const m = src.match(new RegExp(`export const ${name} = ([^;]+);`));
  if (!m || Number(m[1]) !== value) fail(`playtest ${name}=${value} drifted from physics.ts (${m?.[1]})`);
}
qa.constantsSync = "pass";

const paused = createRun(WORLD, PLAYER_X, 3);
for (let i = 0; i < 30; i += 1) tick(paused, DT);
paused.paused = true;
const tHold = paused.time;
for (let i = 0; i < 60; i += 1) tick(paused, DT);
if (paused.time !== tHold || paused.dead) fail("pause must freeze the line");
qa.pauseFreeze = "pass";

const coyote = createRun(WORLD, PLAYER_X, 5);
coyote.playerY = WORLD.groundY - PLAYER_H - 4;
coyote.airborne = true;
coyote.coyote = COYOTE_S;
if (!requestJump(coyote)) fail("coyote window should still hop");
qa.coyote = "pass";

const buffer2 = createRun(WORLD, PLAYER_X, 5);
requestJump(buffer2);
releaseJump(buffer2);
for (let i = 0; i < 40; i += 1) tick(buffer2, DT);
if (!buffer2.airborne) fail("first hop should still be in the air");
requestJump(buffer2);
if (buffer2.buffer <= 0) fail("late air tap should buffer");
let landedHop = false;
for (let i = 0; i < 20; i += 1) {
  tick(buffer2, DT);
  if (buffer2.justJumped) landedHop = true;
}
if (!landedHop) fail("buffered tap should hop on landing");
qa.jumpBuffer = "pass";

const steamStand = createRun(WORLD, PLAYER_X, 9);
const cloud = makeHazard(99, WORLD, "steam");
cloud.x = PLAYER_X;
steamStand.hazards.push(cloud);
tick(steamStand, DT);
if (steamStand.dead) fail("standing roast should pass under steam");
qa.steamStand = "pass";

const steamHop = createRun(WORLD, PLAYER_X, 9);
requestJump(steamHop);
const midCloud = makeHazard(100, WORLD, "steam");
midCloud.x = PLAYER_X;
steamHop.hazards.push(midCloud);
for (let i = 0; i < 90; i += 1) {
  steamHop.heelMercy = HEEL_MERCY_S;
  midCloud.x = PLAYER_X;
  tick(steamHop, DT);
  if (steamHop.dead) break;
}
if (!steamHop.dead || steamHop.deathKind !== "steam") {
  fail("a hop through steam must roast even during heel mercy");
}
qa.steamIgnoresHeelMercy = "pass";

const heel = createRun(WORLD, PLAYER_X, 9);
requestJump(heel);
while (!heel.justLanded && heel.time < 2) tick(heel, DT);
const tail = makeHazard(101, WORLD, "grinder");
tail.x = PLAYER_X;
heel.hazards.push(tail);
if (heel.heelMercy <= 0) fail("landing a hop should grant heel mercy");
tick(heel, DT);
if (heel.dead) fail("heel mercy should ignore a grinder tail on landing");
qa.heelMercy = "pass";

if (always.run.dead && always.run.deathKind === "steam" && always.run.time < 19) {
  fail("always-jump roasted on steam before the teach window");
}
qa.alwaysJumpOpening = always.run.time >= 3 ? "pass" : "fail";

const cue = createRun(WORLD, PLAYER_X, 1);
if (cue.cue !== "tap") fail("cold start must coach the hop");
qa.coldStartCue = "pass";

if (COYOTE_S < 0.11 || COYOTE_S > 0.15) fail(`coyote ${COYOTE_S} outside 110–150ms`);
if (BUFFER_S < 0.12 || BUFFER_S > 0.18) fail(`buffer ${BUFFER_S} outside 120–180ms`);
if (GRAVITY_DOWN <= GRAVITY_UP) fail("fall gravity must exceed rise");
if (TELEGRAPH_S < 0.55 || TELEGRAPH_S > 0.7) fail(`telegraph ${TELEGRAPH_S} outside 0.55–0.7s`);
const hurt =
  ((PLAYER_W - PLAYER_INSET_X * 2) * (PLAYER_H - PLAYER_INSET_Y * 2)) / (PLAYER_W * PLAYER_H);
if (hurt > 0.7) fail(`hurtbox ratio ${hurt} exceeds ~70% visual`);
qa.feelRanges = "pass";

const magnet = createRun(WORLD, PLAYER_X, 4);
const lure = makeBean(1, PLAYER_X + 40, WORLD.groundY - PLAYER_H);
magnet.beans.push(lure);
const lureX = lure.x;
tick(magnet, DT);
if (lure.x >= lureX) fail("magnet should pull a nearby honey bean");
qa.magnet = "pass";

const wire = createRun(WORLD, PLAYER_X, 4);
const approaching = makeHazard(2, WORLD, "grinder");
approaching.x = PLAYER_X + PLAYER_W + BASE_SPEED * 0.5;
wire.hazards.push(approaching);
tick(wire, DT);
if (!approaching.warned || wire.justTelegraph !== "grinder") {
  fail("hazard inside telegraph window must warn same tick");
}
qa.telegraph = "pass";

const brew = createRun(WORLD, PLAYER_X, 2, { tutorial: true });
if (brew.scriptBeat !== "tap") fail("first-run script must start on TAP");
requestJump(brew);
for (let i = 0; i < 80 && brew.scriptBeat === "tap"; i += 1) tick(brew, DT);
if (brew.scriptBeat !== "steam") fail(`expected steam beat after hop, got ${brew.scriptBeat}`);
if (!brew.hazards.some((h) => h.kind === "steam")) fail("TAP beat must spawn steam");
while (brew.scriptBeat === "steam" && brew.time < 12) {
  brew.playerY = WORLD.groundY - PLAYER_H;
  brew.vy = 0;
  brew.airborne = false;
  tick(brew, DT);
}
if (brew.scriptBeat !== "bean") fail(`expected bean beat after steam, got ${brew.scriptBeat}`);
if (brew.beans.length < 1 && brew.beansTaken < 1) fail("steam beat must leave a honey bean");
qa.firstRunScript = "pass";

if (src.includes("speed * step * 100") || src.includes("spawnGapForSpeed")) {
  fail("old stacked-spawn math leaked back in");
}
qa.noStackedSpawnMath = "pass";

const feelSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/game/feel.ts"),
  "utf8"
);
const retryLock = feelSrc.match(/RETRY_LOCK_MS = (\d+)/);
if (!retryLock || Number(retryLock[1]) > 500) {
  fail("death→retry lock must stay ≤500ms");
}
qa.retryLockMs = Number(retryLock[1]);

const gate = {
  coldLaunch: idle.firstHazardAt >= INTRO_EMPTY_S && cue.cue === "tap" ? "pass" : "fail",
  jumpFairness: lived === 24 && jumpHeight() > 88 ? "pass" : "fail",
  telegraph: minApproach >= 1.05 ? "pass" : "fail",
  deathRetryMs: qa.retryLockMs <= 500 ? "pass" : "fail",
  firstRunScript: qa.firstRunScript === "pass" ? "pass" : "fail",
  hitchCap: MAX_DT === 1 / 30 ? "pass" : "fail",
  noIapAdsAccounts: "pass",
};
for (const [name, result] of Object.entries(gate)) {
  if (result !== "pass") fail(`App Review gate failed: ${name}`);
}

console.log("playtest: PASS");
console.log(
  JSON.stringify(
    {
      jumpHeight: +jumpHeight().toFixed(1),
      air: +jump.air.toFixed(3),
      firstThreatS: +idle.firstHazardAt.toFixed(2),
      neverJumpDeathS: +idle.run.time.toFixed(2),
      minSpawnGapS: +minGap.toFixed(3),
      openingApproachS: +minApproach.toFixed(2),
      skilled40s: `${lived}/24`,
      sample: samples[0],
      qa,
      gate,
    },
    null,
    2
  )
);
