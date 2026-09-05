#!/usr/bin/env bash
# Fail fast before spending an EAS iOS build minute.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
EXPECTED_IOS_BUNDLE_ID="com.vibecode.espressoescape-20z7xb"
EXPECTED_ANDROID_PACKAGE="com.jrod042.espressoescape"
EXPECTED_ASC_APP_ID="6758108565"

[[ -f app.json ]] || { echo "missing app.json"; exit 1; }
[[ -f eas.json ]] || { echo "missing eas.json"; exit 1; }
[[ -f package.json ]] || { echo "missing package.json"; exit 1; }
[[ -f assets/icon.png ]] || { echo "missing assets/icon.png"; exit 1; }

EXPECTED_IOS_BUNDLE_ID="$EXPECTED_IOS_BUNDLE_ID" \
EXPECTED_ANDROID_PACKAGE="$EXPECTED_ANDROID_PACKAGE" \
EXPECTED_ASC_APP_ID="$EXPECTED_ASC_APP_ID" node <<'NODE'
const app = require('./app.json');
const eas = require('./eas.json');
const pkg = require('./package.json');
const expectedIos = process.env.EXPECTED_IOS_BUNDLE_ID;
const expectedAndroid = process.env.EXPECTED_ANDROID_PACKAGE;
const expectedAsc = process.env.EXPECTED_ASC_APP_ID;
const bid = app.expo?.ios?.bundleIdentifier;
const bn = app.expo?.ios?.buildNumber;

if (!pkg.dependencies?.expo) throw new Error('package.json missing expo');
if (bid !== expectedIos) throw new Error(`bundleIdentifier ${bid} != ${expectedIos}`);
if (typeof bn !== 'string' || !/^\d+$/.test(bn)) {
  throw new Error(`ios.buildNumber must be digit string, got ${JSON.stringify(bn)}`);
}
if (app.expo?.android?.package !== expectedAndroid) {
  throw new Error(`android.package ${app.expo?.android?.package} != ${expectedAndroid}`);
}
const vc = app.expo?.android?.versionCode;
if (!Number.isInteger(vc) || vc < 1) {
  throw new Error(`android.versionCode must be a positive integer, got ${JSON.stringify(vc)}`);
}
const desc = String(app.expo?.description ?? "");
if (!/mini-game/i.test(desc) || !/does not sell coffee/i.test(desc)) {
  throw new Error("app.json description must match the playable coffee mini-game (no IAP)");
}
if (!eas.build?.production) throw new Error('eas.json missing production profile');
if (!eas.build?.internal) throw new Error('eas.json missing internal profile');
if (!eas.build.production.android) throw new Error('production profile must include android');
if (eas.build.production.autoIncrement) {
  throw new Error('autoIncrement is not supported — use npm run bump:ios');
}
const env = eas.build.production.env || {};
if (env.EXPO_USE_PRECOMPILED_MODULES !== '0') {
  throw new Error('production env must set EXPO_USE_PRECOMPILED_MODULES=0');
}
const plugins = app.expo.plugins || [];
const buildProps = plugins.find((p) => Array.isArray(p) && p[0] === 'expo-build-properties');
if (!buildProps?.[1]?.ios || buildProps[1].ios.privacyManifestAggregationEnabled !== false) {
  throw new Error('expo-build-properties must set privacyManifestAggregationEnabled: false');
}
const submitIos = eas.submit?.production?.ios || {};
if (submitIos.bundleIdentifier !== expectedIos) {
  throw new Error(`eas submit bundleIdentifier ${submitIos.bundleIdentifier} != ${expectedIos}`);
}
if (String(submitIos.ascAppId) !== expectedAsc) {
  throw new Error(`eas submit ascAppId ${submitIos.ascAppId} != ${expectedAsc}`);
}
console.log('config ok', { bid, bn, profiles: Object.keys(eas.build) });
NODE

npx expo config --type public --json >/tmp/ee-expo-config.json
node <<'NODE'
const c = require('/tmp/ee-expo-config.json');
if (c.ios?.bundleIdentifier !== 'com.vibecode.espressoescape-20z7xb') {
  throw new Error('expo config bundle mismatch: ' + c.ios?.bundleIdentifier);
}
console.log('expo config ok', c.ios.bundleIdentifier, 'buildNumber', c.ios.buildNumber);
NODE

echo "preflight-ios: PASS"
