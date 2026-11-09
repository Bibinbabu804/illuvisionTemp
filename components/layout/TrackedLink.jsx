"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

/** Next <Link> that fires an analytics event on click. */
export default function TrackedLink({ event, eventProps, onClick, ...rest }) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        if (event) track(event, eventProps);
        onClick?.(e);
      }}
    />
  );
}
