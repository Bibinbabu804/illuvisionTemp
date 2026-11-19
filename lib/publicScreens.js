import { getProduct } from "@/data/catalog";

/**
 * Fetches dynamic screen data and display variants from the Illuvision backend API.
 * Gracefully falls back to static catalog.js data if the backend is unreachable or offline.
 */
export async function getPublicProductWithVariants(slug) {
  const staticProduct = getProduct(slug);
  if (!staticProduct) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const res = await fetch(`${apiBase}/public/screens/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      const serverData = json.data;

      if (serverData && Array.isArray(serverData.variants) && serverData.variants.length > 0) {
        // Map dynamic variants to frontend schema
        const dynamicVariants = serverData.variants.map((v) => ({
          id: v.id,
          size: Number(v.size),
          display: v.display,
          regular: Number(v.regular),
          founding: Number(v.founding),
          outright: Number(v.outright),
          currency: v.currency || "INR",
          tag: v.tag || null,
          model: v.model_name || null,
          isActive: v.is_active,
        }));

        return {
          ...staticProduct,
          serverScreenId: serverData.id,
          name: serverData.name || staticProduct.name,
          sku: serverData.sku || staticProduct.sku,
          variants: dynamicVariants,
        };
      }
    }
  } catch {
    // Graceful fallback to static catalog data on connection timeout or offline backend
  }

  return staticProduct;
}