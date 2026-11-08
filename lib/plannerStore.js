import { PLANNER_STORAGE_KEY } from "@/data/planner";

/**
 * Keeps planner selections between the planner, the map and the enquiry
 * form (same page or after navigating). sessionStorage only — nothing
 * leaves the browser.
 */
const EVENT = "illuvision:planner";

export function readPlanner() {
  try {
    return JSON.parse(sessionStorage.getItem(PLANNER_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function savePlanner(data) {
  const next = { ...(readPlanner() || {}), ...data };
  try {
    sessionStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the in-page event still carries the data */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  return next;
}

export function onPlannerChange(cb) {
  const handler = (e) => cb(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
