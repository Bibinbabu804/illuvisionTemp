const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/+$/, "");

/**
 * Request a unique backend-persisted Marketplace Product Request Code
 * and structured WhatsApp enquiry message.
 */
export async function requestProductCode({
  slug,
  variantId = null,
  pricingPlan = null,
  quantity = 1,
  deliveryLocation = "",
  productUrl = "",
  idempotencyKey = "",
} = {}) {
  if (!slug) {
    throw new Error("Product identifier is missing.");
  }

  const payload = {
    ...(variantId ? { product_display_variant_id: Number(variantId) } : {}),
    ...(pricingPlan ? { pricing_plan: pricingPlan } : {}),
    quantity: Math.max(1, Number(quantity) || 1),
    ...(deliveryLocation && deliveryLocation.trim()
      ? { delivery_location: deliveryLocation.trim() }
      : {}),
    ...(productUrl ? { product_url: productUrl } : {}),
    ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
  };

  const res = await fetch(
    `${API_BASE_URL}/v1/public/marketplace/products/${encodeURIComponent(slug)}/request-code`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const firstFieldError = json?.errors
      ? Object.values(json.errors).flat()[0]
      : null;
    const message =
      firstFieldError ||
      json?.message ||
      "Unable to generate a request code right now. Please try again.";
    const error = new Error(message);
    error.status = res.status;
    error.fieldErrors = json?.errors || null;
    throw error;
  }

  if (!json?.data?.request_code || !json?.data?.whatsapp_message) {
    throw new Error("Invalid response received while generating request code.");
  }

  return json.data;
}
