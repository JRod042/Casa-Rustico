#!/usr/bin/env node
// Restores binary assets from base64 parts (GitHub-friendly chunked payload)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');

function loadJson() {
  const single = [
    path.join(root, '..', '_shared', 'assets-base64.json'),
    path.join(__dirname, 'assets-base64.json'),
  ].find((p) => fs.existsSync(p));
  if (single) return JSON.parse(fs.readFileSync(single, 'utf8'));

  const partsDir = path.join(root, '..', '_shared', 'assets-b64-parts');
  const manifest = path.join(partsDir, 'MANIFEST.txt');
  if (!fs.existsSync(manifest)) {
    console.warn('No assets base64 payload found; assuming assets/ already present');
    return null;
  }
  const names = fs.readFileSync(manifest, 'utf8').split(/\r?\n/).filter(Boolean);
  const joined = names.map((n) => fs.readFileSync(path.join(partsDir, n), 'utf8')).join('');
  return JSON.parse(joined);
}

const data = loadJson();
if (!data) process.exit(0);
fs.mkdirSync(assetsDir, { recursive: true });
for (const [name, b64] of Object.entries(data)) {
  const dest = path.join(assetsDir, name);
  fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
  console.log('restored', name, fs.statSync(dest).size);
}
