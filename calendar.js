// ============================================================
// EWIGER KALENDER - Kalenderlogik & UI
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

// ---- Schaltjahrberechnung ----
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// ---- Gregorianisch → Ewig ----
// Struktur: { year, month (1-13 | 0=Sondertag), day (1-28 | 1=Unara | 2=Intera),
//             monthName, monthSub, season, emoji, weekday (0-6 = Mo-So),
//             isUnara, isIntera }
function gregToEwig(date) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  // dayOfYear: 1-basiert
  const dayOfYear = Math.floor((date - startOfYear) / 86400000) + 1;
  const leap = isLeapYear(year);

  // Sondertage am ENDE des Jahres:
  // Tag 365 (normales Jahr) = Unara
  // Tag 365 (Schaltjahr)    = Unara
  // Tag 366 (Schaltjahr)    = Intera
  // Reguläre Tage: 1..364

  if (!leap && dayOfYear === 365) {
    return { year, month: 0, day: 1, monthName: "Unara", monthSub: "Zeitloser Tag",
             season: "winter", emoji: "✨", isUnara: true, isIntera: false };
  }
  if (leap && dayOfYear === 365) {
    return { year, month: 0, day: 1, monthName: "Unara", monthSub: "Zeitloser Tag",
             season: "winter", emoji: "✨", isUnara: true, isIntera: false };
  }
  if (leap && dayOfYear === 366) {
    return { year, month: 0, day: 2, monthName: "Intera", monthSub: "Schalttag",
             season: "winter", emoji: "🌟", isUnara: false, isIntera: true };
  }

  // Regulärer Tag: dayOfYear 1..364
  // monthIndex 0-basiert: 0=Aurora..12=Noctis
  const monthIndex = Math.floor((dayOfYear - 1) / 28);
  const day = ((dayOfYear - 1) % 28) + 1; // 1..28

  // Wochentag: Tag 1 jedes Monats = Montag (Index 0)
  const weekday = (day - 1) % 7; // 0=Mo..6=So

  const m = MONTHS[monthIndex];
  return {
    year,
    month: m.num,
    day,
    monthName: m.name,
    monthSub: m.sub,
    season: m.season,
    emoji: m.emoji,
    weekday,
    isUnara: false,
    isIntera: false,
  };
}

// ---- Ewig → Gregorianisch ----
// month 1-13 → regulär; month 0 day 1 → Unara; month 0 day 2 → Intera
function ewigToGreg(year, month, day) {
  let dayOfYear;
  if (month === 0) {
    dayOfYear = day === 2 ? 366 : 365;
  } else {
    dayOfYear = (month - 1) * 28 + day;
  }
  const startOfYear = new Date(year, 0, 1);
  return new Date(startOfYear.getTime() + (dayOfYear - 1) * 86400000);
}

// ---- Formatierung ----
function formatGreg(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}
function formatGregShort(date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}
function formatGregMedium(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

// ---- Ewig-Datum als lesbarer String ----
// z.B. "Samstag, 2026 · Crescera 5"
function formatEwig(ewig) {
  if (ewig.isUnara) return `${ewig.year} · ✨ Unara`;
  if (ewig.isIntera) return `${ewig.year} · 🌟 Intera`;
  return `${WEEKDAY_NAMES[ewig.weekday]}, ${ewig.year} · ${ewig.emoji} ${ewig.monthName} ${ewig.day}`;
}

// ============================================================
// UI – Heutiges Datum
// ============================================================

function renderToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ewig = gregToEwig(today);

  // Gregorianisch: "Dienstag, 29. April 2026"
  document.getElementById("greg-today").textContent = today.toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // Ewig: "Dienstag, 2026 · ☀️ Crescera 5"
  document.getElementById("ewig-today").textContent = formatEwig(ewig);
  document.getElementById("ewig-today").className = `today-date ewig-date season-text-${ewig.season}`;
}

// ============================================================
// UI – Jahresübersicht
// ============================================================

let currentYear = new Date().getFullYear();

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;
  const leap = isLeapYear(year);
  document.getElementById("year-leap-label").textContent = leap ? "🌟 Schaltjahr" : "";

  const grid = document.getElementById("year-grid");
  grid.innerHTML = "";

  const sections = [
    { label: "Frühling", emoji: "🌸", season: "spring", months: [1, 2, 3] },
    { label: "Sommer",   emoji: "☀️",  season: "summer", months: [4, 5, 6, 7] },
    { label: "Herbst",   emoji: "🍂",  season: "autumn", months: [8, 9, 10] },
    { label: "Winter",   emoji: "❄️",  season: "winter", months: [11, 12, 13] },
  ];

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

      // Tage mit korrektem Gregorianischem Datum
      const daysHtml = Array.from({ length: 28 }, (_, i) => {
        const d = i + 1;
        const gregDate = ewigToGreg(year, mNum, d);
        const gregStr = gregDate.toISOString().split("T")[0];
        return `<span class="year-day" data-greg="${gregStr}">${d}</span>`;
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

  // Sondertage (Unara / Intera) – immer am ENDE
  const specialSec = document.createElement("div");
  specialSec.className = "year-season-section season-section-winter";
  specialSec.innerHTML = `<div class="season-section-header"><span>✨</span><span>Zeitlose Tage</span></div>`;
  const specialRow = document.createElement("div");
  specialRow.className = "year-months-row";

  const unaraDate = ewigToGreg(year, 0, 1);
  const unaraCard = document.createElement("div");
  unaraCard.className = "year-month-card year-special-card glass-card month-winter";
  unaraCard.innerHTML = `
    <div class="year-month-title"><span>✨ Unara</span><span class="year-month-sub">Tag 365</span></div>
    <div class="special-day-btn year-day" data-greg="${unaraDate.toISOString().split("T")[0]}">
      <div class="special-day-circle">365</div>
      <div class="special-day-label">${formatGregShort(unaraDate)}</div>
    </div>`;
  specialRow.appendChild(unaraCard);

  if (leap) {
    const interaDate = ewigToGreg(year, 0, 2);
    const interaCard = document.createElement("div");
    interaCard.className = "year-month-card year-special-card glass-card month-winter";
    interaCard.innerHTML = `
      <div class="year-month-title"><span>🌟 Intera</span><span class="year-month-sub">Tag 366</span></div>
      <div class="special-day-btn year-day" data-greg="${interaDate.toISOString().split("T")[0]}">
        <div class="special-day-circle">366</div>
        <div class="special-day-label">${formatGregShort(interaDate)}</div>
      </div>`;
    specialRow.appendChild(interaCard);
  }

  specialSec.appendChild(specialRow);
  grid.appendChild(specialSec);

  // Heutigen Tag markieren
  const todayStr = new Date().toISOString().split("T")[0];
  document.querySelectorAll(`.year-day[data-greg="${todayStr}"]`).forEach(el => {
    el.classList.add("today");
  });

  // Klick-Handler für alle Tage
  document.querySelectorAll(".year-day").forEach(el => {
    el.addEventListener("click", () => {
      const gregStr = el.dataset.greg;
      if (gregStr) showPopup(gregStr);
    });
  });
}

// ============================================================
// Popup – nur gregorianisches Datum anzeigen
// ============================================================

function showPopup(gregDateStr) {
  const date = new Date(gregDateStr + "T00:00:00");
  const ewig = gregToEwig(date);
  const overlay = document.getElementById("popup-overlay");
  const content = document.getElementById("popup-content");

  let ewigStr, icon;
  if (ewig.isUnara) {
    ewigStr = `${ewig.year} · ✨ Unara`;
    icon = "✨";
  } else if (ewig.isIntera) {
    ewigStr = `${ewig.year} · 🌟 Intera`;
    icon = "🌟";
  } else {
    ewigStr = `${WEEKDAY_NAMES[ewig.weekday]}, ${ewig.year} · ${ewig.emoji} ${ewig.monthName} ${ewig.day}`;
    icon = ewig.emoji;
  }

  content.innerHTML = `
    <div class="popup-simple">
      <div class="popup-ewig-str season-${ewig.season}">${ewigStr}</div>
      <div class="popup-greg-str">${formatGreg(date)}</div>
    </div>`;

  overlay.classList.add("visible");
}

// ============================================================
// Konverter
// ============================================================

function setupConverter() {
  const today = new Date();
  document.getElementById("greg-input").value = today.toISOString().split("T")[0];
  document.getElementById("ewig-year").value = today.getFullYear();

  document.getElementById("btn-greg-to-ewig").addEventListener("click", () => {
    const val = document.getElementById("greg-input").value;
    if (!val) return;
    const date = new Date(val + "T00:00:00");
    const ewig = gregToEwig(date);
    const resultEl = document.getElementById("result-greg-to-ewig");

    if (ewig.isUnara || ewig.isIntera) {
      resultEl.innerHTML = `<div class="result-main"><div class="result-big">${ewig.emoji} ${ewig.monthName}</div><div class="result-sub">Jahr ${ewig.year} · ${ewig.monthSub}</div></div>`;
    } else {
      resultEl.innerHTML = `
        <div class="result-main season-${ewig.season}">
          <div class="result-big">${ewig.emoji} ${ewig.monthName} ${ewig.day}</div>
          <div class="result-sub">${WEEKDAY_NAMES[ewig.weekday]} · ${ewig.monthSub} · Jahr ${ewig.year}</div>
        </div>`;
    }
    resultEl.classList.add("show");
  });

  document.getElementById("btn-ewig-to-greg").addEventListener("click", () => {
    const year = parseInt(document.getElementById("ewig-year").value);
    const month = parseInt(document.getElementById("ewig-month").value);
    const dayVal = document.getElementById("ewig-day").value;
    if (!year || isNaN(month)) return;

    let day = parseInt(dayVal) || 1;
    if (month !== 0) {
      day = Math.max(1, Math.min(28, day));
    }

    const gregDate = ewigToGreg(year, month, day);
    const resultEl = document.getElementById("result-ewig-to-greg");
    resultEl.innerHTML = `<div class="result-main"><div class="result-big">📅 ${formatGreg(gregDate)}</div></div>`;
    resultEl.classList.add("show");
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
// Popup schließen
// ============================================================

function setupPopup() {
  document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("popup-overlay").classList.remove("visible");
  });
  document.getElementById("popup-overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("popup-overlay")) {
      document.getElementById("popup-overlay").classList.remove("visible");
    }
  });
}

// ============================================================
// Init
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  renderToday();
  setupConverter();
  setupTabs();
  setupYearNav();
  setupPopup();
  renderYearGrid(currentYear);
});
