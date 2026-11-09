import HomeBanner from "./home/HomeBanner";
import ScrollSequence from "@/components/home/ScrollSequence";
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
import FaqSection from "@/components/home/FaqSection";
import Testimonials from "@/components/home/Testimonials";
import PageView from "@/components/home/PageView";
import ScrollScale from "@/components/motion/ScrollScale";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import AdIntro from "@/components/advertise/AdIntro";
import NetworkSection from "@/components/advertise/NetworkSection";
import Planner from "@/components/advertise/Planner";
import HowItWorks from "@/components/advertise/HowItWorks";
import { categories } from "@/data/catalog";
import { faqs } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    description:
      "Shop commercial digital screens from Illuvision: indoor displays, LED video walls, outdoor LED and digital standees. Request a quote or plan an advertising campaign on our screen network.",
    path: "/",
  }),
  title: { absolute: "Illuvision — Commercial digital screens & screen advertising" },
};

export default function HomePage() {
  const names = categories.map((c) => c.name);
  return (
    <>
      <PageView event={EVENTS.HOME_VIEW} />
      {/* Screen sales first */}
      <HomeBanner />
      <Statement index={1} />
      <ScrollSequence />
      <MarqueeRibbons items={names} />
      <CategoryList index={2} />
      <ScreenFinder index={3} />
      <Showreel />
      <FeaturedProducts index={4} />
      <BuyingStory index={5} />
      <SizeVisualizer index={6} />
      <ScrollScale>
        <WhySection index={7} />
      </ScrollScale>
      <Showcase index={8} />
      <SpecGuide index={9} />
      <NetworkOption />
      {/* Advertising — secondary proposition */}
      <AdIntro index={10} />
      <NetworkSection index={11} />
      <Planner index={12} />
      <HowItWorks index={13} />
      <MarqueeRibbons panel items={["Project your vision", "Screens that sell", "Indoor to outdoor", "Seen by the room"]} />
      <Testimonials />
      <FaqSection index={14} items={[...faqs.general, faqs.advertising[0]]} />
    </>
  );
}
