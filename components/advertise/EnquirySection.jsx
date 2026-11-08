import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import EnquiryForm from "@/components/forms/EnquiryForm";
import styles from "./EnquirySection.module.css";

export default function EnquirySection({ index }) {
  return (
    <section className={`section ${styles.section}`} id="enquiry" aria-labelledby="enquiry-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <SectionHeader
            className={styles.head}
            index={index}
            label="Advertising enquiry"
            id="enquiry-title"
            lines={["Tell us about", "your campaign."]}
            layout="stack"
            lead="We will review your brief and come back with suitable screens, availability and pricing to confirm. This is an enquiry, not a booking."
          />
          <Reveal as="ul" className={styles.points} delay={180}>
            <li>No commitment until you approve the plan</li>
            <li>Creative requirements confirmed per screen</li>
            <li>Scheduling and terms agreed in writing</li>
          </Reveal>
        </div>
        <Reveal className={`card ${styles.card}`} delay={100}>
          <EnquiryForm variant="advertising" />
        </Reveal>
      </div>
    </section>
  );
}
