/**
 * Frontend conversion tracking.
 *
 * No analytics provider is installed yet. `track` forwards events to
 * Google Tag Manager (`window.dataLayer`) or gtag if either is added later,
 * and logs to the console in development. Never pass personal data
 * (names, emails, phone numbers, message text) as event properties.
 */
export const EVENTS = {
  HOME_VIEW: "home_view",
  SHOP_CTA: "shop_screens_click",
  FEATURED_PRODUCT: "featured_product_click",
  PRODUCT_VIEW: "product_detail_view",
  PRODUCT_ENQUIRY: "product_enquiry_submit",
  AD_CTA: "advertising_cta_click",
  PLANNER_CHANGE: "planner_interaction",
  PLANNER_BUDGET: "planner_budget_change",
  PLANNER_SUBMIT: "planner_continue",
  MAP_MARKER: "map_marker_click",
  SCREEN_DETAIL: "screen_detail_click",
  AD_ENQUIRY: "advertising_enquiry_submit",
  CONTACT_SUBMIT: "contact_submit",
};

export function track(event, props = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, page: window.location.pathname, ...props };
  try {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    if (typeof window.gtag === "function") window.gtag("event", event, props);
  } catch {
    /* analytics must never break the UI */
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", payload);
  }
}
