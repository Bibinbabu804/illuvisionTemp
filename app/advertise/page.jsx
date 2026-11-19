import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NetworkSection from "@/components/advertise/NetworkSection";
import Placements from "@/components/advertise/Placements";
import Planner from "@/components/advertise/Planner";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import EnquirySection from "@/components/advertise/EnquirySection";
import FaqSection from "@/components/home/FaqSection";
import { faqs } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Advertise on digital screens",
  description:
    "Advertise across Illuvision's associated digital screen network. Set your budget, browse screens by location and send a campaign enquiry. Availability and pricing confirmed by Illuvision.",
  path: "/advertise",
});

export default function AdvertisePage() {
  return (
    <>
      {/* No hero banner: the budget planner leads, then the map. */}
      <Breadcrumbs visible={false} items={[{ label: "Home", href: "/" }, { label: "Advertise", href: "/advertise" }]} />
      <Planner inPage lead headingAs="h1" index={1} />
      <NetworkSection enquiryHref="#enquiry" index={2} />
      <Placements index={3} />
      <EnquirySection index={4} />
      <MarqueeRibbons panel hidden items={["Your brand", "On screen", "Your budget", "Your plan", "Seen across the city"]} />
      <FaqSection index={5} items={faqs.advertising} title={["Advertising", "questions."]} />
    </>
  );
}
