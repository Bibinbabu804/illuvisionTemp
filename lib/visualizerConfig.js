/**
 * Safe Configuration Adapter & Versioned Fallback for SizeVisualizer.
 *
 * Isolates the CSS container-query rendering engine from raw backend payloads,
 * prevents unsupported enclosure types or NaN slider states, and cleanly
 * distinguishes genuine API failures (fallback) from explicit empty backend lists.
 */

export const SUPPORTED_ENCLOSURES = ["wall-mount", "a-frame", "half-glass", "full-glass"];

export const CURATED_ARTWORK = {
  "wall-mount": "/images/products/screen-wall-mount.webp",
  "a-frame": "/images/products/screen-a-frame.webp",
  "half-glass": "/images/products/screen-half-glass.webp",
  "full-glass": "/images/products/screen-full-glass.webp",
};

export const FALLBACK_VISUALIZER_CONFIG = {
  revision: "fallback_v1",
  source: "fallback",
  defaultFormatId: "wall-mount",
  defaultSizeInches: 43,
  formats: [
    {
      id: "wall-mount",
      slug: "wall-mount",
      label: "Wall mount",
      enclosureType: "wall-mount",
      defaultOrientation: "landscape",
      sizes: [32, 43, 55],
      unit: "inch",
      aspectRatio: "16:9",
      note: "Saves floor space.",
      productSlug: "wall-mount-display",
      productUrl: "/screens/wall-mount-display#prices",
      content: CURATED_ARTWORK["wall-mount"],
      displayOrder: 1,
    },
    {
      id: "a-frame",
      slug: "a-frame-standee",
      label: "A-frame standee",
      enclosureType: "a-frame",
      defaultOrientation: "portrait",
      sizes: [32, 43],
      unit: "inch",
      aspectRatio: "16:9",
      note: "Folds away, perfect for entrances.",
      productSlug: "a-frame-standee",
      productUrl: "/screens/a-frame-standee#prices",
      content: CURATED_ARTWORK["a-frame"],
      displayOrder: 2,
    },
    {
      id: "half-glass",
      slug: "half-glass-standee",
      label: "Half-glass standee",
      enclosureType: "half-glass",
      defaultOrientation: "portrait",
      sizes: [32, 43, 50, 55],
      unit: "inch",
      aspectRatio: "16:9",
      note: "Sleek, with a solid lower panel.",
      productSlug: "half-glass-standee",
      productUrl: "/screens/half-glass-standee#prices",
      content: CURATED_ARTWORK["half-glass"],
      displayOrder: 3,
    },
    {
      id: "full-glass",
      slug: "full-glass-standee",
      label: "Full-glass standee",
      enclosureType: "full-glass",
      defaultOrientation: "portrait",
      sizes: [32, 43, 50, 55],
      unit: "inch",
      aspectRatio: "16:9",
      note: "Premium full-height glass front.",
      productSlug: "full-glass-standee",
      productUrl: "/screens/full-glass-standee#prices",
      content: CURATED_ARTWORK["full-glass"],
      displayOrder: 4,
    },
  ],
};

function normalizeSizes(rawSizes) {
  if (!Array.isArray(rawSizes)) return [];
  const unique = new Set();
  for (const val of rawSizes) {
    const num = Number(val);
    if (Number.isFinite(num) && num > 0 && num <= 200) {
      unique.add(Number.isInteger(num) ? num : Number(num.toFixed(1)));
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

/**
 * Normalize server-fetched visualizer configuration into a rendering-safe structure.
 *
 * @param {{ ok: boolean, data?: any, error?: string } | null | undefined} apiResult
 */
export function normalizeVisualizerConfig(apiResult) {
  // Genuine failure / unavailable API -> use versioned local fallback
  if (!apiResult || apiResult.ok === false || !apiResult.data || typeof apiResult.data !== "object") {
    return FALLBACK_VISUALIZER_CONFIG;
  }

  const rawData = apiResult.data;
  if (!Array.isArray(rawData.formats)) {
    return FALLBACK_VISUALIZER_CONFIG;
  }

  // Backend explicitly returned an empty eligible list -> do NOT show stale fallback products
  if (rawData.formats.length === 0) {
    return {
      revision: rawData.revision || "api_empty",
      source: "api-empty",
      defaultFormatId: null,
      defaultSizeInches: null,
      formats: [],
    };
  }

  const seenIds = new Set();
  const normalizedFormats = [];

  for (const raw of rawData.formats) {
    if (!raw || typeof raw !== "object") continue;

    const enclosure = String(raw.enclosure_type || raw.id || "").trim();
    if (!SUPPORTED_ENCLOSURES.includes(enclosure)) {
      continue; // Never render an unsupported enclosure chassis
    }

    const id = SUPPORTED_ENCLOSURES.includes(String(raw.id || "").trim())
      ? String(raw.id).trim()
      : enclosure;

    if (seenIds.has(id)) continue;

    const sizes = normalizeSizes(raw.sizes);
    if (sizes.length === 0) continue; // Exclude formats without valid sizes

    const productSlug = String(raw.product_slug || raw.product || "").trim();
    if (!productSlug) continue;

    const productUrl =
      typeof raw.product_url === "string" && raw.product_url.startsWith("/")
        ? raw.product_url
        : `/screens/${productSlug}#prices`;

    const defaultOrientation =
      raw.default_orientation === "landscape" || raw.default_orientation === "portrait"
        ? raw.default_orientation
        : enclosure === "wall-mount"
          ? "landscape"
          : "portrait";

    const artworkUrl =
      typeof raw.artwork_url === "string" && raw.artwork_url.trim()
        ? raw.artwork_url.trim()
        : CURATED_ARTWORK[enclosure];

    seenIds.add(id);
    normalizedFormats.push({
      id,
      slug: String(raw.slug || id),
      label: String(raw.label || id).trim(),
      enclosureType: enclosure,
      defaultOrientation,
      sizes,
      unit: String(raw.unit || "inch"),
      aspectRatio: String(raw.aspect_ratio || "16:9"),
      note: String(raw.note || "").trim(),
      productSlug,
      productUrl,
      content: artworkUrl,
      displayOrder: Number.isFinite(Number(raw.display_order)) ? Number(raw.display_order) : 0,
    });
  }

  // If API returned formats but every single entry was invalid/unsupported -> safe empty state
  if (normalizedFormats.length === 0) {
    return {
      revision: rawData.revision || "api_filtered_empty",
      source: "api-empty",
      defaultFormatId: null,
      defaultSizeInches: null,
      formats: [],
    };
  }

  const defaultFormat =
    normalizedFormats.find((f) => f.id === rawData.default_format_id) || normalizedFormats[0];

  const requestedSize = Number(rawData.default_size_inches);
  const defaultSizeInches =
    Number.isFinite(requestedSize) && defaultFormat.sizes.includes(requestedSize)
      ? requestedSize
      : defaultFormat.sizes.includes(43)
        ? 43
        : defaultFormat.sizes[0];

  return {
    revision: String(rawData.revision || "api_v1"),
    source: "api",
    defaultFormatId: defaultFormat.id,
    defaultSizeInches,
    formats: normalizedFormats,
  };
}
