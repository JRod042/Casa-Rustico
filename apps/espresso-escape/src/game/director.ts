import {
  type Hazard,
  type HazardKind,
  type World,
  GAP_S,
  INTRO_EMPTY_S,
  JUMP_AIR_S,
  MAX_BEANS,
  MAX_HAZARDS,
  makeBean,
  makeHazard,
  phaseFor,
} from "./physics";
import type { CoachCue } from "./physics";

type Course = {
  world: World;
  time: number;
  rng: () => number;
  nextId: number;
  hazards: Hazard[];
  beans: { id: number; taken: boolean; x: number; y: number; w: number; h: number }[];
  hazardsSpawned: number;
  lastKind: HazardKind | null;
  untilHazard: number;
  seenPorta: boolean;
  seenSteam: boolean;
  cue: CoachCue;
  cueFor: number;
  jumped: boolean;
};

/**
 * Course director — Cookie Run jelly-path + Chrome Dino spacing +
 * Subway/Temple “teach one verb, then mix.”
 *
 * Time-based gaps (not the old speed*100 unit bug). Every jump-required
 * kit leaves a landable beat. Steam never appears until the player has
 * seen grinders and a portafilter. Beans sit on the safe line.
 */
export function direct(run: Course, dt: number): void {
  if (run.cueFor > 0) {
    run.cueFor -= dt;
    if (run.cueFor <= 0) run.cue = run.jumped ? null : "tap";
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

function chooseKind(run: Course): HazardKind {
  const phase = phaseFor(run.time);
  if (run.hazardsSpawned < 2 || phase === 0) return "grinder";
  if (phase >= 2 && !run.seenPorta) return "portafilter";

  const roll = run.rng();
  if (phase === 1) return roll < 0.68 ? "grinder" : "portafilter";

  if (run.lastKind === "portafilter" && roll < 0.22) {
    return "grinder";
  }

  if (phase === 2) {
    if (roll < 0.42) return "grinder";
    if (roll < 0.74) return "portafilter";
    return "steam";
  }

  if (roll < 0.34) return "grinder";
  if (roll < 0.64) return "portafilter";
  return "steam";
}

function gapAfter(run: Course, kind: HazardKind): number {
  const [lo, hi] = GAP_S[phaseFor(run.time)];
  let gap = lo + run.rng() * (hi - lo);
  if (kind === "grinder" || kind === "portafilter") {
    gap = Math.max(gap, JUMP_AIR_S + 0.3);
  } else {
    gap = Math.max(gap, 0.64);
  }
  return gap;
}

function cueForKind(run: Course, kind: HazardKind): void {
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

function sprinkleBeans(run: Course, hazard: Hazard): void {
  const ground = run.world.groundY;
  const spots: { x: number; y: number }[] = [];
  if (hazard.kind === "grinder") {
    spots.push(
      { x: hazard.x + 6, y: ground - 96 },
      { x: hazard.x + 30, y: ground - 122 }
    );
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
