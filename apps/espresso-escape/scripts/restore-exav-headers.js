#!/usr/bin/env node
/**
 * expo-av 16 EXAV imports ExpoModulesCore/EXEventEmitter.h which SDK 57 removed.
 * Copy compat headers into expo-modules-core so Xcode can build EXAV.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const srcDir = path.join(__dirname, "exav-compat-headers", "ExpoModulesCore");
const destDir = path.join(root, "node_modules", "expo-modules-core", "ios", "Legacy", "Protocols");
const umbrella = path.join(root, "node_modules", "expo-modules-core", "ios", "ExpoModulesCore.h");
const defines = path.join(root, "node_modules", "expo-modules-core", "ios", "EXDefines.h");

const names = ["EXEventEmitter.h", "EXEventEmitterService.h", "EXLegacyExpoViewProtocol.h"];

if (!fs.existsSync(path.join(root, "node_modules", "expo-modules-core"))) {
  console.log("restore-exav-headers: expo-modules-core not installed — skip");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
for (const name of names) {
  const from = path.join(srcDir, name);
  const to = path.join(destDir, name);
  fs.copyFileSync(from, to);
  console.log("restore-exav-headers:", to);
}

if (fs.existsSync(umbrella)) {
  let text = fs.readFileSync(umbrella, "utf8");
  for (const name of names) {
    const line = `#import <ExpoModulesCore/${name}>\n`;
    if (!text.includes(name)) {
      text += line;
    }
  }
  fs.writeFileSync(umbrella, text);
}

if (fs.existsSync(defines)) {
  let text = fs.readFileSync(defines, "utf8");
  if (!text.includes("UMPromiseResolveBlock")) {
    text += `
#ifndef UMPromiseResolveBlock
typedef EXPromiseResolveBlock UMPromiseResolveBlock;
typedef EXPromiseRejectBlock UMPromiseRejectBlock;
#endif
`;
    fs.writeFileSync(defines, text);
  }
}

console.log("restore-exav-headers: EXAV ExpoModulesCore headers restored");
