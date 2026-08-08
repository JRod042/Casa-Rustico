#!/usr/bin/env bash
# Interactive iOS build + optional TestFlight submit for Casa Rustico apps.
# Run this in your own terminal (Apple login needs a real TTY/browser).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="${1:-}"
PROFILE="${2:-production}"

usage() {
  echo "Usage: $0 <casa-rustico-go|espresso-escape> [production|internal|preview|development]"
  echo
  echo "Examples:"
  echo "  $0 casa-rustico-go"
  echo "  $0 casa-rustico-go internal"
  echo "  $0 espresso-escape production"
  exit 1
}

[[ -n "$APP" ]] || usage
DIR="$ROOT/$APP"
[[ -d "$DIR" ]] || { echo "Unknown app: $APP"; usage; }

cd "$DIR"
export EAS_BUILD_NO_EXPO_GO_WARNING=true

if ! npx eas-cli whoami >/dev/null 2>&1; then
  echo "Log into Expo first:"
  npx eas-cli login
fi

echo "==> iOS build for $APP (profile: $PROFILE)"
echo "    EAS will ask for Apple Developer login to create certs + profiles."
echo "    Team ID in eas.json: FY5H9V76QL"
echo

npx eas-cli build --platform ios --profile "$PROFILE" --no-wait

echo
echo "When the build finishes (watch expo.dev), submit with:"
echo "  cd $DIR && npx eas-cli submit --platform ios --profile $PROFILE --latest"
echo
echo "Or open the build page on expo.dev and click Submit."
