"""
Merges the dictionary review (audit/dictionary/review/chunk-NN.json) into docs/review/dictionary/decisions.json,
which scripts/build-dictionary.py applies.

    python -I -X utf8 scripts/audit/dictionary-decisions.py            # merge reviews
    python -I -X utf8 scripts/audit/dictionary-decisions.py --xcheck   # also write the cross-check list

Cross-check verdicts (audit/dictionary/xcheck/out-NN.json: {"verdicts": [{"key", "ok": bool, "use": {...}, "why"}]})
are applied when present: ok=false with "use" replaces the fix fields; ok=false without "use" keeps the original row.
"""
import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
pool = {r["key"]: r for r in json.load(open("audit/dictionary/pool.json", encoding="utf-8"))}
drop, fix, bad = {}, {}, []
files = sorted(glob.glob("audit/dictionary/review/chunk-*.json"))
for fn in files:
    d = json.load(open(fn, encoding="utf-8"))
    for x in d.get("drop", []):
        (drop.__setitem__(x["key"], x.get("why", "")) if x["key"] in pool else bad.append(x["key"]))
    for x in d.get("fix", []):
        if x["key"] not in pool:
            bad.append(x["key"])
            continue
        fix[x["key"]] = {k: v for k, v in x.items() if k in ("ar", "en", "pos", "gender", "plural", "present")}
print(f"{len(files)} review files; drop {len(drop)}, fix {len(fix)}, unknown keys {len(bad)} {bad[:5]}")

ARABIC_FIELDS = ("ar", "plural", "present", "pos")
xfiles = sorted(glob.glob("audit/dictionary/xcheck/out-*.json"))
overruled = 0
for fn in xfiles:
    for v in json.load(open(fn, encoding="utf-8")).get("verdicts", []):
        if v.get("ok", True) or v["key"] not in fix:
            continue
        overruled += 1
        if v.get("use"):
            fix[v["key"]].update({k: x for k, x in v["use"].items() if k in ("ar", "en", "pos", "gender", "plural", "present")})
        else:
            for k in ARABIC_FIELDS:
                fix[v["key"]].pop(k, None)
if xfiles:
    print(f"cross-check: {len(xfiles)} files, {overruled} fixes changed")

os.makedirs("docs/review/dictionary", exist_ok=True)
json.dump({"drop": sorted(drop), "fix": dict(sorted(fix.items())), "why_dropped": dict(sorted(drop.items()))},
          open("docs/review/dictionary/decisions.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

if "--xcheck" in sys.argv:
    rows = [{"key": k, "before": {f: pool[k].get(f, "") for f in ("ar", "en", "pos", "gender", "plural", "present")}, "fix": f}
            for k, f in fix.items() if any(a in f and f[a] != pool[k].get(a, "") for a in ARABIC_FIELDS)]
    os.makedirs("audit/dictionary/xcheck", exist_ok=True)
    n = 5
    size = -(-len(rows) // n)
    for i in range(n):
        json.dump(rows[i * size:(i + 1) * size], open(f"audit/dictionary/xcheck/in-{i + 1:02d}.json", "w", encoding="utf-8"),
                  ensure_ascii=False, indent=0)
    print(f"cross-check list: {len(rows)} fixes that change Arabic or part of speech, in {n} files")
