import { Suspense } from "react";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import ScreenFinder from "@/components/home/ScreenFinder";
import SizeVisualizer from "@/components/home/SizeVisualizer";
import MediaHero from "@/components/ui/MediaHero";
import Button from "@/components/ui/Button";
import { videos } from "@/data/media";
import { EVENTS } from "@/lib/analytics";
import ProductBrowser from "@/components/products/ProductBrowser";
import FaqSection from "@/components/home/FaqSection";
import GalleryWall from "@/components/home/GalleryWall";
import ScreenStory from "@/components/products/ScreenStory";
import { faqs } from "@/data/site";
import { categories } from "@/data/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop commercial digital screens",
  description:
    "Browse Illuvision commercial screens by category: indoor displays, LED video walls, outdoor LED, digital standees, interactive panels and menu boards. Request a confirmed quote.",
  path: "/screens",
});

export default function ScreensPage() {
  return (
    <>
      <MediaHero
        video={videos.reelRetro}
        crumbs={[{ label: "Home", href: "/" }, { label: "Screens", href: "/screens" }]}
        lines={["Find the screen", <>that fits your <em>space.</em></>]}
        lead="Browse by category, open any screen for details and request a quote with confirmed specifications, pricing and delivery."
      >
        <Button href="#browse" variant="light" icon="screen" event={EVENTS.SHOP_CTA} eventProps={{ section: "screens-hero" }}>
          Browse screens
        </Button>
        <Button href="/contact" variant="outline-inv">
          Talk to the team
        </Button>
      </MediaHero>
      <section className="section" id="browse" aria-label="Screen listings">
        <div className="container">
          <Suspense fallback={null}>
            <ProductBrowser />
          </Suspense>
        </div>
      </section>
      <GalleryWall />
      <ScreenStory />
      <SizeVisualizer />
      <ScreenFinder />
      <MarqueeRibbons panel items={categories.map((c) => c.name)} />
      <FaqSection items={faqs.general} />
    </>
  );
}
