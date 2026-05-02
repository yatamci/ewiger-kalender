// ============================================================
// EWIGER KALENDER – Kalenderlogik & UI
// Timezone-sicher: alle Datumsoperationen lokal, kein toISOString()
// ============================================================

const MONTHS = [
  { num: 1,  name: "Aurora",   sub: "Morgenröte",     season: "spring", emoji: "🌸" },
  { num: 2,  name: "Floris",   sub: "Blütezeit",      season: "spring", emoji: "🌸" },
  { num: 3,  name: "Viridia",  sub: "Grünwerden",     season: "spring", emoji: "🌿" },
  { num: 4,  name: "Solara",   sub: "Sonnenaufbruch", season: "summer", emoji: "☀️" },
  { num: 5,  name: "Crescera", sub: "Wachstum",       season: "summer", emoji: "☀️" },
  { num: 6,  name: "Luminis",  sub: "Lichtzeit",      season: "summer", emoji: "🌞" },
  { num: 7,  name: "Aestas",   sub: "Hochsommer",     season: "summer", emoji: "🌻" },
  { num: 8,  name: "Helion",   sub: "Sonnenhöhe",     season: "autumn", emoji: "🍂" },
  { num: 9,  name: "Fructa",   sub: "Ernte",          season: "autumn", emoji: "🍁" },
  { num: 10, name: "Aurelia",  sub: "Goldzeit",       season: "autumn", emoji: "🍂" },
  { num: 11, name: "Ventis",   sub: "Windzeit",       season: "winter", emoji: "❄️" },
  { num: 12, name: "Nivara",   sub: "Schneezeit",     season: "winter", emoji: "🌨️" },
  { num: 13, name: "Noctis",   sub: "Dunkelzeit",     season: "winter", emoji: "❄️" },
];

const WEEKDAY_NAMES = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WEEKDAYS_SHORT = ["Mo","Di","Mi","Do","Fr","Sa","So"];

// ============================================================
// Hilfsfunktionen – TIMEZONE-SICHER (kein toISOString)
// ============================================================

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Lokales Datum als YYYY-MM-DD (kein UTC-Versatz)
function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Lokales Datum aus YYYY-MM-DD (kein UTC-Versatz)
function fromLocalDateStr(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Tag des Jahres (1-basiert), timezone-sicher
function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86400000) + 1;
}

// ============================================================
// Kernkonvertierung: Gregorianisch → Ewig
// ============================================================
// Struktur:
//   { year, month (1-13 | 0=Sondertag), day (1-28 | 1=Unara | 2=Intera),
//     monthName, monthSub, season, emoji,
//     weekday (0=Mo..6=So),   ← nur für reguläre Tage
//     isUnara, isIntera }
//
// Kalenderstruktur:
//   Tag 1..364  → Aurora 1..Noctis 28  (13×28 Tage)
//   Tag 365     → Unara  (immer, ob Schaltjahr oder nicht)
//   Tag 366     → Intera (nur Schaltjahr)
// ============================================================
function gregToEwig(date) {
  const year = date.getFullYear();
  const doy  = dayOfYear(date);
  const leap = isLeapYear(year);

  if (doy === 365) {
    return {
      year, month: 0, day: 1,
      monthName: "Unara", monthSub: "Zeitloser Tag",
      season: "winter", emoji: "✨",
      isUnara: true, isIntera: false,
    };
  }
  if (leap && doy === 366) {
    return {
      year, month: 0, day: 2,
      monthName: "Intera", monthSub: "Schalttag",
      season: "winter", emoji: "🌟",
      isUnara: false, isIntera: true,
    };
  }

  // Regulärer Tag: doy 1..364
  const monthIdx = Math.floor((doy - 1) / 28); // 0-basiert
  const day      = ((doy - 1) % 28) + 1;        // 1..28
  const weekday  = (day - 1) % 7;               // 0=Mo..6=So (jeder Monat beginnt Montag)
  const m        = MONTHS[monthIdx];

  return {
    year,
    month: m.num,
    day,
    monthName: m.name,
    monthSub:  m.sub,
    season:    m.season,
    emoji:     m.emoji,
    weekday,
    isUnara:  false,
    isIntera: false,
  };
}

// ============================================================
// Kernkonvertierung: Ewig → Gregorianisch (timezone-sicher)
// ============================================================
function ewigToGreg(year, month, day) {
  let doy;
  if (month === 0) {
    doy = day === 2 ? 366 : 365;
  } else {
    doy = (month - 1) * 28 + day;
  }
  // Lokales Datum: New Date(year, 0, 1) + (doy-1) Tage
  const result = new Date(year, 0, doy); // new Date(year, 0, 1+doy-1)
  return result;
}

// ============================================================
// Formatierung
// ============================================================

function formatGreg(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatGregShort(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// Ewig-Datum als lesbarer String:
// "Montag 🌸 Aurora · 1 · 2026"
function formatEwigLong(ewig) {
  if (ewig.isUnara)  return `${ewig.year} · ✨ Unara`;
  if (ewig.isIntera) return `${ewig.year} · 🌟 Intera`;
  return `${WEEKDAY_NAMES[ewig.weekday]} ${ewig.emoji} ${ewig.monthName} · ${ewig.day} · ${ewig.year}`;
}

// ============================================================
// Heutiges Datum rendern
// ============================================================
function renderToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ewig = gregToEwig(today);

  document.getElementById("greg-today").textContent = formatGreg(today);

  const ewigEl = document.getElementById("ewig-today");
  ewigEl.textContent = formatEwigLong(ewig);
  ewigEl.className = `today-date ewig-date season-text-${ewig.season}`;
}

// ============================================================
// Jahresübersicht
// ============================================================
let currentYear = new Date().getFullYear();

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;
  const leap = isLeapYear(year);
  document.getElementById("year-leap-label").textContent = leap ? "🌟 Schaltjahr" : "";

  const grid = document.getElementById("year-grid");
  grid.innerHTML = "";

  const sections = [
    { label: "Frühling", emoji: "🌸", season: "spring", months: [1,2,3] },
    { label: "Sommer",   emoji: "☀️",  season: "summer", months: [4,5,6,7] },
    { label: "Herbst",   emoji: "🍂",  season: "autumn", months: [8,9,10] },
    { label: "Winter",   emoji: "❄️",  season: "winter", months: [11,12,13] },
  ];

  const todayStr = toLocalDateStr(new Date());

  sections.forEach(sec => {
    const secEl = document.createElement("div");
    secEl.className = `year-season-section season-section-${sec.season}`;
    secEl.innerHTML = `<div class="season-section-header"><span>${sec.emoji}</span><span>${sec.label}</span></div>`;

    const row = document.createElement("div");
    row.className = "year-months-row";

    sec.months.forEach(mNum => {
      const mData = MONTHS[mNum - 1];
      const card = document.createElement("div");
      card.className = `year-month-card glass-card month-${sec.season}`;

      const daysHtml = Array.from({ length: 28 }, (_, i) => {
        const d = i + 1;
        const gregDate = ewigToGreg(year, mNum, d);
        // TIMEZONE-SICHER: lokales Datum als String
        const gregStr = toLocalDateStr(gregDate);
        const isToday = gregStr === todayStr ? " today" : "";
        return `<span class="year-day${isToday}" data-greg="${gregStr}" data-ewig-m="${mNum}" data-ewig-d="${d}" data-ewig-y="${year}">${d}</span>`;
      }).join("");

      card.innerHTML = `
        <div class="year-month-title">
          <span>${mData.emoji} ${mData.name}</span>
          <span class="year-month-sub">${mData.sub}</span>
        </div>
        <div class="year-cal-header">${WEEKDAYS_SHORT.map(d => `<span>${d}</span>`).join("")}</div>
        <div class="year-cal-days">${daysHtml}</div>`;

      row.appendChild(card);
    });

    secEl.appendChild(row);
    grid.appendChild(secEl);
  });

  // Sondertage
  const specialSec = document.createElement("div");
  specialSec.className = "year-season-section season-section-winter";
  specialSec.innerHTML = `<div class="season-section-header"><span>✨</span><span>Zeitlose Tage</span></div>`;

  const specialRow = document.createElement("div");
  specialRow.className = "year-months-row";

  // Unara (Tag 365)
  const unaraDate = ewigToGreg(year, 0, 1);
  const unaraStr = toLocalDateStr(unaraDate);
  const unaraToday = unaraStr === todayStr ? " today" : "";
  const unaraCard = document.createElement("div");
  unaraCard.className = "year-month-card year-special-card glass-card month-winter";
  unaraCard.innerHTML = `
    <div class="year-month-title"><span>✨ Unara</span><span class="year-month-sub">Tag 365</span></div>
    <div class="year-cal-header">${WEEKDAYS_SHORT.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="year-cal-days special-days-row">
      <span class="year-day special-num${unaraToday}" data-greg="${unaraStr}" data-ewig-m="0" data-ewig-d="1" data-ewig-y="${year}">365</span>
    </div>`;
  specialRow.appendChild(unaraCard);

  // Intera (Tag 366) – immer anzeigen, aber ausgegraut wenn kein Schaltjahr
  const interaCard = document.createElement("div");
  interaCard.className = `year-month-card year-special-card glass-card month-winter${leap ? "" : " disabled-card"}`;
  let interaInner;
  if (leap) {
    const interaDate = ewigToGreg(year, 0, 2);
    const interaStr = toLocalDateStr(interaDate);
    const interaToday = interaStr === todayStr ? " today" : "";
    interaInner = `
      <div class="year-cal-header">${WEEKDAYS_SHORT.map(d => `<span>${d}</span>`).join("")}</div>
      <div class="year-cal-days special-days-row">
        <span class="year-day special-num${interaToday}" data-greg="${interaStr}" data-ewig-m="0" data-ewig-d="2" data-ewig-y="${year}">366</span>
      </div>`;
  } else {
    const nextLeap = nextLeapYear(year);
    interaInner = `
      <div class="year-cal-header">${WEEKDAYS_SHORT.map(d => `<span>${d}</span>`).join("")}</div>
      <div class="year-cal-days special-days-row">
        <span class="year-day special-num disabled-day">366</span>
      </div>
      <div class="intera-next">nächstes Schaltjahr: ${nextLeap}</div>`;
  }
  interaCard.innerHTML = `
    <div class="year-month-title"><span>🌟 Intera</span><span class="year-month-sub">Tag 366</span></div>
    ${interaInner}`;
  specialRow.appendChild(interaCard);

  specialSec.appendChild(specialRow);
  grid.appendChild(specialSec);

  // Klick-Handler
  document.querySelectorAll(".year-day:not(.disabled-day)").forEach(el => {
    el.addEventListener("click", (e) => {
      const gregStr = el.dataset.greg;
      if (!gregStr) return;
      showPopup(gregStr, e);
    });
  });
}

function nextLeapYear(from) {
  let y = from + 1;
  while (!isLeapYear(y)) y++;
  return y;
}

// ============================================================
// Popup – positioniert am Klickpunkt
// ============================================================
function showPopup(gregDateStr, event) {
  const date = fromLocalDateStr(gregDateStr);
  const ewig = gregToEwig(date);

  const overlay = document.getElementById("popup-overlay");
  const card    = document.getElementById("popup-card");
  const content = document.getElementById("popup-content");

  // Ewig-Zeile
  let ewigLine;
  if (ewig.isUnara)       ewigLine = `${ewig.year} · ✨ Unara`;
  else if (ewig.isIntera) ewigLine = `${ewig.year} · 🌟 Intera`;
  else ewigLine = `${WEEKDAY_NAMES[ewig.weekday]} ${ewig.emoji} ${ewig.monthName} · ${ewig.day} · ${ewig.year}`;

  content.innerHTML = `
    <div class="popup-ewig season-${ewig.season}">${ewigLine}</div>
    <div class="popup-greg">${formatGreg(date)}</div>`;

  // Overlay sichtbar machen (transparent, nur zum Klickfangen)
  overlay.classList.add("visible");

  // Popup am Klickpunkt positionieren
  requestAnimationFrame(() => {
    const rect   = card.getBoundingClientRect();
    const vw     = window.innerWidth;
    const vh     = window.innerHeight;
    const margin = 12;

    let x = event.clientX;
    let y = event.clientY + 12; // etwas unterhalb

    // Rechts rausragen verhindern
    if (x + rect.width + margin > vw) x = vw - rect.width - margin;
    // Links rausragen
    if (x < margin) x = margin;
    // Unten rausragen → nach oben
    if (y + rect.height + margin > vh) y = event.clientY - rect.height - 12;
    if (y < margin) y = margin;

    card.style.left = x + "px";
    card.style.top  = y + "px";
  });
}

function hidePopup() {
  document.getElementById("popup-overlay").classList.remove("visible");
}

// ============================================================
// Dark Mode
// ============================================================
function setupDarkMode() {
  const btn  = document.getElementById("darkmode-toggle");
  const html = document.documentElement;
  const icon = btn.querySelector(".toggle-icon");

  // System-Präferenz respektieren
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme");
  const initial = saved || (prefersDark ? "dark" : "light");
  html.setAttribute("data-theme", initial);
  icon.textContent = initial === "dark" ? "☀️" : "🌙";

  btn.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next    = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    icon.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

// ============================================================
// Konverter
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

    if (ewig.isUnara || ewig.isIntera) {
      el.innerHTML = `<div class="result-main"><div class="result-big">${ewig.emoji} ${ewig.monthName}</div><div class="result-sub">Jahr ${ewig.year} · ${ewig.monthSub}</div></div>`;
    } else {
      el.innerHTML = `
        <div class="result-main season-${ewig.season}">
          <div class="result-big">${ewig.emoji} ${ewig.monthName} ${ewig.day}</div>
          <div class="result-sub">${WEEKDAY_NAMES[ewig.weekday]} · ${ewig.monthSub} · Jahr ${ewig.year}</div>
        </div>`;
    }
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
// Tabs
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

// ============================================================
// Jahresnavigation
// ============================================================
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
// Init
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setupDarkMode();
  renderToday();
  setupConverter();
  setupTabs();
  setupYearNav();
  renderYearGrid(currentYear);

  // Popup schließen bei Klick außerhalb
  document.getElementById("popup-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("popup-overlay")) hidePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePopup();
  });
});
