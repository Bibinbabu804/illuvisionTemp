import PageHero from "./PageHero";
import Icon from "./Icon";

/** Placeholder legal page until approved policy text is supplied. */
export default function LegalPage({ title, path }) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        crumbs={[{ label: "Home", href: "/" }, { label: title, href: path }]}
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <p className="notice">
            <Icon name="info" />
            <span>
              The approved {title.toLowerCase()} will be published here before launch. Contact
              Illuvision with any questions in the meantime.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
