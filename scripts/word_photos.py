"""
Word photos (Prompt B M): one square 360x360 licensed Wikimedia Commons photo for each concrete noun in the plan.
Other words keep their emoji tile.

    python -I -X utf8 scripts/word_photos.py search [id ...]   # choose a Commons title for every entry without one
    python -I -X utf8 scripts/word_photos.py get [id ...]      # fetch chosen photos into assets/words (square crop), credit -> plan
    python -I -X utf8 scripts/word_photos.py candidates <out-dir> id [id ...]   # sheet of the top Commons hits per word (cands.json)
    python -I -X utf8 scripts/word_photos.py choose <out-dir> id=N [id=N ...]   # pick hit N from cands.json as the title (drops file/credit)
    python -I -X utf8 scripts/word_photos.py sheet <out-dir>   # contact sheets (20 per sheet) to check the pictures and write alts
    python -I -X utf8 scripts/word_photos.py apply             # write content/course/word-photos.json from the complete entries
    python -I -X utf8 scripts/word_photos.py status            # what is still missing

The plan lives in scripts/word-plan.json, one entry per vocabulary id:
    { "query": "apple fruit",            # Wikidata label search / Commons search terms
      "wd": "Q89",                       # optional: the Wikidata item whose image (P18) to use
      "title": "File:...",               # chosen Commons file (search fills it in, or write it by hand)
      "crop": "center|top|bottom|left|right",   # optional: which part to keep in the square
      "alt": "...",                      # written from the picture
      "file", "credit" }                 # filled in by get
`search` prefers the Wikidata item's image (a representative, usually clean picture of the concept) and falls back to
the first allowed Commons search result. `apply` rebuilds content/course/word-photos.json (owned by this script).
Reuses commons_photo.py (licence filter, throttle, credit format).
"""
import io
import json
import os
import re
import sys
import urllib.parse
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commons_photo as cp  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PLAN = os.path.join(ROOT, "scripts", "word-plan.json")
OUT = os.path.join(ROOT, "content", "course", "word-photos.json")
VOCAB = os.path.join(ROOT, "content", "course", "vocabulary.json")
ASSETS = os.path.join(ROOT, "assets", "words")
SIDE = 360
MIN_SRC = 500  # the source must be at least this wide and high
WD = "https://www.wikidata.org/w/api.php"
# Wikidata search results whose description matches this are not the everyday concept.
NOT_CONCEPT = re.compile(
    r"\b(company|album|film|movie|song|band|surname|given name|family name|name|record label|television|TV|video game|"
    r"novel|magazine|journal|newspaper|painting|genus|municipality|village in|river in|town in|city in|district|"
    r"disambiguation|Wikimedia|episode|series|brand|manufacturer|character|single by|play by|poem)\b",
    re.I,
)


def load_plan():
    return json.load(open(PLAN, encoding="utf-8"))


def save_plan(plan):
    with open(PLAN, "w", encoding="utf-8", newline="\n") as f:
        json.dump(plan, f, ensure_ascii=False, indent=2)
        f.write("\n")


def vocab():
    return {v["id"]: v for v in json.load(open(VOCAB, encoding="utf-8"))}


def wd_json(params):
    return json.loads(cp.fetch(WD + "?" + urllib.parse.urlencode({**params, "format": "json"}), 40))


def wd_images(qid):
    d = wd_json({"action": "wbgetclaims", "entity": qid, "property": "P18"})
    out = []
    for c in d.get("claims", {}).get("P18", []):
        v = c.get("mainsnak", {}).get("datavalue", {}).get("value")
        if v:
            out.append(("File:" + v, c.get("rank") == "preferred"))
    out.sort(key=lambda t: not t[1])
    return [t[0] for t in out]


def wd_find(query):
    """First Wikidata item for the label that looks like the everyday concept."""
    d = wd_json({"action": "wbsearchentities", "search": query, "language": "en", "limit": 8})
    for s in d.get("search", []):
        desc = s.get("description") or ""
        if NOT_CONCEPT.search(desc):
            continue
        return s["id"], s.get("label"), desc
    return None, None, None


def usable(i):
    if not cp.allowed(i["license"]):
        return "licence " + i["license"]
    if i["mime"] not in ("image/jpeg", "image/png", "image/webp"):
        return "type " + str(i["mime"])
    w, h = i["size"]
    if not w or not h or min(w, h) < MIN_SRC:
        return f"too small {w}x{h}"
    if max(w, h) > 3.0 * min(w, h):
        return f"too narrow {w}x{h}"
    return None


def commons_candidates(query, limit=10):
    d = cp.get_json(
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
    return [cp._parse(p) for p in pages if "imageinfo" in p]


def search(ids, plan):
    vb = vocab()
    for vid in ids:
        p = plan.setdefault(vid, {})
        if p.get("title"):
            continue
        q = p.get("query") or vb[vid]["en"].split(";")[0].split(",")[0].strip()
        chosen, how = None, ""
        qid = p.get("wd")
        if not qid:
            qid, label, desc = wd_find(q)
            if qid:
                how = f"wikidata {qid} {label} ({desc})"
        else:
            how = f"wikidata {qid} (plan)"
        if qid:
            for title in wd_images(qid)[:3]:
                i = cp.info(title, 400)
                why = usable(i)
                if why:
                    print(f"  {vid}: skip {title}: {why}")
                    continue
                chosen = i["title"]
                break
        if not chosen:
            for i in commons_candidates(q):
                if usable(i):
                    continue
                if re.search(r"\b(map|diagram|logo|icon|chart|flag of|coat of arms|svg)\b", i["title"] + " " + i["description"], re.I) and "flag" not in q:
                    continue
                chosen, how = i["title"], f"commons search '{q}'"
                break
        if chosen:
            p["title"] = chosen
            if qid and "wd" not in p:
                p["wd"] = qid
            p["via"] = how
            save_plan(plan)
            print(f"{vid}: {chosen}  <- {how}")
        else:
            print(f"{vid}: NOTHING FOUND for '{q}'")


SKIP_TITLE = re.compile(r"\b(map|diagram|logo|icon|chart|coat of arms|svg|poster|drawing|engraving|painting|stamp)\b", re.I)


def candidates(out_dir, ids, plan):
    """For each word, fetch the top usable Commons hits for its query and lay them out on one numbered sheet
    (<out-dir>/cand-<id>.png); the titles go to <out-dir>/cands.json for `choose`."""
    from PIL import Image, ImageDraw

    os.makedirs(out_dir, exist_ok=True)
    cpath = os.path.join(out_dir, "cands.json")
    cands = json.load(open(cpath, encoding="utf-8")) if os.path.exists(cpath) else {}
    vb = vocab()
    for vid in ids:
        p = plan.setdefault(vid, {})
        q = p.get("query") or vb[vid]["en"].split(";")[0].split(",")[0].strip()
        hits = []
        for i in commons_candidates(q, 16):
            if usable(i) or SKIP_TITLE.search(i["title"] + " " + i["description"]):
                continue
            hits.append(i)
            if len(hits) == 8:
                break
        cands[vid] = [h["title"] for h in hits]
        json.dump(cands, open(cpath, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
        cell, cols = 240, 4
        rows = max(1, (len(hits) + cols - 1) // cols)
        sheet_img = Image.new("RGB", (cols * cell, rows * (cell + 34) + 30), "white")
        d = ImageDraw.Draw(sheet_img)
        d.text((6, 6), f"{vid}: {q}", fill="black")
        for n, h in enumerate(hits):
            try:
                im = Image.open(io.BytesIO(cp.fetch(h["thumb"]))).convert("RGB")
            except Exception as e:  # noqa: BLE001
                print(f"  {vid}: cannot load {h['title']}: {e}")
                continue
            im = square(im, "center").resize((cell - 4, cell - 4), 1)
            x, y = (n % cols) * cell, 30 + (n // cols) * (cell + 34)
            sheet_img.paste(im, (x + 2, y + 2))
            d.text((x + 4, y + cell + 2), f"{n + 1}. {h['title'][5:60]}", fill="black")
            d.text((x + 4, y + cell + 16), f"{h['size'][0]}x{h['size'][1]} {h['license']}", fill="gray")
        sheet_img.save(os.path.join(out_dir, f"cand-{vid}.png"))
        print(f"{vid} ({q}): {len(hits)} hits")
        for n, h in enumerate(hits):
            print(f"  {n + 1}. {h['title']}")


def choose(out_dir, picks, plan):
    """picks: id=N pairs; sets the plan title to hit N of cands.json and clears file/credit so `get` refetches."""
    cands = json.load(open(os.path.join(out_dir, "cands.json"), encoding="utf-8"))
    for pick in picks:
        vid, n = pick.split("=")
        title = cands[vid][int(n) - 1]
        p = plan.setdefault(vid, {})
        p["title"] = title
        p["via"] = "chosen by hand from candidates"
        for k in ("file", "credit", "wd"):
            p.pop(k, None)
        f = os.path.join(ASSETS, f"{vid}.jpg")
        if os.path.exists(f):
            os.remove(f)
        print(f"{vid}: {title}")
    save_plan(plan)


def square(img, crop):
    w, h = img.size
    s = min(w, h)
    if w > h:
        left = {"left": 0, "right": w - s}.get(crop, (w - s) // 2)
        box = (left, 0, left + s, s)
    else:
        top = {"top": 0, "bottom": h - s}.get(crop, (h - s) // 2)
        box = (0, top, s, top + s)
    return img.crop(box).resize((SIDE, SIDE), 1)  # 1 = LANCZOS


def get(ids, plan, force=False):
    from PIL import Image

    os.makedirs(ASSETS, exist_ok=True)
    done = 0
    for vid in ids:
        p = plan.get(vid, {})
        if not p.get("title"):
            continue
        out = os.path.join(ASSETS, f"{vid}.jpg")
        if not force and p.get("credit") and os.path.exists(out):
            continue
        i = cp.info(p["title"], 1000)
        why = usable(i)
        if why:
            print(f"{vid}: {why}: {p['title']}")
            continue
        img = Image.open(io.BytesIO(cp.fetch(i["thumb"]))).convert("RGB")
        img = square(img, p.get("crop", "center"))
        img.save(out, "JPEG", quality=84, optimize=True, progressive=True)
        credit = {
            "title": i["title"],
            "author": i["author"][:120],
            "license": i["license"],
            "source": i["source"],
            "accessed": date.today().isoformat(),
            "modified": "cropped to a square, resized and re-encoded",
        }
        if i["licenseUrl"]:
            credit["licenseUrl"] = i["licenseUrl"]
        p.update({"file": f"{vid}.jpg", "credit": credit})
        plan[vid] = p
        save_plan(plan)
        done += 1
        print(f"{vid}: {i['title']} ({i['license']})")
    print(f"{done} photos fetched")


def recrop(ids, plan):
    """Re-cut the square from the already chosen photo with the plan's crop (one download per word)."""
    get(ids, plan, force=True)


def sheet(out_dir, plan):
    from PIL import Image, ImageDraw

    os.makedirs(out_dir, exist_ok=True)
    ids = [v for v in plan if plan[v].get("file") and os.path.exists(os.path.join(ASSETS, plan[v]["file"]))]
    vb = vocab()
    per, cols, cell, cap = 20, 5, 240, 34
    for n in range(0, len(ids), per):
        chunk = ids[n : n + per]
        rows = (len(chunk) + cols - 1) // cols
        sh = Image.new("RGB", (cols * cell, rows * (cell + cap)), "white")
        d = ImageDraw.Draw(sh)
        for k, vid in enumerate(chunk):
            im = Image.open(os.path.join(ASSETS, plan[vid]["file"])).resize((cell, cell))
            x, y = (k % cols) * cell, (k // cols) * (cell + cap)
            sh.paste(im, (x, y))
            d.text((x + 4, y + cell + 2), f"{n + k + 1}. {vid}", fill="black")
            d.text((x + 4, y + cell + 17), vb[vid]["en"][:36], fill=(60, 60, 60))
        path = os.path.join(out_dir, f"words-{n // per + 1:02d}.png")
        sh.save(path)
        print(path, chunk)


def complete(p):
    return all(p.get(k) for k in ("file", "alt", "credit"))


def apply(plan):
    vb = vocab()
    items = []
    for vid in vb:  # vocabulary order
        p = plan.get(vid)
        if not p or not complete(p):
            continue
        items.append({"vocab": vid, "file": p["file"], "alt": p["alt"], "credit": p["credit"]})
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"{len(items)} word photos written to content/course/word-photos.json")


def status(plan):
    vb = vocab()
    missing = {"title": [], "file": [], "alt": []}
    for vid, p in plan.items():
        if vid not in vb:
            print(f"{vid}: not in vocabulary.json")
        for k in missing:
            if not p.get(k):
                missing[k].append(vid)
    print(f"{len(plan)} planned, {sum(1 for p in plan.values() if complete(p))} complete")
    for k, v in missing.items():
        if v:
            print(f"no {k} ({len(v)}): {' '.join(v)}")


if __name__ == "__main__":
    a = sys.argv[1:]
    cmds = ("search", "get", "recrop", "sheet", "apply", "status", "candidates", "choose")
    if not a or a[0] not in cmds:
        print(__doc__)
        sys.exit(1)
    plan = load_plan() if os.path.exists(PLAN) else {}
    if a[0] == "sheet":
        sheet(a[1], plan)
    elif a[0] == "apply":
        apply(plan)
    elif a[0] == "status":
        status(plan)
    elif a[0] == "candidates":
        candidates(a[1], a[2:], plan)
    elif a[0] == "choose":
        choose(a[1], a[2:], plan)
    else:
        ids = a[1:] or list(plan)
        {"search": search, "get": get, "recrop": recrop}[a[0]](ids, plan)
