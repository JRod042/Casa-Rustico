# iOS builds from GitHub

These are **iOS** App Store apps (not Android-first).

## Expo projects

| App | Expo project | Base directory on GitHub |
|-----|--------------|--------------------------|
| Casa Rustico Go | https://expo.dev/accounts/jrod42/projects/casa-rustico-go | `apps/casa-rustico-go` |
| Espresso Escape | https://expo.dev/accounts/jrod42/projects/espresso-escape | `apps/espresso-escape` |

## One-time setup (GitHub → EAS)

1. Link GitHub: https://expo.dev/settings#connections
2. Install Expo GitHub App on account JRod042
3. For each project open **GitHub** settings and link repo `JRod042/Casa-Rustico`
4. Set **Base directory** to the app path above
5. Complete one successful **local** iOS credential setup (Apple team FY5H9V76QL) with:
   ```bash
   cd apps/casa-rustico-go && npx eas-cli build -p ios --profile production
   ```
6. Then use **Build from GitHub** on the project Builds page (platform: iOS, profile: production)

## Workflow

Each app has `.eas/workflows/build-ios.yml` for iOS production builds when the repo is linked.
