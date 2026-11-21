import { getPublicProductSlugs } from "@/services/server/marketplace";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 1800; // Revalidate sitemap every 30 minutes via ISR

export default async function sitemap() {
  const now = new Date();
  const pages = ["/", "/screens", "/advertise", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const slugs = await getPublicProductSlugs();
  const productPages = slugs.map((slug) => ({
    url: absoluteUrl(`/screens/${slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pages, ...productPages];
}
