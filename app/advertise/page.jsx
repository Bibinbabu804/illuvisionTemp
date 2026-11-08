import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NetworkSection from "@/components/advertise/NetworkSection";
import Planner from "@/components/advertise/Planner";
import HowItWorks from "@/components/advertise/HowItWorks";
import ScrubText from "@/components/motion/ScrubText";
import EnquirySection from "@/components/advertise/EnquirySection";
import FaqSection from "@/components/home/FaqSection";
import { videos } from "@/data/media";
import LazyVideo from "@/components/motion/LazyVideo";
import { faqs } from "@/data/site";
import { EVENTS } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Advertise on digital screens",
  description:
    "Advertise across Illuvision's associated digital screen network. Set your budget, browse screens by location and send a campaign enquiry. Availability and pricing confirmed by Illuvision.",
  path: "/advertise",
});

export default function AdvertisePage() {
  return (
    <>
      <section className={styles.hero}>
        <LazyVideo
          eager
          src={videos.streetKiosk.src}
          poster={videos.streetKiosk.poster}
          className={styles.bg}
        />
        <span className={styles.shade} aria-hidden="true" />
        <div className={`container on-dark ${styles.inner}`}>
          <Breadcrumbs visible={false} items={[{ label: "Home", href: "/" }, { label: "Advertise", href: "/advertise" }]} />
          <p className={`eyebrow ${styles.in}`} style={{ "--s": 1 }}>Advertise with Illuvision</p>
          <h1 className={styles.title}>
            <span className={styles.line}><span style={{ "--s": 2 }}>Your message,</span></span>
            <span className={styles.line}><span style={{ "--s": 3 }}>on screens that</span></span>
            <span className={styles.line}><span style={{ "--s": 4 }}>get <em>noticed.</em></span></span>
          </h1>
          <p className={`${styles.lead} ${styles.in}`} style={{ "--s": 5 }}>
            Tell us your budget and goals. We match your campaign to suitable screens on
            Illuvision&rsquo;s associated network and confirm everything before it goes live.
          </p>
          <div className={`${styles.ctas} ${styles.in}`} style={{ "--s": 6 }}>
            <Button href="#planner" variant="light" event={EVENTS.AD_CTA} eventProps={{ section: "advertise-hero", cta: "plan" }}>
              Plan my campaign
            </Button>
            <Button href="#network" variant="outline-inv" event={EVENTS.AD_CTA} eventProps={{ section: "advertise-hero", cta: "map" }}>
              Browse the network
            </Button>
          </div>
        </div>
      </section>
      <NetworkSection enquiryHref="#enquiry" index={1} />
      <Planner inPage index={2} />
      <HowItWorks index={3} />
      <ScrubText dark words={["Your brand", "on screen", "Your budget", "your plan"]} />
      <EnquirySection index={4} />
      <FaqSection index={5} items={faqs.advertising} title={["Advertising", "questions."]} />
    </>
  );
}
