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
 * Fetch a single public active product category by slug with Next.js ISR.
 *
 * @param {string} slug
 * @param {string} [locale='en']
 */
export async function getPublicProductCategory(slug, locale = "en") {
  if (!slug) return null;
  const url = `${API_BASE_URL}/v1/public/marketplace/categories/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 1800, // 30 minutes
        tags: ["marketplace-product-categories", `marketplace-category:${slug}`],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error(`[Server Data] Error fetching category "${slug}":`, error.message);
    return null;
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

/**
 * Fetch the dynamic Founding Partner Price List (2026) with Next.js ISR and tag-based caching.
 * Never falls back to hardcoded prices; signals `unavailable: true` on upstream errors.
 *
 * @param {{ currency?: string, locale?: string, year?: number }} [options]
 */
export async function getFoundingPartnerPrices({ currency = "INR", locale = "en", year = 2026 } = {}) {
  const params = new URLSearchParams({
    currency,
    locale,
    year: String(year),
  });
  const url = `${API_BASE_URL}/v1/public/marketplace/products/founding-partner-prices?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: ["marketplace-founding-partner-prices", "marketplace-products"],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[Server Data] Failed to fetch Founding Partner prices: HTTP ${res.status}`);
      return {
        title: `Founding Partner Price List ${year}`,
        year,
        currency,
        products: [],
        items: [],
        last_updated_at: null,
        unavailable: true,
      };
    }

    const json = await res.json();
    const data = json.data || {};
    return {
      title: data.title || `Founding Partner Price List ${year}`,
      year: data.year || year,
      currency: data.currency || currency,
      products: Array.isArray(data.products) ? data.products : [],
      items: Array.isArray(data.items) ? data.items : [],
      last_updated_at: data.last_updated_at || null,
      unavailable: false,
    };
  } catch (error) {
    console.error("[Server Data] Error fetching Founding Partner prices:", error.message);
    return {
      title: `Founding Partner Price List ${year}`,
      year,
      currency,
      products: [],
      items: [],
      last_updated_at: null,
      unavailable: true,
    };
  }
}

/**
 * Fetch a single public Marketplace Product by slug with Next.js ISR and granular tag caching.
 * Returns null if the product does not exist or is inactive (404).
 *
 * @param {string} slug
 * @param {{ locale?: string, currency?: string }} [options]
 */
export async function getMarketplaceProductBySlug(slug, { locale = "en", currency = "INR" } = {}) {
  if (!slug) return null;
  const cleanSlug = encodeURIComponent(String(slug));
  const params = new URLSearchParams({ locale, currency });
  const url = `${API_BASE_URL}/v1/public/marketplace/products/${cleanSlug}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: [
          "marketplace-products",
          `marketplace-product:${slug}`,
          `marketplace-product-pricing:${slug}`,
        ],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`[Server Data] Failed to fetch product "${slug}": HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error(`[Server Data] Error fetching product "${slug}":`, error.message);
    return null;
  }
}

/**
 * Fetch active public product slugs for optional build-time static pre-warming.
 */
export async function getPublicProductSlugs() {
  const url = `${API_BASE_URL}/v1/public/marketplace/products?per_page=50`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: 300,
        tags: ["marketplace-products"],
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((p) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}
