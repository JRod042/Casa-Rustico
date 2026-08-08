# iOS builds from GitHub

These are **iOS** App Store apps (not Android-first).

## Expo projects

| App | Expo project | Base directory on GitHub |
|-----|--------------|--------------------------|
| Casa Rustico Go | https://expo.dev/accounts/jrod42/projects/casa-rustico-go | `apps/casa-rustico-go` |
| Espresso Escape | https://expo.dev/accounts/jrod42/projects/espresso-escape | `apps/espresso-escape` |

## EAS profiles

Use a **profile name** from `eas.json` (not the distribution type alone):

| Profile | Distribution | Use for |
|---------|--------------|---------|
| `internal` | internal (ad hoc / APK) | Testers via Expo link / devices |
| `preview` | same as `internal` | Alias of `internal` |
| `production` | store | TestFlight / App Store |
| `development` | internal + dev client | Native debug builds |

### Correct commands

```bash
cd apps/casa-rustico-go

# Internal / tester build (this is what “internal” maps to)
npx eas-cli build --platform ios --profile internal

# App Store / TestFlight
npx eas-cli build --platform ios --profile production
```

If Expo shows **Failed to run eas build: internal**, the build was started with profile `internal` while that profile was missing. Current `eas.json` defines `internal` explicitly.

For iOS **internal** builds, register tester devices in Apple Developer / EAS credentials first, or use `production` → TestFlight instead.

## One-time setup (GitHub → EAS)

1. Link GitHub: https://expo.dev/settings#connections
2. Install Expo GitHub App on account JRod042
3. For each project open **GitHub** settings and link repo `JRod042/Casa-Rustico`
4. Set **Base directory** to the app path above
5. Complete one successful **local** iOS credential setup (Apple team FY5H9V76QL) with:
   ```bash
   cd apps/casa-rustico-go && npx eas-cli build -p ios --profile production
   ```
6. Then use **Build from GitHub** on the project Builds page (platform: iOS, profile: `production` or `internal`)

## Workflow

Each app has `.eas/workflows/build-ios.yml` for iOS production builds (manual `workflow_dispatch` only).
