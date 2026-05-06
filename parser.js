// Shared Google Maps URL parser used by popup + background.
// Exposed on `self` so it works in both window and service-worker contexts.
(function (root) {
  function parseMapsUrl(url) {
    if (!url) return null;
    let address = null;
    let lat = null;
    let lng = null;

    try {
      const u = new URL(url);
      if (!/google\./.test(u.hostname) || !u.pathname.includes("/maps")) {
        return null;
      }

      const placeMatch = u.pathname.match(/\/place\/([^/]+)/);
      if (placeMatch) {
        try {
          address = decodeURIComponent(placeMatch[1]).replace(/\+/g, " ").trim();
        } catch {
          address = placeMatch[1].replace(/\+/g, " ");
        }
      }

      const dMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (dMatch) {
        lat = parseFloat(dMatch[1]);
        lng = parseFloat(dMatch[2]);
      } else {
        const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (atMatch) {
          lat = parseFloat(atMatch[1]);
          lng = parseFloat(atMatch[2]);
        }
      }
    } catch {
      return null;
    }

    if (lat === null && lng === null && !address) return null;
    return { address, lat, lng };
  }

  function buildClipboardText(data, mode = "all") {
    if (!data) return "";
    if (mode === "address") return data.address || "";
    if (mode === "coords") {
      return data.lat !== null && data.lng !== null
        ? `${data.lat}, ${data.lng}`
        : "";
    }
    // tab-separated for Google Sheets (3 columns)
    const cols = [
      data.address || "",
      data.lat !== null ? data.lat : "",
      data.lng !== null ? data.lng : "",
    ];
    return cols.join("\t");
  }

  function fingerprint(data) {
    if (!data) return "";
    return `${data.address || ""}|${data.lat ?? ""}|${data.lng ?? ""}`;
  }

  root.CoordiParser = { parseMapsUrl, buildClipboardText, fingerprint };
})(typeof self !== "undefined" ? self : this);
