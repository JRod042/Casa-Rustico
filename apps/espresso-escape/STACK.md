# Espresso Escape — stack (1.0.6 / 13)

Casa Rústico café runner. Mid-iPhone first. HOLD ASC Submit until Jorge says it feels pro.

**ASC:** `6809059605` only. Never `6758108565`. Never Shop 49. Bundle `com.jrod042.espressoescape`.

## Current render stack (for kit-eval)

| Layer | What ships now |
|---|---|
| Scene | **React Native `View` + `Image` paper planes** |
| Motion | **`react-native-reanimated` 4.5** shared values (parallax, squash, life loop) |
| Light | **`expo-linear-gradient`** + cream wash / shafts |
| Art | Kraft PNGs via `require()` (`assets/kraft/`) |
| Loop | One `requestAnimationFrame` play tick |

**Not on the branch:** Skia (`@shopify/react-native-skia`), `expo-gl`, three.js, React Three Fiber, a GLView / Canvas. Do not add them until kit-eval says the TF cost is worth it.

LBP craft here is **receding paper plates** (canopy → highland → mid café → shelf → ground) with steam, dust, idle sacks/cups, plant sway, cloth, and soft shafts. That is high-end **2.5D**, not a mesh jungle.

Full 3D on Expo 57 adds GL startup, shader compile, and a second render loop next to Reanimated. On iPhone 12/13 class that is how a 60fps runner drops to 40. **No R3F this pass.**

## Physics — already Matter.js (sensors only)

| Candidate | On branch? | Note |
|---|---|---|
| **matter-js** 0.20 | **Yes** | Sensor `Query.collides` for ~63% hurtboxes |
| rapier | No | WASM + native glue. Wait for kit-eval. |
| cannon-es | No | 3D world. Wait until a 3D renderer exists. |
| react-native-game-engine | No | Class-entity loop fights Reanimated RAF. |

Hop stepper stays custom: variable gravity (fall 3600 > rise 2200), coyote 130ms, buffer 150ms, heel mercy, telegraph 0.62s, magnet. Matter’s constant gravity cannot express that without fighting the hop.

**Hard kit / physics adoption is paused** until the kit-eval lane reports. Do not swap Matter or add a second engine in this PR.

## Other kits (in-tree)

- `expo-haptics` — cloth hop / cardboard land / fabric bean
- `expo-av` — optional café ticks

## Art

**V2_HOLD.** Jorge skipped v1 review. No Creative PNG copy/commit from `/workspace/casa-brand/exports/escape-kraft/` until Jorge says WIRE on denser v2. Hooks in `kraftMap.ts` / plate aliases in `kraftAssets.ts`.

No ads, IAP, HomeKit, shop, or vibecode ASC.
