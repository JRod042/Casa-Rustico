import {
  type Hazard,
  type HazardKind,
  type ScriptBeat,
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
  playerX: number;
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
  airborne: boolean;
  beansTaken: number;
  tutorial: boolean;
  scriptBeat: ScriptBeat;
  scriptWait: number;
};

/**
 * Course director — Cookie Run jelly-path + Chrome Dino spacing +
 * Subway/Temple “teach one verb, then mix.”
 *
 * First-run micro-script is TAP → steam (stay low) → honey bean, then the
 * normal grinders-first phrase. Time-based gaps. Beans sit on the safe line.
 */
export function direct(run: Course, dt: number): void {
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

function directTutorial(run: Course, dt: number): void {
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
