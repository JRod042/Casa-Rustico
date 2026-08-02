#!/usr/bin/env node
// Restores binary assets from base64 (for GitHub-sourced EAS builds)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
// Prefer shared monorepo blob, fall back to local copy
const candidates = [
  path.join(root, '..', '_shared', 'assets-base64.json'),
  path.join(__dirname, 'assets-base64.json'),
];
const dataPath = candidates.find((p) => fs.existsSync(p));
if (!dataPath) {
  console.warn('No assets-base64.json found; assuming assets/ already present');
  process.exit(0);
}
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
fs.mkdirSync(assetsDir, { recursive: true });
for (const [name, b64] of Object.entries(data)) {
  const dest = path.join(assetsDir, name);
  fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
  console.log('restored', name, fs.statSync(dest).size, 'from', path.relative(root, dataPath));
}
