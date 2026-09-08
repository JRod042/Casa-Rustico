import {
  type Addon,
  type AddonKind,
  type Bubble,
  type BubbleKind,
  type FloorMat,
  type FloorSeg,
  type Hazard,
  type HazardKind,
  type Scenery,
  type SceneryKind,
  type ScriptBeat,
  type World,
  GAP_S,
  INTRO_EMPTY_S,
  JUMP_AIR_S,
  MAX_ADDONS,
  MAX_BEANS,
  MAX_BUBBLES,
  MAX_FLOOR,
  MAX_HAZARDS,
  MAX_SCENERY,
  makeAddon,
  makeBean,
  makeBubble,
  makeFloor,
  makeHazard,
  makeScenery,
  phaseFor,
  type CoachCue,
} from "./physics";

type Course = {
  world: World;
  playerX: number;
  time: number;
  rng: () => number;
  nextId: number;
  hazards: Hazard[];
  beans: { id: number; taken: boolean; x: number; y: number; w: number; h: number }[];
  bubbles: Bubble[];
  scenery: Scenery[];
  addons: Addon[];
  floor: FloorSeg[];
  hazardsSpawned: number;
  lastKind: HazardKind | null;
  untilHazard: number;
  untilScenery: number;
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

export function dressStage(run: Course): void {
  const ground = run.world.groundY;
  const kinds: SceneryKind[] = [
    "palm",
    "flamboyan",
    "coffeeTree",
    "plantain",
    "pineapple",
    "tinaja",
    "coconuts",
  ];
  kinds.forEach((kind, i) => {
    const x = 28 + i * 108 + run.rng() * 18;
    run.scenery.push(makeScenery(run.nextId++, kind, x, ground, run.rng()));
  });
}

export function direct(run: Course, dt: number): void {
  if (run.cueFor > 0) {
    run.cueFor -= dt;
    if (run.cueFor <= 0) run.cue = run.jumped ? null : "tap";
  }

  if (run.tutorial && run.scriptBeat !== "done") {
    directTutorial(run, dt);
    return;
  }

  run.untilScenery -= dt;
  if (run.untilScenery <= 0 && run.scenery.length < MAX_SCENERY) {
    sprinkleScenery(run);
    run.untilScenery = 1.45 + run.rng() * 1.6;
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
    sprinkleBubbles(run, hazard);
    sprinkleAddons(run, hazard);
    layFloor(run, hazard);
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
    if (roll < 0.28) return "grinder";
    if (roll < 0.48) return "portafilter";
    if (roll < 0.64) return "knockbox";
    if (roll < 0.8) return "tamper";
    return "steam";
  }

  if (roll < 0.22) return "grinder";
  if (roll < 0.4) return "portafilter";
  if (roll < 0.55) return "knockbox";
  if (roll < 0.68) return "tamper";
  if (roll < 0.82) return "cup";
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
    spots.push({ x: hazard.x + 8, y: ground - 128 });
  } else if (hazard.kind === "portafilter") {
    spots.push({ x: hazard.x + 10, y: ground - 188 });
  } else if (hazard.kind !== "steam") {
    spots.push({ x: hazard.x - 44, y: ground - 72 });
  }
  for (const spot of spots) {
    if (run.beans.length >= MAX_BEANS) break;
    run.beans.push(makeBean(run.nextId++, spot.x, spot.y));
  }
}

function sprinkleBubbles(run: Course, hazard: Hazard): void {
  const ground = run.world.groundY;
  const spots: { x: number; y: number; kind: BubbleKind }[] = [];
  if (hazard.kind === "steam") {
    for (let i = 0; i < 4; i += 1) {
      spots.push({ x: hazard.x - 8 + i * 30, y: ground - 48 - i * 4, kind: "score" });
    }
  } else {
    const n = hazard.kind === "portafilter" ? 7 : 6;
    const peak = hazard.kind === "portafilter" ? 210 : hazard.kind === "grinder" ? 138 : 118;
    const startX = hazard.x - 28;
    const span = hazard.w + 108;
    const prizeAt = Math.floor(n / 2);
    for (let i = 0; i < n; i += 1) {
      const t = i / (n - 1);
      const arc = 4 * t * (1 - t);
      const kind: BubbleKind = i === prizeAt && run.rng() < 0.28 ? "prize" : "score";
      spots.push({
        x: startX + t * span,
        y: ground - 58 - arc * peak,
        kind,
      });
    }
  }
  for (const spot of spots) {
    if (run.bubbles.length >= MAX_BUBBLES) break;
    run.bubbles.push(makeBubble(run.nextId++, spot.kind, spot.x, spot.y, run.rng() * Math.PI * 2));
  }
}

function sprinkleAddons(run: Course, hazard: Hazard): void {
  if (run.addons.length >= MAX_ADDONS) return;
  const roll = run.rng();
  if (roll > 0.42) return;
  const kind: AddonKind = roll < 0.22 ? "sponge" : "prize";
  const ground = run.world.groundY;
  const y = kind === "sponge" ? ground - 78 : ground - 132;
  const x = hazard.x + hazard.w + 28 + run.rng() * 36;
  run.addons.push(makeAddon(run.nextId++, kind, x, y));
}

function sprinkleScenery(run: Course): void {
  if (run.scenery.length >= MAX_SCENERY) return;
  const roll = run.rng();
  const kind: SceneryKind =
    roll < 0.16
      ? "coffeeTree"
      : roll < 0.28
        ? "flamboyan"
        : roll < 0.4
          ? "palm"
          : roll < 0.52
            ? "plantain"
            : roll < 0.62
              ? "banana"
              : roll < 0.72
                ? "pineapple"
                : roll < 0.8
                  ? "dryingBed"
                  : roll < 0.88
                    ? "tinaja"
                    : roll < 0.95
                      ? "coconuts"
                      : "cacao";
  const x = run.world.width + 16 + run.rng() * 90;
  run.scenery.push(makeScenery(run.nextId++, kind, x, run.world.groundY, run.rng()));
}

function layFloor(run: Course, hazard: Hazard): void {
  if (run.floor.length >= MAX_FLOOR) return;
  if (run.rng() > 0.55) return;
  const mat: FloorMat = run.rng() < 0.55 ? "sponge" : "cardboard";
  const w = 160 + run.rng() * 180;
  const x = hazard.x - 24;
  run.floor.push(makeFloor(x, w, mat));
}
