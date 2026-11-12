"""
Scene photo per scenario (Prompt B M): one licensed Wikimedia Commons photo with up to 15 outlined objects.

    python -I -X utf8 scripts/scene_photos.py search [id ...]      # candidates for scenarios without a chosen title
    python -I -X utf8 scripts/scene_photos.py get [id ...]         # fetch chosen photos into assets/scenes, size+credit -> plan
    python -I -X utf8 scripts/scene_photos.py grid <id> <out.png>  # the photo with a 10% grid, for placing the boxes
    python -I -X utf8 scripts/scene_photos.py apply                # write content/course/scenes.json (+ hand glossary) from the plan
    python -I -X utf8 scripts/scene_photos.py status               # what is still missing per scenario

The plan lives in scripts/scene-plan.json, one entry per scenario id:
    { "query": "...", "title": "File:...", "alt": "...", "caption": "...",
      "spots": [ { "box": {"x","y","w","h"} (percent of the photo), "ar": "...", "en": "...", "note": "..." } ],
      "hand": { "<vowelled word>": "English" } }
`get` fills in file, width, height and credit. `apply` rebuilds content/course/scenes.json from every complete
entry (that file is owned by this script) and appends new hand-glossary keys to content/glossary/hand.json by text
(that file is shared: append only). Reuses commons_photo.py (licence filter, throttle, credit format).
"""
import io
import json
import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commons_photo as cp  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PLAN = os.path.join(ROOT, "scripts", "scene-plan.json")
SCENES = os.path.join(ROOT, "content", "course", "scenes.json")
HAND = os.path.join(ROOT, "content", "glossary", "hand.json")
ASSETS = os.path.join(ROOT, "assets", "scenes")
MAX_SIDE = 1280


def load_plan():
    return json.load(open(PLAN, encoding="utf-8"))


def save_plan(plan):
    with open(PLAN, "w", encoding="utf-8", newline="\n") as f:
        json.dump(plan, f, ensure_ascii=False, indent=2)
        f.write("\n")


def scenario_ids():
    return [s["id"] for s in json.load(open(os.path.join(ROOT, "content", "course", "scenarios.json"), encoding="utf-8"))]


def search(ids, plan):
    for sid in ids:
        p = plan.setdefault(sid, {})
        if p.get("title"):
            continue
        if not p.get("query"):
            print(f"{sid}: no query in the plan")
            continue
        print(f"\n=== {sid}: {p['query']}")
        cp.cmd_search(p["query"], 10)


def get(ids, plan):
    from PIL import Image

    os.makedirs(ASSETS, exist_ok=True)
    done = 0
    for sid in ids:
        p = plan.get(sid, {})
        if not p.get("title"):
            print(f"{sid}: no title chosen, skipped")
            continue
        out = os.path.join(ASSETS, f"{sid}.jpg")
        if p.get("credit") and p.get("width") and os.path.exists(out):
            continue
        i = cp.info(p["title"], MAX_SIDE)
        if not cp.allowed(i["license"]):
            print(f"{sid}: licence not allowed: {i['license']}")
            continue
        if i["mime"] not in ("image/jpeg", "image/png", "image/webp"):
            print(f"{sid}: unsupported type {i['mime']}")
            continue
        img = Image.open(io.BytesIO(cp.fetch(i["thumb"]))).convert("RGB")
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
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
        p.update({"file": f"{sid}.jpg", "width": img.width, "height": img.height, "credit": credit})
        plan[sid] = p
        save_plan(plan)
        done += 1
        print(f"{sid}: {i['title']} ({i['license']}, {img.width}x{img.height})")
    print(f"{done} photos fetched")


def grid(sid, out):
    """The scene photo with a labelled 10 % grid (and any boxes already in the plan), to place the outline boxes."""
    from PIL import Image, ImageDraw

    plan = load_plan()
    p = plan[sid]
    im = Image.open(os.path.join(ASSETS, p["file"])).convert("RGB")
    W, H = im.size
    d = ImageDraw.Draw(im, "RGBA")
    for k in range(1, 10):
        x, y = k * W / 100 * 10, k * H / 100 * 10
        d.line([(x, 0), (x, H)], fill=(255, 255, 0, 150), width=1)
        d.line([(0, y), (W, y)], fill=(255, 255, 0, 150), width=1)
        d.text((x + 3, 3), str(k * 10), fill=(255, 255, 0, 255))
        d.text((3, y + 3), str(k * 10), fill=(255, 255, 0, 255))
    for sp in p.get("spots", []):
        b = sp["box"]
        d.rectangle([b["x"] * W / 100, b["y"] * H / 100, (b["x"] + b["w"]) * W / 100, (b["y"] + b["h"]) * H / 100], outline=(230, 30, 30, 255), width=3)
        d.text((b["x"] * W / 100 + 4, b["y"] * H / 100 + 4), sp["en"], fill=(255, 255, 255, 255))
    im.save(out)
    print(f"saved {out} ({W}x{H})")


def complete(p):
    return all(p.get(k) for k in ("file", "width", "height", "alt", "credit", "spots"))


def apply(plan):
    ids = scenario_ids()
    scenes = []
    for sid in ids:
        p = plan.get(sid)
        if not p or not complete(p):
            continue
        scene = {"scenario": sid, "file": p["file"], "width": p["width"], "height": p["height"], "alt": p["alt"]}
        if p.get("caption"):
            scene["caption"] = p["caption"]
        spots = []
        for sp in p["spots"]:
            s = {"box": sp["box"], "ar": sp["ar"], "en": sp["en"]}
            if sp.get("note"):
                s["note"] = sp["note"]
            spots.append(s)
        scene["spots"] = spots
        scene["credit"] = p["credit"]
        scenes.append(scene)
    with open(SCENES, "w", encoding="utf-8", newline="\n") as f:
        json.dump(scenes, f, ensure_ascii=False, indent=2)
        f.write("\n")
    # hand glossary: append only, by text
    raw = open(HAND, encoding="utf-8", newline="").read().replace("\r\n", "\n")
    hand = json.loads(raw)
    new = []
    for sid in ids:
        for k, v in (plan.get(sid, {}).get("hand") or {}).items():
            if k in hand:
                if hand[k] != v:
                    print(f'{sid}: hand "{k}" differs, kept existing')
                continue
            hand[k] = v
            new.append("  " + json.dumps(k, ensure_ascii=False) + ": " + json.dumps(v, ensure_ascii=False))
    if new:
        body = raw.rstrip()
        assert body.endswith("}")
        body = body[:-1].rstrip() + "".join(",\n" + n for n in new) + "\n}" + ("\n" if raw.endswith("\n") else "")
        json.loads(body)
        open(HAND, "w", encoding="utf-8", newline="\n").write(body)
    print(f"{len(scenes)} scenes written to content/course/scenes.json, {len(new)} new hand glossary entries")


def status(plan):
    for sid in scenario_ids():
        p = plan.get(sid, {})
        missing = [k for k in ("query", "title", "file", "alt", "credit", "spots") if not p.get(k)]
        print(f"{sid:<22} {'complete' if not missing else 'missing: ' + ', '.join(missing)}  spots={len(p.get('spots', []))}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] not in ("search", "get", "grid", "apply", "status"):
        print(__doc__)
        sys.exit(1)
    plan = load_plan() if os.path.exists(PLAN) else {}
    if a[0] == "grid":
        grid(a[1], a[2])
    elif a[0] == "apply":
        apply(plan)
    elif a[0] == "status":
        status(plan)
    else:
        ids = a[1:] or scenario_ids()
        {"search": search, "get": get}[a[0]](ids, plan)
