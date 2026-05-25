// ============================================================
// EWIGER KALENDER
// DST-sicher, Timezone-sicher, 3x5 Raster
// ============================================================

const MONTHS = [
  { num:1,  name:"Nivara",  sub:"Schneezeit",     season:"winter", emoji:"❄️" },
  { num:2,  name:"Aurora",  sub:"Morgenröte",     season:"winter", emoji:"❄️" },
  { num:3,  name:"Viridia", sub:"Grünwerden",     season:"spring", emoji:"🌸" },
  { num:4,  name:"Floris",  sub:"Blütezeit",      season:"spring", emoji:"🌸" },
  { num:5,  name:"Solara",  sub:"Sonnenaufbruch", season:"spring", emoji:"🌸" },
  { num:6,  name:"Luminis", sub:"Lichtzeit",      season:"summer", emoji:"☀️" },
  { num:7,  name:"Calora",  sub:"Wärmezeit",      season:"summer", emoji:"☀️" },
  { num:8,  name:"Helia",   sub:"Sonnenhöhe",     season:"summer", emoji:"☀️" },
  { num:9,  name:"Fructa",  sub:"Erntezeit",      season:"summer", emoji:"☀️" },
  { num:10, name:"Aurelia", sub:"Goldzeit",       season:"autumn", emoji:"🍂" },
  { num:11, name:"Ventis",  sub:"Windzeit",       season:"autumn", emoji:"🍂" },
  { num:12, name:"Umbra",   sub:"Schattenzeit",   season:"autumn", emoji:"🍂" },
  { num:13, name:"Noctis",  sub:"Dunkelzeit",     season:"winter", emoji:"❄️" },
];

const SEASON_STARTS = [
  { month:3,  day:8,  label:"🌸 Frühlingsanfang 🌸", cls:"season-start-spring" },
  { month:6,  day:15, label:"☀️ Sommeranfang ☀️",    cls:"season-start-summer" },
  { month:9,  day:22, label:"🍂 Herbstanfang 🍂",     cls:"season-start-autumn" },
  { month:13, day:1,  label:"❄️ Winteranfang ❄️",    cls:"season-start-winter" },
];

// ============================================================
// STERNZEICHEN + SEELENWÄCHTER + ELEMENT
// doy-Ranges basierend auf gregorianischen Daten (2026, kein Schaltjahr)
// Schaltjahre: Steinbock + Riese decken Intera (doy 366) automatisch ab
// ============================================================

const ZODIAC = [
  ["Steinbock",  356, 384], // 22.Dez – 19.Jan (wraps)
  ["Wassermann",  20,  49], // 20.Jan – 18.Feb
  ["Fische",      50,  79], // 19.Feb – 20.Mär
  ["Widder",      80, 109], // 21.Mär – 19.Apr
  ["Stier",      110, 140], // 20.Apr – 20.Mai
  ["Zwillinge",  141, 171], // 21.Mai – 20.Jun
  ["Krebs",      172, 203], // 21.Jun – 22.Jul
  ["Löwe",       204, 234], // 23.Jul – 22.Aug
  ["Jungfrau",   235, 265], // 23.Aug – 22.Sep
  ["Waage",      266, 295], // 23.Sep – 22.Okt
  ["Skorpion",   296, 325], // 23.Okt – 21.Nov
  ["Schütze",    326, 355], // 22.Nov – 21.Dez
];

const SOUL = [
  ["Waldfee",     "Erde",      80, 106],
  ["Elfe",        "Magie",    107, 137],
  ["Meerjungfrau","Wasser",   138, 166],
  ["Einhorn",     "Licht",    167, 192],
  ["Feuergeist",  "Feuer",    193, 222],
  ["Sphinx",      "Gestein",  223, 254],
  ["Kobold",      "Erde",     255, 281],
  ["Werwolf",     "Schatten", 282, 304],
  ["Hexe",        "Magie",    305, 330],
  ["Vampir",      "Schatten", 331, 359],
  ["Riese",       "Gestein",  360, 387], // wraps: 360-365 + 1-22
  ["Eisdrache",   "Wasser",    23,  49],
  ["Phönix",      "Feuer",     50,  79],
];

function getZodiac(doy) {
  // Schaltjahr: doy 366 (Intera) -> treat as Steinbock (same as 365/Unara)
  if (doy >= 366) doy = 365;
  for (const [name, s, e] of ZODIAC) {
    if (e > 365) {
      if (doy >= s || doy <= (e - 365)) return name;
    } else {
      if (doy >= s && doy <= e) return name;
    }
  }
  return "";
}

function getSoul(doy) {
  // Schaltjahr: doy 366 -> treat as Riese (same as Unara)
  if (doy >= 366) doy = 365;
  for (const [name, elem, s, e] of SOUL) {
    if (e > 365) {
      if (doy >= s || doy <= (e - 365)) return [name, elem];
    } else {
      if (doy >= s && doy <= e) return [name, elem];
    }
  }
  return ["", ""];
}

function buildExtraInfo(date, ewig) {
  const doy = (ewig.isUnara || ewig.isIntera)
    ? (ewig.isIntera ? 366 : 365)
    : dayOfYear(date);
  const zodiac       = getZodiac(doy);
  const [soul, elem] = getSoul(doy);
  if (!zodiac && !soul) return "";
  return (
    '<div class="extra-info">' +
    (zodiac ? '<span>Sternzeichen: ' + zodiac + '</span>' : '') +
    (soul   ? '<span>Seelenwächter: ' + soul  + '</span>' : '') +
    (elem   ? '<span>Element: '       + elem  + '</span>' : '') +
    '</div>'
  );
}

const WEEKDAY_NAMES  = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
const WEEKDAYS_SHORT = ["Mo","Di","Mi","Do","Fr","Sa","So"];

// ============================================================
// HILFSFUNKTIONEN
// ============================================================

function isLeapYear(y) { return (y%4===0&&y%100!==0)||(y%400===0); }

// Tag des Jahres – DST-sicher
function dayOfYear(date) {
  return Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(date.getFullYear(),0,1))/86400000)+1;
}

// Echte Jahreszeit nach Kalender-Datum (nicht Monat)
// Frühlingsanfang: Viridia 8 = doy 64
// Sommeranfang:    Luminis 15 = doy 155
// Herbstanfang:    Fructa 22 = doy 246
// Winteranfang:    Noctis 1  = doy 337
function calendarSeason(doy) {
  if (doy < 64)  return "winter";
  if (doy < 155) return "spring";
  if (doy < 246) return "summer";
  if (doy < 337) return "autumn";
  return "winter";
}

function toLocalDateStr(date) {
  return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
}

function fromLocalDateStr(str) {
  const [y,m,d] = str.split("-").map(Number);
  return new Date(y,m-1,d);
}

// ============================================================
// KONVERTIERUNG
// ============================================================

function gregToEwig(date) {
  const year = date.getFullYear();
  const doy  = dayOfYear(date);
  const leap = isLeapYear(year);
  if (doy===365) return {year,month:0,day:1,monthName:"Unara",monthSub:"Zeitloser Tag",season:"winter",emoji:"✨",weekday:null,popupSeason:"winter",isUnara:true,isIntera:false};
  if (leap&&doy===366) return {year,month:0,day:2,monthName:"Intera",monthSub:"Zeitloser Tag",season:"winter",emoji:"🌟",weekday:null,popupSeason:"winter",isUnara:false,isIntera:true};
  const mi = Math.floor((doy-1)/28);
  const day = ((doy-1)%28)+1;
  const m = MONTHS[mi];
  return {year,month:m.num,day,monthName:m.name,monthSub:m.sub,season:m.season,emoji:m.emoji,weekday:(day-1)%7,popupSeason:calendarSeason(doy),isUnara:false,isIntera:false};
}

function ewigToGreg(year,month,day) {
  const doy = month===0?(day===2?366:365):(month-1)*28+day;
  return new Date(year,0,doy);
}

// ============================================================
// FORMATIERUNG
// ============================================================

function formatGreg(date) {
  return date.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}

function formatEwigReadable(ewig) {
  if (ewig.isUnara)  return "Unara "+ewig.year;
  if (ewig.isIntera) return "Intera "+ewig.year;
  return WEEKDAY_NAMES[ewig.weekday]+", "+ewig.day+". "+ewig.monthName+" "+ewig.year;
}

// ============================================================
// HEUTE RENDERN
// ============================================================

function renderToday() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const ewig = gregToEwig(today);
  document.getElementById("greg-today").textContent = formatGreg(today);
  const ewigEl = document.getElementById("ewig-today");
  ewigEl.textContent = formatEwigReadable(ewig);
  
  // Taggenaue Jahreszeit ermitteln
  const exactSeason = (ewig.isUnara || ewig.isIntera) ? "winter" : ewig.popupSeason;
  
  // Die exakte Jahreszeit als Klasse setzen
  ewigEl.className = "today-date ewig-date season-text-" + exactSeason;
}

// ============================================================
// JAHRESÜBERSICHT – 3×5 Raster
// ============================================================

const TODAY_YEAR = new Date().getFullYear();
let currentYear = TODAY_YEAR;

function renderYearGrid(year) {
  document.getElementById("year-label").textContent = year;

  // Year-Select befüllen
  const sel = document.getElementById("year-select");
  if (sel) {
    sel.innerHTML = "";
    const minY = Math.min(year, TODAY_YEAR) - 200;
    const maxY = Math.max(year, TODAY_YEAR) + 200;
    for (let y = minY; y <= maxY; y++) {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      if (y === year) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.onchange = (e) => { currentYear = parseInt(e.target.value); renderYearGrid(currentYear); };
  }

  // Zurück-zum-Jahr Buttons – Text dynamisch setzen
  const prevBtn = document.getElementById("btn-goto-today-prev");
  const nextBtn = document.getElementById("btn-goto-today-next");
  if (prevBtn) { prevBtn.textContent = String(TODAY_YEAR); prevBtn.style.display = year > TODAY_YEAR ? "inline-flex" : "none"; }
  if (nextBtn) { nextBtn.textContent = String(TODAY_YEAR); nextBtn.style.display = year < TODAY_YEAR ? "inline-flex" : "none"; }

  const leap = isLeapYear(year);
  const todayStr = toLocalDateStr(new Date());
  const grid = document.getElementById("year-grid");
  grid.innerHTML = "";

  // Fragment für Performance
  const frag = document.createDocumentFragment();

  // Zeilen 1–4: Monate 1–12 (je 3 pro Zeile)
  for (let row=0; row<4; row++) {
    const rowEl = document.createElement("div");
    rowEl.className = "year-months-row";
    for (let col=0; col<3; col++) {
      rowEl.appendChild(buildMonthCard(year, row*3+col+1, todayStr));
    }
    frag.appendChild(rowEl);
  }

  // Zeile 5: Monat 13 + Unara + Intera
  const lastRow = document.createElement("div");
  lastRow.className = "year-months-row";
  lastRow.appendChild(buildMonthCard(year, 13, todayStr));
  lastRow.appendChild(buildUnaraCard(year, todayStr));
  lastRow.appendChild(buildInteraCard(year, leap, todayStr));
  frag.appendChild(lastRow);

  grid.appendChild(frag);

  // Klick-Handler für reguläre Tage
  grid.querySelectorAll(".year-day[data-greg]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(el.dataset.greg, e);
    });
  });
}

function buildMonthCard(year, mNum, todayStr) {
  const mData = MONTHS[mNum-1];
  const card  = document.createElement("div");
  const isLuminis = mNum===6;
  card.className = "year-month-card glass-card "+(isLuminis?"month-luminis":"month-"+mData.season);

  const displayEmoji = isLuminis ? "🌸/☀️" : mData.emoji;

  const days = [];
  for (let d=1; d<=28; d++) {
    const gregDate = ewigToGreg(year, mNum, d);
    const gregStr  = toLocalDateStr(gregDate);
    
    let cls = "year-day";
    if (gregStr === todayStr) {
      // Exakte Jahreszeit für diesen spezifischen Tag berechnen
      const doy = dayOfYear(gregDate);
      const exactSeason = calendarSeason(doy);
      cls += " today today-" + exactSeason;
    }
    
    days.push('<span class="'+cls+'" data-greg="'+gregStr+'">'+d+'</span>');
  }
  card.innerHTML =
    '<div class="year-month-header">'+
      '<span class="year-month-emoji">'+displayEmoji+'</span>'+
      '<span class="year-month-name">'+mData.name+'</span>'+
      '<span class="year-month-sub">'+mData.sub+'</span>'+
    '</div>'+
    '<div class="year-cal-header">'+WEEKDAYS_SHORT.map(d=>'<span>'+d+'</span>').join("")+'</div>'+
    '<div class="year-cal-days">'+days.join("")+'</div>';
  return card;
}

function buildUnaraCard(year, todayStr) {
  const card = document.createElement("div");
  card.className = "year-month-card year-special-card glass-card month-special";
  const unaraDate = ewigToGreg(year,0,1);
  const isToday = toLocalDateStr(unaraDate)===todayStr;
  card.innerHTML =
    '<div class="special-row special-row-title'+(isToday?" special-today":"")+'">Unara '+year+'</div>'+
    '<div class="special-row special-row-sub">Zeitloser Tag</div>'+
    '<div class="special-row special-row-date">'+formatGreg(unaraDate)+'</div>'+
    buildExtraInfo(unaraDate,{isUnara:true,isIntera:false,year:year,month:0,day:1,season:'winter'});
  return card;
}

function buildInteraCard(year, leap, todayStr) {
  const card = document.createElement("div");
  card.className = "year-month-card year-special-card glass-card month-special"+(leap?"":" special-disabled");
  if (leap) {
    const interaDate = ewigToGreg(year,0,2);
    const isToday = toLocalDateStr(interaDate)===todayStr;
    const interaEwig = {isUnara:false, isIntera:true, year:year, month:0, day:2, season:'winter'};
    card.innerHTML =
      '<div class="special-row special-row-title'+(isToday?" special-today":"")+'">Intera '+year+'</div>'+
      '<div class="special-row special-row-sub">Zeitloser Tag</div>'+
      '<div class="special-row special-row-date">'+formatGreg(interaDate)+'</div>'+
      buildExtraInfo(interaDate, interaEwig);
  } else {
    let y=year+1; while(!isLeapYear(y)) y++;
    card.innerHTML =
      '<div class="special-row special-row-title">Intera</div>'+
      '<div class="special-row special-row-sub">Zeitloser Tag</div>'+
      '<div class="special-row special-row-date special-row-next">Nächstes Schaltjahr: '+y+'</div>';
  }
  return card;
}

// ============================================================
// POPUP
// ============================================================

function showPopup(gregDateStr, event) {
  const date  = fromLocalDateStr(gregDateStr);
  const ewig  = gregToEwig(date);
  const card  = document.getElementById("popup-card");
  const content = document.getElementById("popup-content");
  const ps = ewig.isUnara||ewig.isIntera ? "winter" : ewig.popupSeason;

  let ssHtml = "";
  if (!ewig.isUnara&&!ewig.isIntera) {
    const ss = SEASON_STARTS.find(s=>s.month===ewig.month&&s.day===ewig.day);
    if (ss) ssHtml = '<div class="popup-season-start '+ss.cls+'">'+ss.label+'</div>';
  }

  const extraHtml = buildExtraInfo(date, ewig);
  content.innerHTML =
    ssHtml+
    '<div class="popup-ewig season-'+ps+'">'+formatEwigReadable(ewig)+'</div>'+
    '<div class="popup-greg">'+formatGreg(date)+'</div>'+
    extraHtml;

  card.style.visibility = "hidden";
  card.style.display    = "block";

  requestAnimationFrame(() => {
    const cw=card.offsetWidth, ch=card.offsetHeight, mg=10;
    const vw=window.innerWidth, vh=window.innerHeight;
    const sx=window.scrollX||window.pageXOffset;
    const sy=window.scrollY||window.pageYOffset;
    // clientX/Y = viewport-relativ; für absolute Position += scroll
    let x=event.clientX, y=event.clientY+14;
    if (x+cw+mg>vw) x=event.clientX-cw-mg;
    if (x<mg) x=mg;
    if (y+ch+mg>vh) y=event.clientY-ch-8;
    if (y<mg) y=mg;
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
  const saved = localStorage.getItem("ewiger-theme");
  const initial = saved||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  html.setAttribute("data-theme",initial);
  icon.textContent = initial==="dark"?"☀️":"🌙";
  btn.addEventListener("click",()=>{
    const next = html.getAttribute("data-theme")==="dark"?"light":"dark";
    html.setAttribute("data-theme",next);
    localStorage.setItem("ewiger-theme",next);
    icon.textContent = next==="dark"?"☀️":"🌙";
  });
}

// ============================================================
// KONVERTER
// ============================================================

function setupConverter() {
  const today = new Date();
  document.getElementById("greg-day-in").value   = today.getDate();
  document.getElementById("greg-month-in").value = today.getMonth()+1;
  document.getElementById("greg-year-in").value  = today.getFullYear();
  // Prefill ewig-to-greg with today's ewiger date
  const todayEwig = gregToEwig(today);
  document.getElementById("ewig-day").value   = todayEwig.isUnara||todayEwig.isIntera ? todayEwig.day : todayEwig.day;
  document.getElementById("ewig-month").value = todayEwig.month;
  document.getElementById("ewig-year").value  = todayEwig.year;

  document.getElementById("btn-greg-to-ewig").addEventListener("click",()=>{
    const day  = parseInt(document.getElementById("greg-day-in").value);
    const mon  = parseInt(document.getElementById("greg-month-in").value);
    const year = parseInt(document.getElementById("greg-year-in").value);
    if (!day||!mon||!year) return;
    const date = new Date(year,mon-1,day);
    const ewig = gregToEwig(date);
    const ps   = ewig.isUnara||ewig.isIntera?"winter":ewig.popupSeason;
    let ssHtml = "";
    if (!ewig.isUnara&&!ewig.isIntera) {
      const ss = SEASON_STARTS.find(s=>s.month===ewig.month&&s.day===ewig.day);
      if (ss) ssHtml = '<div class="converter-season-start '+ss.cls+'">'+ss.label+'</div>';
    }
    const el = document.getElementById("result-greg-to-ewig");
        el.innerHTML = ssHtml+'<div class="result-big">'+formatEwigReadable(ewig)+'</div>'+buildExtraInfo(date,ewig);
    el.classList.add("show");
  });

  document.getElementById("btn-ewig-to-greg").addEventListener("click",()=>{
    const day  = parseInt(document.getElementById("ewig-day").value)||1;
    const mon  = parseInt(document.getElementById("ewig-month").value);
    const year = parseInt(document.getElementById("ewig-year").value);
    if (!year||isNaN(mon)) return;
    const d = mon!==0?Math.max(1,Math.min(28,day)):day;
    const gregDate = ewigToGreg(year,mon,d);
    // Jahreszeitenanfang auch bei ewig->greg anzeigen
    let ssHtml2 = "";
    if (mon!==0) {
      const ss2 = SEASON_STARTS.find(s=>s.month===mon&&s.day===d);
      if (ss2) ssHtml2 = '<div class="converter-season-start '+ss2.cls+'">'+ss2.label+'</div>';
    }
    const el = document.getElementById("result-ewig-to-greg");
    const ewigInfo = gregToEwig(gregDate);
    el.innerHTML = ssHtml2+'<div class="result-big">'+formatGreg(gregDate)+'</div>'+buildExtraInfo(gregDate,ewigInfo);
    el.classList.add("show");
  });

  document.getElementById("ewig-month").addEventListener("change",(e)=>{
    const isSpecial = e.target.value==="0";
    const dayEl = document.getElementById("ewig-day");
    dayEl.placeholder = isSpecial?"1=Unara, 2=Intera":"1–28";
    dayEl.max = isSpecial?"2":"28";
  });
}

// ============================================================
// TABS & NAVIGATION
// ============================================================

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
    });
  });
}

function setupYearNav() {
  document.getElementById("btn-year-prev").addEventListener("click",()=>{ currentYear--; renderYearGrid(currentYear); });
  document.getElementById("btn-year-next").addEventListener("click",()=>{ currentYear++; renderYearGrid(currentYear); });
  // Heute-Jahr Buttons
  document.getElementById("btn-goto-today-prev").addEventListener("click",()=>{ currentYear=TODAY_YEAR; renderYearGrid(currentYear); });
  document.getElementById("btn-goto-today-next").addEventListener("click",()=>{ currentYear=TODAY_YEAR; renderYearGrid(currentYear); });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded",()=>{
  setupDarkMode();
  renderToday();
  setupConverter();
  setupTabs();
  setupYearNav();
  renderYearGrid(currentYear);

  document.addEventListener("click",(e)=>{
    const card = document.getElementById("popup-card");
    if (!card.classList.contains("popup-open")) return;
    if (!card.contains(e.target)) hidePopup();
  });
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") hidePopup(); });
});
