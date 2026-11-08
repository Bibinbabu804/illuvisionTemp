"use client";

import { useEffect, useRef } from "react";

/**
 * One shared IntersectionObserver for every reveal on the page. Elements
 * get `.is-in` once and are then unobserved, so there is no ongoing
 * scroll work.
 */
let observer;
function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  return observer;
}

export default function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const io = getObserver();
    if (!el || !io) return;
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant === "up" ? "" : variant}
      className={className}
      style={delay ? { ...style, "--d": `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Splits a headline into masked lines that slide up in sequence. */
export function SplitHeading({ as: Tag = "h2", id, lines, className, baseDelay = 0, step = 90 }) {
  return (
    <Reveal as={Tag} id={id} variant="fade" className={className}>
      {lines.map((line, i) => (
        <span className="split-line" key={i}>
          <span style={{ "--d": `${baseDelay + i * step}ms` }}>{line}</span>
        </span>
      ))}
    </Reveal>
  );
}
