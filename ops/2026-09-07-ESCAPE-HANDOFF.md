# Espresso Escape handoff — 2026-09-07

**App:** Espresso Escape Runner in `apps/espresso-escape/` only.  
**Repo:** `JRod042/Casa-Rustico` **PR #21** `cursor/escape-kraft-feel-menus-a233`  
**Identity:** bundle `com.jrod042.espressoescape`, ASC **`6809059605`**, Expo `@jrod42/espresso-escape` / `016d7c24-a7df-4e0d-8e59-00a9d8db352c`.  
**Never** ASC `6758108565`. Do **not** reintroduce `expo-av`.

## Done

| Item | Value |
|---|---|
| Marketing | **1.0.6** |
| iOS `buildNumber` | **19** |
| Android `versionCode` | 12 |
| Tip SHA | `65682592765d07fb1281d5bd9427ce6efc33c521` |
| EAS production | `ac509b66-fffb-47cf-820f-eaa3c1e7d219` |
| EAS auto-submit | `fb574aa8-9721-49c6-b361-c08e89f78dd2` → ASC 6809059605 |
| Actions queue | https://github.com/JRod042/Casa-Rustico/actions/runs/34158353002 |
| TestFlight | **Build 19 installable** (binary upload succeeded) |

**Native audio path (locked):** `expo-av` **removed**. SFX via `expo-audio` `~57.0.4` (`createAudioPlayer` / `setAudioModeAsync`) in `src/game/sfx.ts`. EXEventEmitter header shim + direct `expo-modules-core` pin **gone**. Same `assets/sfx/` Tone keys.

## NEXT (this is the remaining work)

ASC **Submit for Review** is **not** EAS `--auto-submit`. Auto-submit only uploaded the IPA to TestFlight.

1. App Store Connect → app **6809059605** only.
2. Create App Store version **1.0.6** if it does not exist.
3. Attach **iOS build 19** (SHA `6568259` / EAS `ac509b66`).
4. Submit for Review.
5. Success = version **Waiting for Review** (or clear TF-ready if Apple is still processing the submission).

Do **not** queue another EAS production build unless 19 is lost. Do **not** bump past 19 unless a new IPA is required. Do **not** touch `assets/game/**` or `assets/sfx/**` just to retrigger the TestFlight workflow.

## How to submit from this repo

GitHub Action **ASC Submit for Review** (`.github/workflows/asc-submit-review.yml`) runs `apps/espresso-escape/scripts/asc-submit-review.py` with `APPLE_API_KEY_P8` / `APPLE_API_KEY_ID` / `APPLE_API_ISSUER_ID`. It does **not** queue EAS.

If the API key is EAS-Submit-only, App Manager / Admin may still need to tap Submit in the ASC UI.

## Feel / brand locks (do not regress)

Cream `#F7F3EC` / kraft `#A47C59` / dark kraft `#8D6C4F`. Coyote 130ms, buffer 150ms, hurtbox 18×24 on 30×38, telegraph 0.62s, retry 320ms. Skia 2.6.6 PRIMARY — no Skia thrash. No IAP / ads / accounts. Game does not sell coffee.
