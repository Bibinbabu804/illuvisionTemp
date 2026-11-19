/**
 * SCREEN CATALOGUE
 * ---------------------------------------------------------------------------
 * Source: the Illuvision customer brochure and the Founding Partner Price
 * List 2026. Formats, sizes, display options and prices below come from
 * those two documents; nothing else is claimed.
 *
 *  - One product per format. Each lists its `variants` (size + display)
 *    with three prices in INR, all BEFORE GST (18% GST is added):
 *      regular   list price
 *      founding  Founding Partner price (delivered and installed)
 *      outright  Buy Outright price (installation and transport extra)
 *  - `price` is the lowest Founding Partner price ("From ₹…"); it shows
 *    only when site.features.publicPricing is true.
 *  - Specs: only fields stated in the brochure are filled. `null` renders
 *    as "Awaiting spec sheet" and is excluded from structured data.
 *  - Images are taken from the brochure and price list artwork.
 */

// `pos` is the focal point used when a portrait photo is cropped to fit.
const img = (name, alt, pos = "50% 50%") => ({ src: `/images/products/${name}.webp`, alt, pos });

export const productImages = {
  wallMount: img("wall-mount", "Wall-mounted Illuvision display showing shop offers above a counter", "50% 22%"),
  wallMountPoster: img("wall-mount-poster", "Illuvision wall-mount digital signage display"),
  aFrame: img("a-frame-standee", "A-frame digital standee showing a menu special at a restaurant entrance", "50% 42%"),
  aFramePoster: img("a-frame-standee-poster", "Illuvision A-frame digital standees in white and black"),
  halfGlass: img("half-glass-standee", "Half-glass digital standee in a car showroom", "50% 38%"),
  halfGlassPoster: img("half-glass-standee-poster", "Illuvision half-glass floor-standing kiosk"),
  fullGlass: img("full-glass-standee", "Full-glass digital standee in a clinic reception", "50% 32%"),
  fullGlassPoster: img("full-glass-standee-poster", "Illuvision full-glass floor-standing kiosk"),
  standeeInStore: img("standee-in-store", "Digital standee showing new arrivals inside a clothing shop", "50% 30%"),
};

export const categories = [
  {
    slug: "wall-mount",
    name: "Wall mount",
    short: "32, 43 and 55 inch displays that save floor space.",
    image: productImages.wallMount,
  },
  {
    slug: "a-frame-standee",
    name: "A-frame standee",
    short: "32 and 43 inch. Folds away, perfect for entrances.",
    image: productImages.aFrame,
  },
  {
    slug: "half-glass-standee",
    name: "Half-glass standee",
    short: "32 to 55 inch. Sleek, with a solid lower panel.",
    image: productImages.halfGlass,
  },
  {
    slug: "full-glass-standee",
    name: "Full-glass standee",
    short: "32 to 55 inch. Premium full-height glass front.",
    image: productImages.fullGlass,
  },
];

/** The two display options offered in every format (customer brochure). */
export const displayOptions = [
  {
    id: "panasonic",
    name: "Panasonic",
    points: [
      "4K UHD with HDR (43 inch and above)",
      "Google TV built in",
      "Dolby Audio 10W + 10W speakers",
      "Cast from your phone",
      "3-year warranty",
    ],
  },
  {
    id: "illuvision",
    name: "Illuvision",
    points: [
      "HD display",
      "Android built in",
      "Wi-Fi and Bluetooth",
      "Dual speakers",
      "1-year warranty",
      "Budget friendly",
    ],
  },
];

/** Spec fields shown on every product, in display order. */
export const specFields = [
  { key: "size", label: "Display size" },
  { key: "resolution", label: "Resolution" },
  { key: "connectivity", label: "Connectivity" },
  { key: "installation", label: "Installation" },
  { key: "panel", label: "Display type" },
  { key: "brightness", label: "Brightness" },
  { key: "orientation", label: "Orientation" },
  { key: "operation", label: "Rated operation" },
];

const pendingSpecs = Object.fromEntries(specFields.map((f) => [f.key, null]));

/** Stated in the brochure for both display options. */
const sharedSpecs = {
  resolution: "Panasonic: 4K UHD with HDR (43 inch and above). Illuvision: HD.",
  connectivity: "Panasonic: Google TV, cast from your phone. Illuvision: Android, Wi-Fi and Bluetooth.",
};

const sharedInfo = {
  warranty: "Panasonic displays carry a 3-year warranty. Illuvision displays carry a 1-year warranty.",
  support:
    "Founding Partners get CMS software free while partnered, tech support and regular maintenance checks, and we handle display issues with the manufacturer. Buy Outright includes 3 months of free CMS software and the manufacturer warranty.",
  delivery:
    "Founding Partner prices include delivery and installation. With Buy Outright, installation and transport are charged separately.",
};

const v = (size, display, regular, founding, outright, tag) => ({ size, display, regular, founding, outright, ...(tag && { tag }) });
const from = (variants) => Math.min(...variants.map((x) => x.founding));

const wallMount = [
  v(32, "Illuvision", 40000, 30000, 32000),
  v(32, "Panasonic", 46000, 34500, 37100),
  v(43, "Illuvision", 47500, 35800, 38500),
  v(43, "Panasonic", 64000, 48300, 52000, "Best value"),
  v(55, "Panasonic", 85500, 63900, 68900),
];

const aFrame = [
  v(32, "Illuvision", 42500, 31500, 33800),
  v(32, "Panasonic", 48500, 36400, 39200),
  v(43, "Illuvision", 49000, 37000, 39800),
  v(43, "Panasonic", 65500, 49500, 53300),
];

const halfGlass = [
  v(32, "Illuvision", 47000, 35200, 37800),
  v(32, "Panasonic", 53000, 40200, 43200),
  v(43, "Illuvision", 59500, 45200, 48600),
  v(43, "Panasonic", 77000, 57700, 62100),
  v(50, "Panasonic", 93000, 69500, 74900),
  v(55, "Panasonic", 98500, 73300, 79000),
];

const fullGlass = [
  v(32, "Illuvision", 54500, 41400, 44600),
  v(32, "Panasonic", 61500, 46400, 50000),
  v(43, "Illuvision", 68000, 51400, 55400),
  v(43, "Panasonic", 85500, 63900, 68900),
  v(50, "Panasonic", 107000, 79500, 85700),
  v(55, "Panasonic", 113000, 83900, 90500),
];

/**
 * `format` and `useCases` describe the type of product; `variants` and
 * `price` come from the Founding Partner Price List 2026.
 */
export const products = [
  {
    slug: "wall-mount-display",
    name: "Wall Mount Display",
    sku: "ILV-WM",
    category: "wall-mount",
    featured: true,
    badge: "Best value",
    summary: "A wall-mounted digital display that promotes your shop and saves floor space. Available in 32, 43 and 55 inch.",
    format: "Wall mounted · 32 / 43 / 55 inch",
    useCases: ["Shops", "Restaurants", "Clinics", "Showrooms"],
    images: [productImages.wallMount, productImages.wallMountPoster],
    specs: { ...pendingSpecs, ...sharedSpecs, size: "32, 43 or 55 inch", installation: "Wall mounted" },
    info: sharedInfo,
    variants: wallMount,
    price: from(wallMount),
    currency: "INR",
    stock: null,
  },
  {
    slug: "a-frame-standee",
    name: "A-Frame Standee",
    sku: "ILV-AF",
    category: "a-frame-standee",
    featured: true,
    badge: "Most popular",
    summary: "A freestanding A-frame digital standee that folds away, perfect for entrances. Available in 32 and 43 inch.",
    format: "Freestanding A-frame · 32 / 43 inch",
    useCases: ["Entrances", "Restaurants", "Shops", "Showrooms"],
    images: [productImages.aFrame, productImages.aFramePoster],
    specs: { ...pendingSpecs, ...sharedSpecs, size: "32 or 43 inch", installation: "Freestanding A-frame, folds away" },
    info: sharedInfo,
    variants: aFrame,
    price: from(aFrame),
    currency: "INR",
    stock: null,
  },
  {
    slug: "half-glass-standee",
    name: "Half-Glass Standee",
    sku: "ILV-HG",
    category: "half-glass-standee",
    featured: true,
    summary: "A sleek floor-standing digital standee with a solid lower panel. Available in 32, 43, 50 and 55 inch.",
    format: "Floor standing · 32 / 43 / 50 / 55 inch",
    useCases: ["Showrooms", "Shops", "Clinics", "Restaurants"],
    images: [productImages.halfGlass, productImages.halfGlassPoster, productImages.standeeInStore],
    specs: { ...pendingSpecs, ...sharedSpecs, size: "32, 43, 50 or 55 inch", installation: "Floor standing, solid lower panel" },
    info: sharedInfo,
    variants: halfGlass,
    price: from(halfGlass),
    currency: "INR",
    stock: null,
  },
  {
    slug: "full-glass-standee",
    name: "Full-Glass Standee",
    sku: "ILV-FG",
    category: "full-glass-standee",
    featured: true,
    summary: "A premium floor-standing digital standee with a full-height glass front. Available in 32, 43, 50 and 55 inch.",
    format: "Floor standing · 32 / 43 / 50 / 55 inch",
    useCases: ["Clinics", "Showrooms", "Shops", "Restaurants"],
    images: [productImages.fullGlass, productImages.fullGlassPoster],
    specs: { ...pendingSpecs, ...sharedSpecs, size: "32, 43, 50 or 55 inch", installation: "Floor standing, full-height glass front" },
    info: sharedInfo,
    variants: fullGlass,
    price: from(fullGlass),
    currency: "INR",
    stock: null,
  },
];

/** Founding Partner Price List 2026: terms that apply to every price. */
export const pricing = {
  title: "Founding Partner Price List 2026",
  gstNote: "All prices shown are before GST. 18% GST will be added.",
  foundingNote: "Founding prices are for the first 15 partners only. One partner per category in each area.",
  earningsNote: "Earnings depend on approved advertising activity. No fixed income is promised.",
  /** Ad video plans after the free 3 months (both options). */
  plans: [
    { name: "Basic", price: 3499, detail: "4 motion videos" },
    { name: "Growth", price: 5999, detail: "8 motion videos" },
  ],
  referral: "Refer a business that becomes a partner and get 1 month of free screen management (worth ₹3,499).",
};

/** The two ways to get a screen (customer brochure). */
export const ownership = [
  {
    id: "founding",
    title: "Founding Partner",
    highlight: "Only 15 founding partners. One per category in each area.",
    points: [
      "Display delivered and installed",
      "3 months free screen management, with a new motion ad video every week",
      "CMS software free while partnered, plus tech support",
      "We handle display issues with the manufacturer",
      "Screen switches on and off by itself",
      "Regular maintenance checks",
      "Free Wi-Fi for the display if needed",
      "Customer QR offers that bring extra sales",
      "Earn a share of ad profit from approved ads",
      "No competitor ads",
    ],
  },
  {
    id: "outright",
    title: "Buy Outright",
    points: [
      "Own the display 100%, for your own content only",
      "3 months free CMS software",
      "1 free ad video",
      "Manufacturer warranty",
      "Installation and transport charged separately",
    ],
  },
];

/** How Founding Partners earn (customer brochure). */
export const partnerSteps = [
  { title: "Install your screen.", icon: "screen" },
  { title: "Run your own offers.", icon: "spark" },
  { title: "Host approved ads from other local businesses and earn a share of the ad profit.", icon: "layers" },
];

// Grouped as printed in the price list (₹113,000, not ₹1,13,000).
export const formatINR = (n) => `₹${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
