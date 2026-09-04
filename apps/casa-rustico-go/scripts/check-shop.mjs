#!/usr/bin/env node
/** Companion-shop checks — Shopify web checkout only, no IAP. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const STORE = "https://rusticopr.com";
function productUrl(handle) {
  return `${STORE}/products/${handle}`;
}
function cartPermalink(lines) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE}/cart`;
  return `${STORE}/cart/${valid.map((l) => `${l.variantId}:${l.qty}`).join(",")}`;
}

if (productUrl("casa-rustico-colombia") !== `${STORE}/products/casa-rustico-colombia`) {
  throw new Error("product deep link must stay on rusticopr.com");
}
const checkout = cartPermalink([{ variantId: 49540770201828, qty: 2 }]);
if (!checkout.startsWith(`${STORE}/cart/`)) {
  throw new Error("checkout must be a rusticopr.com cart permalink");
}
if (!checkout.includes("49540770201828:2")) {
  throw new Error("permalink missing variant qty");
}

function goBack(screen) {
  return screen.kind === "tab" ? screen : screen.back;
}
function activeTab(screen) {
  let cur = screen;
  while (cur.kind !== "tab") cur = cur.back;
  return cur.tab;
}

const home = { kind: "tab", tab: "home" };
const bag = { kind: "bag", back: home };
const product = { kind: "product", productId: "cr-colombia", back: bag };
if (activeTab(product) !== "home") throw new Error("nested product should keep home tab");
if (goBack(product).kind !== "bag") throw new Error("product from bag returns to bag");
if (goBack(goBack(product)).kind !== "tab") throw new Error("bag returns to tab");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const shopify = readFileSync(join(root, "src/shopify.ts"), "utf8");
if (!shopify.includes("https://rusticopr.com")) {
  throw new Error("shopify.ts must point at rusticopr.com");
}
const sources = [
  "App.tsx",
  "src/shopify.ts",
  "src/shop/BagScreen.tsx",
  "src/shop/GiftScreen.tsx",
  "src/shop/ProductScreen.tsx",
  "src/shop/ShopShell.tsx",
  "src/theme.ts",
]
  .map((f) => readFileSync(join(root, f), "utf8"))
  .join("\n");
if (/StoreKit|RevenueCat|expo-iap|Purchases\.|buyProduct/.test(sources)) {
  throw new Error("in-app purchase API leaked into Go");
}
if (!sources.includes("#9c704b") && !sources.includes("#9C704B")) {
  throw new Error("Go theme must include kraft #9c704b");
}
if (!sources.includes("onJoin")) {
  throw new Error("Gift must be able to open Join");
}

console.log("check-shop: PASS");
