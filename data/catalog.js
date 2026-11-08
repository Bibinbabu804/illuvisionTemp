import { media } from "./media";

/**
 * SCREEN CATALOGUE — SAMPLE DATA
 * ---------------------------------------------------------------------------
 * No verified Illuvision catalogue was available when this frontend was
 * built. Everything in this file is SAMPLE content that demonstrates the
 * layout. Records are flagged `sample: true` and the UI labels them.
 *
 * Replacing with real data:
 *  - Keep the same field names, set `sample: false`.
 *  - Specs: only fill fields you have verified. `null` renders as
 *    "Awaiting spec sheet" and is excluded from structured data.
 *  - `price`: a number (in `currency`) shows only when
 *    site.features.publicPricing is true; otherwise "Request quote".
 *  - `stock`: leave `null` unless stock levels are verified.
 */

export const categories = [
  {
    slug: "indoor-displays",
    name: "Indoor commercial displays",
    short: "Wall-mounted screens for receptions, retail floors and offices.",
    image: media.wallDisplay,
    sample: true,
  },
  {
    slug: "led-video-walls",
    name: "LED video walls",
    short: "Large-format walls for statement visuals and immersive spaces.",
    image: media.indoorVideoWall,
    sample: true,
  },
  {
    slug: "outdoor-led",
    name: "Outdoor LED screens",
    short: "Façade and street-level screens built for open-air viewing.",
    image: media.outdoorLedFacade,
    sample: true,
  },
  {
    slug: "digital-standees",
    name: "Digital standees & kiosks",
    short: "Freestanding portrait screens for entrances and walkways.",
    image: media.standeeInStore,
    sample: true,
  },
  {
    slug: "interactive-panels",
    name: "Interactive panels",
    short: "Touch-ready screens for meeting rooms and customer self-service.",
    image: media.meetingRoom,
    sample: true,
  },
  {
    slug: "menu-boards",
    name: "Menu & retail boards",
    short: "Screens for counters, menus and in-store promotions.",
    image: media.menuBoard,
    sample: true,
  },
];

/** Spec fields shown on every product, in display order. */
export const specFields = [
  { key: "size", label: "Display size" },
  { key: "resolution", label: "Resolution" },
  { key: "panel", label: "Display type" },
  { key: "brightness", label: "Brightness" },
  { key: "orientation", label: "Orientation" },
  { key: "connectivity", label: "Connectivity" },
  { key: "installation", label: "Installation" },
  { key: "operation", label: "Rated operation" },
];

const pendingSpecs = Object.fromEntries(specFields.map((f) => [f.key, null]));

/**
 * `format` and `useCases` describe the type of product (what a standee or
 * a video wall *is*), not verified model specifications.
 */
export const products = [
  {
    slug: "sample-indoor-wall-display",
    name: "Indoor Wall Display",
    sku: "SAMPLE-IWD-01",
    category: "indoor-displays",
    sample: true,
    featured: true,
    summary:
      "A clean, wall-mounted commercial display for receptions, showrooms and offices.",
    format: "Wall-mounted, landscape or portrait",
    useCases: ["Reception", "Showroom", "Office"],
    images: [media.wallDisplay, media.brickWallDisplay, media.receptionScreen],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
  {
    slug: "sample-led-video-wall",
    name: "Modular LED Video Wall",
    sku: "SAMPLE-LVW-01",
    category: "led-video-walls",
    sample: true,
    featured: true,
    summary:
      "Modular LED cabinets combined into a seamless wall for large indoor spaces.",
    format: "Modular cabinets, custom size",
    useCases: ["Lobbies", "Events", "Flagship retail"],
    images: [media.indoorVideoWall, media.ledMacro, media.blueWall],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
  {
    slug: "sample-outdoor-led-screen",
    name: "Outdoor LED Screen",
    sku: "SAMPLE-OLS-01",
    category: "outdoor-led",
    sample: true,
    featured: true,
    summary:
      "A large-format outdoor screen for façades, forecourts and roadside sites.",
    format: "Fixed outdoor installation",
    useCases: ["Building façades", "Forecourts", "Roadside"],
    images: [media.outdoorLedFacade, media.cityBillboards, media.ledMacro],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
  {
    slug: "sample-digital-standee",
    name: "Digital Standee",
    sku: "SAMPLE-DST-01",
    category: "digital-standees",
    sample: true,
    featured: true,
    summary:
      "A freestanding portrait screen that brings promotions to entrances and aisles.",
    format: "Freestanding, portrait",
    useCases: ["Entrances", "Malls", "Events"],
    images: [media.standeeInStore, media.interactiveStandee, media.retailScreens],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
  {
    slug: "sample-interactive-panel",
    name: "Interactive Display Panel",
    sku: "SAMPLE-IDP-01",
    category: "interactive-panels",
    sample: true,
    featured: true,
    summary:
      "A touch-ready panel for collaborative meeting rooms and self-service points.",
    format: "Wall-mounted or trolley",
    useCases: ["Meeting rooms", "Training", "Self-service"],
    images: [media.meetingRoom, media.interactiveStandee, media.wallDisplay],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
  {
    slug: "sample-menu-board",
    name: "Digital Menu Board",
    sku: "SAMPLE-DMB-01",
    category: "menu-boards",
    sample: true,
    featured: true,
    summary:
      "Counter-top and overhead screens for menus, offers and in-store messaging.",
    format: "Overhead or counter, multi-screen",
    useCases: ["Cafés", "Quick service", "Retail counters"],
    images: [media.menuBoard, media.retailScreens, media.standeeInStore],
    specs: { ...pendingSpecs },
    price: null,
    currency: null,
    stock: null,
  },
];

/** Product detail sections that need approved, model-specific copy. */
export const productInfoPending = {
  inTheBox: null,
  warranty: null,
  support: null,
  delivery: null,
};

export const getProduct = (slug) => products.find((p) => p.slug === slug);
export const getCategory = (slug) => categories.find((c) => c.slug === slug);
export const featuredProducts = () => products.filter((p) => p.featured);
export const relatedProducts = (product, count = 3) =>
  products.filter((p) => p.slug !== product.slug).slice(0, count);
