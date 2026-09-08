import { direct, dressStage } from "./director";
import {
  createMatterWorld,
  matterHitsBean,
  matterHitsHazard,
  type MatterWorld,
} from "./matterWorld";
import {
  type Addon,
  type Bean,
  type Bubble,
  type BubbleKind,
  type FloorMat,
  type FloorSeg,
  type Hazard,
  type HazardKind,
  type CoachCue,
  type ScriptBeat,
  type Scenery,
  type World,
  BUBBLE_MAGNET_PULL,
  BUBBLE_MAGNET_R,
  BUBBLE_PTS,
  BUFFER_S,
  COMBO_STEP,
  COMBO_WINDOW,
  COYOTE_S,
  GYRO_DAMP,
  GYRO_K,
  HANG_KINDS,
  HEEL_MERCY_S,
  JUMP_CUT,
  JUMP_V,
  LEAN_MAX,
  MAGNET_PULL,
  MAGNET_R,
  MAX_DT,
  MAX_FALL,
  MAX_MULT,
  PLAYER_H,
  PLAYER_W,
  PLANT_S,
  PRIZE_BUBBLE_PTS,
  skipImpulse,
  SPONGE_S,
  SUB_DT,
  TELEGRAPH_S,
  aabbHits,
  bubbleHitbox,
  gravityFor,
  matAt,
  mulberry32,
  playerHitbox,
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
  bubbles: Bubble[];
  scenery: Scenery[];
  addons: Addon[];
  floor: FloorSeg[];
  mat: FloorMat;
  spongeT: number;
  prizes: number;
  score: number;
  beansTaken: number;
  combo: number;
  comboT: number;
  mult: number;
  nextId: number;
  time: number;
  distance: number;
  untilHazard: number;
  untilScenery: number;
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
  justPrize: number;
  justSponge: boolean;
  justBubble: number;
  justPop: BubbleKind | null;
  justMult: number;
  justRustle: boolean;
  justTelegraph: HazardKind | null;
  heelMercy: number;
  plantT: number;
  lean: number;
  leanV: number;
  impact: number;
  tutorial: boolean;
  scriptBeat: ScriptBeat;
  scriptWait: number;
  sim: MatterWorld;
};

export function createRun(world: World, playerX: number, seed = Date.now(), opts: { tutorial?: boolean } = {}): Run {
  const tutorial = !!opts.tutorial;
  const run: Run = {
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
    bubbles: [],
    scenery: [],
    addons: [],
    floor: [],
    mat: "burlap",
    spongeT: 0,
    prizes: 0,
    score: 0,
    beansTaken: 0,
    combo: 0,
    comboT: 0,
    mult: 1,
    nextId: 1,
    time: 0,
    distance: 0,
    untilHazard: 0,
    untilScenery: 1.1,
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
    justPrize: 0,
    justSponge: false,
    justBubble: 0,
    justPop: null,
    justMult: 0,
    justRustle: false,
    justTelegraph: null,
    heelMercy: 0,
    plantT: 0,
    lean: 0,
    leanV: 0,
    impact: 0,
    tutorial,
    scriptBeat: tutorial ? "tap" : "done",
    scriptWait: 0,
    sim: createMatterWorld(world, playerX),
  };
  dressStage(run);
  return run;
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
  run.plantT = 0;
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

function bounceSkip(run: Run, incoming: number): void {
  const floor = run.world.groundY - PLAYER_H;
  run.vy = skipImpulse(run.mat, incoming);
  run.playerY = floor - 0.4;
  run.airborne = true;
  run.skipping = true;
  run.hopping = false;
  run.plantT = 0;
}

function swapPop<T>(list: T[], i: number): void {
  const last = list[list.length - 1];
  if (last === undefined) return;
  list[i] = last;
  list.pop();
}

function stepRun(run: Run, step: number): void {
  const speed = speedForRun(run.time);
  const playerX = run.playerX;
  const floor = run.world.groundY - PLAYER_H;

  run.heelMercy = Math.max(0, run.heelMercy - step);
  run.spongeT = Math.max(0, run.spongeT - step);
  run.mat = matAt(run.playerX, run.floor, run.spongeT);

  if (run.comboT > 0) {
    run.comboT = Math.max(0, run.comboT - step);
    if (run.comboT === 0) {
      run.combo = 0;
      run.mult = 1;
    }
  }

  const wantLean = Math.max(
    -LEAN_MAX,
    Math.min(LEAN_MAX, run.vy * 0.00022 + (run.skipping ? -0.07 : 0) + (run.hopping ? -0.04 : 0)),
  );
  run.leanV += (wantLean - run.lean) * GYRO_K * step;
  run.leanV *= Math.exp(-GYRO_DAMP * step);
  run.lean += run.leanV * step;

  if (run.plantT > 0) {
    run.plantT = Math.max(0, run.plantT - step);
    run.playerY = floor;
    run.vy = 0;
    run.airborne = false;
    run.skipping = false;
    if (run.plantT === 0) {
      if (run.buffer > 0) tryJump(run);
      else bounceSkip(run, run.impact);
    }
  } else {
    run.vy += gravityFor(run.vy, run.holding, run.skipping && !run.hopping, run.mat) * step;
    if (run.vy > MAX_FALL) run.vy = MAX_FALL;
    run.playerY += run.vy * step;
    if (run.playerY >= floor) {
      const incoming = Math.max(0, run.vy);
      if (run.airborne) {
        run.justLanded = true;
        run.landFromHop = run.hopping;
        run.impact = incoming;
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
        const plant = PLANT_S[run.mat];
        if (plant > 0) {
          run.vy = 0;
          run.airborne = false;
          run.skipping = false;
          run.plantT = plant;
        } else {
          bounceSkip(run, incoming);
        }
      }
    } else {
      run.airborne = true;
      if (!run.skipping) run.coyote = Math.max(0, run.coyote - step);
      run.buffer = Math.max(0, run.buffer - step);
    }
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

  for (let i = 0; i < run.floor.length; ) {
    const s = run.floor[i];
    s.x -= speed * step;
    if (s.x + s.w <= -24) swapPop(run.floor, i);
    else i += 1;
  }

  for (let i = 0; i < run.scenery.length; ) {
    const s = run.scenery[i];
    s.x -= speed * s.par * step;
    if (s.x + s.w <= -80) swapPop(run.scenery, i);
    else i += 1;
  }

  const me = playerHitbox(playerX, run.playerY);

  for (let i = 0; i < run.scenery.length; i += 1) {
    const s = run.scenery[i];
    if (!HANG_KINDS.includes(s.kind) || s.rustled) continue;
    if (aabbHits(me, { x: s.x, y: s.y, w: s.w, h: s.h })) {
      s.rustled = true;
      run.score += 3;
      run.justRustle = true;
    }
  }

  for (let i = 0; i < run.addons.length; ) {
    const a = run.addons[i];
    a.x -= speed * step;
    if (a.x + a.w <= -24) {
      swapPop(run.addons, i);
      continue;
    }
    if (aabbHits(me, a)) {
      if (a.kind === "sponge") {
        run.spongeT = SPONGE_S;
        run.score += 8;
        run.justSponge = true;
      } else {
        run.prizes += 1;
        run.score += 20;
        run.justPrize += 20;
      }
      swapPop(run.addons, i);
      continue;
    }
    i += 1;
  }

  for (let i = 0; i < run.beans.length; ) {
    const b = run.beans[i];
    b.x -= speed * step;
    if (b.taken || b.x + b.w <= -24) {
      swapPop(run.beans, i);
      continue;
    }
    const cx = playerX + PLAYER_H / 8 + 28;
    const cy = run.playerY + PLAYER_H / 2;
    const dx = cx - (b.x + b.w / 2);
    const dy = cy - (b.y + b.h / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < MAGNET_R && dist > 1) {
      const pull = MAGNET_PULL * step * (1 - dist / MAGNET_R);
      b.x += (dx / dist) * pull;
      b.y += (dy / dist) * pull;
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

  const cx = playerX + PLAYER_H / 8 + 28;
  const cy = run.playerY + PLAYER_H / 2;
  for (let i = 0; i < run.bubbles.length; ) {
    const b = run.bubbles[i];
    b.x -= speed * step;
    if (b.x + b.w <= -24) {
      swapPop(run.bubbles, i);
      continue;
    }
    const dx = cx - (b.x + b.w / 2);
    const dy = cy - (b.y + b.h / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < BUBBLE_MAGNET_R && dist > 1) {
      const pull = BUBBLE_MAGNET_PULL * step * (1 - dist / BUBBLE_MAGNET_R);
      b.x += (dx / dist) * pull;
      b.y += (dy / dist) * pull;
    }
    if (aabbHits(me, bubbleHitbox(b))) {
      run.combo += 1;
      run.comboT = COMBO_WINDOW;
      run.mult = Math.min(MAX_MULT, 1 + Math.floor(run.combo / COMBO_STEP));
      const base = b.kind === "prize" ? PRIZE_BUBBLE_PTS : BUBBLE_PTS;
      const pts = base * run.mult;
      run.score += pts;
      run.justBubble += pts;
      run.justPop = b.kind;
      if (b.kind === "prize") run.prizes += 1;
      if (run.combo > 0 && run.combo % COMBO_STEP === 0) run.justMult = run.mult;
      swapPop(run.bubbles, i);
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

export function tick(run: Run, dt: number): void {
  if (run.paused || run.dead) return;
  const cap = dt > MAX_DT ? MAX_DT : dt < 0 ? 0 : dt;
  if (cap === 0) return;

  run.justJumped = false;
  run.justLanded = false;
  run.landFromHop = false;
  run.justBean = 0;
  run.justPrize = 0;
  run.justSponge = false;
  run.justBubble = 0;
  run.justPop = null;
  run.justMult = 0;
  run.justRustle = false;
  run.justTelegraph = null;

  let left = cap;
  while (left > 0.0004) {
    const step = left > SUB_DT ? SUB_DT : left;
    stepRun(run, step);
    left -= step;
    if (run.dead) return;
  }
}
