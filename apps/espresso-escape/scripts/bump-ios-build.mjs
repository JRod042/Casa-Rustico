#!/usr/bin/env node
/**
 * Increment ios.buildNumber (string) and android.versionCode together.
 * Run before each new store upload when Apple/Play already used the current
 * numbers. Do not use EAS autoIncrement.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const appJsonPath = path.join(root, 'app.json');
const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const current = String(app.expo?.ios?.buildNumber ?? '0');
const next = String(Number.parseInt(current, 10) + 1);
if (!Number.isFinite(Number(next)) || Number(next) < 1) {
  console.error(`Invalid buildNumber: ${current}`);
  process.exit(1);
}
app.expo.ios.buildNumber = next;
const vc = Number(app.expo?.android?.versionCode ?? 0);
app.expo.android = app.expo.android ?? {};
app.expo.android.versionCode = Number.isFinite(vc) ? vc + 1 : Number(next);
fs.writeFileSync(appJsonPath, `${JSON.stringify(app, null, 2)}\n`);
console.log(`ios.buildNumber: ${current} → ${next}`);
console.log(`android.versionCode: ${vc} → ${app.expo.android.versionCode}`);
