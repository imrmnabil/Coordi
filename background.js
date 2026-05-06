// Coordi background service worker.
// Watches Google Maps tabs and auto-copies the parsed location to the clipboard
// whenever a new place is pinned (URL changes), without requiring the popup to be open.
//
// Clipboard writes happen via an offscreen document because MV3 service workers
// have no DOM and can't use navigator.clipboard.

importScripts("parser.js");

const OFFSCREEN_URL = "offscreen.html";

// Per-tab fingerprint of the last copied location, to avoid redundant copies.
const lastFingerprintByTab = new Map();

async function getAutoCopy() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ autoCopy: false }, (r) => resolve(!!r.autoCopy));
  });
}

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: ["CLIPBOARD"],
      justification: "Write extracted coordinates to clipboard.",
    });
  } catch (e) {
    // If another caller created it concurrently, ignore.
    if (!String(e).includes("Only a single offscreen")) throw e;
  }
}

async function copyToClipboard(text) {
  if (!text) return false;
  await ensureOffscreen();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "coordi-copy", text },
      (resp) => resolve(!!(resp && resp.ok))
    );
  });
}

const DEFAULT_ICON = {
  16: "icons/icon16.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};
const TICK_ICON = {
  16: "icons/tick16.png",
  48: "icons/tick48.png",
  128: "icons/tick128.png",
};

const flashTimers = new Map();

function flashFeedback(tabId, ok) {
  if (!ok) {
    // Keep the small red badge for failures (no icon swap).
    try {
      chrome.action.setBadgeBackgroundColor({ color: "#b3261e" });
      chrome.action.setBadgeText({ text: "!", tabId });
      setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), 1500);
    } catch {}
    return;
  }
  try {
    chrome.action.setIcon({ tabId, path: TICK_ICON });
    clearTimeout(flashTimers.get(tabId));
    flashTimers.set(
      tabId,
      setTimeout(() => {
        try {
          chrome.action.setIcon({ tabId, path: DEFAULT_ICON });
        } catch {}
        flashTimers.delete(tabId);
      }, 1500)
    );
  } catch {}
}

async function handleTabUrl(tabId, url) {
  if (!url) return;
  if (!(await getAutoCopy())) return;

  const data = CoordiParser.parseMapsUrl(url);
  if (!data) return;

  // Need at least coords to be meaningful.
  if (data.lat === null || data.lng === null) return;

  const fp = CoordiParser.fingerprint(data);
  if (lastFingerprintByTab.get(tabId) === fp) return;
  lastFingerprintByTab.set(tabId, fp);

  const text = CoordiParser.buildClipboardText(data, "all");
  const ok = await copyToClipboard(text);
  flashFeedback(tabId, ok);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Maps' SPA updates the URL without a full reload, surfaced as changeInfo.url.
  const url = changeInfo.url || (changeInfo.status === "complete" ? tab.url : null);
  if (!url) return;
  handleTabUrl(tabId, url);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lastFingerprintByTab.delete(tabId);
});

// When the user toggles the pref off, clear the dedupe cache so re-enabling
// will copy the current location again.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "autoCopy" in changes && !changes.autoCopy.newValue) {
    lastFingerprintByTab.clear();
  }
});
