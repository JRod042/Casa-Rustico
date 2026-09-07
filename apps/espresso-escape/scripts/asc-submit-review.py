#!/usr/bin/env python3
"""Create ASC 1.0.6, attach iOS build 19, Submit for Review.

Only ASC 6809059605 / com.jrod042.espressoescape. Never 6758108565.
Needs APPLE_API_KEY_ID, APPLE_API_ISSUER_ID, and APPLE_API_KEY_P8 (PEM text).
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import jwt

APP_ID = "6809059605"
FORBIDDEN_APP_ID = "6758108565"
BUNDLE = "com.jrod042.espressoescape"
VERSION_STRING = "1.0.6"
BUILD_NUMBER = "19"
BASE = "https://api.appstoreconnect.apple.com"
WHATS_NEW = (
    "Casa Rústico café runner. Kraft scrapbook stage, hop/land/bean/whoosh/stamp/steam "
    "SFX, tighter coyote and retry. Free to play — no accounts, ads, or in-app purchases. "
    "This game does not sell coffee."
)


def die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def mint_jwt() -> str:
    key_id = os.environ.get("APPLE_API_KEY_ID", "").strip()
    issuer = os.environ.get("APPLE_API_ISSUER_ID", "").strip()
    pem = os.environ.get("APPLE_API_KEY_P8", "").strip()
    if not key_id or not issuer or not pem:
        die("Missing APPLE_API_KEY_ID / APPLE_API_ISSUER_ID / APPLE_API_KEY_P8")
    if "BEGIN PRIVATE KEY" not in pem:
        pem = "-----BEGIN PRIVATE KEY-----\n" + pem + "\n-----END PRIVATE KEY-----"
    now = int(time.time())
    return jwt.encode(
        {"iss": issuer, "iat": now, "exp": now + 18 * 60, "aud": "appstoreconnect-v1"},
        pem,
        algorithm="ES256",
        headers={"kid": key_id, "typ": "JWT"},
    )


def api(method: str, path: str, token: str, body: dict | None = None) -> dict:
    url = path if path.startswith("http") else BASE + path
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", errors="replace")
        print(f"{method} {url} -> {err.code}\n{detail}", file=sys.stderr)
        raise


def first(data: dict) -> dict | None:
    items = data.get("data") or []
    return items[0] if items else None


def main() -> None:
    if APP_ID == FORBIDDEN_APP_ID:
        die("refusing forbidden ASC id")
    token = mint_jwt()

    app = api("GET", f"/v1/apps/{APP_ID}?fields[apps]=bundleId,name", token)
    attrs = (app.get("data") or {}).get("attributes") or {}
    bundle = attrs.get("bundleId")
    print("ASC app", APP_ID, attrs.get("name"), bundle)
    if bundle and bundle != BUNDLE:
        die(f"bundle {bundle} != {BUNDLE}")

    versions = api(
        "GET",
        "/v1/apps/"
        + APP_ID
        + "/appStoreVersions?"
        + urllib.parse.urlencode(
            {
                "filter[platform]": "IOS",
                "filter[versionString]": VERSION_STRING,
                "limit": "5",
            }
        ),
        token,
    )
    version = first(versions)
    if version:
        print("existing version", version["id"], version.get("attributes"))
    else:
        created = api(
            "POST",
            "/v1/appStoreVersions",
            token,
            {
                "data": {
                    "type": "appStoreVersions",
                    "attributes": {
                        "platform": "IOS",
                        "versionString": VERSION_STRING,
                        "copyright": "2026 Casa Rústico",
                    },
                    "relationships": {
                        "app": {"data": {"type": "apps", "id": APP_ID}},
                    },
                }
            },
        )
        version = created.get("data")
        if not version:
            die("failed to create appStoreVersion 1.0.6")
        print("created version", version["id"], version.get("attributes"))
    version_id = version["id"]

    builds = api(
        "GET",
        "/v1/builds?"
        + urllib.parse.urlencode(
            {
                "filter[app]": APP_ID,
                "filter[version]": BUILD_NUMBER,
                "limit": "10",
            }
        ),
        token,
    )
    build = None
    for item in builds.get("data") or []:
        state = (item.get("attributes") or {}).get("processingState")
        print("build candidate", item["id"], item.get("attributes"))
        if state in {"VALID", "VALIDATING"} or build is None:
            build = item
        if state == "VALID":
            break
    if not build:
        die("iOS build 19 not found on 6809059605 — wait for TF processing")
    build_id = build["id"]
    proc = (build.get("attributes") or {}).get("processingState")
    if proc not in {"VALID"}:
        die(f"build 19 processingState={proc} — not VALID yet")

    enc = (build.get("attributes") or {}).get("usesNonExemptEncryption")
    if enc is not False:
        api(
            "PATCH",
            f"/v1/builds/{build_id}",
            token,
            {
                "data": {
                    "type": "builds",
                    "id": build_id,
                    "attributes": {"usesNonExemptEncryption": False},
                }
            },
        )
        print("set usesNonExemptEncryption=false on", build_id)

    api(
        "PATCH",
        f"/v1/appStoreVersions/{version_id}/relationships/build",
        token,
        {"data": {"type": "builds", "id": build_id}},
    )
    print("attached build", build_id, "to version", version_id)

    locs = api("GET", f"/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations", token)
    for loc in locs.get("data") or []:
        lid = loc["id"]
        locale = (loc.get("attributes") or {}).get("locale")
        whats = (loc.get("attributes") or {}).get("whatsNew")
        if locale == "en-US" and not whats:
            api(
                "PATCH",
                f"/v1/appStoreVersionLocalizations/{lid}",
                token,
                {
                    "data": {
                        "type": "appStoreVersionLocalizations",
                        "id": lid,
                        "attributes": {"whatsNew": WHATS_NEW},
                    }
                },
            )
            print("set whatsNew for", locale)

    existing_subs = api(
        "GET",
        "/v1/apps/"
        + APP_ID
        + "/reviewSubmissions?"
        + urllib.parse.urlencode({"filter[platform]": "IOS", "limit": "5"}),
        token,
    )
    submission = None
    for item in existing_subs.get("data") or []:
        state = (item.get("attributes") or {}).get("state")
        print("reviewSubmission", item["id"], state)
        if state in {"READY_FOR_REVIEW", "UNRESOLVED_ISSUES", "WAITING_FOR_REVIEW", "IN_REVIEW"}:
            submission = item
            break
        if state not in {"COMPLETE"} and submission is None:
            submission = item
    if submission and (submission.get("attributes") or {}).get("state") == "WAITING_FOR_REVIEW":
        print("ALREADY Waiting for Review", submission["id"])
        return
    if not submission:
        created = api(
            "POST",
            "/v1/reviewSubmissions",
            token,
            {
                "data": {
                    "type": "reviewSubmissions",
                    "attributes": {"platform": "IOS"},
                    "relationships": {
                        "app": {"data": {"type": "apps", "id": APP_ID}},
                    },
                }
            },
        )
        submission = created.get("data")
        if not submission:
            die("failed to create reviewSubmission")
        print("created reviewSubmission", submission["id"])

    sub_id = submission["id"]
    api(
        "POST",
        "/v1/reviewSubmissionItems",
        token,
        {
            "data": {
                "type": "reviewSubmissionItems",
                "relationships": {
                    "reviewSubmission": {"data": {"type": "reviewSubmissions", "id": sub_id}},
                    "appStoreVersion": {"data": {"type": "appStoreVersions", "id": version_id}},
                },
            }
        },
    )
    print("added version item to", sub_id)

    committed = api(
        "PATCH",
        f"/v1/reviewSubmissions/{sub_id}",
        token,
        {
            "data": {
                "type": "reviewSubmissions",
                "id": sub_id,
                "attributes": {"submitted": True},
            }
        },
    )
    state = ((committed.get("data") or {}).get("attributes") or {}).get("state")
    print("SUBMITTED", sub_id, "state=", state)
    print("ASC https://appstoreconnect.apple.com/apps/6809059605/appstore")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as err:
        die(f"ASC HTTP {err.code}")
    except SystemExit:
        raise
    except Exception as err:  # noqa: BLE001 — surface any API/JWT failure
        die(str(err))
