(function () {
  var PAGE = document.body.getAttribute("data-page") || "home";
  var TA = (document.documentElement.lang || "en").slice(0, 2) === "ta";
  var LANG = TA ? "ta" : "en";
  // Pages that have a Tamil version. Tamil pages link to the English page for the rest.
  var TA_READY = ["home", "thiruparankundram", "thiruchendur", "palani", "swamimalai", "thiruthani", "pazhamudircholai"];
  // Pages other than the six abodes that Tamil pages may link to: Tamil when ready, else English.
  var OTHER = ["calendar", "abroad"];
  function L(en, ta) { return TA ? ta : en; }

  // Copy text in every browser: the older copy command first (works in Safari), then the clipboard API.
  function copyText(text) {
    var ta = document.createElement("textarea"), ok = false;
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) return Promise.resolve();
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return Promise.reject();
  }

  var abodes = [
    { n: 1, id: "thiruparankundram", name: "Thiruparankundram", ta: "திருப்பரங்குன்றம்", place: "Madurai", lat: 9.88, lon: 78.07,
      legend: "Where Murugan married Deivanai, daughter of Indra, after his victory.",
      taPlace: "மதுரை", taLegend: "வெற்றிக்குப் பின், இந்திரனின் மகள் தெய்வானையை முருகன் மணந்த தலம்." },
    { n: 2, id: "thiruchendur", name: "Thiruchendur", ta: "திருச்செந்தூர்", place: "Thoothukudi district, on the sea", lat: 8.50, lon: 78.12,
      legend: "The shore where he defeated Soorapadman. The heart of Kanda Sashti.",
      taPlace: "தூத்துக்குடி மாவட்டம், கடற்கரையில்", taLegend: "சூரபத்மனை முருகன் வென்ற கடற்கரை. கந்த சஷ்டியின் மையம்." },
    { n: 3, id: "palani", name: "Palani", ta: "பழனி", place: "Dindigul district", lat: 10.45, lon: 77.52,
      legend: "Where he stood as a renunciant, Dhandayuthapani, after the episode of the fruit.",
      taPlace: "திண்டுக்கல் மாவட்டம்", taLegend: "ஞானப்பழக் கதைக்குப் பின், தண்டாயுதபாணியாகத் துறவுக் கோலத்தில் நின்ற தலம்." },
    { n: 4, id: "swamimalai", name: "Swamimalai", ta: "சுவாமிமலை", place: "Near Kumbakonam", lat: 10.96, lon: 79.33,
      legend: "Where the child Murugan taught the meaning of Om to his father Shiva.",
      taPlace: "கும்பகோணம் அருகில்", taLegend: "குழந்தை முருகன், தந்தை சிவனுக்குப் பிரணவ மந்திரமான ஓம் என்பதன் பொருளை உபதேசித்த தலம்." },
    { n: 5, id: "thiruthani", name: "Thiruthani", ta: "திருத்தணி", place: "Tiruvallur district, near Chennai", lat: 13.18, lon: 79.61,
      legend: "Where his anger cooled after battle, and where he married Valli.",
      taPlace: "திருவள்ளூர் மாவட்டம், சென்னை அருகில்", taLegend: "போருக்குப் பின் சினம் தணிந்து, வள்ளியை மணந்த தலம்." },
    { n: 6, id: "pazhamudircholai", name: "Pazhamudircholai", ta: "பழமுதிர்சோலை", place: "Near Madurai, in the Alagar hills", lat: 10.07, lon: 78.21,
      legend: "Where he tested Avvaiyar with the riddle of the 'hot fruit'.",
      taPlace: "மதுரை அருகில், அழகர் மலையில்", taLegend: "'சுட்ட பழம் வேண்டுமா, சுடாத பழம் வேண்டுமா?' என்று ஔவையாரைச் சோதித்த தலம்." }
  ];

  var IDS = ["thiruparankundram", "thiruchendur", "palani", "swamimalai", "thiruthani", "pazhamudircholai"];
  var byId = {}; abodes.forEach(function (a) { byId[a.id] = a; });
  function aname(id) { return TA ? byId[id].ta : byId[id].name; }
  function link(id) { return (TA && TA_READY.indexOf(id) < 0 ? "../" : "") + id + ".html"; }
  function idFromHref(h) { var m = (h || "").match(/([a-z]+)\.html$/); return m ? m[1] : ""; }
  if (PAGE === "home" && IDS.indexOf(location.hash.slice(1)) >= 0) { location.replace(link(location.hash.slice(1))); return; }

  // On Tamil pages, point links at the English page until that page is translated.
  if (TA) document.querySelectorAll("a[href]").forEach(function (a) {
    var m = a.getAttribute("href").match(/^([a-z]+)\.html$/);
    if (m && (IDS.indexOf(m[1]) >= 0 || OTHER.indexOf(m[1]) >= 0)) a.setAttribute("href", link(m[1]));
  });

  // Abode cards
  var list = document.getElementById("abode-list");
  if (list) list.innerHTML = abodes.map(function (a) {
    var pill = TA ? (TA_READY.indexOf(a.id) >= 0 ? "வழிகாட்டியைப் படிக்க" : "ஆங்கில வழிகாட்டி") : "Read the guide";
    return '<a class="abode" href="' + link(a.id) + '">' +
      '<span class="num" aria-hidden="true">' + a.n + "</span>" +
      "<h3>" + (TA ? a.ta : a.name) + "</h3>" +
      '<span class="ta" lang="' + (TA ? "en" : "ta") + '">' + (TA ? a.name : a.ta) + "</span>" +
      '<span class="place">' + (TA ? a.taPlace : a.place) + "</span>" +
      '<p class="legend">' + (TA ? a.taLegend : a.legend) + "</p>" +
      '<span class="pill ready">' + pill + "</span>" +
      "</a>";
  }).join("");

  // Map
  function px(lon) { return ((lon - 76.0) * 92 + 20).toFixed(1); }
  function py(lat) { return ((13.8 - lat) * 92 + 20).toFixed(1); }
  var outline = [[13.55,80.25],[13.08,80.29],[12.6,80.2],[11.93,79.84],[11.4,79.75],[10.77,79.85],[10.28,79.86],[10.2,79.4],[9.7,79.05],[9.4,78.95],[9.25,78.6],[9.0,78.3],[8.8,78.17],[8.5,78.13],[8.3,77.85],[8.08,77.55],[8.3,77.2],[8.8,77.15],[9.5,77.2],[10.0,77.25],[10.3,76.95],[10.7,76.85],[11.05,76.65],[11.35,76.3],[11.6,76.4],[11.75,76.9],[12.0,77.4],[12.3,77.6],[12.7,77.75],[12.75,78.3],[12.95,78.5],[13.2,78.7],[13.45,79.1],[13.6,79.6]];
  var pts = outline.map(function (p) { return px(p[1]) + "," + py(p[0]); }).join(" ");
  var labelPos = {
    thiruparankundram: { dx: -10, dy: 4, anchor: "end" },
    pazhamudircholai: { dx: 10, dy: -4, anchor: "start" },
    palani: { dx: -10, dy: 4, anchor: "end" },
    swamimalai: { dx: -10, dy: 4, anchor: "end" },
    thiruthani: { dx: -10, dy: 4, anchor: "end" },
    thiruchendur: { dx: 10, dy: 4, anchor: "start" }
  };
  if (document.getElementById("planner")) (function () {
  // ---------- Trip planner ----------
  var START = {
    chennai: { name: "Chennai", lat: 13.08, lon: 80.27 },
    bengaluru: { name: "Bengaluru", lat: 12.97, lon: 77.59 },
    coimbatore: { name: "Coimbatore", lat: 11.02, lon: 76.96 },
    madurai: { name: "Madurai", lat: 9.93, lon: 78.12 },
    trichy: { name: "Tiruchirappalli", lat: 10.79, lon: 78.70 },
    puducherry: { name: "Puducherry", lat: 11.93, lon: 79.83 }
  };
  var STOPOVER = [START.chennai, START.trichy, START.madurai, { name: "Villupuram", lat: 11.94, lon: 79.49 }, { name: "Salem", lat: 11.66, lon: 78.15 }, { name: "Tirunelveli", lat: 8.71, lon: 77.76 }, { name: "Vellore", lat: 12.92, lon: 79.13 }, { name: "Krishnagiri", lat: 12.52, lon: 78.21 }];
  var STAY = { thiruparankundram: "Madurai", pazhamudircholai: "Madurai", swamimalai: "Kumbakonam", thiruchendur: "Thiruchendur", palani: "Palani", thiruthani: "Thiruthani" };
  // Town names stay in English inside the planner; tn() shows them in the page's language.
  var TOWN_TA = { Chennai: "சென்னை", Bengaluru: "பெங்களூரு", Coimbatore: "கோயம்புத்தூர்", Madurai: "மதுரை", Tiruchirappalli: "திருச்சிராப்பள்ளி",
    Puducherry: "புதுச்சேரி", Villupuram: "விழுப்புரம்", Salem: "சேலம்", Tirunelveli: "திருநெல்வேலி", Vellore: "வேலூர்", Krishnagiri: "கிருஷ்ணகிரி",
    Kumbakonam: "கும்பகோணம்", Palani: "பழனி", Thiruchendur: "திருச்செந்தூர்", Thiruthani: "திருத்தணி" };
  function tn(n) { return TA && TOWN_TA[n] ? TOWN_TA[n] : n; }
  var VISIT_H = { thiruparankundram: 1.5, thiruchendur: 3, palani: 3, swamimalai: 2, thiruthani: 2.5, pazhamudircholai: 2 };
  var VISIT_TIP = {
    en: {
      thiruparankundram: "Cave temple at the foot of the hill. Easy for all ages.",
      thiruchendur: "Sea bath, then darshan. Free queue entry closes at 7:30 PM.",
      palani: "Take the rope car or winch up if needed. The temple is open until 8 PM.",
      swamimalai: "60 steps, or the lift. Closed roughly 12:30–4 PM, so time your arrival.",
      thiruthani: "365 steps or the ghat road. Book abhishekam a day ahead.",
      pazhamudircholai: "Temple shuttle up from Alagar Kovil. Closes around 6 PM."
    },
    ta: {
      thiruparankundram: "மலையடிவாரத்தில் உள்ள குடவரைக் கோயில். எல்லா வயதினருக்கும் எளிது.",
      thiruchendur: "முதலில் கடல் நீராடல், பிறகு தரிசனம். இலவச வரிசையில் இரவு 7:30 வரை அனுமதி.",
      palani: "தேவைப்பட்டால் ரோப் கார் அல்லது வின்ச்சில் மேலே செல்லுங்கள். கோயில் இரவு 8 மணி வரை திறந்திருக்கும்.",
      swamimalai: "60 படிகள், அல்லது லிஃப்ட். மதியம் சுமார் 12:30 முதல் 4 மணி வரை நடை சாத்தப்படும்; அதற்கேற்ப வாருங்கள்.",
      thiruthani: "365 படிகள் அல்லது மலைப்பாதை. அபிஷேகத்துக்கு ஒரு நாள் முன்பே பதிவு செய்யுங்கள்.",
      pazhamudircholai: "அழகர் கோவிலிலிருந்து கோயில் வாகனத்தில் மேலே செல்லலாம். மாலை சுமார் 6 மணிக்கு நடை சாத்தப்படும்."
    }
  };
  var SPARE = {
    en: {
      Madurai: "Meenakshi Amman temple and the old city.",
      Kumbakonam: "Darasuram and the Navagraha temples nearby.",
      Palani: "A day trip up to Kodaikanal, about 65 km.",
      Thiruchendur: "Kulasekarapattinam and the quiet coast.",
      Thiruthani: "Kanchipuram, about 40 km away."
    },
    ta: {
      Madurai: "மீனாட்சி அம்மன் கோயிலும் பழைய நகரமும்.",
      Kumbakonam: "அருகிலுள்ள தாராசுரமும் நவக்கிரகக் கோயில்களும்.",
      Palani: "சுமார் 65 கி.மீ தொலைவிலுள்ள கொடைக்கானலுக்கு ஒரு நாள் பயணம்.",
      Thiruchendur: "குலசேகரப்பட்டினமும் அமைதியான கடற்கரையும்.",
      Thiruthani: "சுமார் 40 கி.மீ தொலைவிலுள்ள காஞ்சிபுரம்."
    }
  };
  var MODE = {
    car: { label: "car", taLabel: "கார்", verb: "Drive", taVerb: "கார்", speed: 45, maxTravel: 8, day: 10 },
    bus: { label: "bus", taLabel: "பேருந்து", verb: "Bus", taVerb: "பேருந்து", speed: 35, maxTravel: 7, day: 9 },
    train: { label: "train and local taxi", taLabel: "ரயில், உள்ளூர் டாக்சி", verb: "Train/taxi", taVerb: "ரயில்/டாக்சி", speed: 45, maxTravel: 7, day: 9 }
  };
  var KM = L(" km", " கி.மீ"), ABOUT = L("about ", "சுமார் ");

  function km(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var d = 2 * R * Math.asin(Math.sqrt(h)) * 1.35;
    return Math.max(5, Math.round(d / 5) * 5);
  }
  function hours(d, mode) {
    var m = MODE[mode];
    if (d < 40) return d / 30 + 0.25;
    var t = d / m.speed;
    if (mode === "train") t += 0.75;
    return t;
  }
  function fmtH(h) { var r = Math.max(0.5, Math.round(h * 2) / 2); return (r % 1 ? r.toFixed(1) : r) + L(" h", " மணி நேரம்"); }
  var MODE_NOW = "car";
  function placeName(p) {
    if (!p.id) return tn(p.name);
    var n = byId[p.id].name, town = STAY[p.id];
    if (MODE_NOW !== "car" && town !== n) return TA ? tn(town) + " (" + aname(p.id) + " செல்ல)" : town + " (for " + n + ")";
    return aname(p.id);
  }

  function permutations(arr) {
    if (arr.length <= 1) return [arr.slice()];
    var out = [];
    arr.forEach(function (x, i) {
      var rest = arr.slice(0, i).concat(arr.slice(i + 1));
      permutations(rest).forEach(function (p) { out.push([x].concat(p)); });
    });
    return out;
  }
  function bestOrder(start, roundTrip) {
    var best = null, bestD = Infinity;
    permutations(abodes.map(function (a) { return a.id; })).forEach(function (p) {
      var d = km(start, byId[p[0]]);
      for (var i = 1; i < p.length; i++) d += km(byId[p[i - 1]], byId[p[i]]);
      if (roundTrip) d += km(byId[p[p.length - 1]], start);
      if (d < bestD) { bestD = d; best = p; }
    });
    return best;
  }
  function nearestStopover(a, b) {
    var mid = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 }, best = null, bd = Infinity;
    STOPOVER.forEach(function (c) { var d = km(mid, c); if (d < bd) { bd = d; best = c; } });
    return best;
  }

  // Build days from an ordered list of legs, with a daily hour budget.
  function schedule(start, order, roundTrip, mode, budget) {
    var m = MODE[mode]; MODE_NOW = mode;
    var stops = [{ name: start.name, lat: start.lat, lon: start.lon }].concat(order.map(function (id) { return { id: id, lat: byId[id].lat, lon: byId[id].lon }; }));
    if (roundTrip) stops.push({ name: start.name, lat: start.lat, lon: start.lon, home: true });
    var days = [], cur = null, used = 0;
    function newDay() { cur = { items: [], end: null }; days.push(cur); used = 0; }
    newDay();
    for (var i = 1; i < stops.length; i++) {
      var from = stops[i - 1], to = stops[i];
      var d = km(from, to), t = hours(d, mode), v = to.id ? VISIT_H[to.id] : 0;
      var short = d < 40;
      function nm(x) { return short ? (x.id ? aname(x.id) : tn(x.name)) : placeName(x); }
      var leg = { type: "travel", from: nm(from), to: nm(to), km: d, h: t };
      if (mode === "train" && t > 6) {
        leg.overnight = true;
        cur.items.push(leg); cur.onTrain = true;
        newDay();
        cur.items.push({ type: "arrive", place: placeName(to) });
      } else if (t > m.maxTravel) {
        if (used > 0) { cur.end = from; newDay(); }
        var mid = nearestStopover(from, to);
        var d1 = km(from, mid), d2 = km(mid, to);
        cur.items.push({ type: "travel", from: placeName(from), to: tn(mid.name), km: d1, h: hours(d1, mode) });
        cur.end = mid; newDay();
        cur.items.push({ type: "travel", from: tn(mid.name), to: placeName(to), km: d2, h: hours(d2, mode) });
        used = hours(d2, mode);
      } else {
        var slack = to.home ? 2.5 : 0;
        if (used > 0 && used + t + v > budget + slack) { cur.end = from; newDay(); }
        cur.items.push(leg);
        used += t;
      }
      if (to.id) { cur.items.push({ type: "visit", id: to.id }); used += v; }
      cur.end = to;
    }
    return days;
  }

  function plan(opts) {
    var start = START[opts.start], m = MODE[opts.mode], round = opts.ret === "round";
    var order = opts.order === "traditional" ? abodes.map(function (a) { return a.id; }) : bestOrder(start, round);
    var days = schedule(start, order, round, opts.mode, m.day);
    var minDays = days.length, wanted = opts.days;
    // Stretch the pace (fewer hours a day) if there is time to spare.
    if (minDays < wanted) {
      for (var b = m.day - 0.5; b >= 5; b -= 0.5) {
        var tryDays = schedule(start, order, round, opts.mode, b);
        if (tryDays.length <= wanted) days = tryDays; else break;
      }
    }
    // Still spare days? Add rest days at good bases.
    var spare = wanted - days.length, added = 0;
    var prefs = ["Madurai", "Kumbakonam", "Palani", "Thiruchendur", "Thiruthani"];
    while (spare > 0 && added < 10) {
      var placed = false;
      for (var p = 0; p < prefs.length && !placed; p++) {
        for (var i = 0; i < days.length - 1; i++) {
          var e = days[i].end;
          var town = e && e.id ? STAY[e.id] : e && e.name;
          if (town === prefs[(p + added) % prefs.length] && !days[i + 1].spare) {
            days.splice(i + 1, 0, { spare: true, town: town, items: [], end: e });
            placed = true; break;
          }
        }
      }
      if (!placed) break;
      spare--; added++;
    }
    var totalKm = 0, totalH = 0;
    days.forEach(function (d) { d.items.forEach(function (it) { if (it.type === "travel") { totalKm += it.km; totalH += it.h; } }); });
    return { start: start, order: order, days: days, minDays: minDays, wanted: wanted, totalKm: totalKm, totalH: totalH, mode: opts.mode, round: round };
  }

  // ---------- Map ----------
  var MAP_TITLE = L("Map of Tamil Nadu showing the six abodes and the planned route", "ஆறு படை வீடுகளையும் திட்டமிட்ட பயண வழியையும் காட்டும் தமிழ்நாடு வரைபடம்");
  function drawMap(p) {
    var routeStops = [p.start].concat(p.order.map(function (id) { return byId[id]; }));
    if (p.round) routeStops.push(p.start);
    var routePts = routeStops.map(function (s) { return px(s.lon) + "," + py(s.lat); }).join(" ");
    var svg = '<title id="map-title">' + MAP_TITLE + '</title>' +
      '<polygon points="' + pts + '" fill="#f3e3c3" stroke="#c39233" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<text x="' + L(400, 385) + '" y="330" font-size="12" fill="#6e5a4c" text-anchor="middle" font-style="italic">' + L("Bay of Bengal", "வங்காள விரிகுடா") + '</text>' +
      '<text x="350" y="548" font-size="12" fill="#6e5a4c" text-anchor="middle" font-style="italic">' + L("Gulf of Mannar", "மன்னார் வளைகுடா") + '</text>' +
      '<polyline points="' + routePts + '" fill="none" stroke="#d9700b" stroke-width="2" stroke-dasharray="5 4" opacity=".85"/>';
    var s = p.start, sx = +px(s.lon), sy = +py(s.lat);
    var inside = sx <= 430 && sx >= 10;
    if (inside) {
      var anchor = sx > 330 ? "end" : "start", dx = sx > 330 ? -10 : 10;
      svg += '<rect x="' + (sx - 6) + '" y="' + (sy - 6) + '" width="12" height="12" fill="#2f5d3a" transform="rotate(45 ' + sx + ' ' + sy + ')"/>' +
        '<text x="' + (sx + dx) + '" y="' + (sy + 18) + '" font-size="12" font-weight="700" fill="#2f5d3a" text-anchor="' + anchor + '">' + L("Start: ", "புறப்பாடு: ") + tn(s.name) + '</text>';
    }
    abodes.forEach(function (a) {
      var l = labelPos[a.id], x = px(a.lon), y = py(a.lat);
      svg += '<a href="' + link(a.id) + '">' +
        '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#6a1420" stroke="#6a1420" stroke-width="2"/>' +
        '<text x="' + x + '" y="' + (+y + 4) + '" font-size="11" font-weight="700" text-anchor="middle" fill="#fff">' + (p.order.indexOf(a.id) + 1) + "</text>" +
        '<text x="' + (+x + l.dx * 1.4) + '" y="' + (+y + l.dy) + '" font-size="' + L(13, 12) + '" fill="#4a0d16" font-weight="500" text-anchor="' + l.anchor + '">' + aname(a.id) + "</text></a>";
    });
    document.getElementById("map").innerHTML = svg;
  }

  // ---------- Render ----------
  var CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];
  function render(p) {
    drawMap(p);
    var m = MODE[p.mode], startName = tn(p.start.name), modeLabel = TA ? m.taLabel : m.label;
    var sum = '<span class="fact"><b>' + L("Days", "நாட்கள்") + '</b> ' + p.days.length + '</span>' +
      '<span class="fact"><b>' + L("Distance", "தூரம்") + '</b> ' + ABOUT + (Math.round(p.totalKm / 10) * 10).toLocaleString("en-IN") + KM + '</span>' +
      '<span class="fact"><b>' + L("On the road", "பயண நேரம்") + '</b> ' + ABOUT + Math.round(p.totalH) + L(" h", " மணி நேரம்") + '</span>';
    document.getElementById("p-summary").innerHTML = sum;
    var note = "";
    if (p.minDays > p.wanted) {
      note = TA
        ? "<b>இந்தப் பயணத்துக்குக் குறைந்தது " + p.minDays + " நாட்கள் தேவை</b> (புறப்படும் இடம்: " + startName + ", பயண வகை: " + modeLabel + "). கீழே உள்ள திட்டம் " + p.minDays + " நாட்களைக் கொண்டது. நேரத்தை மிச்சப்படுத்த, கடைசிக் கோயிலில் பயணத்தை முடியுங்கள், அல்லது நீண்ட தூரங்களுக்கு இரவு ரயில்களைப் பயன்படுத்துங்கள்."
        : "<b>This needs at least " + p.minDays + " days</b> from " + startName + " by " + modeLabel + ". The plan below uses " + p.minDays + ". To save time, end the trip at the last temple, or use overnight trains for the long legs.";
    } else if (p.days.some(function (d) { return d.spare; })) {
      note = L("<b>You have time to spare.</b> The plan adds rest days at good bases, so the trip is not rushed.",
        "<b>உங்களிடம் கூடுதல் நேரம் உள்ளது.</b> அவசரமில்லாமல் பயணிக்க, நல்ல தங்குமிடங்களில் ஓய்வு நாட்கள் சேர்க்கப்பட்டுள்ளன.");
    }
    var n = document.getElementById("p-note"); n.innerHTML = note; n.hidden = !note;
    var html = p.days.map(function (d, i) {
      var title, lines = [];
      if (d.spare) {
        title = L("Rest day in " + d.town, "ஓய்வு நாள்: " + tn(d.town));
        lines.push("<p>" + L("Slow down, or see more nearby: " + (SPARE.en[d.town] || "explore the town."),
          "நிதானமாக ஓய்வெடுங்கள், அல்லது அருகில் உள்ளவற்றைப் பாருங்கள்: " + (SPARE.ta[d.town] || "ஊரைச் சுற்றிப் பாருங்கள்.")) + "</p>");
      } else {
        var visits = d.items.filter(function (it) { return it.type === "visit"; }).map(function (it) {
          return '<a href="' + link(it.id) + '">' + aname(it.id) + "</a> " + CIRCLED[p.order.indexOf(it.id)];
        });
        var travels = d.items.filter(function (it) { return it.type === "travel"; });
        title = visits.length ? visits.join(L(" and ", " மற்றும் ")) : (travels.length ? travels[travels.length - 1].from + " → " + travels[travels.length - 1].to : L("Travel", "பயணம்"));
        d.items.forEach(function (it) {
          if (it.type === "travel") {
            var how = it.overnight ? L("Overnight train", "இரவு ரயில்") : (it.km < 40 && p.mode !== "car" ? L("Local taxi or bus", "உள்ளூர் டாக்சி அல்லது பேருந்து") : (TA ? m.taVerb : m.verb));
            lines.push('<div class="meta">' + how + ": " + it.from + " → " + it.to + " · " + ABOUT + it.km + KM + " · " + fmtH(it.h) + "</div>");
          } else if (it.type === "arrive") {
            lines.push('<div class="meta">' + L("Arrive in " + it.place + " in the morning.", "காலையில் " + it.place + " வந்தடைதல்.") + "</div>");
          } else {
            lines.push("<p>" + VISIT_TIP[LANG][it.id] + L(" Allow about " + fmtH(VISIT_H[it.id]) + ".", " தரிசனத்துக்குச் சுமார் " + fmtH(VISIT_H[it.id]) + " ஒதுக்குங்கள்.") + "</p>");
          }
        });
        var e = d.end, last = i === p.days.length - 1;
        var town = tn(e && e.id ? STAY[e.id] : (e && e.name));
        if (!last && d.onTrain) lines.push('<div class="meta stay">' + L("Sleep on the train.", "இரவு ரயிலிலேயே உறக்கம்.") + "</div>");
        else if (!last && town) lines.push('<div class="meta stay">' + L("Stay: ", "தங்குமிடம்: ") + town + "</div>");
        if (last && !p.round) lines.push('<div class="meta stay">' + L("Head home from " + town + ".", "பயண முடிவு: " + town + ". அங்கிருந்து வீடு திரும்புங்கள்.") + "</div>");
        if (last && p.round) lines.push('<div class="meta stay">' + L("Back in " + startName + ".", "மீண்டும் " + startName + " வந்தடைதல்.") + "</div>");
      }
      return '<li><span class="day">' + L("Day ", "நாள் ") + (i + 1) + '</span><div><div class="leg">' + title + "</div>" + lines.join("") + "</div></li>";
    }).join("");
    document.getElementById("route").innerHTML = html;
    lastPlan = p;
  }
  var lastPlan = null;

  function planText(p) {
    var m = MODE[p.mode], startName = tn(p.start.name);
    var out = [L("Aaru Padai trip plan: " + p.days.length + " days from " + startName + " by " + m.label,
      "ஆறுபடை வீடு பயணத் திட்டம்: " + p.days.length + " நாட்கள். புறப்படும் இடம்: " + startName + ", பயண வகை: " + m.taLabel), ""];
    p.days.forEach(function (d, i) {
      var day = L("Day ", "நாள் ") + (i + 1) + ": ";
      if (d.spare) { out.push(day + L("Rest day in " + d.town, "ஓய்வு நாள், " + tn(d.town))); return; }
      var parts = d.items.map(function (it) {
        if (it.type === "travel") return it.from + " → " + it.to + " (" + it.km + KM + ")";
        if (it.type === "visit") return L("darshan at " + aname(it.id), aname(it.id) + " தரிசனம்");
        return L("arrive " + it.place, it.place + " வந்தடைதல்");
      });
      out.push(day + parts.join(", "));
    });
    out.push("", L("Distances and times are estimates.", "தூரமும் நேரமும் தோராயமானவை."));
    return out.join("\n");
  }

  var form = document.getElementById("planner");
  var KEYP = "aarupadai-planner";
  try { var sv = JSON.parse(localStorage.getItem(KEYP) || "null"); if (sv) Object.keys(sv).forEach(function (k) { var el = document.getElementById("p-" + k); if (el && sv[k]) el.value = sv[k]; }); } catch (e) {}
  function readOpts() {
    return { start: document.getElementById("p-start").value, days: +document.getElementById("p-days").value,
      mode: document.getElementById("p-mode").value, order: document.getElementById("p-order").value, ret: document.getElementById("p-ret").value };
  }
  function update() {
    var o = readOpts();
    try { localStorage.setItem(KEYP, JSON.stringify(o)); } catch (e) {}
    render(plan(o));
  }
  form.addEventListener("change", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); update(); });
  document.getElementById("p-copy").addEventListener("click", function () {
    var btn = this, txt = planText(lastPlan), label = btn.textContent;
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = label; }, 2000); }
    copyText(txt).then(function () { done(L("Copied", "நகலெடுக்கப்பட்டது")); }, function () { done(L("Copy failed: select the plan text instead", "நகலெடுக்க முடியவில்லை: திட்டத்தைத் தேர்ந்தெடுத்து நகலெடுக்கவும்")); });
  });
  update();
  })();

  // Checklist (remembered on this device only)
  var items = TA
    ? ["வேட்டி, அல்லது புடவை / சுடிதார்", "கடல் நீராடலுக்குத் துண்டும் மாற்று உடையும்", "காணிக்கைப் பொருட்களுக்குப் பிளாஸ்டிக் இல்லாத பை", "கவுண்டர்களுக்குச் சில்லறை நோட்டுகள்", "முன்பதிவு உறுதிச்சீட்டு, அச்சிட்டோ கைபேசியில் சேமித்தோ", "தண்ணீர் பாட்டிலும், கடற்கரை வெயிலுக்குத் தொப்பியும்", "யாருக்காக வேண்டிக்கொள்கிறீர்கள் என்ற பட்டியல்"]
    : ["Veshti / dhoti or saree / churidar", "Towel and a change of clothes for the sea bath", "Plastic-free bag for offerings", "Cash in small notes for counters", "Printed or saved booking confirmation", "Water bottle and sun cap for the beach", "A list of who you are praying for"];
  var KEY = "aarupadai-checklist-thiruchendur";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }
  var cl = document.getElementById("checklist");
  if (cl) {
  cl.innerHTML = items.map(function (t, i) {
    return '<label for="ck' + i + '"><input type="checkbox" id="ck' + i + '"' + (saved[i] ? " checked" : "") + "><span>" + t + "</span></label>";
  }).join("");
  cl.addEventListener("change", function (e) {
    var i = e.target.id.replace("ck", ""); saved[i] = e.target.checked;
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (err) {}
  });
  document.getElementById("reset-list").addEventListener("click", function () {
    saved = {}; cl.querySelectorAll("input").forEach(function (c) { c.checked = false; });
    try { localStorage.removeItem(KEY); } catch (err) {}
  });
  }

  // In-page jump links (no hash change, so page routing stays intact)
  document.querySelectorAll("[data-jump]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.getElementById(b.getAttribute("data-jump"));
      if (t) t.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });


  // ---------- Open now ----------
  // Usual daily hours (India time), kept in step with the timings on each temple page.
  var HOURS = {
    thiruparankundram: [["05:00", "13:00"], ["16:00", "21:00"]],
    thiruchendur: [["04:00", "21:00"]],
    palani: [["05:45", "20:00"]],
    swamimalai: [["06:00", "12:30"], ["16:00", "21:00"]],
    thiruthani: [["05:45", "20:45"]],
    pazhamudircholai: [["06:00", "18:00"]]
  };
  var LAST_ENTRY = { thiruchendur: "19:30" }; // free queue entry stops before the doors close
  function mins(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function clock(m) { var h = Math.floor(m / 60) % 24, mm = m % 60, ap = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return h + ":" + (mm < 10 ? "0" : "") + mm + " " + ap; }
  function clockTa(m) {
    var h = Math.floor(m / 60) % 24, mm = m % 60, part = h < 6 ? "அதிகாலை" : h < 12 ? "காலை" : h < 16 ? "மதியம்" : h < 19 ? "மாலை" : "இரவு";
    return part + " " + (h % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm;
  }
  function clk(m) { return TA ? clockTa(m) : clock(m); }
  function openStatus(id) {
    var ist = new Date(Date.now() + 330 * 60000), now = ist.getUTCHours() * 60 + ist.getUTCMinutes(), slots = HOURS[id];
    for (var i = 0; i < slots.length; i++) {
      var o = mins(slots[i][0]), c = mins(slots[i][1]);
      if (now < o) return { cls: "closed", text: i ? L("Closed for the afternoon · reopens " + clk(o), "மதிய நேரம் நடை சாத்தப்பட்டுள்ளது · மீண்டும் திறப்பு " + clk(o))
        : L("Closed now · opens " + clk(o), "இப்போது நடை சாத்தப்பட்டுள்ளது · திறப்பு " + clk(o)) };
      if (now < c) {
        var le = LAST_ENTRY[id] ? mins(LAST_ENTRY[id]) : null;
        if (le !== null && now >= le) return { cls: "soon", text: L("Queue closed for today · doors close " + clk(c), "இன்றைய வரிசை முடிந்தது · நடை சாத்துதல் " + clk(c)) };
        var next = i < slots.length - 1 ? L(", reopens ", ", மீண்டும் திறப்பு ") + clk(mins(slots[i + 1][0])) : "";
        if (c - now <= 60) return { cls: "soon", text: L("Closing soon · closes ", "விரைவில் நடை சாத்தப்படும் · ") + clk(c) + next };
        return { cls: "open", text: L("Open now · closes ", "இப்போது திறந்துள்ளது · நடை சாத்துதல் ") + clk(c) + next };
      }
    }
    return { cls: "closed", text: L("Closed now · opens " + clk(mins(slots[0][0])) + " tomorrow", "இப்போது நடை சாத்தப்பட்டுள்ளது · நாளை திறப்பு " + clk(mins(slots[0][0]))) };
  }
  function showStatus() {
    document.querySelectorAll("[data-status]").forEach(function (el) {
      var st = openStatus(el.getAttribute("data-status"));
      el.className = el.className.replace(/\b(open|soon|closed)\b/g, "").trim() + " " + st.cls;
      el.textContent = st.text;
    });
  }
  if (HOURS[PAGE]) {
    var factsRow = document.querySelector(".temple-hero .facts");
    if (factsRow) factsRow.insertAdjacentHTML("afterbegin", '<span class="fact status" data-status="' + PAGE + '"></span>');
  }
  document.querySelectorAll(".abode").forEach(function (card) {
    var id = idFromHref(card.getAttribute("href")), place = card.querySelector(".place");
    if (HOURS[id] && place) place.insertAdjacentHTML("afterend", '<span class="status" data-status="' + id + '"></span>');
  });
  showStatus(); setInterval(showStatus, 60000);
  if (PAGE === "home" && document.getElementById("abode-list")) {
    var hd = document.querySelector("#abodes .section-head .quiet");
    if (hd) hd.insertAdjacentHTML("beforeend", L(" Open and closed times show the usual daily hours, in India time. Festival days differ.", " திறந்திருக்கும் நேரம், வழக்கமான தினசரி நேரத்தின்படி (இந்திய நேரம்). திருவிழா நாட்களில் மாறும்."));
  }

  // ---------- Murugan calendar ----------
  var DAYS = window.MURUGAN_DAYS || [];
  var MON = TA ? ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WDAY = TA ? ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function todayIST() { return new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10); }
  function dayDiff(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
  function nice(iso) { var d = new Date(iso + "T00:00:00Z"); return WDAY[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[d.getUTCMonth()]; }
  function when(n) { return n === 0 ? L("Today", "இன்று") : n === 1 ? L("Tomorrow", "நாளை") : L("in " + n + " days", "இன்னும் " + n + " நாட்களில்"); }
  function upcoming(n) {
    var t = todayIST(), out = [];
    for (var i = 0; i < DAYS.length && out.length < n; i++) if (DAYS[i].date >= t) out.push(DAYS[i]);
    return out;
  }
  // Home page strip
  var band = document.getElementById("next-day");
  if (band && DAYS.length) {
    var nx = upcoming(2), t0 = todayIST();
    if (nx.length) {
      var e0 = nx[0], n0 = dayDiff(t0, e0.date);
      band.querySelector(".wrap").innerHTML = '<span class="next-label">' + (n0 === 0 ? L("Today", "இன்று") : L("Next Murugan day", "அடுத்த முருகன் விசேஷ நாள்")) + '</span> ' +
        (TA ? '<b>' + e0.ta + '</b>' : '<b>' + e0.name + '</b> <span lang="ta">' + e0.ta + '</span>') + ' · ' + nice(e0.date) + (n0 > 0 ? " · " + when(n0) : "") +
        ' <a href="' + link("calendar") + '">' + L("See all dates", "எல்லா நாட்களும்") + '</a>';
      band.hidden = false;
    }
  }
  // Calendar page
  var cal = document.getElementById("cal");
  if (cal) {
    var t1 = todayIST();
    cal.querySelectorAll("li.cal-day").forEach(function (li) {
      var d = li.getAttribute("data-date");
      if (d < t1) li.classList.add("past");
      if (d === t1) { li.classList.add("today"); li.querySelector(".cal-name").insertAdjacentHTML("afterbegin", '<span class="today-tag">Today</span> '); }
    });
    var nextBox = document.getElementById("cal-next"), up3 = upcoming(3);
    if (nextBox && up3.length) {
      nextBox.innerHTML = '<h2 class="cal-next-h">Coming up</h2>' + up3.map(function (e) {
        var n = dayDiff(t1, e.date);
        return '<div class="cal-next-item' + (e.major ? " major" : "") + '"><span class="when">' + when(n) + '</span><b>' + e.name + '</b> <span lang="ta">' + e.ta + '</span><span class="date">' + nice(e.date) + '</span></div>';
      }).join("");
      nextBox.hidden = false;
    }
    function applyFilter(k) {
      cal.querySelectorAll("li.cal-day").forEach(function (li) {
        var kind = li.getAttribute("data-kind"), nm = li.querySelector(".cal-name").textContent;
        var show = k === "all" || kind === k || (k === "sashti" && kind === "sashti-t") ||
          (k === "krithigai" && /Krithigai|Karthigai/.test(nm) && kind === "festival") ||
          (k === "sashti" && /Sashti|Soorasamharam/.test(nm) && kind === "festival") ||
          (k === "visakam" && /Visakam/.test(nm) && kind === "festival");
        li.hidden = !show || li.classList.contains("past");
      });
      cal.querySelectorAll("h3.cal-month").forEach(function (h) {
        var ol = h.nextElementSibling, any = ol && ol.querySelector("li:not([hidden])");
        h.hidden = ol.hidden = !any;
      });
    }
    document.querySelectorAll(".chips [data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".chips [data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        applyFilter(b.getAttribute("data-filter"));
      });
    });
    applyFilter("all");
  }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var label = b.textContent, url = b.getAttribute("data-copy");
      function done(m) { b.textContent = m; setTimeout(function () { b.textContent = label; }, 2000); }
      copyText(url).then(function () { done(L("Link copied", "இணைப்பு நகலெடுக்கப்பட்டது")); }, function () {
        // Copying is blocked: show the link, selected, so it can be copied by hand.
        var box = b.parentNode.querySelector("input.copy-box");
        if (!box) { b.insertAdjacentHTML("afterend", '<input class="copy-box" type="text" readonly aria-label="Calendar link" value="' + url + '">'); box = b.nextElementSibling; }
        box.focus(); box.select(); done(L("Copy this link", "இந்த இணைப்பை நகலெடுக்கவும்"));
      });
    });
  });

  // ---------- Sharing and corrections ----------
  // One setting: the public address comes from the og:url tag in <head>.
  var SITE_URL = (document.querySelector('meta[property="og:url"]') || {}).content || "";
  SITE_URL = SITE_URL.replace(/^(https?:\/\/[^\/]+).*$/, "$1");
  var SITE_READY = SITE_URL && SITE_URL.indexOf("YOUR-SITE-ADDRESS") < 0;
  // Google Form for corrections. Paste the form link and the two entry IDs here.
  var CORRECTION_FORM = { url: "https://docs.google.com/forms/d/e/1FAIpQLSfKcKkcT0c96UPqZuXVXNyTJsmi2LePOsTTAcV7oxFfowifzQ/viewform", entryPage: "entry.228261771", entrySection: "entry.1367748000" };

  function currentView() { return PAGE; }
  function pageUrl(view) {
    if (!SITE_READY) return location.href.split("#")[0];
    return SITE_URL + (TA ? "/ta/" : "/") + (view === "home" ? "" : view);
  }
  function shareText(view) {
    if (view === "home") return L("Aaru Padai: a pilgrim's guide to the six abodes of Lord Murugan, with timings, costs and a trip planner. ",
      "ஆறுபடை வீடு: முருகப்பெருமானின் ஆறு படை வீடுகளுக்கான யாத்திரை வழிகாட்டி. தரிசன நேரம், கட்டணம், பயணத் திட்டம். ") + pageUrl(view);
    var a = byId[view];
    return L(a.name + " (" + a.ta + "): darshan timings, ticket costs and how to reach, on Aaru Padai. ",
      a.ta + ": தரிசன நேரம், டிக்கெட் கட்டணம், செல்லும் வழி. ஆறுபடை வீடு வழிகாட்டியில். ") + pageUrl(view);
  }
  function updateShare() {
    var v = currentView();
    document.querySelectorAll("[data-share]").forEach(function (el) {
      el.href = "https://wa.me/?text=" + encodeURIComponent(shareText(v));
    });
  }
  function toast(msg) {
    var t = document.getElementById("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 4000);
  }
  function fixUrl(section) {
    if (!CORRECTION_FORM.url) return null;
    var v = currentView(), page = byId[v] ? byId[v].name : (v === "home" ? "Home" : v);
    if (TA) page += " (Tamil)";
    return CORRECTION_FORM.url + (CORRECTION_FORM.url.indexOf("?") < 0 ? "?" : "&") + "usp=pp_url" +
      "&" + CORRECTION_FORM.entryPage + "=" + encodeURIComponent(page) +
      "&" + CORRECTION_FORM.entrySection + "=" + encodeURIComponent(section);
  }
  // Add a "Suggest a correction" link after every "last checked" note on temple pages.
  document.querySelectorAll(PAGE === "home" ? 'p.checked.none' : 'main p.checked').forEach(function (p) {
    var nx = p.nextElementSibling; if (nx && nx.matches('p.checked')) return;
    var box = p.closest(".panel") || p.closest("section"), h = box && box.querySelector("h2, h3");
    var name = h ? h.textContent.trim() : "General";
    p.insertAdjacentHTML("beforeend", ' · <a class="fix" href="#" data-fix="' + name.replace(/"/g, "") + '">' + L("Suggest a correction", "திருத்தம் தெரிவிக்க") + "</a>");
  });
  function updateFix() {
    document.querySelectorAll("a.fix").forEach(function (a) {
      var u = fixUrl(a.getAttribute("data-fix"));
      if (u) { a.href = u; a.rel = "noopener"; a.removeAttribute("data-pending"); }
      else { a.setAttribute("data-pending", ""); }
    });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.fix[data-pending]");
    if (a) { e.preventDefault(); toast(L("The corrections form is not connected yet. It will open a short Google Form.", "திருத்தப் படிவம் இன்னும் இணைக்கப்படவில்லை.")); }
  });
  updateShare(); updateFix();

})();

// Visitor stats (GoatCounter): free, no cookies, no personal data. Does nothing on localhost or when opened as a file.
(function () {
  var GC = "https://aarupadaiveedu.goatcounter.com/count";
  if (!/^https?:$/.test(location.protocol)) return;
  var s = document.createElement("script");
  s.async = true; s.src = "https://gc.zgo.at/count.js"; s.setAttribute("data-goatcounter", GC);
  document.head.appendChild(s);

  // Count useful clicks as events, so we can see what pilgrims actually use.
  function send(name) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: document.title, event: true });
  }
  var page = location.pathname.replace(/^\/|\.html$/g, "") || "home";
  document.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("a, button");
    if (!el) return;
    var href = el.getAttribute("href") || "", txt = el.textContent.trim();
    if (el.matches(".sub")) {
      var which = /festivals/.test(href + (el.getAttribute("data-copy") || "")) ? "festivals" : "all-days";
      send("subscribe/" + which + "/" + (el.hasAttribute("data-copy") ? "copy-link" : txt.replace(/\s*\(.*\)/, "").toLowerCase().replace(/\s+/g, "-")));
    }
    else if (href.indexOf("tel:") === 0) send("call/" + page);
    else if (/google\.com\/maps/.test(href)) send("maps/" + page);
    else if (el.hasAttribute("data-share")) send("whatsapp-share/" + page);
    else if (el.id === "p-copy") send("planner/copy-plan");
    else if (el.matches("a.fix") && !el.hasAttribute("data-pending")) send("suggest-correction/" + page);
  });
})();

// Contact link: the address is only put together when someone clicks, so it never appears in the page for spam bots.
(function () {
  function rev(s) { return s.split("").reverse().join(""); }
  var P = ["udeeviadapuraaotediug", "moc.liamg"];
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.contact");
    if (!a) return;
    e.preventDefault();
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "contact", title: document.title, event: true });
    location.href = "mailto:" + rev(P[0]) + "@" + rev(P[1]) + "?subject=" + encodeURIComponent("Aaru Padai website");
  });
})();
