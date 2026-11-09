import { products } from "@/data/catalog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap() {
  const now = new Date();
  const pages = ["/", "/screens", "/advertise", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
  // Sample listings are noindex, so they are left out of the sitemap.
  const productPages = products
    .filter((p) => !p.sample)
    .map((p) => ({ url: absoluteUrl(`/screens/${p.slug}`), lastModified: now, priority: 0.7 }));
  return [...pages, ...productPages];
}
