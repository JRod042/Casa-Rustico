#!/usr/bin/env node
// Optional asset restore for monorepo GitHub builds.
// Real PNGs live in assets/ — if present, skip. Never fail the build.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const icon = path.join(assetsDir, 'icon.png');

function ok(msg) {
  console.log(msg);
  process.exit(0);
}

try {
  if (fs.existsSync(icon) && fs.statSync(icon).size > 1000) {
    ok(`assets already present (${fs.statSync(icon).size} bytes icon.png)`);
  }

  const partsDir = path.join(root, '..', '_shared', 'assets-b64-parts');
  const single = path.join(root, '..', '_shared', 'assets-base64.json');
  let data = null;
  if (fs.existsSync(single)) {
    data = JSON.parse(fs.readFileSync(single, 'utf8'));
  } else if (fs.existsSync(path.join(partsDir, 'MANIFEST.txt'))) {
    const names = fs
      .readFileSync(path.join(partsDir, 'MANIFEST.txt'), 'utf8')
      .split(/\r?\n/)
      .filter(Boolean);
    const joined = names
      .map((n) => {
        const p = path.join(partsDir, n);
        if (!fs.existsSync(p)) throw new Error(`missing part ${n}`);
        return fs.readFileSync(p, 'utf8');
      })
      .join('');
    data = JSON.parse(joined);
  } else {
    ok('no base64 payload and no icon.png — continuing (EAS may still fail if icons required)');
  }

  fs.mkdirSync(assetsDir, { recursive: true });
  for (const [name, b64] of Object.entries(data)) {
    const dest = path.join(assetsDir, name);
    fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
    console.log('restored', name, fs.statSync(dest).size);
  }
  ok('asset restore complete');
} catch (e) {
  // Never fail pre-install if assets might already be fine
  console.warn('restore-assets warning:', e && e.message ? e.message : e);
  if (fs.existsSync(icon)) ok('continuing with existing assets');
  process.exit(0);
}
