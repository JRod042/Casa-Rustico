import Matter from "matter-js";
import {
  type Bean,
  type Hazard,
  type Rect,
  PLAYER_H,
  PLAYER_INSET_X,
  PLAYER_INSET_Y,
  PLAYER_W,
  type World,
  beanHitbox,
  hazardHitbox,
  playerHitbox,
} from "./physics";

/**
 * Matter.js collision world for the café line.
 * Gravity is zero — the runner stepper owns variable rise/fall.
 * Matter owns sensor queries so hurtboxes stay smaller than stickers.
 */
export type MatterWorld = {
  engine: Matter.Engine;
  player: Matter.Body;
};

export function createMatterWorld(world: World, playerX: number): MatterWorld {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 0 },
    enableSleeping: false,
  });
  engine.timing.timeScale = 1;
  const hurt = playerHitbox(playerX, world.groundY - PLAYER_H);
  const player = Matter.Bodies.rectangle(
    hurt.x + hurt.w / 2,
    hurt.y + hurt.h / 2,
    hurt.w,
    hurt.h,
    {
      label: "player",
      isSensor: true,
      inertia: Infinity,
      friction: 0,
      frictionAir: 0,
      restitution: 0,
    }
  );
  Matter.Composite.add(engine.world, player);
  return { engine, player };
}

function syncBody(body: Matter.Body, rect: Rect): void {
  Matter.Body.setPosition(body, {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  });
  Matter.Body.setVelocity(body, { x: 0, y: 0 });
}

function sensor(rect: Rect, label: string): Matter.Body {
  return Matter.Bodies.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, {
    label,
    isSensor: true,
    isStatic: true,
  });
}

export function matterHitsHazard(
  sim: MatterWorld,
  playerX: number,
  playerY: number,
  hazards: Hazard[]
): Hazard | null {
  syncBody(sim.player, playerHitbox(playerX, playerY));
  for (const h of hazards) {
    const box = hazardHitbox(h);
    const body = sensor(box, `hazard-${h.id}`);
    const hit = Matter.Query.collides(sim.player, [body]).length > 0;
    if (hit) return h;
  }
  return null;
}

export function matterHitsBean(
  sim: MatterWorld,
  playerX: number,
  playerY: number,
  bean: Bean
): boolean {
  syncBody(sim.player, playerHitbox(playerX, playerY));
  const box = beanHitbox(bean);
  const body = sensor(box, `bean-${bean.id}`);
  return Matter.Query.collides(sim.player, [body]).length > 0;
}

export const HURTBOX_W = PLAYER_W - PLAYER_INSET_X * 2;
export const HURTBOX_H = PLAYER_H - PLAYER_INSET_Y * 2;
