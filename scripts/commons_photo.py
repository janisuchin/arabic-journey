"""
Fetch one licensed photo from Wikimedia Commons, check its licence, resize it and print
the credit as JSON (ready to paste into content/culture).

    python scripts/commons_photo.py search "Red Square Moscow"          # list candidate files + licences
    python scripts/commons_photo.py get "File:Some photo.jpg" assets/culture/coffee-1.jpg --max 1280

Only public domain, CC0, CC BY and CC BY-SA files are accepted (no NC / ND, no fair use).
Images are resized (longest side --max, default 1280) and re-encoded as JPEG, which the
credit records under "modified". Requests identify the project as Wikimedia asks.
"""
import io
import json
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request
from datetime import date

from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

API = "https://commons.wikimedia.org/w/api.php"
UA = "ArabicJourney/1.0 (educational app; github.com/janisuchin) python-urllib"
ALLOWED = re.compile(r"^(public domain|pd|cc0|cc[ -]by(-sa)?[ -]?\d(\.\d)?)", re.I)
BLOCKED = re.compile(r"\b(nc|nd|non-?commercial|no ?deriv|fair use)\b", re.I)


GAP = 1.2  # seconds between requests across ALL processes on this machine (polite to Commons)
_STAMP = os.path.join(tempfile.gettempdir(), "journey-commons-throttle")


def throttle():
    """Cross-process throttle: an exclusive lock file holds the time of the last request."""
    import time

    lock = _STAMP + ".lock"
    while True:
        try:
            fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            break
        except FileExistsError:
            try:
                if time.time() - os.path.getmtime(lock) > 120:
                    os.remove(lock)  # stale lock from a crashed process
            except OSError:
                pass
            time.sleep(0.3)
    try:
        last = float(open(_STAMP).read()) if os.path.exists(_STAMP) else 0.0
        wait = GAP - (time.time() - last)
        if wait > 0:
            time.sleep(wait)
        with open(_STAMP, "w") as f:
            f.write(str(time.time()))
    finally:
        os.close(fd)
        os.remove(lock)


def fetch(url, timeout=60):
    """GET with polite retries on 429/5xx (honours Retry-After)."""
    import time
    import urllib.error

    for attempt in range(8):
        throttle()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or attempt == 7:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 2 ** (attempt + 1)
            time.sleep(min(wait, 60))


def get_json(params):
    return json.loads(fetch(API + "?" + urllib.parse.urlencode({**params, "format": "json"}), 40))


def strip_html(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()


def _parse(page):
    ii = page["imageinfo"][0]
    md = ii.get("extmetadata", {})
    lic = strip_html(md.get("LicenseShortName", {}).get("value", ""))
    return {
        "title": page["title"],
        "license": lic,
        "licenseUrl": strip_html(md.get("LicenseUrl", {}).get("value", "")) or None,
        "author": strip_html(md.get("Artist", {}).get("value", "")) or "Unknown",
        "source": ii["descriptionurl"],
        "thumb": ii.get("thumburl") or ii["url"],
        "mime": ii.get("mime"),
        "size": [ii.get("width"), ii.get("height")],
        "description": strip_html(md.get("ImageDescription", {}).get("value", ""))[:300],
    }


def info(title, width=1600):
    d = get_json({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|size|extmetadata|mime", "iiurlwidth": width})
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise SystemExit(f"not found: {title}")
    return _parse(page)


def allowed(lic):
    return bool(ALLOWED.match(lic)) and not BLOCKED.search(lic)


def cmd_search(query, limit=12):
    """One request: search File: pages and fetch their licence metadata together."""
    d = get_json(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query + " filetype:bitmap",
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime",
            "iiurlwidth": 400,
        }
    )
    pages = sorted((d.get("query", {}).get("pages", {}) or {}).values(), key=lambda p: p.get("index", 0))
    if not pages:
        print("no results")
    for page in pages:
        if "imageinfo" not in page:
            continue
        i = _parse(page)
        ok = "OK " if allowed(i["license"]) else "NO "
        print(f"{ok} {i['license']:<14} {i['size'][0]}x{i['size'][1]}  {i['title']}")
        print(f"      {i['description'][:160]}")


def cmd_get(title, out, max_side=1280):
    i = info(title, max(max_side, 400))
    if not allowed(i["license"]):
        raise SystemExit(f"licence not allowed: {i['license']} ({title})")
    if i["mime"] not in ("image/jpeg", "image/png", "image/webp"):
        raise SystemExit(f"unsupported type {i['mime']}")
    img = Image.open(io.BytesIO(fetch(i["thumb"]))).convert("RGB")
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    credit = {
        "title": i["title"],
        "author": i["author"][:120],
        "license": i["license"],
        "source": i["source"],
        "accessed": date.today().isoformat(),
        "modified": "resized and re-encoded",
    }
    if i["licenseUrl"]:
        credit["licenseUrl"] = i["licenseUrl"]
    print(json.dumps({"file": out.replace("\\", "/").split("/")[-1], "width": img.width, "height": img.height, "credit": credit}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] not in ("search", "get"):
        print(__doc__)
        sys.exit(1)
    if a[0] == "search":
        cmd_search(" ".join(a[1:]))
    else:
        mx = int(a[a.index("--max") + 1]) if "--max" in a else 1280
        cmd_get(a[1], a[2], mx)
