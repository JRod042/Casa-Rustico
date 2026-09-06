#!/usr/bin/env node
/**
 * Creative escape-kraft drop-in. HALTED until Jorge says WIRE.
 * Set ESCAPE_WIRE_KRAFT=1 only after that explicit ok.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destRoot = join(root, "assets/kraft");
const box = "/workspace/casa-brand/exports/escape-kraft/game";

if (process.env.ESCAPE_WIRE_KRAFT !== "1") {
  console.log("sync-kraft: HALTED (Jorge review). Set ESCAPE_WIRE_KRAFT=1 after WIRE.");
  process.exit(0);
}

if (!existsSync(box)) {
  console.log("sync-kraft: Creative box missing — hooks stay on the in-repo pack");
  process.exit(0);
}

const REL = [
  "ui/title-bg.png",
  "ui/menu-panel.png",
  "ui/wordmark-espresso-escape.png",
  "ui/panel-game-over.png",
  "ui/panel-best-run.png",
  "sprites/runner-01.png",
  "sprites/runner-02.png",
  "sprites/runner-03.png",
  "sprites/runner-04.png",
  "sprites/hazard-grinder.png",
  "sprites/hazard-portafilter.png",
  "sprites/hazard-steam.png",
  "sprites/pickup-honey-bean.png",
  "world/ground-strip.png",
  "world/scroll-backdrop.png",
  "world/kraft-cafe-backdrop.png",
];

let copied = 0;
for (const rel of REL) {
  const src = join(box, rel);
  if (!existsSync(src)) continue;
  const dest = join(destRoot, "game", rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  copied += 1;
  for (const scale of ["@2x", "@3x"]) {
    const s = src.replace(/\.png$/i, `${scale}.png`);
    if (!existsSync(s)) continue;
    copyFileSync(s, dest.replace(/\.png$/i, `${scale}.png`));
    copied += 1;
  }
  console.log("kraft wire", rel, statSync(src).size);
}
console.log(`sync-kraft: copied ${copied} file(s)`);
