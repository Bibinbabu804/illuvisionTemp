"use client";

/** Soft radial light that follows the pointer across its children. */
export default function Spotlight({ children, className, as: Tag = "div" }) {
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag className={`spotlight ${className || ""}`} onPointerMove={onMove}>
      {children}
    </Tag>
  );
}
