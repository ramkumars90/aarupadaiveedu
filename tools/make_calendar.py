"""Make the Murugan auspicious-days calendar for aarupadaiveedu.in.

Needs:  pip install pyswisseph
Run:    python3 tools/make_calendar.py 2026-11-19 2027-12-31
Writes: assets/murugan-days.js, murugan-days.ics, murugan-festivals.ics,
        and the date list inside calendar.html (between the CALENDAR-LIST markers).

How days are fixed (Chennai sunrise and sunset, Lahiri sidereal positions):
  Krithigai and Karthigai Deepam: the day the Krithigai star is up at sunset (lamp time).
  Sashti, Visakam, Thaipoosam, Panguni Uthiram: the day the tithi or star covers most of the daylight.
  These matched published Tamil panchangams for 2026 and 2027; check the big festivals each year.
"""
import datetime as dt, json, os, re, sys
import swisseph as swe

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
swe.set_sid_mode(swe.SIDM_LAHIRI)
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
LAT, LON = 13.08, 80.27
F = swe.FLG_SIDEREAL | swe.FLG_MOSEPH

def jd(t):
    u = t.astimezone(dt.timezone.utc)
    return swe.julday(u.year, u.month, u.day, u.hour + u.minute / 60 + u.second / 3600)
def moon(j): return swe.calc_ut(j, swe.MOON, F)[0][0]
def sun(j): return swe.calc_ut(j, swe.SUN, F)[0][0]
def tithi(j): return int(((moon(j) - sun(j)) % 360) // 12) + 1
def nak(j): return int(moon(j) // (360 / 27))
def sign(j): return int(sun(j) // 30)

def rise_set(day):
    j0 = jd(dt.datetime(day.year, day.month, day.day, tzinfo=IST))
    geo = (LON, LAT, 0)
    r = swe.rise_trans(j0, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geo, 0, 0, swe.FLG_MOSEPH)[1][0]
    s = swe.rise_trans(j0, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geo, 0, 0, swe.FLG_MOSEPH)[1][0]
    return r, s

def intervals(fn, target, a, b, step=1 / 24):
    out, j, cur, prev = [], a, None, fn(a)
    def refine(x, y, v):
        for _ in range(20):
            m = (x + y) / 2
            if fn(m) == v: x = m
            else: y = m
        return y
    if prev == target: cur = j
    while j < b:
        j2 = j + step; v = fn(j2)
        if v != prev:
            t = refine(j, j2, prev)
            if v == target: cur = t
            elif prev == target and cur is not None: out.append((cur, t)); cur = None
            prev = v
        j = j2
    return out

def build(start, end):
    days = {}
    d = start - dt.timedelta(days=3)
    while d <= end + dt.timedelta(days=3):
        days[d] = rise_set(d); d += dt.timedelta(days=1)
    a = jd(dt.datetime.combine(start - dt.timedelta(days=5), dt.time(), IST))
    b = jd(dt.datetime.combine(end + dt.timedelta(days=5), dt.time(), IST))
    def most_daylight(iv):
        x, y = iv
        best = max(days.items(), key=lambda kv: max(0, min(y, kv[1][1]) - max(x, kv[1][0])))
        return best[0]
    def at_sunset(iv):
        x, y = iv
        for d, (r, s) in days.items():
            if x <= s < y: return d
        return most_daylight(iv)
    ev = []
    def add(d, kind, name, ta, note, major=False):
        if start <= d <= end: ev.append(dict(date=d.isoformat(), kind=kind, name=name, ta=ta, note=note, major=major))

    for iv in intervals(nak, 2, a, b):  # Krithigai
        d, s = at_sunset(iv), sign((iv[0] + iv[1]) / 2)
        if s == 7: add(d, "festival", "Karthigai Deepam", "கார்த்திகை தீபம்", "Krithigai in the month of Karthigai. Lamps are lit at dusk in every home and on the temple hills, including the maha deepam at Thiruparankundram.", True)
        elif s == 3: add(d, "festival", "Aadi Krithigai", "ஆடிக் கிருத்திகை", "Krithigai in the month of Aadi, one of the three great Krithigais. Thiruthani holds its float festival.", True)
        elif s == 9: add(d, "festival", "Thai Krithigai", "தைக் கிருத்திகை", "Krithigai in the month of Thai, one of the three great Krithigais.", True)
        else: add(d, "krithigai", "Krithigai", "கிருத்திகை", "Murugan's star. Many devotees fast and light a lamp at dusk.")
    for iv in intervals(nak, 15, a, b):  # Visakam
        d, s = most_daylight(iv), sign((iv[0] + iv[1]) / 2)
        if s == 1: add(d, "festival", "Vaikasi Visakam", "வைகாசி விசாகம்", "Murugan's birth star in the month of Vaikasi. Big celebrations at Thiruchendur and Thiruparankundram.", True)
        else: add(d, "visakam", "Visakam", "விசாகம்", "Murugan's birth star.")
    for iv in intervals(nak, 7, a, b):  # Poosam
        if sign((iv[0] + iv[1]) / 2) == 9:
            add(most_daylight(iv), "festival", "Thaipoosam", "தைப்பூசம்", "Poosam star in the month of Thai. The biggest day at Palani, with kavadi processions at all six abodes.", True)
    for iv in intervals(nak, 11, a, b):  # Uthiram
        if sign((iv[0] + iv[1]) / 2) == 11:
            add(most_daylight(iv), "festival", "Panguni Uthiram", "பங்குனி உத்திரம்", "Uthiram star in the month of Panguni, the day of divine weddings. Palani holds a ten-day festival.", True)
    for iv in intervals(tithi, 6, a, b):  # Valarpirai Sashti
        d = most_daylight(iv)
        if sign((iv[0] + iv[1]) / 2) == 6:
            add(d - dt.timedelta(days=5), "festival", "Kanda Sashti begins", "கந்த சஷ்டி தொடக்கம்", "Six days of fasting and prayer begin. Thiruchendur is the centre of the festival.", True)
            add(d, "festival", "Soorasamharam", "சூரசம்ஹாரம்", "The sixth day of Kanda Sashti. In the evening Murugan defeats Soorapadman on the shore at Thiruchendur.", True)
            add(d + dt.timedelta(days=1), "festival", "Thirukalyanam", "திருக்கல்யாணம்", "Murugan's wedding with Deivanai, the day after Soorasamharam.", True)
        else:
            add(d, "sashti", "Sashti", "வளர்பிறை சஷ்டி", "Sashti fast on the sixth day after the new moon (valarpirai).")
    for iv in intervals(tithi, 21, a, b):  # Theipirai Sashti
        add(most_daylight(iv), "sashti-t", "Theipirai Sashti", "தேய்பிறை சஷ்டி", "The sixth day after the full moon (theipirai). Some devotees fast on this Sashti too.")
    ev.sort(key=lambda e: (e["date"], not e["major"]))
    return ev

# ---------- outputs ----------
def esc(s): return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")
def fold(line):
    b = line.encode("utf-8"); out = []
    while len(b) > 75:
        cut = 75 if not out else 74
        while (b[cut] & 0xC0) == 0x80: cut -= 1
        out.append(b[:cut]); b = b[cut:]
    out.append(b)
    return b"\r\n ".join(out).decode("utf-8")
def ics(events, name, desc, stamp):
    L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aaru Padai//Murugan calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
         "X-WR-CALNAME:" + esc(name), "X-WR-CALDESC:" + esc(desc), "X-WR-TIMEZONE:Asia/Kolkata",
         "REFRESH-INTERVAL;VALUE=DURATION:P1D", "X-PUBLISHED-TTL:P1D"]
    for e in events:
        d = dt.date.fromisoformat(e["date"])
        L += ["BEGIN:VEVENT", f"UID:{e['date']}-{e['kind']}-{re.sub('[^a-z]', '', e['name'].lower())}@aarupadaiveedu.in",
              "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + d.strftime("%Y%m%d"),
              "DTEND;VALUE=DATE:" + (d + dt.timedelta(days=1)).strftime("%Y%m%d"),
              "SUMMARY:" + esc(f"{e['name']} · {e['ta']}"),
              "DESCRIPTION:" + esc(e["note"] + " Dates follow the Tamil panchangam for Chennai; temples may differ by a day. https://aarupadaiveedu.in/calendar"),
              "URL:https://aarupadaiveedu.in/calendar", "TRANSP:TRANSPARENT", "CATEGORIES:" + ("Festival" if e["major"] else "Monthly"),
              "END:VEVENT"]
    L.append("END:VCALENDAR")
    return "\r\n".join(fold(x) for x in L) + "\r\n"

def html_list(events):
    out, month = [], None
    for e in events:
        d = dt.date.fromisoformat(e["date"])
        m = d.strftime("%B %Y")
        if m != month:
            if month: out.append("      </ol>")
            out.append(f'      <h3 class="cal-month">{m}</h3>\n      <ol class="cal-list">')
            month = m
        cls = "cal-day" + (" major" if e["major"] else "")
        out.append(f'        <li class="{cls}" data-kind="{e["kind"]}" data-date="{e["date"]}"><time datetime="{e["date"]}"><b>{d.day}</b> {d.strftime("%a")}</time>'
                   f'<div><span class="cal-name">{e["name"]} <span lang="ta">{e["ta"]}</span></span><span class="cal-note">{e["note"]}</span></div></li>')
    if month: out.append("      </ol>")
    return "\n".join(out)

if __name__ == "__main__":
    start = dt.date.fromisoformat(sys.argv[1]); end = dt.date.fromisoformat(sys.argv[2])
    out_dir = sys.argv[3] if len(sys.argv) > 3 else SITE
    ev = build(start, end)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    os.makedirs(os.path.join(out_dir, "assets"), exist_ok=True)
    with open(os.path.join(out_dir, "assets", "murugan-days.js"), "w", encoding="utf-8") as f:
        f.write("// Made by tools/make_calendar.py. Do not edit by hand.\nwindow.MURUGAN_DAYS = " + json.dumps(ev, ensure_ascii=False, separators=(",", ":")) + ";\n")
    with open(os.path.join(out_dir, "murugan-days.ics"), "w", encoding="utf-8", newline="") as f:
        f.write(ics(ev, "Murugan days · Aaru Padai", "Krithigai, Sashti, Visakam and Murugan festivals, from aarupadaiveedu.in", stamp))
    with open(os.path.join(out_dir, "murugan-festivals.ics"), "w", encoding="utf-8", newline="") as f:
        f.write(ics([e for e in ev if e["major"]], "Murugan festivals · Aaru Padai", "The big Murugan festivals of the year, from aarupadaiveedu.in", stamp))
    page = os.path.join(out_dir, "calendar.html")
    if os.path.exists(page):
        s = open(page, encoding="utf-8").read()
        s = re.sub(r"(<!-- CALENDAR-LIST -->).*?(<!-- /CALENDAR-LIST -->)", lambda m: m.group(1) + "\n" + html_list(ev) + "\n      " + m.group(2), s, flags=re.S)
        open(page, "w", encoding="utf-8").write(s)
    else:
        open(os.path.join(out_dir, "calendar-list.html"), "w", encoding="utf-8").write(html_list(ev))
    print(len(ev), "days,", sum(e["major"] for e in ev), "festivals")
