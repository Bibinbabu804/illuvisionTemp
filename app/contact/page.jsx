import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Contact Illuvision",
  description: "Contact Illuvision about buying commercial digital screens, advertising on our screen network, support or partnerships.",
  path: "/contact",
});

export default function ContactPage() {
  const { contact } = site;
  const items = [
    contact.email && { icon: "chat", label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: "chat", label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.address && { icon: "pin", label: "Address", value: contact.address },
    contact.hours && { icon: "info", label: "Hours", value: contact.hours },
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk screens."
        lead="Whether you are buying one display or planning a campaign, send us a message and the Illuvision team will get back to you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
      />
      <section className="section" style={{ paddingTop: 0 }} aria-label="Contact form and details">
        <div className={`container ${styles.grid}`}>
          <Reveal className={`card ${styles.formCard}`}>
            <EnquiryForm variant="contact" />
          </Reveal>
          <Reveal as="aside" delay={120} className={styles.aside}>
            <h2 className={styles.h2}>Other ways to reach us</h2>
            {items.length ? (
              <ul className={styles.list}>
                {items.map((i) => (
                  <li key={i.label}>
                    <Icon name={i.icon} size={20} />
                    <div>
                      <span>{i.label}</span>
                      {i.href ? <a href={i.href}>{i.value}</a> : <strong>{i.value}</strong>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="notice">
                <Icon name="info" />
                <span>Direct contact details will be published here once confirmed. For now, please use the form.</span>
              </p>
            )}
            <div className={styles.shortcuts}>
              <Link href="/screens" className={styles.shortcut}>
                <Icon name="screen" size={22} />
                <span><strong>Buying a screen?</strong> Request a quote from any product page.</span>
                <Icon name="arrow" size={18} />
              </Link>
              <Link href="/advertise#planner" className={styles.shortcut}>
                <Icon name="spark" size={22} />
                <span><strong>Planning a campaign?</strong> Start with the budget planner.</span>
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
