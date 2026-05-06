// Offscreen document: receives copy requests from the service worker
// and writes to the clipboard via the legacy execCommand path,
// which works reliably from offscreen documents (no user-gesture requirement).

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== "coordi-copy") return false;
  try {
    const ta = document.getElementById("sink");
    ta.value = msg.text || "";
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    sendResponse({ ok });
  } catch (e) {
    sendResponse({ ok: false, error: String(e) });
  }
  return true; // async response
});
