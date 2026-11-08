/**
 * ADVERTISING PLANNER CONFIGURATION
 * ---------------------------------------------------------------------------
 * No approved rate card or allocation rules exist yet, so the planner works
 * as an enquiry-preparation tool: it collects the brief and passes it to
 * the enquiry form. It never estimates reach, impressions or allocation.
 *
 * When approved rules exist, set `rules` to an object such as
 * { minBudget: { USD: 500 }, ... } and extend the planner to use them.
 */

export const plannerRules = null;

export const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "AED", symbol: "AED " },
  { code: "INR", symbol: "₹" },
];

export const durations = [
  { id: "1w", label: "1 week" },
  { id: "2w", label: "2 weeks" },
  { id: "1m", label: "1 month" },
  { id: "3m", label: "3 months" },
  { id: "custom", label: "Not sure yet" },
];

export const objectives = [
  { id: "awareness", label: "Brand awareness" },
  { id: "launch", label: "Product launch" },
  { id: "footfall", label: "Drive store visits" },
  { id: "event", label: "Promote an event" },
];

/** Slider bounds — purely a UI convenience, not a minimum spend. */
export const budgetSlider = { min: 0, max: 50000, step: 250, initial: 5000 };

export const howItWorks = [
  {
    title: "Share your brief",
    body: "Tell us your budget, campaign dates, preferred areas and screen types.",
  },
  {
    title: "We find matching screens",
    body: "Illuvision reviews the network for opportunities that fit your brief.",
  },
  {
    title: "Review your options",
    body: "You receive suitable screens and campaign options to compare.",
  },
  {
    title: "We coordinate placement",
    body: "Illuvision handles coordination with the screens in your plan.",
  },
  {
    title: "Everything is confirmed",
    body: "Availability, creative specs, scheduling and terms are confirmed before going live.",
  },
];

export const PLANNER_STORAGE_KEY = "illuvision:planner";
