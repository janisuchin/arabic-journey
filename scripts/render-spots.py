"""
Draw a scene photo's red outline boxes onto a copy of the photo, to check that every outline sits on the right
object (Prompt B M). Each box is labelled with its English word (never a number, like the app).

    python -I -X utf8 scripts/render-spots.py <scenario-id> <out.png> [--plan]
    python -I -X utf8 scripts/render-spots.py --all <out-dir> [--plan]
    python -I -X utf8 scripts/render-spots.py <scenario-id> <out.png> --plan-file <fragment.json>

Reads content/course/scenes.json, or scripts/scene-plan.json with --plan (before `scene_photos.py apply`), or
a plan-shaped fragment ({id: {file, spots, ...}}) with --plan-file (a writer's draft).
Also checks: 1–15 spots, every box inside the photo, no two spots with the same Arabic word, and prints a
warning for boxes that overlap another box by more than 80 % of their area. Exit 1 on any check failure.
"""
import json
import os
import sys

from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
RED = (230, 30, 30)


def load(use_plan, plan_file=None):
    if use_plan or plan_file:
        plan = json.load(open(plan_file or os.path.join(ROOT, "scripts", "scene-plan.json"), encoding="utf-8"))
        return [{"scenario": k, "file": f"{k}.jpg", **v} for k, v in plan.items() if v.get("spots")]
    return json.load(open(os.path.join(ROOT, "content", "course", "scenes.json"), encoding="utf-8"))


def overlap(a, b):
    x = max(0, min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"]))
    y = max(0, min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"]))
    return x * y


def render(scene, out):
    ok = True
    im = Image.open(os.path.join(ROOT, "assets", "scenes", scene["file"])).convert("RGB")
    W, H = im.size
    d = ImageDraw.Draw(im, "RGBA")
    spots = scene["spots"]
    if not 1 <= len(spots) <= 15:
        print(f"  ✗ {len(spots)} spots (want 1–15)")
        ok = False
    if len({s["ar"] for s in spots}) != len(spots):
        print("  ✗ two spots carry the same Arabic word")
        ok = False
    for i, s in enumerate(spots):
        b = s["box"]
        if b["x"] < 0 or b["y"] < 0 or b["w"] <= 0 or b["h"] <= 0 or b["x"] + b["w"] > 100.01 or b["y"] + b["h"] > 100.01:
            print(f"  ✗ {s['en']}: box leaves the photo {b}")
            ok = False
        for j, o in enumerate(spots):
            if j != i and overlap(b, o["box"]) > 0.8 * b["w"] * b["h"] and o["box"]["w"] * o["box"]["h"] <= b["w"] * b["h"]:
                print(f"  ! {s['en']} is almost fully covered by {o['en']}")
        x0, y0 = b["x"] * W / 100, b["y"] * H / 100
        x1, y1 = (b["x"] + b["w"]) * W / 100, (b["y"] + b["h"]) * H / 100
        d.rectangle([x0, y0, x1, y1], outline=RED + (255,), width=3)
        d.rectangle([x0, y0, x0 + 7 * len(s["en"]) + 6, y0 + 14], fill=RED + (220,))
        d.text((x0 + 3, y0 + 1), s["en"], fill=(255, 255, 255, 255))
        print(f"  {s['en']:<28} {s['ar']}  box={b}")
    im.save(out)
    print(f"  saved {out} ({W}x{H}, {len(spots)} spots)")
    return ok


if __name__ == "__main__":
    argv = sys.argv[1:]
    plan_file = None
    if "--plan-file" in argv:
        i = argv.index("--plan-file")
        plan_file = argv[i + 1]
        del argv[i : i + 2]
    a = [x for x in argv if x != "--plan"]
    use_plan = "--plan" in argv
    if len(a) != 2:
        print(__doc__)
        sys.exit(1)
    scenes = load(use_plan, plan_file)
    good = True
    if a[0] == "--all":
        os.makedirs(a[1], exist_ok=True)
        for sc in scenes:
            print(f"== {sc['scenario']}")
            good &= render(sc, os.path.join(a[1], f"{sc['scenario']}.png"))
    else:
        sc = next((s for s in scenes if s["scenario"] == a[0]), None)
        if not sc:
            print("scenario not found (or no photo/spots yet):", a[0])
            sys.exit(1)
        print(f"== {sc['scenario']}")
        good = render(sc, a[1])
    sys.exit(0 if good else 1)
