#!/usr/bin/env node
/**
 * Creative escape-kraft drop-in.
 * HARD STOP: v1 first pack is not final. Jorge skipped v1 review.
 * HALTED until Jorge says WIRE on denser v2.
 * Set ESCAPE_WIRE_KRAFT=1 only after that explicit ok.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destRoot = join(root, "assets/kraft");
const box = "/workspace/casa-brand/exports/escape-kraft/game";

if (process.env.ESCAPE_WIRE_KRAFT !== "1") {
  console.log("sync-kraft: HALTED (V2_HOLD). Denser v2 only after Jorge says WIRE.");
  process.exit(0);
}

if (!existsSync(box)) {
  console.log("sync-kraft: Creative box missing — hooks stay on the in-repo pack");
  process.exit(0);
}

const inventory = join(box, "INVENTORY.md");
if (existsSync(inventory)) {
  const text = readFileSync(inventory, "utf8");
  const looksV1 =
    /first pack|v1 first|16×1x|16x1x/i.test(text) && !/denser v2|v2 denser/i.test(text);
  if (looksV1) {
    console.log("sync-kraft: refused v1 first pack — wait for denser v2 WIRE");
    process.exit(0);
  }
}

/** Live pack files Metro already require()s — WIRE overwrites these, no loader change. */
const DROPIN = [
  ["sprites/runner-01.png", "runner.png"],
  ["sprites/hazard-grinder.png", "grinder.png"],
  ["sprites/hazard-portafilter.png", "portafilter.png"],
  ["sprites/hazard-steam.png", "steam.png"],
  ["sprites/pickup-honey-bean.png", "bean.png"],
  ["ui/menu-panel.png", "menu-panel.png"],
  ["world/mid-cafe.png", "cafe-bg.png"],
  ["world/kraft-cafe-backdrop.png", "cafe-bg.png"],
];

let copied = 0;
for (const [rel, destName] of DROPIN) {
  const src = join(box, rel);
  if (!existsSync(src)) continue;
  const dest = join(destRoot, destName);
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
