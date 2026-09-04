import {
  type Bean,
  type Hazard,
  type World,
  GRAVITY,
  JUMP_V,
  PLAYER_H,
  aabbHits,
  makeBean,
  makeHazard,
  pickHazardKind,
  playerRect,
  spawnGapForSpeed,
  speedForScore,
} from "./physics";

/** Cap catch-up so a long JS hitch does not tunnel through hazards. */
export const MAX_DT = 1 / 30;
export const MAX_HAZARDS = 8;
export const MAX_BEANS = 6;

export type Run = {
  world: World;
  playerX: number;
  playerY: number;
  vy: number;
  hazards: Hazard[];
  beans: Bean[];
  score: number;
  nextId: number;
  spawnIn: number;
  beanIn: number;
  paused: boolean;
  dead: boolean;
  jumped: boolean;
};

export function createRun(world: World, playerX: number): Run {
  return {
    world,
    playerX,
    playerY: world.groundY - PLAYER_H,
    vy: 0,
    hazards: [],
    beans: [],
    score: 0,
    nextId: 1,
    spawnIn: 700,
    beanIn: 900,
    paused: false,
    dead: false,
    jumped: false,
  };
}

export function resizeRun(run: Run, world: World, playerX: number): void {
  run.world = world;
  run.playerX = playerX;
  const floor = world.groundY - PLAYER_H;
  if (run.playerY > floor) run.playerY = floor;
}

export function jump(run: Run): boolean {
  if (run.paused || run.dead) return false;
  const onGround = run.playerY >= run.world.groundY - PLAYER_H - 1;
  if (!onGround) return false;
  run.vy = JUMP_V;
  run.jumped = true;
  return true;
}

function swapPop<T>(list: T[], i: number): void {
  const last = list[list.length - 1];
  if (last === undefined) return;
  list[i] = last;
  list.pop();
}

/** Advance one frame. Mutates `run` in place — no allocations on the quiet path. */
export function tick(run: Run, dt: number): void {
  if (run.paused || run.dead) return;
  const step = dt > MAX_DT ? MAX_DT : dt < 0 ? 0 : dt;
  if (step === 0) return;

  const speed = speedForScore(run.score);
  const { world, playerX } = run;

  run.vy += GRAVITY * step;
  run.playerY += run.vy * step;
  const floor = world.groundY - PLAYER_H;
  if (run.playerY >= floor) {
    run.playerY = floor;
    run.vy = 0;
  }

  run.spawnIn -= speed * step * 100;
  if (run.spawnIn <= 0 && run.hazards.length < MAX_HAZARDS) {
    run.hazards.push(makeHazard(run.nextId++, world, pickHazardKind(run.score)));
    run.spawnIn = spawnGapForSpeed(speed);
  }

  run.beanIn -= speed * step * 100;
  if (run.beanIn <= 0 && run.beans.length < MAX_BEANS) {
    run.beans.push(makeBean(run.nextId++, world, Math.floor(run.score) % 2 === 0));
    run.beanIn = 1100 + (Math.floor(run.score) % 5) * 80;
  }

  for (let i = 0; i < run.hazards.length; ) {
    const h = run.hazards[i];
    h.x -= speed * step;
    if (h.x + h.w <= -40) swapPop(run.hazards, i);
    else i += 1;
  }

  const me = playerRect(playerX, run.playerY);
  let gained = 0;
  for (let i = 0; i < run.beans.length; ) {
    const b = run.beans[i];
    b.x -= speed * step;
    if (b.taken || b.x + b.w <= -20) {
      swapPop(run.beans, i);
      continue;
    }
    if (aabbHits(me, b, 0)) {
      gained += 5;
      swapPop(run.beans, i);
      continue;
    }
    i += 1;
  }

  if (gained) run.score += gained;
  else run.score += step * 2.4;

  for (let i = 0; i < run.hazards.length; i += 1) {
    if (aabbHits(me, run.hazards[i])) {
      run.dead = true;
      return;
    }
  }
}
