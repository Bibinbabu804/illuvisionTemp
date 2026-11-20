import { api } from "@/lib/api/client";

/**
 * Fetch featured products for the public homepage.
 *
 * @param {number} [limit=8]
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('./product.types').PublicProduct[]>}
 */
export async function fetchFeaturedProducts(limit = 8, signal) {
  const json = await api.get("/v1/public/marketplace/products/featured", {
    params: { limit },
    signal,
  });
  return json.data || [];
}

/**
 * Fetch paginated and filtered products for public screen/product listing.
 *
 * @param {Object} [filters={}]
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ data: import('./product.types').PublicProduct[], pagination: any }>}
 */
export async function fetchPublicProducts(filters = {}, signal) {
  const json = await api.get("/v1/public/marketplace/products", {
    params: filters,
    signal,
  });
  return {
    data: json.data || [],
    pagination: json.pagination || null,
  };
}

/**
 * Fetch single product details with variants by slug.
 *
 * @param {string} slug
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('./product.types').PublicProduct>}
 */
export async function fetchPublicProduct(slug, signal) {
  const json = await api.get(`/v1/public/marketplace/products/${slug}`, {
    signal,
  });
  return json.data;
}
