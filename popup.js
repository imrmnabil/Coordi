// Coordi popup. Uses CoordiParser from parser.js (loaded first in popup.html).

const { parseMapsUrl, buildClipboardText } = self.CoordiParser;

function setStatus(msg, kind) {
  const el = document.getElementById("status");
  if (!msg) {
    el.textContent = "";
    el.className = "snackbar";
    return;
  }
  el.textContent = msg;
  el.className = "snackbar show" + (kind ? " " + kind : "");
}

function render(data) {
  const addrEl = document.getElementById("address");
  const latEl = document.getElementById("lat");
  const lngEl = document.getElementById("lng");
  const btnAll = document.getElementById("copyAllBtn");
  const btnAddr = document.getElementById("copyAddrBtn");
  const btnCoords = document.getElementById("copyCoordsBtn");

  if (!data) {
    addrEl.innerHTML = '<span class="empty">Not a Google Maps page</span>';
    setStatus("Open a Google Maps place URL and reopen this popup.", "err");
    return;
  }

  addrEl.textContent = data.address || "—";
  latEl.textContent = data.lat !== null ? data.lat : "—";
  lngEl.textContent = data.lng !== null ? data.lng : "—";

  const hasCoords = data.lat !== null && data.lng !== null;
  const hasAddr = !!data.address;
  btnAll.disabled = !(hasCoords || hasAddr);
  btnAddr.disabled = !hasAddr;
  btnCoords.disabled = !hasCoords;

  if (!hasCoords) setStatus("Coordinates not found in URL.", "err");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

let currentData = null;

async function doCopy(mode, label) {
  if (!currentData) return;
  const text = buildClipboardText(currentData, mode);
  if (!text) {
    setStatus(`Nothing to copy for ${label}.`, "err");
    return;
  }
  const ok = await copyText(text);
  setStatus(ok ? `${label} copied to clipboard!` : "Copy failed.", ok ? "ok" : "err");
}

function loadAutoCopyPref() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get({ autoCopy: false }, (r) => resolve(!!r.autoCopy));
    } catch {
      resolve(false);
    }
  });
}

function saveAutoCopyPref(value) {
  try {
    chrome.storage.local.set({ autoCopy: !!value });
  } catch {}
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentData = parseMapsUrl(tab && tab.url);
    render(currentData);
  } catch (e) {
    setStatus("Failed to read tab URL.", "err");
  }

  const autoEl = document.getElementById("autoCopy");
  autoEl.checked = await loadAutoCopyPref();
  autoEl.addEventListener("change", () => {
    saveAutoCopyPref(autoEl.checked);
    setStatus(
      autoEl.checked
        ? "Background auto-copy enabled."
        : "Background auto-copy disabled.",
      "ok"
    );
  });

  document.getElementById("copyAllBtn").addEventListener("click", () => doCopy("all", "Row"));
  document.getElementById("copyAddrBtn").addEventListener("click", () => doCopy("address", "Address"));
  document.getElementById("copyCoordsBtn").addEventListener("click", () => doCopy("coords", "Coords"));
});
