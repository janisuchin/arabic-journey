"""Merge the two reviewers' findings per chunk into one owner report.

    python -I -X utf8 scripts/audit/merge-findings.py docs/review/round-1 [chunk ...]

Reads <round>/<chunk>-A.json and <chunk>-B.json, pairs findings that point at the same file+path (or the same
current text), and writes <round>/<chunk>-MERGED.md (one table of errors, agreed first, then notes) and
<round>/SUMMARY.md with the counts per chunk. Nothing is applied; the owner decides.
"""

import json
import re
import sys
from collections import OrderedDict
from pathlib import Path


def norm_path(p: str) -> str:
    return re.sub(r"\s+", "", p or "").lower()


def key_of(f: dict) -> set[str]:
    keys = set()
    file = (f.get("file") or "").replace("\\", "/").lower()
    for p in (f.get("path") or "").split(";"):
        p = norm_path(p)
        if p:
            keys.add(f"{file}|{p}")
    cur = (f.get("current") or "").strip()
    if cur:
        keys.add("cur|" + cur)
    return keys


def load(path: Path) -> dict:
    if not path.exists():
        return {"errors": [], "notes": [], "summary": f"(missing: {path.name})"}
    try:
        return json.loads(path.read_text(encoding="utf8"))
    except json.JSONDecodeError as e:  # tolerate a trailing comma or comment
        text = re.sub(r",\s*([}\]])", r"\1", path.read_text(encoding="utf8"))
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            print(f"!! {path.name}: {e}")
            return {"errors": [], "notes": [], "summary": f"(unreadable JSON: {path.name})"}


def cell(s) -> str:
    return str(s if s is not None else "").replace("|", "\\|").replace("\n", " ").strip()


def merge_chunk(round_dir: Path, chunk: str) -> dict:
    a = load(round_dir / f"{chunk}-A.json")
    b = load(round_dir / f"{chunk}-B.json")
    rows = []
    used_b = set()
    for fa in a.get("errors", []):
        ka = key_of(fa)
        match = None
        for j, fb in enumerate(b.get("errors", [])):
            if j in used_b:
                continue
            if ka & key_of(fb):
                match = (j, fb)
                break
        if match:
            used_b.add(match[0])
            fb = match[1]
            sev = "major" if "major" in (fa.get("severity"), fb.get("severity")) else fa.get("severity", "minor")
            rows.append({"by": "A+B", "sev": sev, **fa, "fixB": fb.get("fix"), "problemB": fb.get("problem")})
        else:
            rows.append({"by": "A", "sev": fa.get("severity", "minor"), **fa})
    for j, fb in enumerate(b.get("errors", [])):
        if j not in used_b:
            rows.append({"by": "B", "sev": fb.get("severity", "minor"), **fb})
    order = {"A+B": 0, "A": 1, "B": 1}
    sev_order = {"major": 0, "minor": 1}
    rows.sort(key=lambda r: (order[r["by"]], sev_order.get(r["sev"], 2), str(r.get("file")), str(r.get("path"))))

    out = [f"# {chunk}: round findings (merged A + B)", ""]
    out.append(f"Reviewer A: {cell(a.get('summary'))}")
    out.append("")
    out.append(f"Reviewer B: {cell(b.get('summary'))}")
    out.append("")
    agreed = sum(1 for r in rows if r["by"] == "A+B")
    major = sum(1 for r in rows if r["sev"] == "major")
    out.append(f"**Errors: {len(rows)}** ({agreed} found by both reviewers, {len(rows) - agreed} by one), {major} major. Notes: {len(a.get('notes', [])) + len(b.get('notes', []))}.")
    out.append("")
    out.append("| # | By | Sev | Category | File · path | Current | Problem | Proposed fix |")
    out.append("|---|---|---|---|---|---|---|---|")
    for i, r in enumerate(rows, 1):
        fix = cell(r.get("fix"))
        if r.get("fixB") and cell(r["fixB"]) != fix:
            fix += f" ‖ B: {cell(r['fixB'])}"
        prob = cell(r.get("problem"))
        if r.get("problemB") and r["by"] == "A+B":
            prob += f" ‖ B: {cell(r['problemB'])}"
        loc = f"{cell(r.get('file')).replace('content/', '')} · `{cell(r.get('path'))}`"
        out.append(f"| {i} | {r['by']} | {r['sev']} | {cell(r.get('category'))} | {loc} | {cell(r.get('current'))} | {prob} | {fix} |")
    out.append("")
    out.append("## Notes for the owner (not counted as errors)")
    out.append("")
    out.append("| By | File · path | Note |")
    out.append("|---|---|---|")
    for who, rev in (("A", a), ("B", b)):
        for n in rev.get("notes", []):
            out.append(f"| {who} | {cell(n.get('file')).replace('content/', '')} · `{cell(n.get('path'))}` | {cell(n.get('note'))} |")
    (round_dir / f"{chunk}-MERGED.md").write_text("\n".join(out) + "\n", encoding="utf8")
    return {"chunk": chunk, "errors": len(rows), "agreed": agreed, "major": major, "notes": len(a.get("notes", [])) + len(b.get("notes", []))}


def main():
    round_dir = Path(sys.argv[1])
    chunks = sys.argv[2:] or sorted({re.sub(r"-[AB]\.json$", "", p.name) for p in round_dir.glob("*-[AB].json")})
    stats = [merge_chunk(round_dir, c) for c in chunks]
    lines = [f"# {round_dir.name}: summary", "", "| Chunk | Errors | Agreed by both | Major | Notes |", "|---|---|---|---|---|"]
    for s in stats:
        lines.append(f"| {s['chunk']} | {s['errors']} | {s['agreed']} | {s['major']} | {s['notes']} |")
    tot = {k: sum(s[k] for s in stats) for k in ("errors", "agreed", "major", "notes")}
    lines.append(f"| **total** | {tot['errors']} | {tot['agreed']} | {tot['major']} | {tot['notes']} |")
    (round_dir / "SUMMARY.md").write_text("\n".join(lines) + "\n", encoding="utf8")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
