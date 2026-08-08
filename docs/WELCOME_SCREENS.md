# Welcome screens

## Study reference

https://github.com/Appllama/top-welcome-screens — cloned at `references/top-welcome-screens/`.

- License: GPL-3.0 for Appllama’s original code
- Educational / IP notice: see upstream `NOTICE.md`
- We do **not** ship Duolingo, Strava, Hallow, or other branded replicas

## Product implementation

| App | Entry | Storage key |
|-----|-------|-------------|
| Casa Rustico Go | `WelcomeGate` → `CasaWelcome` | `@casa-rustico/go-welcome-v1` |
| Espresso Escape | `WelcomeGate` → `EscapeWelcome` | `@casa-rustico/escape-welcome-v1` |

Motion ideas borrowed (reimplemented): timed splash dissolve, progress pulse, staggered page copy reveal, reduced-motion jump-to-pages.

Stack: Expo SDK 57, Reanimated, LinearGradient, Fraunces + Source Sans 3, AsyncStorage.
