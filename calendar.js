// ============================================================
// EWIGER KALENDER - Calendar Logic & UI
// ============================================================

const MONTHS = [
  { num: 1,  name: "Aurora",   sub: "Morgenröte",    season: "spring", emoji: "🌸" },
  { num: 2,  name: "Floris",   sub: "Blütezeit",     season: "spring", emoji: "🌸" },
  { num: 3,  name: "Viridia",  sub: "Grünwerden",    season: "spring", emoji: "🌿" },
  { num: 4,  name: "Solara",   sub: "Sonnenaufbruch",season: "summer", emoji: "☀️" },
  { num: 5,  name: "Crescera", sub: "Wachstum",      season: "summer", emoji: "☀️" },
  { num: 6,  name: "Luminis",  sub: "Lichtzeit",     season: "summer", emoji: "🌞" },
  { num: 7,  name: "Aestas",   sub: "Hochsommer",    season: "summer", emoji: "🌻" },
  { num: 8,  name: "Helion",   sub: "Sonnenhöhe",    season: "autumn", emoji: "🍂" },
  { num: 9,  name: "Fructa",   sub: "Ernte",         season: "autumn", emoji: "🍁" },
  { num: 10, name: "Aurelia",  sub: "Goldzeit",      season: "autumn", emoji: "🍂" },
  { num: 11, name: "Ventis",   sub: "Windzeit",      season: "winter", emoji: "❄️" },
  { num: 12, name: "Nivara",   sub: "Schneezeit",    season: "winter", emoji: "🌨️" },
  { num: 13, name: "Noctis",   sub: "Dunkelzeit",    season: "winter", emoji: "❄️" },
];

const SEASONS = {
  spring: { label: "Frühling", emoji: "🌸", color: "spring" },
  summer: { label: "Sommer",   emoji: "☀️", color: "summer" },
  autumn: { label: "Herbst",   emoji: "🍂", color: "autumn" },
  winter: { label: "Winter",   emoji: "❄️", color: "winter" },
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// Day 1 of Ewiger Kalender (Aurora 1) = January 1 of each year
// The Ewiger Kalender always starts on Monday.
// Each month has exactly 28 days. 13*28 = 364 days.
// Day 365 = Unara (timeless day, not part of any month)
// Leap year: day 366 = Intera

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Convert Gregorian date to Ewiger Kalender
// Returns { year, month (1-13 or 0=special), day (1-28 or 1 for special), monthName, dayName, season, isUnara, isIntera }
function gregToEwig(date) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1); // Jan 1
  const dayOfYear = Math.floor((date - startOfYear) / 86400000) + 1; // 1-based

  const leap = isLeapYear(year);
  const yearDays = leap ? 366 : 365;

  // Special days
  if (dayOfYear === 365 && !leap) {
    // Unara (non-leap year, last day)
    return { year, month: 0, day: 1, monthName: "Unara", dayName: "Unara", season: "winter", isUnara: true, isIntera: false };
  }
  if (dayOfYear === 365 && leap) {
    // Unara in leap year (before Intera)
    return { year, month: 0, day: 1, monthName: "Unara", dayName: "Unara", season: "winter", isUnara: true, isIntera: false };
  }
  if (dayOfYear === 366 && leap) {
    // Intera
    return { year, month: 0, day: 2, monthName: "Intera", dayName: "Intera", season: "winter", isUnara: false, isIntera: true };
  }

  // Regular days: dayOfYear 1..364
  const monthIndex = Math.floor((dayOfYear - 1) / 28); // 0-based (0..12)
  const day = ((dayOfYear - 1) % 28) + 1; // 1..28
  const monthData = MONTHS[monthIndex];

  return {
    year,
    month: monthData.num,
    day,
    monthName: monthData.name,
    monthSub: monthData.sub,
    dayName: `${monthData.name} ${day}`,
    season: monthData.season,
    emoji: monthData.emoji,
    isUnara: false,
    isIntera: false,
  };
}

// Convert Ewiger Kalender to Gregorian
// month: 1-13 (regular), 0 = Unara/Intera; day: 1-28 (or for month=0: 1=Unara, 2=Intera)
function ewigToGreg(year, month, day) {
  let dayOfYear;

  if (month === 0) {
    // Special day
    dayOfYear = day === 2 ? 366 : 365;
  } else {
    dayOfYear = (month - 1) * 28 + day;
  }

  const startOfYear = new Date(year, 0, 1);
  const result = new Date(startOfYear.getTime() + (dayOfYear - 1) * 86400000);
  return result;
}

// Format Gregorian date nicely in German
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

// ============================================================
// UI
// ============================================================

function seasonClass(season) {
  return `season-${season}`;
}

// ---- Today Tab ----
function renderToday() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const ewig = gregToEwig(today);

  document.getElementById("greg-today").textContent = formatGreg(today);

  const mainEl = document.getElementById("ewig-today-main");
  const seasonEl = document.getElementById("ewig-today-season");
  const detailEl = document.getElementById("today-month-detail");

  if (ewig.isUnara || ewig.isIntera) {
    mainEl.innerHTML = `<span class="ewig-special ${seasonClass("winter")}">${ewig.isIntera ? "🌟" : "✨"} ${ewig.monthName}</span>`;
    seasonEl.innerHTML = `<span class="season-tag winter">❄️ Winter · ${ewig.year}</span>`;
    detailEl.innerHTML = `
      <div class="special-day-info">
        <div class="special-icon">${ewig.isIntera ? "🌟" : "✨"}</div>
        <h3>${ewig.monthName}</h3>
        <p>${ewig.isIntera ? "Der Schalttag – nur alle 4 Jahre" : "Der zeitlose Tag – außerhalb aller Monate"}</p>
        <p class="special-desc">Im Ewigen Kalender steht ${ewig.monthName} am Ende des Jahres, nach Noctis (Monat 13). Er gehört zu keinem Monat und zu keiner Woche.</p>
      </div>`;
    return;
  }

  const s = SEASONS[ewig.season];
  mainEl.innerHTML = `
    <div class="ewig-day-display ${seasonClass(ewig.season)}">
      <span class="ewig-day-num">${ewig.day}</span>
      <div class="ewig-month-info">
        <span class="ewig-month-name">${ewig.emoji} ${ewig.monthName}</span>
        <span class="ewig-month-sub">${ewig.monthSub}</span>
      </div>
    </div>`;
  seasonEl.innerHTML = `<span class="season-tag ${ewig.season}">${s.emoji} ${s.label} · ${ewig.year} · Monat ${ewig.month}</span>`;

  // Weekday in Ewiger Kalender: always starts Monday, day 1 of any month = Monday
  const weekdayNames = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
  const weekday = weekdayNames[(ewig.day - 1) % 7];
  const week = Math.ceil(ewig.day / 7);

  // Mini month calendar
  detailEl.innerHTML = `
    <div class="month-detail-inner">
      <div class="month-detail-header ${seasonClass(ewig.season)}">
        <span>${ewig.emoji} ${ewig.monthName}</span>
        <span class="month-detail-sub">${ewig.monthSub}</span>
      </div>
      <div class="month-detail-info">
        <span>${weekday}, Woche ${week}</span>
        <span>Tag ${(ewig.month - 1) * 28 + ewig.day} des Jahres</span>
      </div>
      ${renderMiniMonth(ewig.month, ewig.day, ewig.season)}
    </div>`;
}

function renderMiniMonth(month, highlightDay, season) {
  const m = MONTHS[month - 1];
  let html = `<div class="mini-cal">
    <div class="mini-cal-header">${WEEKDAYS.map(d => `<span>${d}</span>`).join("")}</div>
    <div class="mini-cal-body">`;
  for (let d = 1; d <= 28; d++) {
    const cls = d === highlightDay ? `highlight ${season}` : "";
    html += `<span class="${cls}">${d}</span>`;
  }
  html += `</div></div>`;
  return html;
}

// ---- Converter Tab ----
function setupConverter() {
  // Set default input to today
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  document.getElementById("greg-input").value = todayStr;
  document.getElementById("ewig-year").value = today.getFullYear();

  document.getElementById("btn-greg-to-ewig").addEventListener("click", () => {
    const val = document.getElementById("greg-input").value;
    if (!val) return;
    const date = new Date(val + "T00:00:00");
    const ewig = gregToEwig(date);
    const resultEl = document.getElementById("result-greg-to-ewig");

    if (ewig.isUnara || ewig.isIntera) {
      resultEl.innerHTML = `
        <div class="result-special">
          <div class="result-big">${ewig.isIntera ? "🌟" : "✨"} ${ewig.monthName}</div>
          <div class="result-sub">Jahr ${ewig.year} · Zeitloser Tag</div>
        </div>`;
    } else {
      const s = SEASONS[ewig.season];
      resultEl.innerHTML = `
        <div class="result-main season-${ewig.season}">
          <div class="result-big">${ewig.emoji} ${ewig.monthName} ${ewig.day}</div>
          <div class="result-sub">${ewig.monthSub} · Jahr ${ewig.year}</div>
          <div class="result-season">${s.emoji} ${s.label} · Monat ${ewig.month} · Tag ${(ewig.month-1)*28+ewig.day}/364</div>
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
    if (month === 0) {
      // Unara/Intera - day determined by which
      // We'll convert day=1 as Unara, day=2 as Intera
      if (!isLeapYear(year)) day = 1;
    } else {
      if (day < 1) day = 1;
      if (day > 28) day = 28;
    }

    const gregDate = ewigToGreg(year, month, day);
    const resultEl = document.getElementById("result-ewig-to-greg");

    resultEl.innerHTML = `
      <div class="result-main">
        <div class="result-big">📅 ${formatGreg(gregDate)}</div>
        <div class="result-sub">${formatGregShort(gregDate)}</div>
      </div>`;
    resultEl.classList.add("show");
  });

  // Handle Unara/Intera special day (month=0)
  document.getElementById("ewig-month").addEventListener("change", (e) => {
    const g = document.getElementById("ewig-day-group");
    const dayInput = document.getElementById("ewig-day");
    if (e.target.value === "0") {
      g.style.display = "none";
    } else {
      g.style.display = "";
      dayInput.max = 28;
    }
  });
}

// ---- Year Overview Tab ----
let currentYear = new Date().getFullYear();

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;
  const leap = isLeapYear(year);
  document.getElementById("year-leap-label").textContent = leap ? "🌟 Schaltjahr" : "";

  const grid = document.getElementById("year-grid");
  grid.innerHTML = "";

  // Season sections
  const sections = [
    { label: "Frühling", emoji: "🌸", season: "spring", months: [1,2,3] },
    { label: "Sommer",   emoji: "☀️",  season: "summer", months: [4,5,6,7] },
    { label: "Herbst",   emoji: "🍂",  season: "autumn", months: [8,9,10] },
    { label: "Winter",   emoji: "❄️",  season: "winter", months: [11,12,13] },
  ];

  sections.forEach(sec => {
    const secEl = document.createElement("div");
    secEl.className = `year-season-section season-section-${sec.season}`;
    secEl.innerHTML = `<div class="season-section-header"><span>${sec.emoji}</span><span>${sec.label}</span></div>`;

    const monthsRow = document.createElement("div");
    monthsRow.className = "year-months-row";

    sec.months.forEach(mNum => {
      const mData = MONTHS[mNum - 1];
      const monthCard = document.createElement("div");
      monthCard.className = `year-month-card glass-card month-${sec.season}`;
      monthCard.innerHTML = `
        <div class="year-month-title">
          <span>${mData.emoji} ${mData.name}</span>
          <span class="year-month-sub">${mData.sub}</span>
        </div>
        <div class="year-month-grid">
          <div class="year-cal-header">${WEEKDAYS.map(d=>`<span>${d}</span>`).join("")}</div>
          <div class="year-cal-days" data-month="${mNum}" data-year="${year}">
            ${Array.from({length:28},(_,i)=>{
              const d = i+1;
              const gregDate = ewigToGreg(year, mNum, d);
              return `<span class="year-day" data-day="${d}" data-greg="${gregDate.toISOString().split('T')[0]}">${d}</span>`;
            }).join("")}
          </div>
        </div>`;
      monthsRow.appendChild(monthCard);
    });

    secEl.appendChild(monthsRow);
    grid.appendChild(secEl);
  });

  // Special days
  const specialSec = document.createElement("div");
  specialSec.className = `year-season-section season-section-winter`;
  specialSec.innerHTML = `<div class="season-section-header"><span>✨</span><span>Zeitlose Tage</span></div>`;
  const specialRow = document.createElement("div");
  specialRow.className = "year-months-row";

  const unaraDate = ewigToGreg(year, 0, 1);
  const unaraCard = document.createElement("div");
  unaraCard.className = "year-month-card year-special-card glass-card month-winter";
  unaraCard.innerHTML = `
    <div class="year-month-title"><span>✨ Unara</span><span class="year-month-sub">Der zeitlose Tag</span></div>
    <div class="special-day-btn year-day" data-day="1" data-greg="${unaraDate.toISOString().split('T')[0]}" data-special="Unara">
      <div class="special-day-circle">365</div>
      <div class="special-day-label">${formatGregShort(unaraDate)}</div>
    </div>`;
  specialRow.appendChild(unaraCard);

  if (leap) {
    const interaDate = ewigToGreg(year, 0, 2);
    const interaCard = document.createElement("div");
    interaCard.className = "year-month-card year-special-card glass-card month-winter";
    interaCard.innerHTML = `
      <div class="year-month-title"><span>🌟 Intera</span><span class="year-month-sub">Der Schalttag</span></div>
      <div class="special-day-btn year-day" data-day="2" data-greg="${interaDate.toISOString().split('T')[0]}" data-special="Intera">
        <div class="special-day-circle">366</div>
        <div class="special-day-label">${formatGregShort(interaDate)}</div>
      </div>`;
    specialRow.appendChild(interaCard);
  }

  specialSec.appendChild(specialRow);
  grid.appendChild(specialSec);

  // Highlight today
  const todayStr = new Date().toISOString().split("T")[0];
  document.querySelectorAll(`.year-day[data-greg="${todayStr}"]`).forEach(el => {
    el.classList.add("today");
  });

  // Click handlers
  document.querySelectorAll(".year-day").forEach(el => {
    el.addEventListener("click", () => {
      const gregStr = el.dataset.greg;
      if (!gregStr) return;
      showPopup(gregStr, el.dataset.special);
    });
  });
}

function showPopup(gregDateStr, special) {
  const date = new Date(gregDateStr + "T00:00:00");
  const ewig = gregToEwig(date);
  const overlay = document.getElementById("popup-overlay");
  const content = document.getElementById("popup-content");

  let html = `<div class="popup-inner">`;

  if (ewig.isUnara || ewig.isIntera) {
    html += `
      <div class="popup-special">
        <div class="popup-icon">${ewig.isIntera ? "🌟" : "✨"}</div>
        <h3>${ewig.monthName}</h3>
        <div class="popup-greg">${formatGreg(date)}</div>
        <p>${ewig.isIntera ? "Schalttag · Alle 4 Jahre · Tag 366" : "Zeitloser Tag · Tag 365"}</p>
      </div>`;
  } else {
    const s = SEASONS[ewig.season];
    const weekdayNames = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
    const weekday = weekdayNames[(ewig.day - 1) % 7];
    html += `
      <div class="popup-ewig season-${ewig.season}">
        <div class="popup-month-badge">${ewig.emoji} ${ewig.monthName}</div>
        <div class="popup-day-num">${ewig.day}</div>
        <div class="popup-month-sub">${ewig.monthSub}</div>
      </div>
      <div class="popup-details">
        <div class="popup-detail-row"><span>📅 Gregorianisch</span><span>${formatGreg(date)}</span></div>
        <div class="popup-detail-row"><span>${s.emoji} Jahreszeit</span><span>${s.label}</span></div>
        <div class="popup-detail-row"><span>📆 Wochentag</span><span>${weekday}</span></div>
        <div class="popup-detail-row"><span>🗓 Monat</span><span>${ewig.month} von 13</span></div>
        <div class="popup-detail-row"><span>📊 Tag des Jahres</span><span>${(ewig.month-1)*28+ewig.day} von 364</span></div>
      </div>`;
  }

  html += `</div>`;
  content.innerHTML = html;
  overlay.classList.add("visible");
}

// ---- Tab Navigation ----
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

// ---- Year Navigation ----
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

// ---- Popup ----
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

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  renderToday();
  setupConverter();
  setupTabs();
  setupYearNav();
  setupPopup();
  renderYearGrid(currentYear);
});
