/**
 * Normalization, coordinate validation, deduplication, and type mapping
 * for live Advertising Screen Management assets rendered on the Screen Network map.
 *
 * Strictly scoped to Advertising Screen assets (/api/v1/public/marketplace/screens/map).
 */

/**
 * Validate latitude & longitude strictly before passing to Leaflet.
 * Rejects null, non-numeric, NaN, out-of-range, and (0, 0) placeholder coordinates.
 */
export function isValidCoordinate(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  if (lat === "" || lng === "") return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) return false;
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) return false;
  if (numLat === 0 && numLng === 0) return false;
  return true;
}

/**
 * Map backend Advertising Screen types into the 4 visual map legend categories
 * without altering the existing map pin/legend design.
 */
export function classifyScreenType(screenType = "", assetType = "") {
  const combined = `${screenType || ""} ${assetType || ""}`.toLowerCase();
  if (combined.includes("led") || combined.includes("video wall") || combined.includes("billboard") || combined.includes("van") || combined.includes("truck")) {
    return "led";
  }
  if (combined.includes("outdoor") || combined.includes("flyover") || combined.includes("road") || combined.includes("bus") || combined.includes("taxi") || combined.includes("drone") || combined.includes("mobile")) {
    return "outdoor";
  }
  if (combined.includes("standee") || combined.includes("kiosk") || combined.includes("walking")) {
    return "standee";
  }
  return "indoor";
}

/**
 * Normalize & deduplicate raw backend MapAssetResource records.
 * Excludes records with invalid coordinates and exposes only public fields.
 */
export function normalizeMapScreens(rawList) {
  if (!Array.isArray(rawList)) return [];

  const seenIds = new Set();
  const normalized = [];

  for (const s of rawList) {
    if (!s || typeof s !== "object") continue;
    if (!isValidCoordinate(s.latitude, s.longitude)) continue;

    const canonicalId = String(s.id ?? s.screen_code ?? "");
    if (!canonicalId || seenIds.has(canonicalId)) continue;
    seenIds.add(canonicalId);

    const lat = Number(s.latitude);
    const lng = Number(s.longitude);
    const cityName = s.city?.name ? String(s.city.name).trim() : "Other";
    const screenName = String(s.name || s.location_name || s.screen_code || "Advertising Screen").trim();
    const locationText = String(s.location_name || s.name || cityName).trim();

    normalized.push({
      id: canonicalId,
      code: s.screen_code ? String(s.screen_code) : canonicalId,
      name: locationText,
      venue: screenName,
      area: cityName,
      type: classifyScreenType(s.screen_type, s.asset_type),
      rawType: s.screen_type ? String(s.screen_type) : null,
      status: s.booking_status === "available" ? "available" : "enquiry",
      lat,
      lng,
    });
  }

  return normalized;
}

/**
 * Extract sorted unique city/area names from live normalized screens.
 */
export function extractDynamicAreas(screens) {
  if (!Array.isArray(screens) || screens.length === 0) return [];
  const counts = new Map();
  for (const s of screens) {
    if (!s.area) continue;
    counts.set(s.area, (counts.get(s.area) || 0) + 1);
  }
  return Array.from(counts.keys()).sort((a, b) => a.localeCompare(b));
}
