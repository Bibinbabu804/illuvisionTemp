import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs({ items, visible = true }) {
  if (!visible) return <JsonLd data={breadcrumbSchema(items)} />;
  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.nav}>
        <ol>
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.href}>
                {last ? (
                  <span aria-current="page">{item.label}</span>
                ) : (
                  <Link href={item.href}>{item.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}
