# ☀️ Ewiger Kalender

Ein moderner Ewiger Kalender im iOS 26 Liquid Glass Design.

**28 Tage · 13 Monate · Immer gleich**

## Features

- 📅 **Heute**: Automatische Anzeige des heutigen Datums im Ewigen Kalender
- 🔄 **Konverter**: Umrechnung in beide Richtungen (Gregorianisch ↔ Ewig)
- 📆 **Jahresübersicht**: Alle 13 Monate + Unara/Intera, klickbar mit Popup
- 🌸 Farbcodierung nach Jahreszeit (Frühling, Sommer, Herbst, Winter)
- 🌟 Schaltjahr-Unterstützung (Intera)
- 💎 iOS 26 Liquid Glass Design mit Glasmorphismus

## Kalenderstruktur

|Jahreszeit|Monate                                        |
|----------|----------------------------------------------|
|🌸 Frühling|Aurora · Floris · Viridia                     |
|☀️ Sommer  |Solara · Crescera · Luminis · Aestas          |
|🍂 Herbst  |Helion · Fructa · Aurelia                     |
|❄️ Winter  |Ventis · Nivara · Noctis                      |
|✨ Zeitlos |Unara (Tag 365) · Intera (Tag 366, Schaltjahr)|

- Jeder Monat hat genau **28 Tage**
- Jedes Jahr beginnt mit **Aurora** am 1. Januar
- Jeder Monat beginnt am **Montag**
- **Unara** = letzter Tag des Jahres, außerhalb aller Monate
- **Intera** = letzter Tag im Schaltjahr

## Deployment

### Vercel (empfohlen)

1. Repository auf GitHub hochladen
1. Auf [vercel.com](https://vercel.com) einloggen
1. “New Project” → GitHub-Repository auswählen
1. Framework: **Other** (Static)
1. Deploy klicken – fertig! ✅

### Lokale Entwicklung

```bash
# Einfach index.html im Browser öffnen, oder:
npx serve .
```

## Technologie

- Reines HTML/CSS/JavaScript (kein Framework nötig)
- Google Fonts: Nunito + Playfair Display
- Glasmorphismus mit `backdrop-filter`
- Responsive Design für Mobile & Desktop
