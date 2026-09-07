import { direct } from "./director";
import {
  createMatterWorld,
  matterHitsBean,
  matterHitsHazard,
  type MatterWorld,
} from "./matterWorld";
import {
  type Bean,
  type Hazard,
  type HazardKind,
  type CoachCue,
  type ScriptBeat,
  type World,
  BUFFER_S,
  COYOTE_S,
  HEEL_MERCY_S,
  JUMP_CUT,
  JUMP_V,
  MAGNET_PULL,
  MAGNET_R,
  MAX_DT,
  MAX_FALL,
  PLAYER_H,
  PLAYER_W,
  SKIP_V,
  TELEGRAPH_S,
  gravityFor,
  mulberry32,
  speedForRun,
} from "./physics";

export type { CoachCue, ScriptBeat };

export type DeathKind = HazardKind;

export type Run = {
  world: World;
  playerX: number;
  playerY: number;
  vy: number;
  holding: boolean;
  coyote: number;
  buffer: number;
  airborne: boolean;
  hazards: Hazard[];
  beans: Bean[];
  score: number;
  beansTaken: number;
  nextId: number;
  time: number;
  distance: number;
  untilHazard: number;
  hazardsSpawned: number;
  lastKind: HazardKind | null;
  seenPorta: boolean;
  seenSteam: boolean;
  cue: CoachCue;
  cueFor: number;
  rng: () => number;
  paused: boolean;
  dead: boolean;
  deathKind: DeathKind | null;
  jumped: boolean;
  hopping: boolean;
  skipping: boolean;
  landFromHop: boolean;
  justJumped: boolean;
  justLanded: boolean;
  justBean: number;
  justTelegraph: HazardKind | null;
  heelMercy: number;
  tutorial: boolean;
  scriptBeat: ScriptBeat;
  scriptWait: number;
  sim: MatterWorld;
};

export function createRun(
  world: World,
  playerX: number,
  seed = Date.now(),
  opts: { tutorial?: boolean } = {}
): Run {
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
    hopping: false,
    skipping: false,
    landFromHop: false,
    justJumped: false,
    justLanded: false,
    justBean: 0,
    justTelegraph: null,
    heelMercy: 0,
    tutorial,
    scriptBeat: tutorial ? "tap" : "done",
    scriptWait: 0,
    sim: createMatterWorld(world, playerX),
  };
}

export function resizeRun(run: Run, world: World, playerX: number): void {
  run.world = world;
  run.playerX = playerX;
  const floor = world.groundY - PLAYER_H;
  if (run.playerY > floor) run.playerY = floor;
}

function tryJump(run: Run): boolean {
  if (run.paused || run.dead) return false;
  const floor = run.world.groundY - PLAYER_H;
  const grounded = run.playerY >= floor - 1;
  if (!grounded && run.coyote <= 0 && !run.skipping) return false;
  run.vy = JUMP_V;
  run.playerY = Math.min(run.playerY, floor - 0.5);
  run.jumped = true;
  run.hopping = true;
  run.skipping = false;
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

/** Touch-down. Buffers if the roast is still in the air. */
export function requestJump(run: Run): boolean {
  if (run.paused || run.dead) return false;
  run.holding = true;
  if (tryJump(run)) return true;
  run.buffer = BUFFER_S;
  return false;
}

export function releaseJump(run: Run): void {
  run.holding = false;
  if (run.hopping && run.airborne && run.vy < -90) run.vy *= JUMP_CUT;
}

function swapPop<T>(list: T[], i: number): void {
  const last = list[list.length - 1];
  if (last === undefined) return;
  list[i] = last;
  list.pop();
}

function pullBean(run: Run, b: Bean, step: number): void {
  const cx = run.playerX + PLAYER_W * 0.5;
  const cy = run.playerY + PLAYER_H * 0.5;
  const bx = b.x + b.w * 0.5;
  const by = b.y + b.h * 0.5;
  const dx = cx - bx;
  const dy = cy - by;
  const d2 = dx * dx + dy * dy;
  if (d2 >= MAGNET_R * MAGNET_R || d2 < 1) return;
  const d = Math.sqrt(d2);
  const pull = Math.min(MAGNET_PULL * step, d);
  b.x += (dx / d) * pull;
  b.y += (dy / d) * pull;
}

/** Advance one frame. Mutates `run` in place — no allocations on the quiet path. */
export function tick(run: Run, dt: number): void {
  if (run.paused || run.dead) return;
  const step = dt > MAX_DT ? MAX_DT : dt < 0 ? 0 : dt;
  if (step === 0) return;

  run.justJumped = false;
  run.justLanded = false;
  run.landFromHop = false;
  run.justBean = 0;
  run.justTelegraph = null;

  const speed = speedForRun(run.time);
  const playerX = run.playerX;
  const floor = run.world.groundY - PLAYER_H;

  run.heelMercy = Math.max(0, run.heelMercy - step);
  run.vy += gravityFor(run.vy, run.holding, run.skipping && !run.hopping) * step;
  if (run.vy > MAX_FALL) run.vy = MAX_FALL;
  run.playerY += run.vy * step;
  if (run.playerY >= floor) {
    if (run.airborne) {
      run.justLanded = true;
      run.landFromHop = run.hopping;
      if (run.hopping) run.heelMercy = HEEL_MERCY_S;
    }
    run.playerY = floor;
    run.hopping = false;
    run.coyote = COYOTE_S;
    if (run.buffer > 0) {
      run.vy = 0;
      run.airborne = false;
      run.skipping = false;
      tryJump(run);
    } else {
      run.vy = SKIP_V;
      run.playerY = floor - 0.4;
      run.airborne = true;
      run.skipping = true;
    }
  } else {
    run.airborne = true;
    if (!run.skipping) run.coyote = Math.max(0, run.coyote - step);
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

  for (let i = 0; i < run.beans.length; ) {
    const b = run.beans[i];
    b.x -= speed * step;
    if (!b.taken) pullBean(run, b, step);
    if (b.taken || b.x + b.w <= -24) {
      swapPop(run.beans, i);
      continue;
    }
    if (matterHitsBean(run.sim, playerX, run.playerY, b)) {
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
  }
  const roast = matterHitsHazard(run.sim, playerX, run.playerY, run.hazards);
  if (roast) {
    if (!(run.heelMercy > 0 && roast.kind !== "steam")) {
      run.dead = true;
      run.deathKind = roast.kind;
    }
  }
}
