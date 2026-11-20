import { Suspense } from "react";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import ScreenFinder from "@/components/home/ScreenFinder";
import SizeVisualizer from "@/components/home/SizeVisualizer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductBrowser from "@/components/products/ProductBrowser";
import PriceList from "@/components/products/PriceList";
import DisplayOptions from "@/components/products/DisplayOptions";
import NetworkOption from "@/components/home/NetworkOption";
import FaqSection from "@/components/home/FaqSection";
import GalleryWall from "@/components/home/GalleryWall";
import ScreenStory from "@/components/products/ScreenStory";
import { faqs } from "@/data/site";
import { getPublicProductCategories, getFoundingPartnerPrices, getVisualizerConfiguration } from "@/services/server/marketplace";
import { pageMetadata, JsonLd, foundingPartnerPriceListSchema } from "@/lib/seo";

export const revalidate = 300; // Next.js ISR: revalidate product listing & pricing every 5 minutes

export const metadata = pageMetadata({
  title: "Digital Displays, Standees & Founding Partner Price List 2026",
  description:
    "Browse Illuvision commercial digital displays and explore the 2026 Founding Partner Price List across wall mount, A-frame, half-glass and full-glass standees in 32 to 55 inch.",
  path: "/screens",
});

export default async function ScreensPage() {
  const [categories, foundingPartnerPricing, visualizerConfig] = await Promise.all([
    getPublicProductCategories(),
    getFoundingPartnerPrices(),
    getVisualizerConfiguration(),
  ]);

  const categoryNames = categories.length > 0
    ? categories.map((c) => c.name || c.category_name)
    : ["Digital Displays", "Standees", "Commercial Screens"];

  const priceListJsonLd = foundingPartnerPriceListSchema(foundingPartnerPricing);

  return (
    <>
      {priceListJsonLd && <JsonLd data={priceListJsonLd} />}
      {/* No hero banner: the page leads straight into the listings. */}
      <Breadcrumbs visible={false} items={[{ label: "Home", href: "/" }, { label: "Screens", href: "/screens" }]} />
      <section className="section section--lead" id="browse" aria-labelledby="screens-title">
        <div className="container">
          <h1 id="screens-title" className="visually-hidden">Illuvision digital displays and standees</h1>
          <Suspense fallback={null}>
            <ProductBrowser initialCategories={categories} />
          </Suspense>
        </div>
      </section>
      <PriceList pricingData={foundingPartnerPricing} />
      <DisplayOptions />
      <NetworkOption />
      <GalleryWall />
      <ScreenStory />
      <SizeVisualizer config={visualizerConfig} />
      <ScreenFinder />
      <MarqueeRibbons panel hidden items={categoryNames} />
      <FaqSection items={faqs.general} />
    </>
  );
}
