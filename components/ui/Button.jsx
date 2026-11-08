"use client";

import Link from "next/link";
import BtnIcon from "./BtnIcon";
import { track } from "@/lib/analytics";

/**
 * Link-styled button with optional analytics event.
 * variant: "primary" | "ghost" | "light" | "outline-inv"
 */
export default function Button({
  href,
  children,
  variant = "primary",
  icon = "arrow",
  block,
  event,
  eventProps,
  onClick,
  className = "",
  ...rest
}) {
  const cls = [
    "btn",
    variant !== "primary" && `btn--${variant}`,
    !icon && "btn--plain",
    block && "btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (event) track(event, eventProps);
    onClick?.(e);
  };

  const inner = (
    <>
      {icon && <BtnIcon name={icon} />}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} onClick={handleClick} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={handleClick} {...rest}>
      {inner}
    </button>
  );
}
