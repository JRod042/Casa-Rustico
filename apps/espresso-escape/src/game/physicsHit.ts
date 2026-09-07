export function makeHazard(id, world, kind) {
  const ground = world.groundY;
  const x = world.width + 20;
  if (kind === "steam") return { id, kind, x, y: ground - 210, w: 56, h: 124, warned: false };
  if (kind === "portafilter") return { id, kind, x, y: ground - 152, w: 52, h: 152, warned: false };
  return { id, kind, x, y: ground - 80, w: 64, h: 80, warned: false };
}
