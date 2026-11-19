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
import { categories } from "@/data/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Digital displays, standees and prices",
  description:
    "Browse Illuvision digital displays: wall mount, A-frame, half-glass and full-glass standees in 32 to 55 inch, with Panasonic or Illuvision displays. See the Founding Partner Price List 2026.",
  path: "/screens",
});

export default function ScreensPage() {
  return (
    <>
      {/* No hero banner: the page leads straight into the listings. */}
      <Breadcrumbs visible={false} items={[{ label: "Home", href: "/" }, { label: "Screens", href: "/screens" }]} />
      <section className="section section--lead" id="browse" aria-labelledby="screens-title">
        <div className="container">
          <h1 id="screens-title" className="visually-hidden">Illuvision digital displays and standees</h1>
          <Suspense fallback={null}>
            <ProductBrowser />
          </Suspense>
        </div>
      </section>
      <PriceList />
      <DisplayOptions />
      <NetworkOption />
      <GalleryWall />
      <ScreenStory />
      <SizeVisualizer />
      <ScreenFinder />
      <MarqueeRibbons panel hidden items={categories.map((c) => c.name)} />
      <FaqSection items={faqs.general} />
    </>
  );
}
