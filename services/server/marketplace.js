const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/+$/, "");

/**
 * Fetch public active product categories with Next.js ISR and tag-based caching.
 *
 * @param {string} [locale='en']
 * @returns {Promise<Array<{ id: number, name: string, slug: string, short: string, image: { src: string, pos: string } }>>}
 */
export async function getPublicProductCategories(locale = "en") {
  const url = `${API_BASE_URL}/v1/public/marketplace/categories?locale=${encodeURIComponent(locale)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 1800, // 30 minutes
        tags: ["marketplace-product-categories"],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[Server Data] Failed to fetch product categories: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("[Server Data] Error fetching product categories:", error.message);
    return [];
  }
}

/**
 * Fetch hero carousel / featured products with Next.js ISR and tag-based caching.
 *
 * @param {number} [limit=6]
 * @param {string} [currency='INR']
 * @returns {Promise<Array<any>>}
 */
export async function getHeroProducts(limit = 6, currency = "INR") {
  const url = `${API_BASE_URL}/v1/public/marketplace/products/featured?limit=${limit}&currency=${currency}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: ["marketplace-products-featured", "marketplace-products"],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[Server Data] Failed to fetch hero products: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("[Server Data] Error fetching hero products:", error.message);
    return [];
  }
}
