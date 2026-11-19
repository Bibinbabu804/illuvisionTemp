import { site } from "@/data/site";

/**
 * Sends an enquiry if an endpoint is configured; otherwise runs in preview
 * mode and transmits nothing. Returns { ok, preview }.
 *
 * Backend integration pending: set NEXT_PUBLIC_ENQUIRY_ENDPOINT to an
 * existing form service that accepts JSON POSTs.
 */
export async function submitEnquiry(type, data) {
  const endpoint = site.enquiryEndpoint;
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }

  // Format payload according to backend schema if submitting a product enquiry
  const payload =
    type === "product"
      ? {
          type,
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone || "Not provided",
          quantity: data.quantity ? Number(data.quantity) : 1,
          delivery_location: data.deliveryLocation || data.delivery_location || "",
          message: data.message || `Enquiry for ${data.product || "screen"}`,
          screen_display_variant_id:
            data.screen_display_variant_id ||
            data.screenDisplayVariantId ||
            data.variant_id ||
            null,
          pricing_tier: data.pricing_tier || data.pricingTier || "founding",
          sku: data.sku || null,
          submittedAt: new Date().toISOString(),
        }
      : {
          type,
          ...data,
          submittedAt: new Date().toISOString(),
        };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const msg = errorJson?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const resultJson = await res.json().catch(() => null);
  return { ok: true, preview: false, data: resultJson?.data };
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
