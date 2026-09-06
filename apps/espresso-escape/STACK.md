# Espresso Escape — stack choices (1.0.6 / 13)

Casa Rústico café runner. Mid-iPhone first. HOLD ASC Submit until Jorge ok.

## Render — 2.5D diorama, not full 3D

Evaluated **expo-gl + three.js / React Three Fiber** and **cannon-es**.

A side-scrolling tap-jump does not need a perspective camera. LBP-style depth is **layered paper planes** (far mist, mid café, near counter, ground strip) with soft light — that is the craft language, not a mesh jungle.

Full 3D on Expo 57 would add GL surface startup, shader compile stalls, and a second render loop next to Reanimated shared values. On mid iPhones (12/13 class) that is the usual way a 60fps runner drops to 40. **We do not ship R3F this pass.**

What ships: **2.5D** — `react-native-reanimated` layers + kraft PNGs + ambient steam/dust/prop bob. Same RAF play loop. Reads lifelike; stays Expo-native.

## Physics — Matter.js + feel layer

| Candidate | Verdict |
|---|---|
| **matter-js** ([liabru/matter-js](https://github.com/liabru/matter-js)) | **Chosen.** Pure JS, Hermes-safe, no WASM. Used by many RN runners. |
| rapier | WASM + native glue. Extra EAS risk. |
| cannon-es | 3D world. Overkill without a 3D renderer. |
| react-native-game-engine | Mature kit, but class-entity loop fights our Reanimated RAF. Not adopted. |

Matter owns **sensor collision queries** (`Query.collides`) so the hurtbox stays ~63% of the sticker.

The hop stepper stays custom: **variable gravity** (fall > rise), **coyote 130ms**, **buffer 150ms**, **heel mercy**, **telegraph 0.62s**, **magnet**. Matter’s constant `world.gravity` cannot express that without fighting the tuned hop.

## Other kits (already in-tree)

- `react-native-reanimated` — 60fps transforms
- `expo-haptics` — cloth hop / cardboard land / fabric bean
- `expo-linear-gradient` — material light
- `expo-av` — optional café ticks

No ads, IAP, HomeKit, shop, or vibecode ASC.
