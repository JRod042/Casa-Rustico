#!/usr/bin/env python3
"""Attach Escape 1.0.5 / 12 and submit listing 6809059605 for App Review."""
from __future__ import annotations

import os
import sys
import time

import jwt
import requests

APP_ID = "6809059605"
BUNDLE = "com.jrod042.espressoescape"
WANTED_BUILD = os.environ.get("APP_BUILD_NUMBER", "12")
VERSION = os.environ.get("APP_VERSION", "1.0.5")
BASE = "https://api.appstoreconnect.apple.com/v1"
KEY_ID = os.environ["EXPO_ASC_KEY_ID"]
ISSUER = os.environ["EXPO_ASC_ISSUER_ID"]
KEY_PATH = os.environ.get("EXPO_ASC_API_KEY_PATH", "asc-api-key.p8")

PRIVACY = "https://rusticopr.com/policies/privacy-policy"
SUPPORT = "https://rusticopr.com"
PHONE = "9174761051"
EMAIL = "jorge.k.rodriguezvargas@gmail.com"

DESC = """Espresso Escape is a free endless coffee runner from Casa Rústico.

Tap to jump the café floor, dodge grinders and portafilters, collect single-origin beans. No accounts, no ads, no in-app purchases. This game does not sell coffee.

Colombia is a visual theme only."""

REVIEW_NOTES = f"""Free game. No login. No IAP. No ads.

Path: splash → Play. Tap to jump. That is the whole product.

Bundle {BUNDLE}. Version {VERSION} build {WANTED_BUILD}. Listing {APP_ID} only — never 6758108565.

Contact {EMAIL} / {PHONE}.
"""


def token() -> str:
    with open(KEY_PATH) as f:
        key = f.read()
    now = int(time.time())
    return jwt.encode(
        {"iss": ISSUER, "iat": now, "exp": now + 19 * 60, "aud": "appstoreconnect-v1"},
        key,
        algorithm="ES256",
        headers={"alg": "ES256", "kid": KEY_ID, "typ": "JWT"},
    )


S = requests.Session()


def headers():
    return {"Authorization": f"Bearer {token()}", "Content-Type": "application/json"}


def api(method: str, path: str, **kwargs):
    url = path if path.startswith("http") else BASE + path
    r = S.request(method, url, headers=headers(), timeout=60, **kwargs)
    if r.status_code >= 400:
        print(f"ASC {method} {url} -> {r.status_code}", file=sys.stderr)
        print(r.text[:4000], file=sys.stderr)
        r.raise_for_status()
    if r.status_code == 204 or not r.content:
        return None
    return r.json()


def main() -> int:
    app = api("GET", f"/apps/{APP_ID}")["data"]
    print("app:", app["attributes"].get("name"), app["id"], "bundle", BUNDLE)

    builds = api(
        "GET",
        f"/builds?filter[app]={APP_ID}&filter[version]={WANTED_BUILD}&sort=-uploadedDate&limit=15",
    )["data"]
    build = next(
        (
            b
            for b in builds
            if b["attributes"].get("processingState") == "VALID" and not b["attributes"].get("expired")
        ),
        None,
    )
    if build is None:
        print(f"No VALID build {WANTED_BUILD} on {APP_ID} yet.", file=sys.stderr)
        return 2
    print("using build", build["attributes"].get("version"), build["id"])

    versions = api(
        "GET",
        f"/apps/{APP_ID}/appStoreVersions?filter[platform]=IOS&limit=20",
    )["data"]
    editable = {
        "PREPARE_FOR_SUBMISSION",
        "DEVELOPER_REJECTED",
        "REJECTED",
        "METADATA_REJECTED",
        "INVALID_BINARY",
    }
    version = next((v for v in versions if v["attributes"]["appStoreState"] in editable), None)
    if version is None:
        created = api(
            "POST",
            "/appStoreVersions",
            json={
                "data": {
                    "type": "appStoreVersions",
                    "attributes": {
                        "platform": "IOS",
                        "versionString": VERSION,
                        "releaseType": "AFTER_APPROVAL",
                    },
                    "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}}},
                }
            },
        )
        version = created["data"]
        print("created version", VERSION, version["id"])
    else:
        print(
            "using version",
            version["attributes"]["versionString"],
            version["attributes"]["appStoreState"],
            version["id"],
        )

    api(
        "PATCH",
        f"/appStoreVersions/{version['id']}/relationships/build",
        json={"data": {"type": "builds", "id": build["id"]}},
    )
    print("attached build", build["id"])

    locs = api("GET", f"/appStoreVersions/{version['id']}/appStoreVersionLocalizations")["data"]
    loc = next((l for l in locs if l["attributes"].get("locale", "").startswith("en")), locs[0] if locs else None)
    if loc:
        api(
            "PATCH",
            f"/appStoreVersionLocalizations/{loc['id']}",
            json={
                "data": {
                    "type": "appStoreVersionLocalizations",
                    "id": loc["id"],
                    "attributes": {
                        "description": DESC,
                        "keywords": "coffee,runner,game,cafe,jump,casa rustico",
                        "supportUrl": SUPPORT,
                        "marketingUrl": SUPPORT,
                        "whatsNew": "Fair tap-jump café runner. No accounts, ads, or IAP.",
                    },
                }
            },
        )

    details = api("GET", f"/appStoreVersions/{version['id']}/appStoreReviewDetail")
    detail = (details or {}).get("data")
    body = {
        "contactFirstName": "Jorge",
        "contactLastName": "Rodriguez",
        "contactPhone": PHONE,
        "contactEmail": EMAIL,
        "demoAccountRequired": False,
        "notes": REVIEW_NOTES,
    }
    if detail:
        api(
            "PATCH",
            f"/appStoreReviewDetails/{detail['id']}",
            json={
                "data": {
                    "type": "appStoreReviewDetails",
                    "id": detail["id"],
                    "attributes": body,
                }
            },
        )
    else:
        api(
            "POST",
            "/appStoreReviewDetails",
            json={
                "data": {
                    "type": "appStoreReviewDetails",
                    "attributes": body,
                    "relationships": {
                        "appStoreVersion": {
                            "data": {"type": "appStoreVersions", "id": version["id"]}
                        }
                    },
                }
            },
        )
    print("review notes set (no demo account)")

    existing = api(
        "GET",
        f"/reviewSubmissions?filter[app]={APP_ID}&filter[state]=WAITING_FOR_REVIEW,IN_REVIEW&limit=10",
    )["data"]
    if existing:
        print("review already in flight:", existing[0]["id"], existing[0]["attributes"].get("state"))
        return 0

    created = api(
        "POST",
        "/reviewSubmissions",
        json={
            "data": {
                "type": "reviewSubmissions",
                "attributes": {"platform": "IOS"},
                "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}}},
            }
        },
    )["data"]
    api(
        "POST",
        "/reviewSubmissionItems",
        json={
            "data": {
                "type": "reviewSubmissionItems",
                "relationships": {
                    "reviewSubmission": {
                        "data": {"type": "reviewSubmissions", "id": created["id"]}
                    },
                    "appStoreVersion": {
                        "data": {"type": "appStoreVersions", "id": version["id"]}
                    },
                },
            }
        },
    )
    api(
        "PATCH",
        f"/reviewSubmissions/{created['id']}",
        json={
            "data": {
                "type": "reviewSubmissions",
                "id": created["id"],
                "attributes": {"submitted": True},
            }
        },
    )
    print("SUBMITTED FOR APP REVIEW", created["id"])
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError:
        raise SystemExit(1)
