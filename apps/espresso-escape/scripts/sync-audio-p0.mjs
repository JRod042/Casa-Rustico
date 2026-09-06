#!/usr/bin/env node
/**
 * Copy Casa sound P0 into the app. AUDIO wire — not art.
 * Box: /workspace/casa-brand/exports/escape-kraft/audio-kit/p0-for-pr21
 * Keys: hop | land | bean | whoosh | stamp | steam
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const box = "/workspace/casa-brand/exports/escape-kraft/audio-kit/p0-for-pr21";
const keys = ["hop", "land", "bean", "whoosh", "stamp", "steam"];

if (!existsSync(box)) {
  console.error(`sync-audio-p0: BOX MISSING — ${box}`);
  process.exit(2);
}

const manifestPath = join(box, "MANIFEST.json");
if (existsSync(manifestPath)) {
  console.log("sync-audio-p0: MANIFEST.json", readFileSync(manifestPath, "utf8").slice(0, 400));
}

mkdirSync(join(root, "assets/sfx"), { recursive: true });
mkdirSync(join(root, "assets/ahap"), { recursive: true });

let copied = 0;
for (const key of keys) {
  const wav = [join(box, "sfx", `${key}.wav`), join(box, `${key}.wav`)].find(existsSync);
  if (wav) {
    copyFileSync(wav, join(root, "assets/sfx", `${key}.wav`));
    copied += 1;
    console.log("wav", key);
  }
  const ahap = [join(box, "ahap", `${key}.ahap`), join(box, `${key}.ahap`)].find(existsSync);
  if (ahap) {
    copyFileSync(ahap, join(root, "assets/ahap", `${key}.ahap`));
    copied += 1;
    console.log("ahap", key);
  }
}

if (copied === 0) {
  console.error("sync-audio-p0: box present but no hop|land|bean|whoosh|stamp|steam files");
  console.error(readdirSync(box).join("\n"));
  process.exit(2);
}

console.log(`sync-audio-p0: copied ${copied} files`);
