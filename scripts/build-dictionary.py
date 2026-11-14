"""
Builds the Arabic -> English learner dictionary (content/dictionary/words.json): every word taught in the course
plus the most frequent Modern Standard Arabic lemmas, 5,000 rows, from licensed open data.

Get the two sources into .cache/dictionary/ (git-ignored), then run from the project root:

    mkdir -p .cache/dictionary && cd .cache/dictionary
    curl -L -o kaikki-ar.jsonl https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl
    curl -L -o ar_50k.txt https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ar/ar_50k.txt
    cd ../.. && python -I -X utf8 scripts/build-dictionary.py            # writes words.json
    python -I -X utf8 scripts/build-dictionary.py --pool 6200          # writes the review pool (audit/dictionary/)

Sources and licences (checked 2026-11-14, recorded in LICENSE-CONTENT and the Credits screen):
  * English Wiktionary, Arabic entries, extracted by kaikki.org / Wiktextract (Tatu Ylonen). Wiktionary text is
    CC BY-SA 3.0 / GFDL (https://en.wiktionary.org/wiki/Wiktionary:Copyrights). Used for the vocalised headword,
    part of speech, gender, plural, present tense, English meanings and the inflection tables that map inflected
    words back to their lemma.
  * FrequencyWords by Hermit Dave (OpenSubtitles 2018, Arabic 50k list), content CC BY-SA 4.0
    (https://github.com/hermitdave/FrequencyWords). Used only to rank the lemmas.
  The generated words.json is a derivative of both and is CC BY-SA 4.0 (share-alike).

Ranking: each frequency token (and the token with clitics such as wa-, bi-, al-, -hu stripped) is looked up in an
index of every lemma's own inflected forms; its count is shared among the lemmas it can belong to (weighted by
how many current, non-dialect meanings each has, with a bonus when the token is the lemma itself). Lemmas are
then ordered by that score.

Review: an AI review (docs/review/dictionary/) read the candidate pool and recorded, per row, keep / drop / fix.
Its decisions live in docs/review/dictionary/decisions.json and are applied here, so the build is reproducible:
  {"drop": ["<key>", ...], "fix": {"<key>": {"ar": ..., "en": ..., "gender": ..., "plural": ..., "present": ...}}}
where <key> is "<vocalised headword>|<pos>".

Row format: [ar, en, pos, gender, plural, present, course]
  ar       fully vocalised headword (verbs: past tense, he-form, as in Arabic dictionaries; no final pause sukun)
  en       1-3 short English meanings joined by "; "
  pos      noun/verb/adj/adverb/prep/pronoun/conj/interj/number/particle/phrase/question/demonstrative
  gender   "m"/"f"/"" ; plural: noun/adjective plural or "" ; present: verb present tense (he-form) or ""
  course   1 = taught in the course (values then come from the course vocabulary so they agree with the app)
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding="utf-8")
SIZE = 5000
POOL = int(sys.argv[sys.argv.index("--pool") + 1]) if "--pool" in sys.argv else 0
CACHE = ".cache/dictionary"
KAIKKI = f"{CACHE}/kaikki-ar.jsonl"
FREQ = f"{CACHE}/ar_50k.txt"
DECISIONS = "docs/review/dictionary/decisions.json"

HARAKAT = re.compile("[ؐ-ًؚ-ٰٟۖ-ۭـ]")
ARABIC = re.compile("[؀-ۿ]")


def bare(s: str) -> str:
    return HARAKAT.sub("", s)


def loose(s: str) -> str:
    """Spelling key: no harakat or tatweel, every alef seat written as a plain alef."""
    return re.sub("[أإآٱ]", "ا", bare(s))


POS = {"noun": "noun", "verb": "verb", "adj": "adj", "adv": "adverb", "prep": "prep", "pron": "pronoun",
       "conj": "conj", "intj": "interj", "num": "number", "particle": "particle", "phrase": "phrase",
       "prep_phrase": "phrase", "det": "demonstrative"}
FUNCTION = {"prep", "pronoun", "conj", "particle", "demonstrative", "question"}
BAD_TAGS = {"form-of", "alt-of", "obsolete", "archaic", "rare", "no-gloss", "Classical", "misspelling", "dialectal",
            "Egyptian-Arabic", "Gulf-Arabic", "Levantine-Arabic", "Iraqi-Arabic", "Moroccan-Arabic", "Hijazi-Arabic",
            "Egyptian", "Gulf", "Levantine", "Iraqi", "Moroccan", "Hijazi", "Tunisian", "Algerian", "Libyan",
            "Sudanese", "Yemeni", "Najdi", "Maltese", "colloquial", "Quranic", "Islamic", "poetic"}
BAD_GLOSS = re.compile(r"^(verbal noun|plural|feminine|masculine|female equivalent|active participle|passive participle|"
                       r"alternative|misspelling|elative|inflection|singulative|collective|dual|diminutive|"
                       r"nisba|abbreviation|initialism|clipping|Classical|obsolete|dialectal|archaic)\b", re.I)
NO_FORM = {"table-tags", "inflection-template", "romanization", "error-unrecognized-form"}


def clean_gloss(g: str) -> str:
    g = re.sub(r"\([^()]*[؀-ۿ][^()]*\)", "", g)  # (عَلَى (ʕalā)) and similar Arabic notes
    g = re.sub(r"\s+", " ", g).strip(" ,;:")
    return "" if ARABIC.search(g) else g


def good_glosses(d):
    out = []
    for s in d.get("senses", []):
        tags = set(s.get("tags", []) or [])
        if tags & BAD_TAGS:
            continue
        gl = s.get("glosses") or []
        if not gl:
            continue
        g = gl[-1] if len(gl) > 1 else gl[0]
        if BAD_GLOSS.search(gl[0]) or BAD_GLOSS.search(g):
            continue
        g = clean_gloss(g)
        if g and g not in out:
            out.append(g)
    return out


def short_en(glosses):
    parts, total = [], 0
    for g in glosses:
        for piece in [p.strip() for p in g.split(",")]:
            if not piece or piece in parts:
                continue
            if total + len(piece) > 48 and parts:
                break
            parts.append(piece)
            total += len(piece) + 2
        if len(parts) >= 3 or total > 40:
            break
    return "; ".join(parts[:4])


# ---------- course words ----------
course = json.load(open("content/course/vocabulary.json", encoding="utf-8"))


def course_row(v):
    pos = v["pos"]
    forms = {f["label"]: f["ar"] for f in v.get("forms", [])}
    ar, present = v["ar"], ""
    if pos == "verb" and "past" in forms:
        ar, present = forms["past"], forms.get("present", v["ar"])
    return {"ar": ar, "en": v["en"], "pos": pos, "gender": v.get("gender", ""), "plural": v.get("plural", ""),
            "present": present, "course": 1, "forms": {loose(ar), loose(v["ar"])}}


# ---------- Wiktionary lemmas ----------
lemmas = []  # dicts; the course words come first and absorb the Wiktionary entry of the same word
index = defaultdict(set)  # loose form -> lemma ids
FAMILY = {"noun": "n", "adj": "n", "verb": "v"}  # nouns and adjectives share forms (kabīr); others match any pos
course_at = {}
for v in course:
    r = course_row(v)
    i = len(lemmas)
    lemmas.append({**r, "w": 12})
    keys = set(r["forms"]) | {loose(f["ar"]) for f in v.get("forms", [])} | ({loose(r["plural"])} if r["plural"] else set())
    for k in keys:
        index[k].add(i)
    for k in r["forms"]:
        course_at.setdefault((k, FAMILY.get(r["pos"], "o")), i)
N_COURSE = len(lemmas)
with open(KAIKKI, encoding="utf-8") as f:
    for line in f:
        d = json.loads(line)
        pos = POS.get(d.get("pos"))
        if not pos:
            continue
        heads = d.get("head_templates") or []
        if any(h.get("name") in ("ar-verb form", "ar-noun form", "ar-adj form") for h in heads):
            continue
        glosses = good_glosses(d)
        if not glosses:
            continue
        forms = d.get("forms", [])
        canon = next((x["form"] for x in forms if "canonical" in (x.get("tags") or []) and ARABIC.search(x["form"])), "")
        if not canon or " " in canon.strip() and pos not in ("phrase", "prep", "conj"):
            continue
        canon = canon.strip()
        ctags = next((x.get("tags") or [] for x in forms if x["form"] == canon), [])
        if "plural" in ctags and pos == "noun":
            continue  # a plural headword (kuttāb, plural of kātib) is reached through its singular
        gender = "m" if "masculine" in ctags else "f" if "feminine" in ctags else ""
        plural = next((x["form"] for x in forms if not x.get("source") and (x.get("tags") or []) in (["plural"], ["common", "plural"])), "")
        present = next((x["form"] for x in forms if not x.get("source") and "non-past" in (x.get("tags") or [])), "") if pos == "verb" else ""
        keys = {loose(canon), loose(d["word"])}
        for x in forms:
            t = set(x.get("tags") or [])
            if t & NO_FORM or not ARABIC.search(x["form"]) or " " in x["form"]:
                continue
            keys.add(loose(x["form"]))
        fam = FAMILY.get(pos, "o")
        same = course_at.get((loose(canon), fam))
        if same is None and fam == "o":
            same = next((course_at[(loose(canon), f)] for f in "nvo" if (loose(canon), f) in course_at), None)
        if same is not None:  # the course word: its inflected forms now count for it
            for k in keys:
                index[k].add(same)
            continue
        i = len(lemmas)
        lemmas.append({"ar": canon, "en": short_en(glosses), "pos": pos, "gender": gender, "plural": plural,
                       "present": present, "course": 0, "w": min(len(glosses), 6), "word": d["word"]})
        for k in keys:
            index[k].add(i)

print(f"{len(lemmas)} Wiktionary lemmas, {len(index)} indexed forms")

# ---------- frequency ----------
PRE = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ل", "ك", "س"]
SUF = ["كما", "هما", "كم", "كن", "هم", "هن", "نا", "ني", "ها", "ه", "ك", "ي"]


def candidates(tok):
    if tok in index:
        return index[tok], 1.0
    for p in [""] + PRE:
        if not tok.startswith(p):
            continue
        rest = tok[len(p):]
        for s in [""] + SUF:
            if s and not rest.endswith(s):
                continue
            stem = rest[: len(rest) - len(s)] if s else rest
            if len(stem) < 2 or (not p and not s):
                continue
            if stem in index:
                return index[stem], 0.8
            if s and stem + "ة" in index:  # madrasatuhu -> madrasat + hu
                return index[stem + "ة"], 0.8
            if s and stem.endswith("ت") and stem[:-1] + "ة" in index:
                return index[stem[:-1] + "ة"], 0.8
    return set(), 0


score = Counter()
for line in open(FREQ, encoding="utf-8"):
    tok, _, n = line.strip().rpartition(" ")
    if not tok or not ARABIC.search(tok):
        continue
    tok = loose(tok)
    cands, damp = candidates(tok)
    if not cands:
        continue
    weights = {}
    for i in cands:
        L = lemmas[i]
        w = L["w"]
        if L["course"] or loose(L["ar"]) == tok or loose(L.get("word", "")) == tok:
            w *= 4 * (3 if L["pos"] in FUNCTION else 1)
        weights[i] = w
    tw = sum(weights.values())
    for i, w in weights.items():
        score[i] += int(n) * damp * w / tw

# ---------- merge course + Wiktionary ----------
decisions = json.load(open(DECISIONS, encoding="utf-8")) if os.path.exists(DECISIONS) else {"drop": [], "fix": {}}
drop = set(decisions.get("drop", []))
fixes = decisions.get("fix", {})

rows = []
seen = set()
for i in sorted(range(len(lemmas)), key=lambda i: -score[i]):
    L = lemmas[i]
    key = ("course", i) if L["course"] else (L["ar"], L["pos"])
    if key in seen:
        continue
    seen.add(key)
    rows.append({**L, "score": score[i]})

rows.sort(key=lambda r: (-r["score"], -r["course"]))


def key_of(r):
    return f"{r['ar']}|{r['pos']}"


if POOL:
    os.makedirs("audit/dictionary", exist_ok=True)
    pool = [r for r in rows if not r["course"]][: POOL]
    out = [{"key": key_of(r), "ar": r["ar"], "en": r["en"], "pos": r["pos"], "gender": r["gender"], "plural": r["plural"],
            "present": r["present"], "rank": n + 1} for n, r in enumerate(pool)]
    json.dump(out, open("audit/dictionary/pool.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"pool: {len(out)} non-course candidates -> audit/dictionary/pool.json")
    sys.exit(0)

picked = [r for r in rows if r["course"]]  # every course word is in, whatever its rank
taken = {(loose(f), FAMILY.get(r["pos"], "o")) for r in picked for f in r["forms"]}
dup_skipped = 0
for r in rows:
    if len(picked) >= SIZE:
        break
    if r["course"] or key_of(r) in drop:
        continue
    r = {**r, **{k: v for k, v in fixes.get(key_of(r), {}).items() if k in ("ar", "en", "pos", "gender", "plural", "present")}}
    r["ar"] = re.sub(r"[^؀-ۿ ]", "", r["ar"]).strip()  # stray text such as "Audio:" in a headword
    k = (loose(r["ar"]), FAMILY.get(r["pos"], "o"))
    if not r["ar"] or k in taken:  # a fix can turn a row into a course word or a word already listed
        dup_skipped += 1
        continue
    taken.add(k)
    picked.append(r)
print(f"skipped {dup_skipped} rows that duplicate a course word or an earlier row")
picked.sort(key=lambda r: (-r["score"], -r["course"]))
final = [[r["ar"], r["en"], r["pos"], r["gender"] or "", r["plural"] or "", r["present"] or "", r["course"]] for r in picked]

doc = {
    "source": "English Wiktionary Arabic entries via kaikki.org / Wiktextract (headwords, vowels, gender, plurals, meanings); "
    "FrequencyWords by Hermit Dave, OpenSubtitles 2018 Arabic list (ranking); course words from the Arabic Journey vocabulary. "
    "AI-reviewed (docs/review/dictionary/).",
    "licence": "CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Wiktionary text: CC BY-SA 3.0 / GFDL "
    "(https://en.wiktionary.org/wiki/Wiktionary:Copyrights); FrequencyWords content: CC BY-SA 4.0. Meanings shortened.",
    "note": "Most frequent first (see scripts/build-dictionary.py). Row: [vocalised headword (verbs: past tense), English, "
    "part of speech, gender m/f, plural, present tense (verbs), 1 = taught in the course].",
    "words": final,
}
os.makedirs("content/dictionary", exist_ok=True)
with open("content/dictionary/words.json", "w", encoding="utf-8") as f:
    json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
print(f"{len(final)} words written; in course {sum(r[6] for r in final)} of {len(course)}; "
      f"by part of speech {Counter(r[2] for r in final).most_common(10)}; dropped by review {len(drop)}, fixed {len(fixes)}")
