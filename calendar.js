// ============================================================
// EWIGER KALENDER – Kalenderlogik & UI
// DST-sicher: dayOfYear via Date.UTC
// Timezone-sicher: kein toISOString(), nur lokale Datumswerte
// ============================================================

const MONTHS = [
  { num: 1,  name: "Aurora",   sub: "Morgenröte",     season: "winter", emoji: "❄️" },
  { num: 2,  name: "Floris",   sub: "Blütezeit",      season: "winter", emoji: "❄️" },
  { num: 3,  name: "Viridia",  sub: "Grünwerden",     season: "spring", emoji: "🌸" },
  { num: 4,  name: "Solara",   sub: "Sonnenaufbruch", season: "spring", emoji: "🌸" },
  { num: 5,  name: "Crescera", sub: "Wachstum",       season: "spring", emoji: "🌸" },
  { num: 6,  name: "Luminis",  sub: "Lichtzeit",      season: "summer", emoji: "☀️" },
  { num: 7,  name: "Aestas",   sub: "Hochsommer",     season: "summer", emoji: "☀️" },
  { num: 8,  name: "Helion",   sub: "Sonnenhöhe",     season: "summer", emoji: "☀️" },
  { num: 9,  name: "Fructa",   sub: "Ernte",          season: "summer", emoji: "☀️" },
  { num: 10, name: "Aurelia",  sub: "Goldzeit",       season: "autumn", emoji: "🍂" },
  { num: 11, name: "Ventis",   sub: "Windzeit",       season: "autumn", emoji: "🍂" },
  { num: 12, name: "Nivara",   sub: "Schneezeit",     season: "autumn", emoji: "🍂" },
  { num: 13, name: "Noctis",   sub: "Dunkelzeit",     season: "winter", emoji: "❄️" },
];

const SEASON_STARTS = [
  { month: 3,  day: 8,  label: "🌸 Frühlingsanfang 🌸", cls: "season-start-spring" },
  { month: 6,  day: 15, label: "☀️ Sommeranfang ☀️",    cls: "season-start-summer" },
  { month: 9,  day: 22, label: "🍂 Herbstanfang 🍂",     cls: "season-start-autumn" },
  { month: 13, day: 1,  label: "❄️ Winteranfang ❄️",    cls: "season-start-winter" },
];

const WEEKDAY_NAMES  = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
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
           season: m.season, emoji: m.emoji,
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

function formatEwigDisplay(ewig) {
  if (ewig.isUnara)  return `Unara ✨ ${ewig.year}`;
  if (ewig.isIntera) return `Intera 🌟 ${ewig.year}`;
  return `${WEEKDAY_NAMES[ewig.weekday]} ${ewig.emoji} ${ewig.monthName} ${ewig.day} ${ewig.emoji} ${ewig.year}`;
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
  ewigEl.textContent = formatEwigDisplay(ewig);
  ewigEl.className = `today-date ewig-date season-text-${ewig.season}`;
}

// ============================================================
// JAHRESÜBERSICHT
// ============================================================
let currentYear = new Date().getFullYear();

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;
  const leap     = isLeapYear(year);
  const todayStr = toLocalDateStr(new Date());
  const grid     = document.getElementById("year-grid");
  grid.innerHTML = "";

  const row = document.createElement("div");
  row.className = "year-months-row";

  for (let mNum = 1; mNum <= 13; mNum++) {
    row.appendChild(buildMonthCard(year, mNum, todayStr));
  }
  row.appendChild(buildSpecialCard(year, leap, todayStr));
  grid.appendChild(row);

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
  card.className = `year-month-card glass-card month-${mData.season}`;

  const daysHtml = Array.from({ length: 28 }, (_, i) => {
    const d        = i + 1;
    const gregDate = ewigToGreg(year, mNum, d);
    const gregStr  = toLocalDateStr(gregDate);
    const isToday  = gregStr === todayStr ? " today" : "";
    return `<span class="year-day${isToday}" data-greg="${gregStr}">${d}</span>`;
  }).join("");

  card.innerHTML = `
    <div class="year-month-title">
      <span>${mData.emoji} ${mData.name}</span>
      <span class="year-month-sub">${mData.sub}</span>
    </div>
    <div class="year-cal-header">${WEEKDAYS_SHORT.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="year-cal-days">${daysHtml}</div>`;
  return card;
}

function buildSpecialCard(year, leap, todayStr) {
  const card = document.createElement("div");
  card.className = "year-month-card year-special-card glass-card month-winter";

  const unaraDate  = ewigToGreg(year, 0, 1);
  const unaraStr   = toLocalDateStr(unaraDate);
  const unaraToday = unaraStr === todayStr ? " today" : "";

  let interaStr = "", interaToday = "";
  if (leap) {
    const interaDate = ewigToGreg(year, 0, 2);
    interaStr   = toLocalDateStr(interaDate);
    interaToday = interaStr === todayStr ? " today" : "";
  }

  const nextLeap = getNextLeapYear(year);

  card.innerHTML = `
    <div class="special-half">
      <div class="special-half-title">
        <span class="special-emoji">✨</span>
        <span class="special-name">Unara</span>
        <span class="special-sub">Zeitloser Tag</span>
      </div>
      <span class="special-day-num year-day${unaraToday}" data-greg="${unaraStr}">365</span>
    </div>
    <div class="special-divider"></div>
    <div class="special-half${leap ? "" : " special-disabled"}">
      <div class="special-half-title">
        <span class="special-emoji">🌟</span>
        <span class="special-name">Intera</span>
        <span class="special-sub">Zeitloser Tag</span>
      </div>
      ${leap
        ? `<span class="special-day-num year-day${interaToday}" data-greg="${interaStr}">366</span>`
        : `<span class="special-day-num disabled-day">366</span>
           <span class="intera-next">nächstes Schaltjahr: ${nextLeap}</span>`
      }
    </div>`;

  return card;
}

function getNextLeapYear(from) {
  let y = from + 1;
  while (!isLeapYear(y)) y++;
  return y;
}

// ============================================================
// POPUP – fixed im Viewport, aber visuell am Klickpunkt
// ============================================================
function showPopup(gregDateStr, event) {
  const date    = fromLocalDateStr(gregDateStr);
  const ewig    = gregToEwig(date);
  const card    = document.getElementById("popup-card");
  const content = document.getElementById("popup-content");

  let ewigLine;
  if (ewig.isUnara)       ewigLine = `Unara ✨ ${ewig.year}`;
  else if (ewig.isIntera) ewigLine = `Intera 🌟 ${ewig.year}`;
  else ewigLine = `${WEEKDAY_NAMES[ewig.weekday]} ${ewig.emoji} ${ewig.monthName} ${ewig.day} ${ewig.emoji} ${ewig.year}`;

  let seasonStartHtml = "";
  if (!ewig.isUnara && !ewig.isIntera) {
    const ss = SEASON_STARTS.find(s => s.month === ewig.month && s.day === ewig.day);
    if (ss) seasonStartHtml = `<div class="popup-season-start ${ss.cls}">${ss.label}</div>`;
  }

  content.innerHTML = `
    <div class="popup-ewig season-${ewig.season}">${ewigLine}</div>
    <div class="popup-greg">${formatGreg(date)}</div>${seasonStartHtml}`;

  // Popup zunächst versteckt platzieren um Größe zu messen
  card.style.visibility = "hidden";
  card.style.display    = "block";

  requestAnimationFrame(() => {
    const cardW  = card.offsetWidth;
    const cardH  = card.offsetHeight;
    const margin = 10;
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;

    // Position relativ zum Viewport (fixed)
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
  document.getElementById("greg-input").value = toLocalDateStr(today);
  document.getElementById("ewig-year").value  = today.getFullYear();

  document.getElementById("btn-greg-to-ewig").addEventListener("click", () => {
    const val = document.getElementById("greg-input").value;
    if (!val) return;
    const date = fromLocalDateStr(val);
    const ewig = gregToEwig(date);
    const el   = document.getElementById("result-greg-to-ewig");

    let html;
    if (ewig.isUnara || ewig.isIntera) {
      html = `<div class="result-main season-${ewig.season}"><div class="result-big">${ewig.emoji} ${ewig.monthName} · ${ewig.year}</div></div>`;
    } else {
      html = `<div class="result-main season-${ewig.season}"><div class="result-big">${WEEKDAY_NAMES[ewig.weekday]} ${ewig.emoji} ${ewig.monthName} ${ewig.day} ${ewig.emoji} ${ewig.year}</div></div>`;
    }
    el.innerHTML = html;
    el.classList.add("show");
  });

  document.getElementById("btn-ewig-to-greg").addEventListener("click", () => {
    const year  = parseInt(document.getElementById("ewig-year").value);
    const month = parseInt(document.getElementById("ewig-month").value);
    const dayV  = document.getElementById("ewig-day").value;
    if (!year || isNaN(month)) return;

    let day = parseInt(dayV) || 1;
    if (month !== 0) day = Math.max(1, Math.min(28, day));

    const gregDate = ewigToGreg(year, month, day);
    const el = document.getElementById("result-ewig-to-greg");
    el.innerHTML = `<div class="result-main"><div class="result-big">📅 ${formatGreg(gregDate)}</div></div>`;
    el.classList.add("show");
  });

  document.getElementById("ewig-month").addEventListener("change", (e) => {
    document.getElementById("ewig-day-group").style.display = e.target.value === "0" ? "none" : "";
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
  document.getElementById("btn-year-prev").addEventListener("click", () => {
    currentYear--;
    renderYearGrid(currentYear);
  });
  document.getElementById("btn-year-next").addEventListener("click", () => {
    currentYear++;
    renderYearGrid(currentYear);
  });
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

  // Popup schließen bei Klick irgendwo ins Leere
  document.addEventListener("click", (e) => {
    const card = document.getElementById("popup-card");
    if (!card.classList.contains("popup-open")) return;
    if (!card.contains(e.target)) hidePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePopup();
  });
});
