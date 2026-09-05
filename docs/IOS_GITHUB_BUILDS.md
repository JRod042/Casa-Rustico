# iOS builds from GitHub

These are **iOS** App Store apps (not Android-first).

Hardening below mirrors fixes already proven on **Omni** (`JRod042/project-1`).

> **Current blocker (Aug 23 2026 runs #1–#3)**  
> All GitHub Actions runs fail with the exact eas-cli message:
> ```
> Distribution Certificate is not validated for non-interactive builds.
> Failed to set up credentials.
> Credentials are not set up. Run this command again in interactive mode.
> ```
> This is **not** an EXPO_TOKEN problem (whoami succeeds). It means the two
> Expo projects do not yet have a validated Distribution Certificate + App
> Store Provisioning Profile stored on EAS. Non-interactive / CI builds
> refuse to create them.

## Expo projects

| App | Expo project | Base directory on GitHub | Bundle ID |
|-----|--------------|--------------------------|-----------|
| Casa Rustico Go | https://expo.dev/accounts/jrod42/projects/casa-rustico-go | `apps/casa-rustico-go` | `com.jrod042.casarusticogo` |
| Espresso Escape | https://expo.dev/accounts/jrod42/projects/espresso-escape | `apps/espresso-escape` | `com.vibecode.espressoescape-20z7xb` |

Per-app checklists: [`apps/casa-rustico-go/IOS.md`](../apps/casa-rustico-go/IOS.md), [`apps/espresso-escape/IOS.md`](../apps/espresso-escape/IOS.md).

## One-time credential bootstrap (REQUIRED before any CI build)

Public eas-cli source and dozens of GitHub issues confirm the same rule:
**the first Distribution Certificate for a project must be created/validated interactively.**

### Option A — Expo web UI (fastest, no local Mac required)

1. Open the project credentials page:
   - Casa Rustico Go → https://expo.dev/accounts/jrod42/projects/casa-rustico-go/credentials
   - Espresso Escape → https://expo.dev/accounts/jrod42/projects/espresso-escape/credentials
2. Select the **iOS** bundle identifier.
3. Choose **App Store** distribution (needed for TestFlight).
4. Let Expo generate / select a **Distribution Certificate** and matching **App Store Provisioning Profile**.
5. Complete Apple login when prompted.
6. Confirm both items show as valid on the credentials page.

### Option B — Local interactive CLI (once per app)

```bash
cd apps/casa-rustico-go   # or apps/espresso-escape
npm ci
npx eas-cli credentials -p ios
# follow prompts → App Store → generate/use Distribution Certificate + Profile

# or simply run the first build interactively (no --non-interactive):
npx eas-cli build --platform ios --profile production
```

After either option succeeds, the GitHub workflow will pass the credentials step.

An App Store Connect API key alone is **not enough** — the Distribution Certificate must exist on the Expo project.

## EAS profiles

| Profile | Distribution | Use for |
|---------|--------------|---------|
| `production` | store | **TestFlight / App Store (preferred)** |
| `internal` | internal | Ad hoc / Expo install links (needs registered devices) |
| `preview` | same as `internal` | Alias |
| `development` | internal + dev client | Native debug only |

### Correct commands (after credentials exist)

```bash
cd apps/casa-rustico-go   # or apps/espresso-escape
npm ci
npm run preflight:ios

# TestFlight path
npm run eas:build:ios          # profile production
# after green build → Submit on expo.dev
npm run eas:submit:ios
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

## GitHub → EAS connection checklist

1. Link GitHub: https://expo.dev/settings#connections  
2. Install Expo GitHub App on account JRod042  
3. For each project → **GitHub** → repo `JRod042/Casa-Rustico`  
4. Set **Base directory** to the app path above  
5. Credentials → iOS → **App Store** → Distribution Certificate + Provisioning Profile (Apple team `FY5H9V76QL`)  
6. First interactive local build optional (see bootstrap above)  
7. Then **Build from GitHub** → iOS → **production** → when green → **Submit**

## Workflow

Root workflow: `.github/workflows/ios-testflight.yml` (workflow_dispatch, chooses app + profile + submit).
Each app also has `.eas/workflows/build-ios.yml` for Expo-side triggers.
