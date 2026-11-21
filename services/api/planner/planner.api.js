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
 * Hierarchical search across Countries, States, and Cities.
 */
export async function searchLocations(query = "", limit = 20, signal) {
  const json = await api.get("/v1/public/marketplace/locations/search", {
    params: { q: query, limit },
    signal,
  });
  return json.data || [];
}

/**
 * Dynamic Advertising Screen types (Fixed + Mobile/Transit formats).
 */
export async function fetchCampaignScreenTypes(signal) {
  const json = await api.get("/v1/public/marketplace/campaign/screen-types", { signal });
  return json.data || { types: [], groups: [] };
}
