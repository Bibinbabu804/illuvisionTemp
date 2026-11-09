import Button from "@/components/ui/Button";
import MediaHero from "@/components/ui/MediaHero";
import NetworkSection from "@/components/advertise/NetworkSection";
import Placements from "@/components/advertise/Placements";
import Planner from "@/components/advertise/Planner";
import AdStory from "@/components/advertise/AdStory";
import MarqueeRibbons from "@/components/home/MarqueeRibbons";
import EnquirySection from "@/components/advertise/EnquirySection";
import FaqSection from "@/components/home/FaqSection";
import { videos } from "@/data/media";
import { faqs } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
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
      <MediaHero
        video={videos.streetKiosk}
        crumbs={[{ label: "Home", href: "/" }, { label: "Advertise", href: "/advertise" }]}
        lines={["Your message, on screens", <>that get <em>noticed.</em></>]}
        lead={
          <>
            Tell us your budget and goals. We match your campaign to suitable screens on
            Illuvision&rsquo;s associated network and confirm everything before it goes live.
          </>
        }
      >
        <Button href="#planner" variant="light" event={EVENTS.AD_CTA} eventProps={{ section: "advertise-hero", cta: "plan" }}>
          Plan my campaign
        </Button>
        <Button href="#network" variant="outline-inv" event={EVENTS.AD_CTA} eventProps={{ section: "advertise-hero", cta: "map" }}>
          Browse the network
        </Button>
      </MediaHero>
      <Placements index={1} />
      <NetworkSection enquiryHref="#enquiry" index={2} />
      <AdStory index={3} />
      <Planner inPage index={4} />
      <MarqueeRibbons panel items={["Your brand", "On screen", "Your budget", "Your plan", "Seen across the city"]} />
      <EnquirySection index={5} />
      <FaqSection index={6} items={faqs.advertising} title={["Advertising", "questions."]} />
    </>
  );
}
