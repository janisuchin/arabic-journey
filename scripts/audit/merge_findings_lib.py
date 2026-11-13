import json, re
from pathlib import Path

def norm(p): return re.sub(r"\s+", "", p or "").lower()
def keys(f):
    k=set(); file=(f.get("file") or "").replace("\\","/").lower()
    for p in (f.get("path") or "").split(";"):
        if norm(p): k.add(file+"|"+norm(p))
    if (f.get("current") or "").strip(): k.add("cur|"+f["current"].strip())
    return k
def load(p):
    if not p.exists(): return {"errors":[],"notes":[]}
    t=p.read_text(encoding="utf8")
    try: return json.loads(t)
    except json.JSONDecodeError: return json.loads(re.sub(r",\s*([}\]])", r"\1", t))
def pair(round_dir, chunk):
    a=load(round_dir/f"{chunk}-A.json"); b=load(round_dir/f"{chunk}-B.json")
    rows=[]; used=set()
    for fa in a.get("errors",[]):
        m=None
        for j,fb in enumerate(b.get("errors",[])):
            if j in used: continue
            if keys(fa)&keys(fb): m=(j,fb); break
        if m:
            used.add(m[0]); fb=m[1]
            sev="major" if "major" in (fa.get("severity"),fb.get("severity")) else "minor"
            rows.append({"by":"A+B","sev":sev,**fa,"fixB":fb.get("fix")})
        else: rows.append({"by":"A","sev":fa.get("severity","minor"),**fa})
    for j,fb in enumerate(b.get("errors",[])):
        if j not in used: rows.append({"by":"B","sev":fb.get("severity","minor"),**fb})
    rows.sort(key=lambda r:({"A+B":0}.get(r["by"],1),{"major":0}.get(r["sev"],1),str(r.get("file")),str(r.get("path"))))
    notes=[("A",n) for n in a.get("notes",[])]+[("B",n) for n in b.get("notes",[])]
    return rows, notes
