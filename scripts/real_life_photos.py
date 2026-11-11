"""
Real-life photo per day (Prompt B H/L/M): one licensed Wikimedia Commons photo for the "In real life" card.

    python -I -X utf8 scripts/real_life_photos.py search [day ...]   # candidates for days without a chosen title
    python -I -X utf8 scripts/real_life_photos.py get [day ...]      # fetch chosen photos into assets/real-life, credit -> plan
    python -I -X utf8 scripts/real_life_photos.py apply [day ...]    # insert {file, alt, credit} into the day's realLife

The plan (query, chosen "File:..." title, alt text, credit) lives in scripts/real-life-plan.json. `get` saves
assets/real-life/dayNN.jpg (max side 960) and records the credit; `apply` (after the alt texts are written from
the pictures) inserts a "photo" block into the day's "realLife" object by text (day files are never
re-serialised). Days that already have a photo are skipped. Reuses commons_photo.py
(licence filter, throttle, credit format).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commons_photo as cp  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PLAN = os.path.join(ROOT, "scripts", "real-life-plan.json")


def load_plan():
    return json.load(open(PLAN, encoding="utf-8"))


def day_path(day):
    return os.path.join(ROOT, "content", "days", f"day{int(day):02d}.json")


def has_photo(day):
    d = json.load(open(day_path(day), encoding="utf-8"))
    return "photo" in d["realLife"]


def search(days, plan):
    for day in days:
        p = plan[day]
        if p.get("title") or has_photo(day):
            continue
        print(f"\n=== day {day}: {p['query']}")
        cp.cmd_search(p["query"], 8)


def get(days, plan):
    done = 0
    for day in days:
        p = plan[day]
        if has_photo(day):
            continue
        if not p.get("title"):
            print(f"day {day}: no title chosen, skipped")
            continue
        out = os.path.join(ROOT, "assets", "real-life", f"day{int(day):02d}.jpg")
        if p.get("credit") and os.path.exists(out):
            continue
        i = cp.info(p["title"], 960)
        if not cp.allowed(i["license"]):
            print(f"day {day}: licence not allowed: {i['license']}")
            continue
        import io
        from datetime import date

        from PIL import Image

        img = Image.open(io.BytesIO(cp.fetch(i["thumb"]))).convert("RGB")
        img.thumbnail((960, 960), Image.LANCZOS)
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
        p["file"] = os.path.basename(out)
        p["credit"] = credit
        json.dump(plan, open(PLAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        done += 1
        print(f"day {day}: {i['title']} ({i['license']}, {img.width}x{img.height})")
    print(f"{done} photos fetched")


def apply(days, plan):
    done = 0
    for day in days:
        p = plan[day]
        if has_photo(day):
            continue
        if not (p.get("file") and p.get("alt") and p.get("credit")):
            print(f"day {day}: needs file, alt and credit, skipped")
            continue
        insert_photo(day, {"file": p["file"], "alt": p["alt"], "credit": p["credit"]})
        done += 1
    print(f"{done} day files updated")


def insert_photo(day, photo):
    """Append "photo" after the realLife story, keeping every other byte of the file."""
    path = day_path(day)
    text = open(path, encoding="utf-8", newline="").read()
    m = re.search(r'"realLife":\s*\{.*?"story":\s*"(?:[^"\\]|\\.)*"', text, re.S)
    if not m:
        raise SystemExit(f"day {day}: realLife story not found")
    multiline = "\n" in text[m.start() : m.end()]
    block = json.dumps(photo, ensure_ascii=False)
    if multiline:
        ins = ',\n    "photo": ' + block
    else:
        ins = ', "photo": ' + block
    text = text[: m.end()] + ins + text[m.end() :]
    open(path, "w", encoding="utf-8", newline="").write(text)
    json.loads(text)  # must still parse


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] not in ("search", "get", "apply"):
        print(__doc__)
        sys.exit(1)
    plan = load_plan()
    days = [str(int(x)) for x in a[1:]] or [str(d) for d in range(1, 91)]
    {"search": search, "get": get, "apply": apply}[a[0]](days, plan)
