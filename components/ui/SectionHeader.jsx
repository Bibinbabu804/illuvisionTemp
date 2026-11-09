import Reveal, { SplitHeading } from "./Reveal";

/**
 * The one section header used across the site, so labels, headings,
 * leads and spacing are identical everywhere.
 *
 *   index   optional section number shown in the label ("03")
 *   label   short kicker text
 *   lines   heading split into lines for the masked reveal
 *   lead    supporting paragraph (string or node)
 *   aside   extra content under the lead (buttons, notes)
 *   layout  "split" (heading left, lead right) | "stack"
 */
export function Kicker({ children, className = "" }) {
  return (
    <span className={`kicker ${className}`}>
      <span className="kicker__text">{children}</span>
    </span>
  );
}

export default function SectionHeader({ label, lines, id, as = "h2", lead, aside, layout = "split", className = "" }) {
  return (
    <header className={`sh sh--${layout} ${className}`}>
      <div className="sh__main">
        <Reveal>
          <Kicker>{label}</Kicker>
        </Reveal>
        <SplitHeading id={id} as={as} lines={lines} className="sh__title" />
      </div>
      {(lead || aside) && (
        <Reveal className="sh__aside" delay={140}>
          {lead && <p className="sh__lead">{lead}</p>}
          {aside}
        </Reveal>
      )}
    </header>
  );
}
