import { api } from "@/lib/api/client";

/**
 * Detect visitor currency context from public IP via backend CurrencyController.
 * Visitor-specific — never cached in shared Next.js ISR.
 */
export async function fetchCurrencyContext(signal) {
  const json = await api.get("/currency/context", { signal });
  return json.data || null;
}

/**
 * Fetch supported currencies with symbols, decimals, and locales.
 */
export async function fetchSupportedCurrencies(signal) {
  const json = await api.get("/currencies", { signal });
  const map = json.data?.currencies || {};
  return Object.entries(map).map(([code, meta]) => ({
    code,
    symbol: meta.symbol || code,
    name: meta.name || code,
    decimals: meta.decimals ?? 2,
    locale: meta.locale || "en-US",
  }));
}

/**
 * City-only location search with state-to-city expansion and alias resolution.
 */
export async function searchLocations(query = "", limit = 20, signal) {
  const json = await api.get("/v1/public/marketplace/locations/search", {
    params: { q: query, limit },
    signal,
  });
  return json.data || [];
}

/**
 * Nearby cities ranked by real geographical distance (Haversine).
 * Priority: selected cityId -> browser lat/lng -> backend IP geolocation fallback.
 */
export async function fetchNearbyLocations(
  { cityId = null, lat = null, lng = null, excludeIds = [], limit = 8 } = {},
  signal
) {
  const params = { limit };
  if (cityId) {
    params.city_id = cityId;
  } else if (lat != null && lng != null) {
    params.lat = lat;
    params.lng = lng;
  }
  if (Array.isArray(excludeIds) && excludeIds.length > 0) {
    params.exclude_ids = [...new Set(excludeIds.map(Number).filter((n) => n > 0))]
      .sort((a, b) => a - b)
      .join(",");
  }

  const json = await api.get("/v1/public/marketplace/locations/nearby", {
    params,
    signal,
  });

  return {
    items: json.data || [],
    meta: json.meta || { source: "unavailable", reference_city: null, count: 0 },
  };
}

/**
 * Dynamic Advertising Screen types (Fixed + Mobile/Transit formats),
 * optionally filtered by selected city IDs.
 */
export async function fetchCampaignScreenTypes(cityIds = [], signal) {
  const sorted = [...new Set((cityIds || []).map(Number).filter((n) => n > 0))].sort((a, b) => a - b);
  const params = sorted.length > 0 ? { city_ids: sorted.join(",") } : undefined;
  const json = await api.get("/v1/public/marketplace/campaign/screen-types", {
    params,
    signal,
  });
  return json.data || { types: [], groups: [], filtered_by_cities: false, city_ids: [] };
}

/**
 * Generate up to three distinct, feasible campaign packages grounded in live backend inventory & pricing.
 */
export async function generateCampaignRecommendations(payload, signal) {
  const json = await api.post("/v1/public/marketplace/campaign/recommendations", payload, { signal });
  return json.data || { status_code: "ERROR", packages: [], limitations: [] };
}

/**
 * Persist an immutable campaign proposal snapshot, generate branded PDF, and return secure links + WhatsApp message.
 */
export async function createCampaignProposal(payload, signal) {
  const json = await api.post("/v1/public/marketplace/campaign/proposals", payload, { signal });
  return json.data || null;
}

/**
 * Fetch an immutable campaign proposal by opaque public token.
 */
export async function fetchCampaignProposal(token, signal) {
  const json = await api.get(`/v1/public/marketplace/campaign/proposals/${encodeURIComponent(token)}`, { signal });
  return json.data || null;
}
