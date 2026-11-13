"""Compact owner report: python -I -X utf8 scripts/audit/owner-report.py <round_dir> <out.md> <title> chunk..."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from merge_findings_lib import pair

def c(s, n=None):
    s = str(s if s is not None else "").replace("|", "\|").replace("\n", " ").strip()
    return s if n is None or len(s) <= n else s[: n - 1] + "…"

rd = Path(sys.argv[1]); out = Path(sys.argv[2]); title = sys.argv[3]; chunks = sys.argv[4:]
lines = [f"# {title}", "", "Nothing has been changed. Mark each row FIX or LEAVE. 'By' = found by reviewer A, B or both.", ""]
n = 0
for ch in chunks:
    rows, notes = pair(rd, ch)
    lines += [f"## {ch}", "", "| # | By | Sev | Cat | Where | Current | Problem | Proposed fix |", "|---|---|---|---|---|---|---|---|"]
    for r in rows:
        n += 1
        where = c(r.get("file")).replace("content/days/", "").replace(".json", "") + " · " + c(r.get("path"), 70)
        fix = c(r.get("fix"), 120)
        if r.get("fixB") and c(r["fixB"], 120) != fix: fix += " ‖ B: " + c(r["fixB"], 100)
        lines.append(f"| {n} | {r['by']} | {r['sev']} | {c(r.get('category'))} | {where} | {c(r.get('current'), 90)} | {c(r.get('problem'), 260)} | {fix} |")
    lines += ["", f"Notes for the owner ({len(notes)}, not errors):", ""]
    for who, nt in notes:
        lines.append(f"- ({who}) {c(nt.get('file')).replace('content/days/', '').replace('.json', '')} · {c(nt.get('path'), 60)}: {c(nt.get('note'), 240)}")
    lines.append("")
out.write_text("\n".join(lines) + "\n", encoding="utf8")
print("\n".join(l for l in lines if l.startswith("|") or l.startswith("## ")))
