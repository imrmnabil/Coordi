# Coordi — Google Maps Coordinate Extractor

A Chrome extension that grabs the **address** and **coordinates** from a Google Maps tab and copies them to your clipboard — formatted to paste straight into Google Sheets.

## What it does

When you're on a Google Maps place page, Coordi extracts:

- **Address** — e.g. `7137 Captiva Cir, New Port Richey, FL 34655, USA`
- **Latitude / Longitude** — e.g. `28.1923725, -82.696326`

And copies them in three handy ways:

- **Copy Row for Sheets** — tab-separated `Address⇥Lat⇥Lng`, fills 3 columns in one row when pasted into Google Sheets
- **Address only** — just the street address
- **Coords only** — just `lat, lng`

There's also an **auto-copy** mode: turn it on once, then browse Maps normally — every time you click a new pin, the location is automatically copied to your clipboard, with a ✓ badge on the toolbar icon for confirmation.

## Install

1. Clone or download this repo:
   ```bash
   git clone https://github.com/imrmnabil/Coordi.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked** and pick the `Coordi` folder.
5. Pin the extension to your toolbar (puzzle icon → pin).

## How to use

### Manual

1. Open any Google Maps place page.
2. Click the Coordi icon in your toolbar.
3. Click **Copy Row for Sheets**, **Address only**, or **Coords only**.
4. Paste anywhere.

### Auto-copy (hands-free)

1. Open the popup once and turn on **Auto-copy on pin change**.
2. Browse Google Maps normally — click pins, search places.
3. Each new location is copied automatically. A green **✓** flashes on the toolbar icon when it succeeds.
4. Paste rows straight into Google Sheets — each row drops into 3 columns.

## Privacy

No network calls, no analytics, no tracking. Everything happens locally by reading the URL of your active Maps tab.

## License

MIT
