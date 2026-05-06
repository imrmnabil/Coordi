# Coordi — Google Maps Coordinate Extractor

A **Chrome Extension** (Manifest V3) that extracts coordinates and addresses from Google Maps URLs and copies them to your clipboard — optimized for pasting directly into Google Sheets.

## ✨ Features

- 🔍 **Smart URL Parsing** — Extracts precise coordinates from Google Maps place URLs (`!3d…!4d…` format) with fallback to camera position (`@lat,lng`)
- 📋 **Google Sheets Ready** — "Copy All" outputs tab-separated values: `Address\tLat\tLng` for instant 3-column paste
- 🤖 **Background Auto-Copy** — Enable in popup, then browse Maps normally — coordinates auto-copy to clipboard when you click new pins
- 🎨 **Material 3 Design** — Modern Google design system with light/dark mode support
- 🔒 **Privacy First** — Zero network calls, zero tracking, zero external dependencies

## 📦 Installation

### From GitHub (Developer Mode)

1. **Download** this repository:
   ```bash
   git clone https://github.com/yourusername/coordi.git
   cd coordi
   ```

2. **Open Chrome Extensions**:
   - Navigate to `chrome://extensions`
   - Toggle **Developer mode** (top-right switch)

3. **Load Unpacked**:
   - Click **"Load unpacked"** button
   - Select the `coordi/` folder
   - The Coordi icon will appear in your toolbar

4. **Pin for easy access**:
   - Click the puzzle icon in Chrome toolbar
   - Click the pin next to "Coordi"

## 🚀 Usage

### Manual Copy

1. Navigate to any Google Maps place page (e.g., `https://www.google.com/maps/place/...`)
2. Click the **Coordi icon** in your toolbar
3. Click one of:
   - **"Copy all to clipboard"** — Address + Lat + Lng (tab-separated for Sheets)
   - **"Address"** — Just the street address
   - **"Coords"** — Just `lat, lng`

### Auto-Copy (Hands-Free)

Perfect for rapid data entry:

1. Open Coordi popup → Enable **"Auto-copy on location change"**
2. Browse Google Maps normally — click different places, search new addresses
3. Each new location automatically copies to clipboard
4. **Visual feedback**: Badge shows ✅ on success, ⚠️ on error

Paste into Google Sheets — each "Copy All" fills 3 adjacent columns in one row.

## 🏗️ Architecture

```
coordi/
├── manifest.json          # MV3 manifest + permissions
├── parser.js              # Shared URL parser (popup + background)
├── popup.html / popup.js  # Material 3 UI (manual copy)
├── background.js          # Service worker (auto-copy watcher)
├── offscreen.html/.js     # Clipboard bridge (MV3 requirement)
└── icons/                 # Generated PNG icons (16/48/128)
```

### How Auto-Copy Works

Google Maps is a Single Page App (SPA) — the URL updates without page reloads. The **background service worker**:

1. Listens to `chrome.tabs.onUpdated` for URL changes
2. Parses via shared `parser.js` module
3. Uses **fingerprint deduplication** (address+lat+lng hash) to avoid re-copying same location
4. Writes to clipboard via **offscreen document** (MV3 service workers can't access `navigator.clipboard` directly)
5. Shows **badge feedback** (✅/⚠️) without opening popup

## 🛡️ Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Read current tab URL when popup opens |
| `clipboardWrite` | Copy coordinates to clipboard |
| `storage` | Persist auto-copy toggle preference |
| `tabs` | Monitor URL changes for auto-copy |
| `offscreen` | Bridge for background clipboard writes |

**Host permissions**: `google.com/maps/*`, `maps.google.com/*`

No external API calls. No analytics. No data collection.

## 📝 Example

**Input URL:**
```
https://www.google.com/maps/place/7137+Captiva+Cir,+New+Port+Richey,+FL+34655,+USA/@28.1923725,-82.6968732,19z/data=!4m6!3m5!1s0x88c2922bf80f4a47:0xa31ea7428153184d!8m2!3d28.1923725!4d-82.696326
```

**Copy All output:**
```
7137 Captiva Cir, New Port Richey, FL 34655, USA	28.1923725	-82.696326
```

**Paste into Google Sheets:**
| A | B | C |
|---|---|---|
| 7137 Captiva Cir, New Port Richey, FL 34655, USA | 28.1923725 | -82.696326 |

## 📄 License

MIT License — feel free to fork and modify for your own use.

## 🤝 Credits

- Custom icons in `icons/` folder (16/48/128 PNGs)
- UI designed with [Material 3](https://m3.material.io/) design tokens
- Built for the Chrome Manifest V3 platform
