import SectionHeader from "@/components/ui/SectionHeader";
import styles from "./AdStart.module.css";

/** Title that opens the advertising part of the home page (above AdIntro). */
export default function AdStart({ index }) {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="ad-start-title">
      <div className="container">
        <SectionHeader
          index={index}
          label="Start advertising"
          id="ad-start-title"
          lines={["Start advertising", "on our screens."]}
          lead="Show your brand on screens in shops, restaurants, clinics and showrooms across Kerala. Tell us your budget and we will match you with suitable screens."
          className={styles.head}
        />
      </div>
    </section>
  );
}
