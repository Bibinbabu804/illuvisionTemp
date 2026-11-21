import HomeBanner from "./home/HomeBanner";
import Statement from "@/components/home/Statement";
import CategoryList from "@/components/home/CategoryList";
import Showreel from "@/components/home/Showreel";
import ScreenFinder from "@/components/home/ScreenFinder";
import SizeVisualizer from "@/components/home/SizeVisualizer";
import BuyingStory from "@/components/home/BuyingStory";
import WhySection from "@/components/home/WhySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Showcase from "@/components/home/Showcase";
import SpecGuide from "@/components/home/SpecGuide";
import NetworkOption from "@/components/home/NetworkOption";
import PartnerEarn from "@/components/home/PartnerEarn";
import FaqSection from "@/components/home/FaqSection";
import Testimonials from "@/components/home/Testimonials";
import PageView from "@/components/home/PageView";
import ScrollScale from "@/components/motion/ScrollScale";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import AdStart from "@/components/advertise/AdStart";
import AdIntro from "@/components/advertise/AdIntro";
import NetworkSection from "@/components/advertise/NetworkSection";
import Planner from "@/components/advertise/Planner";
import AdStory from "@/components/advertise/AdStory";
import { getPublicProductCategories, getHeroProducts, getVisualizerConfiguration } from "@/services/server/marketplace";
import { faqs } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300; // Next.js ISR: revalidate homepage every 5 minutes

export const metadata = {
  ...pageMetadata({
    description:
      "Illuvision digital displays for shops, restaurants, clinics and showrooms across Kerala: wall mount displays and A-frame, half-glass and full-glass standees. Your screen promotes your shop, and can earn from ads.",
    path: "/",
  }),
  title: { absolute: "Illuvision — Commercial digital screens & screen advertising" },
};

export default async function HomePage() {
  const [categories, heroProducts, visualizerConfig] = await Promise.all([
    getPublicProductCategories(),
    getHeroProducts(6),
    getVisualizerConfiguration(),
  ]);

  const names = categories.length > 0
    ? categories.map((c) => c.name || c.category_name)
    : ["Digital Displays", "Standees", "Commercial Screens"];

  return (
    <>
      <PageView event={EVENTS.HOME_VIEW} />
      {/* Screen sales first. The hero carries the scroll-scrubbed city film. */}
      <HomeBanner heroProducts={heroProducts} />
      <Statement index={1} />
      <MarqueeRibbons items={names} hidden />
      <CategoryList index={2} categories={categories} />
      <SizeVisualizer index={3} config={visualizerConfig} />
      <ScreenFinder index={4} />
      <FeaturedProducts index={5} />
      <BuyingStory index={6} />
      <ScrollScale>
        <WhySection index={7} />
      </ScrollScale>
      <Showcase index={8} products={heroProducts} />
      <SpecGuide index={9} />
      <NetworkOption />
      <PartnerEarn />
      {/* Advertising — secondary proposition */}
      <AdStart />
      <AdIntro index={10} />
      <Planner index={11} />
      <NetworkSection index={12} />
      <AdStory />
      <MarqueeRibbons panel hidden items={["Project your vision", "Screens that sell", "Indoor to outdoor", "Seen by the room"]} />
      <Testimonials />
      <Showreel />
      <FaqSection index={13} items={[...faqs.general, faqs.advertising[0]]} />
    </>
  );
}
