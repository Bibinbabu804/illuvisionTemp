/**
 * Centralized Privacy-Conscious Marketplace Analytics SDK.
 *
 * - Pseudonymous visitor_id (localStorage) + 30-min inactivity session_id (sessionStorage)
 * - Respects Do Not Track (DNT)
 * - Strict client-side PII scrubber (never transmits names, emails, phones, messages)
 * - Batched delivery via navigator.sendBeacon with keepalive fetch fallback
 * - Deduplicates React StrictMode double-effects and rapid duplicate page_views
 * - Backward-compatible with existing `track(EVENTS.xxx, props)` calls
 */

const VISITOR_KEY = "illuvision:vid";
const SESSION_KEY = "illuvision:sid";
const SESSION_TS_KEY = "illuvision:sid_ts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 4000;

const BLOCKED_META_KEYS = new Set([
  "name",
  "full_name",
  "email",
  "phone",
  "mobile",
  "message",
  "password",
  "token",
  "ip",
  "address",
]);

export const EVENTS = {
  HOME_VIEW: "page_view",
  PAGE_VIEW: "page_view",
  SESSION_START: "session_start",
  SESSION_END: "session_end",
  BUTTON_CLICK: "button_click",
  CTA_CLICK: "cta_click",
  NAVIGATION_CLICK: "navigation_click",
  SEARCH: "search",
  FILTER_APPLIED: "filter_applied",
  CATEGORY_VIEW: "category_view",
  FORM_START: "form_start",
  SHOP_CTA: "cta_click",
  FEATURED_PRODUCT: "product_card_click",
  PRODUCT_VIEW: "product_view",
  PRODUCT_CARD_CLICK: "product_card_click",
  PRODUCT_IMAGE_VIEW: "product_image_view",
  PRODUCT_VARIANT_SELECT: "product_variant_select",
  PRODUCT_CATEGORY_VIEW: "product_category_view",
  SCREEN_VIEW: "screen_view",
  SCREEN_CARD_CLICK: "screen_card_click",
  MAP_MARKER: "screen_map_marker_click",
  SCREEN_DETAIL: "product_card_click",
  SCREEN_LOCATION_SEARCH: "screen_location_search",
  SCREEN_TYPE_SELECT: "screen_type_select",
  INQUIRY_FORM_START: "inquiry_form_start",
  INQUIRY_FORM_SUBMIT: "inquiry_form_submit",
  PRODUCT_ENQUIRY: "product_inquiry",
  SCREEN_ENQUIRY: "screen_inquiry",
  AD_ENQUIRY: "inquiry_form_submit",
  CONTACT_SUBMIT: "inquiry_form_submit",
  WHATSAPP_CLICK: "whatsapp_click",
  AD_CTA: "cta_click",
  PLANNER_CHANGE: "filter_applied",
  PLANNER_BUDGET: "filter_applied",
  PLANNER_SUBMIT: "campaign_plan_start",
  CAMPAIGN_PLAN_START: "campaign_plan_start",
  CAMPAIGN_RECOMMENDATIONS_VIEW: "campaign_recommendations_view",
  CAMPAIGN_PACKAGE_SELECT: "campaign_package_select",
  CAMPAIGN_PROPOSAL_GENERATED: "campaign_proposal_generated",
};

let queue = [];
let flushTimer = null;
let listenersBound = false;
let lastPageView = { path: "", ts: 0 };

function getEndpoint() {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/v1/public/analytics/events`;
}

function isTrackingDisabled() {
  if (typeof window === "undefined") return true;
  try {
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    if (dnt === "1" || dnt === "yes") return true;
  } catch {
    /* ignore */
  }
  return false;
}

function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid || vid.length < 8) {
      vid = generateId("vis");
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return generateId("vis");
  }
}

function getOrCreateSession() {
  const now = Date.now();
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    const lastTs = Number(sessionStorage.getItem(SESSION_TS_KEY) || 0);
    const isExpired = !sid || !lastTs || now - lastTs > SESSION_TIMEOUT_MS;
    if (isExpired) {
      sid = generateId("ses");
      sessionStorage.setItem(SESSION_KEY, sid);
      sessionStorage.setItem(SESSION_TS_KEY, String(now));
      return { sid, isNew: true };
    }
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    return { sid, isNew: false };
  } catch {
    return { sid: generateId("ses"), isNew: false };
  }
}

function getUtmParams() {
  try {
    const sp = new URLSearchParams(window.location.search);
    return {
      utm_source: sp.get("utm_source") || undefined,
      utm_medium: sp.get("utm_medium") || undefined,
      utm_campaign: sp.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

function scrubMetadata(raw) {
  if (!raw || typeof raw !== "object") return undefined;
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const lk = String(k).toLowerCase();
    if (BLOCKED_META_KEYS.has(lk)) continue;
    if (v != null && (typeof v === "string" || typeof v === "number" || typeof v === "boolean")) {
      const s = String(v).trim();
      if (s) out[lk] = s.slice(0, 120);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function bindLifecycleFlush() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushEvents(true);
  });
  window.addEventListener("pagehide", () => flushEvents(true));
}

export function flushEvents(useBeacon = false) {
  if (!queue.length) return;
  const endpoint = getEndpoint();
  const batch = queue.splice(0, BATCH_SIZE);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!endpoint) return;

  const body = JSON.stringify({ events: batch });

  try {
    if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(endpoint, blob)) return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break navigation or UX */
    });
  } catch {
    /* silent fail */
  }
}

function enqueue(eventObj) {
  if (isTrackingDisabled()) return;
  bindLifecycleFlush();
  queue.push(eventObj);

  if (queue.length >= BATCH_SIZE) {
    flushEvents(false);
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => flushEvents(false), FLUSH_INTERVAL_MS);
  }
}

/**
 * Core event tracker.
 */
export function trackEvent(eventName, options = {}) {
  if (isTrackingDisabled()) return;

  const visitorId = getOrCreateVisitorId();
  const { sid: sessionId, isNew } = getOrCreateSession();
  const utm = getUtmParams();

  if (isNew && eventName !== "session_start") {
    enqueue({
      event_id: generateId("evt"),
      event_name: "session_start",
      event_version: 1,
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: window.location.pathname || "/",
      page_url: window.location.href,
      page_title: document.title || undefined,
      referrer: document.referrer || undefined,
      ...utm,
      occurred_at: new Date().toISOString(),
    });
  }

  const eventPayload = {
    event_id: generateId("evt"),
    event_name: eventName,
    event_version: 1,
    visitor_id: visitorId,
    session_id: sessionId,
    page_path: options.pagePath || window.location.pathname || "/",
    page_url: window.location.href,
    page_title: options.pageTitle || document.title || undefined,
    referrer: document.referrer || undefined,
    element_id: options.elementId || undefined,
    element_label: options.elementLabel || undefined,
    entity_type: options.entityType || undefined,
    entity_id: options.entityId && Number(options.entityId) > 0 ? Number(options.entityId) : undefined,
    metadata: scrubMetadata(options.metadata),
    ...utm,
    occurred_at: new Date().toISOString(),
  };

  enqueue(eventPayload);

  // Preserve optional GTM / gtag forwarding
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, page: eventPayload.page_path, ...(eventPayload.metadata || {}) });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventPayload.metadata || {});
    }
  } catch {
    /* ignore */
  }
}

/**
 * Track Next.js route page_view (deduplicates StrictMode double-effects within 2s).
 */
export function trackPageView(path, title) {
  if (isTrackingDisabled()) return;
  const normalized = path || window.location.pathname || "/";
  const now = Date.now();
  if (lastPageView.path === normalized && now - lastPageView.ts < 2000) {
    return;
  }
  lastPageView = { path: normalized, ts: now };
  trackEvent("page_view", { pagePath: normalized, pageTitle: title || document.title });
}

export function trackButtonClick({ elementId, elementLabel, section, entityType, entityId, metadata = {} }) {
  trackEvent("cta_click", {
    elementId,
    elementLabel,
    entityType,
    entityId,
    metadata: { section, ...metadata },
  });
}

export function trackProductView({ productId, slug, category }) {
  trackEvent("product_view", {
    entityType: "product",
    entityId: productId,
    metadata: { slug, category },
  });
}

export function trackWhatsAppClick({ elementId, elementLabel, entityType, entityId, metadata = {} }) {
  trackEvent("whatsapp_click", {
    elementId,
    elementLabel,
    entityType,
    entityId,
    metadata: { channel: "whatsapp", ...metadata },
  });
}

export function trackInquiry({ eventName = "inquiry_form_submit", inquiryType, entityType, entityId, metadata = {} }) {
  trackEvent(eventName, {
    entityType,
    entityId,
    metadata: { inquiry_type: inquiryType, ...metadata },
  });
}

/**
 * Backward-compatible facade for existing `track(EVENTS.xxx, props)` call sites.
 */
export function track(event, props = {}) {
  if (typeof window === "undefined") return;
  const { elementId, elementLabel, entityType, entityId, cta, section, ...rest } = props || {};
  const derivedElementId =
    elementId ||
    (section && cta ? `${section}_${cta}` : section && event === "cta_click" ? `${section}_cta` : undefined);

  trackEvent(event, {
    elementId: derivedElementId,
    elementLabel: elementLabel || cta || undefined,
    entityType,
    entityId,
    metadata: { section, ...rest },
  });
}
