"""Compare each English page with its Tamil twin in ta/.
Flags times (6:30), prices (₹1,500) and phone numbers that appear in one language but not the other.
Run from the site folder:  python3 tools/check_tamil.py"""
import glob, os, re, sys

def facts(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<head>.*?</head>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    times = set(re.findall(r"\b\d{1,2}:\d{2}\b", s))
    prices = set(re.findall(r"₹[\d,]+", s))
    phones = set(re.findall(r"\b0\d{2,4} \d{6,7}\b", s))
    return times | prices | phones

site = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
problems = 0
for ta in sorted(glob.glob(os.path.join(site, "ta", "*.html"))):
    en = os.path.join(site, os.path.basename(ta))
    if not os.path.exists(en):
        continue
    a, b = facts(en), facts(ta)
    name = os.path.basename(ta)
    if a == b:
        print(f"OK    {name}")
    else:
        problems += 1
        print(f"CHECK {name}")
        if a - b: print("      only in English:", ", ".join(sorted(a - b)))
        if b - a: print("      only in Tamil:  ", ", ".join(sorted(b - a)))
sys.exit(1 if problems else 0)
