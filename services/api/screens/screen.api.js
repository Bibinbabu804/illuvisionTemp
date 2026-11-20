import { api } from "@/lib/api/client";

/**
 * Fetch public screen inventory with filters and pagination.
 *
 * @param {Object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ data: import('./screen.types').PublicScreen[], pagination: any, stats: any }>}
 */
export async function fetchScreens(filters = {}, signal) {
  const json = await api.get("/screens", {
    params: { ...filters, is_public: 1 },
    signal,
  });
  return {
    data: json.data || [],
    pagination: json.pagination || null,
    stats: json.stats || null,
  };
}

/**
 * Fetch map screen inventory with coordinates and lightweight attributes.
 *
 * @param {Object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<any[]>}
 */
export async function fetchMapScreens(filters = {}, signal) {
  const json = await api.get("/screens/map", {
    params: { ...filters, is_public: 1 },
    signal,
  });
  return json.data || [];
}

/**
 * Fetch individual screen detail.
 *
 * @param {string|number} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('./screen.types').PublicScreen>}
 */
export async function fetchScreenDetail(id, signal) {
  const json = await api.get(`/screens/${id}`, {
    signal,
  });
  return json.data;
}
