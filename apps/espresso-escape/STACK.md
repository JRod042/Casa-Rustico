# Espresso Escape — stack (1.0.6 / 14)

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

`SKIA_TIMEBOX.decision` is **KEEP_PRIMARY**. `SKIA_FPS_KILL` is **false**. This Linux VM cannot measure mid-iPhone fps — that is **not** a <55 kill. If a Casa TestFlight run holds under 55, set the kill + reason; Views stay playable.

## Control fairness (App Store brief)

Cited: `2026-09-05-escape-appstore-controls-feel-hits`. Live: coyote 130ms, buffer 150ms, hurtbox 18×24 on 30×38, telegraph 0.62s, retry 320ms.

## Haptics + audio

Cited: `2026-09-05-escape-best-in-class-master-plan`, `2026-09-05-escape-appdev-element-checklist`.

| Layer | On branch now |
|---|---|
| Haptics | `hapticsManager` — hop / land / bean / steam / death / retry. Expo Haptics first; Vibration fallback. `AHAP_SEAMS` all `null` |
| Audio | `audioHooks` — live hop / land / bean / steam / death / retry (+ roast / warn). whoosh / stamp stay hooks |

Steam / death / retry use tiny placeholder wavs. No AHAP files. Device fps still OPEN.

Feel smoke: dedicated leaf-dot ±2px pulse; contact/cavity fake-AO uses **Multiply** (Skia `blendMode="multiply"`, Views `mixBlendMode`).

## Art

**V2_HOLD.** `USE_CRAFT_ART=false` until Cacique WIRE paste. `WIRE_KEYS` / `WIRE_PLATES` (01–06) + runner / hazards / UI are hooks only. `INVENTORY.md` is STALE.

## EAS TestFlight — HOLD (do not fire tonight)

Ready: version **1.0.6**, iOS **14**, Android **12**, profile `production`, ASC `6809059605`.

AFTER Cacique says **build** or **WIRE** — from `apps/espresso-escape`:

```bash
npx --yes eas-cli@16.28.0 build --platform ios --profile production --non-interactive
```

HOLD Submit:

```bash
npx --yes eas-cli@16.28.0 submit --platform ios --profile production --latest
```

Do not queue either command unless instructed. Shop 49 stays alone.
