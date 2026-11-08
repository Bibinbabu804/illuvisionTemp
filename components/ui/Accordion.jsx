"use client";

import { useId, useState } from "react";
import Icon from "./Icon";
import styles from "./Accordion.module.css";

export default function Accordion({ items, dark = false, defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className={`${styles.list} ${dark ? styles.dark : ""}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={styles.item} key={i} data-open={isOpen}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                id={`${id}-t-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className={styles.icon}>
                  <Icon name="plus" size={18} />
                </span>
              </button>
            </h3>
            <div
              className={styles.panel}
              id={`${id}-${i}`}
              role="region"
              aria-labelledby={`${id}-t-${i}`}
              inert={!isOpen}
            >
              <div className={styles.inner}>
                <div className={styles.body}>{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
