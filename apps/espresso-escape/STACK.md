# Espresso Escape — stack (1.0.6 / 13)

Casa Rústico café runner. Mid-iPhone first. HOLD ASC Submit until Jorge says it feels pro.

**ASC:** `6809059605` only. Never `6758108565`. Never Shop 49. Bundle `com.jrod042.espressoescape`.

## Render — Skia PRIMARY + Views fallback

Kit-eval briefs: `2026-09-05-escape-pro-kit-eval`, `2026-09-05-escape-pro-stack-kits-physics`.

| Layer | On branch now |
|---|---|
| **PRIMARY** | `@shopify/react-native-skia` **2.6.2** (Expo 57 pin) `Canvas` + `Image` parallax + 1-frame `Atlas` |
| Motion | `react-native-reanimated` 4.5 shared values (`useDerivedValue` into Skia `Group`) |
| Gestures | `react-native-gesture-handler` ~2.32 (`GestureHandlerRootView`) |
| Fallback | `CafeStageViews` — RN Views + Images + LinearGradient if web, `SKIA_FPS_KILL`, or Skia throws |
| Loop | One `requestAnimationFrame` play tick |
| Physics | **matter-js** sensor queries + custom hop stepper |

**Not adopted:** expo-gl, three.js, R3F, rapier, cannon-es.

`SKIA_FPS_KILL` stays **false** until a mid-iPhone TestFlight run shows sustained fps **< 55**. This Linux VM cannot measure that. If killed, document the reason in `skiaStack.ts` and the Views path remains playable.

## Control fairness (App Store brief)

Cited: `2026-09-05-escape-appstore-controls-feel-hits`. Live: coyote 130ms, buffer 150ms, hurtbox 18×24 on 30×38, telegraph 0.62s, retry 320ms.

## Art

**V2_HOLD.** No Creative PNG wire. `INVENTORY.md` is STALE.
