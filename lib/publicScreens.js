import { getProduct } from "@/data/catalog";

/**
 * Fetches dynamic product data and display variants from the Illuvision backend API.
 * Gracefully falls back to static catalog.js data if the backend is unreachable or offline.
 */
export async function getPublicProductWithVariants(slug) {
  const staticProduct = getProduct(slug);
  if (!staticProduct) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const res = await fetch(`${apiBase}/products/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      const serverData = json.data;

      if (serverData && Array.isArray(serverData.variants) && serverData.variants.length > 0) {
        // Map dynamic ProductDisplayVariant records to frontend schema
        const dynamicVariants = serverData.variants.map((v) => {
          // Parse numeric size from "32", "32 Inch", "32″" etc.
          const rawSize = v.display_size ?? v.size ?? "";
          const numericSize = parseInt(String(rawSize).replace(/[^0-9]/g, ""), 10) || rawSize;

          return {
            id: v.id,
            size: numericSize,
            display: v.brand_name || v.display || "Illuvision",
            regular: Number(v.regular_price ?? v.regular ?? 0),
            founding: Number(v.founding_price ?? v.founding ?? 0),
            outright: Number(v.outright_price ?? v.outright ?? 0),
            currency: v.currency_code || v.currency || "INR",
            tag: v.tag || null,
            isActive: v.is_active ?? true,
          };
        });

        const activeVariants = dynamicVariants.filter((v) => v.isActive);
        const foundingPrices = activeVariants.map((v) => v.founding).filter((p) => p > 0);
        const dynamicMinPrice = foundingPrices.length > 0 ? Math.min(...foundingPrices) : staticProduct.price;

        return {
          ...staticProduct,
          serverProductId: serverData.id,
          productId: serverData.id,
          name: serverData.name || staticProduct.name,
          sku: serverData.model_number || staticProduct.sku,
          variants: activeVariants.length > 0 ? activeVariants : dynamicVariants,
          price: dynamicMinPrice,
        };
      }
    }
  } catch {
    // Graceful fallback to static catalog data on connection timeout or offline backend
  }

  return staticProduct;
}
