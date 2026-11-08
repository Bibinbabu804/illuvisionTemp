import { site } from "@/data/site";

/**
 * Sends an enquiry if an endpoint is configured; otherwise runs in preview
 * mode and transmits nothing. Returns { ok, preview }.
 *
 * Backend integration pending: set NEXT_PUBLIC_ENQUIRY_ENDPOINT to an
 * existing form service that accepts JSON POSTs.
 */
export async function submitEnquiry(type, data) {
  if (!site.enquiryEndpoint) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }
  const res = await fetch(site.enquiryEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data, submittedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return { ok: true, preview: false };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared field validation. `rules` maps field name -> array of checks. */
export function validate(values, rules) {
  const errors = {};
  for (const [field, checks] of Object.entries(rules)) {
    const v = typeof values[field] === "string" ? values[field].trim() : values[field];
    for (const check of checks) {
      if (check === "required" && !v) errors[field] = "This field is required.";
      else if (check === "email" && v && !EMAIL.test(v)) errors[field] = "Enter a valid email address.";
      else if (check === "phone" && v && !/^[+()\d\s-]{6,}$/.test(v)) errors[field] = "Enter a valid phone number.";
      else if (check === "checked" && !v) errors[field] = "Please confirm to continue.";
      if (errors[field]) break;
    }
  }
  return errors;
}
