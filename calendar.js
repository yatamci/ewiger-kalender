// ============================================================
// EWIGER KALENDER – Version 3
// Neue Monatsnamen, neues Datumsformat, 3x5 Raster
// DST-sicher + Timezone-sicher
// ============================================================

const MONTHS = [
  { num: 1,  name: "Nivara",  sub: "Schneezeit",     season: "winter", emoji: "❄️" },
  { num: 2,  name: "Aurora",  sub: "Morgenröte",     season: "winter", emoji: "❄️" },
  { num: 3,  name: "Viridia", sub: "Grünwerden",     season: "spring", emoji: "🌸" },
  { num: 4,  name: "Floris",  sub: "Blütezeit",      season: "spring", emoji: "🌸" },
  { num: 5,  name: "Solara",  sub: "Sonnenaufbruch", season: "spring", emoji: "🌸" },
  { num: 6,  name: "Luminis", sub: "Lichtzeit",      season: "summer", emoji: "☀️" },
  { num: 7,  name: "Calora",  sub: "Wärmezeit",      season: "summer", emoji: "☀️" },
  { num: 8,  name: "Helia",   sub: "Sonnenhöhe",     season: "summer", emoji: "☀️" },
  { num: 9,  name: "Fructa",  sub: "Erntezeit",       season: "summer", emoji: "☀️" },
  { num: 10, name: "Aurelia", sub: "Goldzeit",       season: "autumn", emoji: "🍂" },
  { num: 11, name: "Ventis",  sub: "Windzeit",       season: "autumn", emoji: "🍂" },
  { num: 12, name: "Umbra",   sub: "Schattenzeit",   season: "autumn", emoji: "🍂" },
  { num: 13, name: "Noctis",  sub: "Dunkelzeit",     season: "winter", emoji: "❄️" },
];

const SEASON_STARTS = [
  { month: 3,  day: 8,  label: "🌸 Frühlingsanfang 🌸", cls: "season-start-spring" },
  { month: 6,  day: 15, label: "☀️ Sommeranfang ☀️",    cls: "season-start-summer" },
  { month: 9,  day: 22, label: "🍂 Herbstanfang 🍂",     cls: "season-start-autumn" },
  { month: 13, day: 1,  label: "❄️ Winteranfang ❄️",    cls: "season-start-winter" },
];

// Gibt die tatsächliche Jahreszeit für ein ewiges Datum zurück,
// basierend auf den Jahreszeitenanfängen (nicht dem Monat)
// Winteranfang: Noctis 1 (Monat 13, Tag 1)  = doy (13-1)*28+1 = 337
// Frühlingsanfang: Viridia 8 (Monat 3, Tag 8) = doy (3-1)*28+8 = 64
// Sommeranfang: Luminis 15 (Monat 6, Tag 15) = doy (6-1)*28+15 = 155
// Herbstanfang: Fructa 22 (Monat 9, Tag 22)  = doy (9-1)*28+22 = 246
function calendarSeason(doy) {
  if (doy < 64)  return "winter";  // Nivara 1 – Viridia 7
  if (doy < 155) return "spring";  // Viridia 8 – Luminis 14
  if (doy < 246) return "summer";  // Luminis 15 – Fructa 21
  if (doy < 337) return "autumn";  // Fructa 22 – Noctis 0 (d.h. bis Umbra 28)
  return "winter";                 // Noctis 1 – Unara/Intera
}


const WEEKDAYS_SHORT = ["Mo","Di","Mi","Do","Fr","Sa","So"];

// ============================================================
// DST-SICHERE HILFSFUNKTIONEN
// ============================================================

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function dayOfYear(date) {
  const startUTC = Date.UTC(date.getFullYear(), 0, 1);
  const dateUTC  = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((dateUTC - startUTC) / 86400000) + 1;
}

function toLocalDateStr(date) {
  return date.getFullYear()
    + "-" + String(date.getMonth() + 1).padStart(2, "0")
    + "-" + String(date.getDate()).padStart(2, "0");
}

function fromLocalDateStr(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ============================================================
// KONVERTIERUNG: Gregorianisch → Ewig
// ============================================================
function gregToEwig(date) {
  const year = date.getFullYear();
  const doy  = dayOfYear(date);
  const leap = isLeapYear(year);

  if (doy === 365) {
    return { year, month: 0, day: 1, monthName: "Unara", monthSub: "Zeitloser Tag",
             season: "winter", emoji: "✨", weekday: null, isUnara: true, isIntera: false };
  }
  if (leap && doy === 366) {
    return { year, month: 0, day: 2, monthName: "Intera", monthSub: "Zeitloser Tag",
             season: "winter", emoji: "🌟", weekday: null, isUnara: false, isIntera: true };
  }

  const monthIdx = Math.floor((doy - 1) / 28);
  const day      = ((doy - 1) % 28) + 1;
  const weekday  = (day - 1) % 7;
  const m        = MONTHS[monthIdx];

  return { year, month: m.num, day,
           monthName: m.name, monthSub: m.sub,
           season: m.season,           // Monats-Jahreszeit (für Randfarbe der Karte)
           popupSeason: calendarSeason(doy), // Echte Jahreszeit (für Popup-Farbe)
           emoji: m.emoji,
           weekday, isUnara: false, isIntera: false };
}

// ============================================================
// KONVERTIERUNG: Ewig → Gregorianisch
// ============================================================
function ewigToGreg(year, month, day) {
  const doy = month === 0 ? (day === 2 ? 366 : 365) : (month - 1) * 28 + day;
  return new Date(year, 0, doy);
}

// ============================================================
// FORMATIERUNG
// ============================================================

function formatGreg(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// "Donnerstag, 18. Solara 2026" – kein Emoji
function formatEwigReadable(ewig) {
  if (ewig.isUnara)  return "Unara " + ewig.year;
  if (ewig.isIntera) return "Intera " + ewig.year;
  return WEEKDAY_NAMES[ewig.weekday] + ", " + ewig.day + ". " + ewig.monthName + " " + ewig.year;
}

// ============================================================
// HEUTE RENDERN
// ============================================================
function renderToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ewig = gregToEwig(today);

  document.getElementById("greg-today").textContent = formatGreg(today);

  const ewigEl = document.getElementById("ewig-today");
  ewigEl.textContent = formatEwigReadable(ewig);
  ewigEl.className = "today-date ewig-date season-text-" + ewig.season;
}

// ============================================================
// JAHRESÜBERSICHT – 3×5 Raster
// Zeilen 1–4: je 3 Monate (Monate 1–12)
// Zeile 5: Monat 13 + Unara-Karte + Intera-Karte
// ============================================================
let currentYear = new Date().getFullYear();

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;
  const leap     = isLeapYear(year);
  const todayStr = toLocalDateStr(new Date());
  const grid     = document.getElementById("year-grid");
  grid.innerHTML = "";

  // Zeilen 1–4: Monate 1–12
  for (let row = 0; row < 4; row++) {
    const rowEl = document.createElement("div");
    rowEl.className = "year-months-row";
    for (let col = 0; col < 3; col++) {
      rowEl.appendChild(buildMonthCard(year, row * 3 + col + 1, todayStr));
    }
    grid.appendChild(rowEl);
  }

  // Zeile 5: Monat 13 + Unara + Intera
  const lastRow = document.createElement("div");
  lastRow.className = "year-months-row";
  lastRow.appendChild(buildMonthCard(year, 13, todayStr));
  lastRow.appendChild(buildUnaraCard(year, todayStr));
  lastRow.appendChild(buildInteraCard(year, leap, todayStr));
  grid.appendChild(lastRow);

  // Klick-Handler nur für reguläre Tage
  grid.querySelectorAll(".year-day[data-greg]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(el.dataset.greg, e);
    });
  });
}

function buildMonthCard(year, mNum, todayStr) {
  const mData = MONTHS[mNum - 1];
  const card  = document.createElement("div");
  const displayEmoji = mNum === 6 ? "🌸/☀️" : mData.emoji;
  const borderClass = mNum === 6 ? "month-luminis" : "month-" + mData.season;
  card.className = "year-month-card glass-card " + borderClass;
  card.className = "year-month-card glass-card " + borderClass;

  const daysHtml = Array.from({ length: 28 }, (_, i) => {
    const d        = i + 1;
    const gregDate = ewigToGreg(year, mNum, d);
    const gregStr  = toLocalDateStr(gregDate);
    const isToday  = gregStr === todayStr ? " today" : "";
    return '<span class="year-day' + isToday + '" data-greg="' + gregStr + '">' + d + '</span>';
  }).join("");

  card.innerHTML =
    '<div class="year-month-header">' +
      '<span class="year-month-emoji">' + displayEmoji + '</span>' +
      '<span class="year-month-name">' + mData.name + '</span>' +
      '<span class="year-month-sub">' + mData.sub + '</span>' +
    '</div>' +
    '<div class="year-cal-header">' + WEEKDAYS_SHORT.map(d => '<span>' + d + '</span>').join("") + '</div>' +
    '<div class="year-cal-days">' + daysHtml + '</div>';

  return card;
}

// Unara: Info direkt im Feld, kein Popup
function buildUnaraCard(year, todayStr) {
  const card = document.createElement("div");
  card.className = "year-month-card year-special-card glass-card month-special";

  const unaraDate = ewigToGreg(year, 0, 1);
  const unaraStr  = toLocalDateStr(unaraDate);
  const isToday   = unaraStr === todayStr;

  card.innerHTML =
    '<div class="special-card-title' + (isToday ? ' special-today' : '') + '">Unara ' + year + '</div>' +
    '<div class="special-card-sub">Zeitloser Tag</div>' +
    '<div class="special-card-greg">' + formatGreg(unaraDate) + '</div>';

  return card;
}

// Intera: Info direkt im Feld, ausgegraut wenn kein Schaltjahr
function buildInteraCard(year, leap, todayStr) {
  const card = document.createElement("div");
  card.className = "year-month-card year-special-card glass-card month-special" + (leap ? "" : " special-disabled");

  if (leap) {
    const interaDate = ewigToGreg(year, 0, 2);
    const interaStr  = toLocalDateStr(interaDate);
    const isToday    = interaStr === todayStr;

    card.innerHTML =
      '<div class="special-card-title' + (isToday ? ' special-today' : '') + '">Intera ' + year + '</div>' +
      '<div class="special-card-sub">Zeitloser Tag</div>' +
      '<div class="special-card-greg">' + formatGreg(interaDate) + '</div>';
  } else {
    const nextLeap = getNextLeapYear(year);
    card.innerHTML =
      '<div class="special-card-title">Intera</div>' +
      '<div class="special-card-sub">Zeitloser Tag</div>' +
      '<div class="special-card-next">Nächstes Schaltjahr: ' + nextLeap + '</div>';
  }

  return card;
}

function getNextLeapYear(from) {
  let y = from + 1;
  while (!isLeapYear(y)) y++;
  return y;
}

// ============================================================
// POPUP – Jahreszeitenanfang zuerst, dann Ewig, dann Greg
// ============================================================
function showPopup(gregDateStr, event) {
  const date    = fromLocalDateStr(gregDateStr);
  const ewig    = gregToEwig(date);
  const card    = document.getElementById("popup-card");
  const content = document.getElementById("popup-content");

  // Jahreszeitenanfang (ganz oben)
  let seasonStartHtml = "";
  if (!ewig.isUnara && !ewig.isIntera) {
    const ss = SEASON_STARTS.find(s => s.month === ewig.month && s.day === ewig.day);
    if (ss) seasonStartHtml = '<div class="popup-season-start ' + ss.cls + '">' + ss.label + '</div>';
  }

  const popupSeason = ewig.isUnara || ewig.isIntera ? "winter" : ewig.popupSeason;

  content.innerHTML =
    seasonStartHtml +
    '<div class="popup-ewig season-' + popupSeason + '">' + formatEwigReadable(ewig) + '</div>' +
    '<div class="popup-greg">' + formatGreg(date) + '</div>';

  card.style.visibility = "hidden";
  card.style.display    = "block";

  requestAnimationFrame(() => {
    const cardW  = card.offsetWidth;
    const cardH  = card.offsetHeight;
    const margin = 10;
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;

    let x = event.clientX;
    let y = event.clientY + 14;

    if (x + cardW + margin > vw) x = event.clientX - cardW - margin;
    if (x < margin) x = margin;
    if (y + cardH + margin > vh) y = event.clientY - cardH - 8;
    if (y < margin) y = margin;

    card.style.left       = x + "px";
    card.style.top        = y + "px";
    card.style.visibility = "visible";
    card.classList.add("popup-open");
  });
}

function hidePopup() {
  const card = document.getElementById("popup-card");
  card.classList.remove("popup-open");
  card.style.display = "none";
}

// ============================================================
// DARK MODE
// ============================================================
function setupDarkMode() {
  const btn  = document.getElementById("darkmode-toggle");
  const html = document.documentElement;
  const icon = btn.querySelector(".toggle-icon");

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved   = localStorage.getItem("ewiger-theme");
  const initial = saved || (prefersDark ? "dark" : "light");
  html.setAttribute("data-theme", initial);
  icon.textContent = initial === "dark" ? "☀️" : "🌙";

  btn.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("ewiger-theme", next);
    icon.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

// ============================================================
// KONVERTER
// ============================================================
function setupConverter() {
  const today = new Date();
  document.getElementById("greg-day-in").value   = today.getDate();
  document.getElementById("greg-month-in").value = today.getMonth() + 1;
  document.getElementById("greg-year-in").value  = today.getFullYear();
  document.getElementById("ewig-year").value     = today.getFullYear();

  document.getElementById("btn-greg-to-ewig").addEventListener("click", () => {
    const day   = parseInt(document.getElementById("greg-day-in").value);
    const month = parseInt(document.getElementById("greg-month-in").value);
    const year  = parseInt(document.getElementById("greg-year-in").value);
    if (!day || !month || !year) return;

    const date = new Date(year, month - 1, day);
    const ewig = gregToEwig(date);
    const el   = document.getElementById("result-greg-to-ewig");
    const popupSeason = ewig.isUnara || ewig.isIntera ? "winter" : ewig.popupSeason;

    // Jahreszeitenanfang prüfen
    let ssHtml = "";
    if (!ewig.isUnara && !ewig.isIntera) {
      const ss = SEASON_STARTS.find(s => s.month === ewig.month && s.day === ewig.day);
      if (ss) ssHtml = '<div class="converter-season-start ' + ss.cls + '">' + ss.label + '</div>';
    }

    el.innerHTML =
      ssHtml +
      '<div class="result-main season-' + popupSeason + '"><div class="result-big">' + formatEwigReadable(ewig) + '</div></div>';
    el.classList.add("show");
  });

  document.getElementById("btn-ewig-to-greg").addEventListener("click", () => {
    const day   = parseInt(document.getElementById("ewig-day").value) || 1;
    const month = parseInt(document.getElementById("ewig-month").value);
    const year  = parseInt(document.getElementById("ewig-year").value);
    if (!year || isNaN(month)) return;

    const clampedDay = month !== 0 ? Math.max(1, Math.min(28, day)) : day;
    const gregDate = ewigToGreg(year, month, clampedDay);
    const el = document.getElementById("result-ewig-to-greg");
    el.innerHTML = '<div class="result-main"><div class="result-big">' + formatGreg(gregDate) + '</div></div>';
    el.classList.add("show");
  });

  document.getElementById("ewig-month").addEventListener("change", (e) => {
    const isSpecial = e.target.value === "0";
    document.getElementById("ewig-day").placeholder = isSpecial ? "1=Unara, 2=Intera" : "1–28";
    document.getElementById("ewig-day").max = isSpecial ? "2" : "28";
  });
}

// ============================================================
// TABS & NAVIGATION
// ============================================================
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });
}

function setupYearNav() {
  document.getElementById("btn-year-prev").addEventListener("click", () => { currentYear--; renderYearGrid(currentYear); });
  document.getElementById("btn-year-next").addEventListener("click", () => { currentYear++; renderYearGrid(currentYear); });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  renderToday();
  setupConverter();
  setupTabs();
  setupYearNav();
  renderYearGrid(currentYear);

  document.addEventListener("click", (e) => {
    const card = document.getElementById("popup-card");
    if (!card.classList.contains("popup-open")) return;
    if (!card.contains(e.target)) hidePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePopup();
  });
});
