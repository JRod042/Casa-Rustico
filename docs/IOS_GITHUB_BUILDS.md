# iOS builds from GitHub

These are **iOS** App Store apps (not Android-first).

Hardening below mirrors fixes already proven on **Omni** (`JRod042/project-1` PRs #5–#8, #11).

> **Still seeing `Failed to run eas build:internal`?**  
> Merge [PR #2](https://github.com/JRod042/Casa-Rustico/pull/2) into `main` first. Until then, `main` has **no** profile named `internal`.  
> Workaround on old `main`: use profile **`production`** (TestFlight) or **`preview`**.  
> After merge, prefer `production` + Submit for TestFlight.

## Expo projects

| App | Expo project | Base directory on GitHub | Bundle ID |
|-----|--------------|--------------------------|-----------|
| Casa Rustico Go | https://expo.dev/accounts/jrod42/projects/casa-rustico-go | `apps/casa-rustico-go` | `com.jrod042.casarusticogo` |
| Espresso Escape | https://expo.dev/accounts/jrod42/projects/espresso-escape | `apps/espresso-escape` | `com.jrod042.espressoescape` |

Per-app checklists: [`apps/casa-rustico-go/IOS.md`](../apps/casa-rustico-go/IOS.md), [`apps/espresso-escape/IOS.md`](../apps/espresso-escape/IOS.md).

## EAS profiles

| Profile | Distribution | Use for |
|---------|--------------|---------|
| `production` | store | **TestFlight / App Store (preferred)** |
| `internal` | internal | Ad hoc / Expo install links (needs registered devices) |
| `preview` | same as `internal` | Alias |
| `development` | internal + dev client | Native debug only |

### Correct commands

```bash
cd apps/casa-rustico-go   # or apps/espresso-escape
npm ci
npm run preflight:ios

# TestFlight path (same as Omni)
npm run eas:build:ios          # profile production
# after green build → Submit on expo.dev
npm run eas:submit:ios

# Ad hoc / internal testers only
npm run eas:build:internal
```

## Omni lessons applied to both apps

| Omni failure | What we do here |
|---|---|
| `Error: build:internal command failed` | Treat as **generic wrapper** — read the real log line above it |
| Credentials not set up | Document Distribution Cert + App Store profile (API key alone fails) |
| `autoIncrement` unsupported / reuse | **No autoIncrement**; `npm run bump:ios` |
| `pod install` exit 1 | `EXPO_USE_PRECOMPILED_MODULES=0` on every profile |
| Privacy manifest CocoaPods crash | `privacyManifestAggregationEnabled: false` via `expo-build-properties` |
| Green build not in TestFlight | Build ≠ Submit — must Submit IPA to ASC |
| Flaky GitHub base dir | Expo project base directory must be the app folder |

## One-time setup (GitHub → EAS)

1. Link GitHub: https://expo.dev/settings#connections  
2. Install Expo GitHub App on account JRod042  
3. For each project → **GitHub** → repo `JRod042/Casa-Rustico`  
4. Set **Base directory** to the app path above  
5. Credentials → iOS → **App Store** → Distribution Certificate + Provisioning Profile (Apple team `FY5H9V76QL`)  
6. First interactive local build optional:
   ```bash
   cd apps/casa-rustico-go && npx eas-cli build -p ios --profile production
   ```
7. Then **Build from GitHub** → iOS → **production** → when green → **Submit**

## Workflow

Each app has `.eas/workflows/build-ios.yml` for iOS production builds (manual `workflow_dispatch` only).
