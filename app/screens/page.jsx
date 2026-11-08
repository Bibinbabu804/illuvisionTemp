import { Suspense } from "react";
import ScrubText from "@/components/motion/ScrubText";
import ScreenFinder from "@/components/home/ScreenFinder";
import SizeVisualizer from "@/components/home/SizeVisualizer";
import ScreensHero from "@/components/products/ScreensHero";
import ProductBrowser from "@/components/products/ProductBrowser";
import FaqSection from "@/components/home/FaqSection";
import { faqs } from "@/data/site";
import { products } from "@/data/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop commercial digital screens",
  description:
    "Browse Illuvision commercial screens by category: indoor displays, LED video walls, outdoor LED, digital standees, interactive panels and menu boards. Request a confirmed quote.",
  path: "/screens",
});

export default function ScreensPage() {
  const hasSamples = products.some((p) => p.sample);
  return (
    <>
      <ScreensHero hasSamples={hasSamples} />
      <section className="section" id="browse" aria-label="Screen listings">
        <div className="container">
          <Suspense fallback={null}>
            <ProductBrowser />
          </Suspense>
        </div>
      </section>
      <SizeVisualizer />
      <ScreenFinder />
      <ScrubText words={["Indoor", "LED walls", "Outdoor", "Standees"]} />
      <FaqSection items={faqs.general} />
    </>
  );
}
