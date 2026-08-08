# Espresso Escape — iOS / TestFlight

Bundle ID: **`com.jrod042.espressoescape`**  
Expo: **`@jrod42/espresso-escape`**  
Apple Team: **`FY5H9V76QL`**  
GitHub base directory: **`apps/espresso-escape`**

These notes mirror the Omni (`JRod042/project-1`) EAS fixes that already shipped.

---

## If you still see `Failed to run eas build:internal`

1. **Merge PR #2 into `main` first.** Until then, `main` has **no** profile named `internal` (only `preview` + `production`). Building profile `internal` from `main` will fail immediately.
2. After merge, rebuild from branch **`main`** (or the fix branch) with profile **`production`** (TestFlight) or **`internal`**.
3. That error string is also EAS’s **generic wrapper** — open the full Expo build log for the real line (credentials / pods / etc.).
4. Prefer a pinned CLI locally: `npx --yes eas-cli@16.28.0` (see `npm run eas:build:ios`).

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

## Credentials (required before GitHub / non-interactive builds)

1. [expo.dev → espresso-escape → Credentials → iOS](https://expo.dev/accounts/jrod42/projects/espresso-escape/credentials)
2. For **`com.jrod042.espressoescape`** open **App Store** (not Ad Hoc) when targeting TestFlight
3. Generate **Distribution Certificate** + **App Store Provisioning Profile** (Apple login)
4. For ad hoc **internal** installs, also set up **Ad Hoc** profile + register devices

An App Store Connect API key alone is **not enough**.

---

## Build matrix

| Profile | Distribution | Use |
|---|---|---|
| `production` | store | TestFlight / App Store (preferred) |
| `internal` / `preview` | internal | Device testers via Expo (needs Ad Hoc devices) |
| `development` | internal + dev client | Native debug |

```bash
cd apps/espresso-escape
npm ci
npm run preflight:ios
# TestFlight path:
npx eas-cli build --platform ios --profile production
# then Submit on expo.dev (or eas submit)
```

GitHub → Expo: base directory **`apps/espresso-escape`**, profile **`production`**.

---

## Before every Expo build

```
[ ] Apple App ID com.jrod042.espressoescape exists
[ ] App Store Connect app exists (add ascAppId to eas.json submit when known)
[ ] Expo credentials: Distribution Cert + App Store profile VALID
[ ] GitHub connected; base directory = apps/espresso-escape
[ ] Bumped ios.buildNumber if Apple already used current number (npm run bump:ios)
[ ] npm ci green
[ ] npm run preflight:ios green
[ ] Expo → Build from GitHub → main → iOS → production
[ ] Submit → TestFlight → Ready to Test
```

### Submit note

`submit.production.ios.appleTeamId` is set (`FY5H9V76QL`).  
When the ASC app exists, add `"ascAppId": "<digits>"` under `submit.production.ios` (same as Omni).

---

## If a build fails again

Paste the **full red error block** from the Expo build log (credentials / Xcode / pod lines), not only `build:internal`.
