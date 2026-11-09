"use client";

import Icon from "@/components/ui/Icon";

export default function BackToTop({ className }) {
  const toTop = () => {
    const l = window.__lenis;
    if (l) l.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button type="button" className={className} onClick={toTop}>
      Back to top
      <span aria-hidden="true">
        <Icon name="arrow" size={16} />
      </span>
    </button>
  );
}
