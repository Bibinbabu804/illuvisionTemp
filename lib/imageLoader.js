"use client";

/**
 * Global next/image loader.
 * - Unsplash stock (temporary): resized and format-negotiated (AVIF/WebP)
 *   by Unsplash's own CDN, so the app server never downloads full-size
 *   originals.
 * - Local assets: served as-is (a custom loader disables /_next/image), so
 *   commit them already sized and compressed, e.g. assets/images/logo-web.png.
 */
export default function imageLoader({ src, width, quality }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 70));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }
  return src;
}
