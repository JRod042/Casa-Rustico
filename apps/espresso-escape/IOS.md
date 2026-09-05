# Espresso Escape — iOS / TestFlight

iOS bundle ID: **`com.jrod042.espressoescape`**  
ASC Apple ID: **pending — do not use vibecode ASC `6758108565`**  
Android package: **`com.jrod042.espressoescape`**  
Expo: **`@jrod42/espresso-escape`** (`016d7c24-a7df-4e0d-8e59-00a9d8db352c`)  
Apple Team: **`FY5H9V76QL`**  
GitHub base directory: **`apps/espresso-escape`**  
Store binary: **version 1.0.4 / iOS build 11 / Android versionCode 9**

Jorge’s iOS identity is **`com.jrod042.espressoescape`**. Do **not** restore `com.vibecode.espressoescape-20z7xb` or point EAS submit at ASC **`6758108565`**. Create a new App Store Connect app for the jrod042 bundle, then add that numeric `ascAppId` to `eas.json` when parent supplies it.

This tree has **no IAP, no store, no checkout**. Coffee is not sold in the game.

These notes mirror the Omni (`JRod042/project-1`) EAS fixes that already shipped.

---

## Current CI blocker (not fixable in git)

```
Distribution Certificate is not validated for non-interactive builds.
Failed to set up credentials.
Credentials are not set up. Run this command again in interactive mode.
```

EXPO_TOKEN is fine. The Expo project needs a **Distribution Certificate + App Store profile** for **`com.jrod042.espressoescape`** on expo.dev before GitHub Actions `--non-interactive` can queue a build.

### Fix once (then CI works)

**Expo web UI**
1. Open https://expo.dev/accounts/jrod42/projects/espresso-escape/credentials
2. Select iOS → bundle `com.jrod042.espressoescape` → **App Store**
3. Generate / assign Distribution Certificate + App Store Provisioning Profile
4. Complete Apple login
5. Confirm both show valid

**CLI path (interactive, once)**
```bash
cd apps/espresso-escape
npm ci
npx eas-cli credentials -p ios
```

An App Store Connect API key alone is **not enough**.

---

## Review notes for the next binary

| Guideline | What changed |
|---|---|
| 2.1.0 completeness | Prototype “BREW / BUST” shell removed. Playable runner: jump, café kits (grinder / portafilter / steam), beans, score, best, pause, first-run how-to → Play, About, in-app Privacy. Linen floor + kraft counter stage. Store description in `app.json` matches the mini-game. Fonts time out so a CDN stall cannot leave a blank screen. Pause is not a dead control after a roast. |
| 3.1.1 IAP / payments | No StoreKit / RevenueCat / IAP / Safari checkout. No shop buttons or `Linking.openURL`. About + Privacy state the game does not sell coffee or take payments. Do not add IAP. |
| Dual platform | iOS and Android both use `com.jrod042.espressoescape`. `eas build --platform all`. |

Do **not** invent payments. Physical bags stay in Casa Rustico Go (Shopify permalinks) and Hacienda.

---

## Omni fixes applied here

| Omni issue | Fix in this app |
|---|---|
| Missing / wrong profile for tester builds | Explicit `internal` + `preview` (+ `production` for TestFlight) |
| `autoIncrement` unsupported / risky | **Not used** — bump with `npm run bump:ios` |
| `pod install` / precompiled modules | `EXPO_USE_PRECOMPILED_MODULES=0` on all profiles |
| Privacy manifest CocoaPods crash | `expo-build-properties` → `privacyManifestAggregationEnabled: false` |
| `expo-dev-client` on store builds | Not a dependency; only `development` sets `developmentClient` |
| API key alone ≠ credentials | Need Distribution Cert + App Store profile on Expo |
| Green build ≠ TestFlight | Must **Submit** IPA to App Store Connect |

---

## Build matrix

| Profile | Distribution | Use |
|---|---|---|
| `production` | store | TestFlight / App Store / Play (preferred) |
| `internal` / `preview` | internal | Device testers via Expo (needs Ad Hoc devices) |
| `development` | internal + dev client | Native debug |

```bash
cd apps/espresso-escape
npm ci
npm run preflight:ios
npm run check:game
# TestFlight path (after credentials exist):
npx eas-cli build --platform ios --profile production
# or both stores:
npx eas-cli build --platform all --profile production
```

GitHub → Expo: base directory **`apps/espresso-escape`**, profile **`production`**.

---

## Before every Expo build

```
[ ] Apple App ID com.jrod042.espressoescape (new ASC app — not 6758108565)
[ ] eas.json submit.production.ios has bundleIdentifier com.jrod042.espressoescape
[ ] ascAppId omitted until parent supplies the new ASC numeric id
[ ] Expo credentials: Distribution Cert + App Store profile VALID for the jrod042 bundle
[ ] GitHub connected; base directory = apps/espresso-escape
[ ] ios.buildNumber / android.versionCode unused by Apple/Play (npm run bump:ios)
[ ] npm ci green
[ ] npm run preflight:ios green
[ ] Expo → Build from GitHub → main → iOS or all → production
[ ] Submit → TestFlight → Ready to Test
```

### Submit note

`submit.production.ios` is set: `appleTeamId` `FY5H9V76QL`, bundle `com.jrod042.espressoescape`. `ascAppId` is omitted until the new App Store Connect numeric id is supplied. Do not add `6758108565`.

---

## If a build fails again

Paste the **full red error block** from the Expo build log (credentials / Xcode / pod lines), not only `build:internal`.
