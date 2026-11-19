/**
 * SITE CONFIGURATION
 * ---------------------------------------------------------------------------
 * Everything that needs business approval lives here so it can be updated
 * without touching layouts. Values set to `null` or empty arrays are
 * intentionally hidden by the UI until approved content is supplied.
 */

export const site = {
  name: "Illuvision",
  tagline: "Project your vision",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // From the customer brochure.
  description:
    "Illuvision supplies digital displays for shops, restaurants, clinics and showrooms across Kerala. Your screen promotes your shop, and can earn from ads.",

  /** Contact details: publish only once approved. `null` hides the item. */
  contact: {
    email: null,
    // Both numbers are printed on the customer brochure and price list.
    phone: "+91 884 845 9136",
    phone2: "+91 6282 825 277",
    whatsapp: null,
    address: null,
    hours: null,
  },

  /** Approved social profiles, e.g. { label: "LinkedIn", href: "https://…" } */
  social: [],

  /**
   * Countries / markets where delivery is confirmed. Empty = unknown, so
   * product pages ask for a free-text delivery location instead.
   */
  deliveryMarkets: [],

  /** Feature flags for content that needs a business decision. */
  features: {
    /** Show the "Founding Partner" vs "Buy Outright" options (customer brochure). */
    networkParticipation: true,
    /** Show public prices (Founding Partner Price List 2026). */
    publicPricing: true,
    /** Enable a Buy Now flow. No commerce integration exists yet. */
    checkout: false,
    /** Show the About link in the header (no approved About content yet). */
    about: false,
  },

  /**
   * Where enquiry forms are sent. If unset, forms run in preview mode:
   * they validate and confirm on screen but nothing is transmitted.
   */
  enquiryEndpoint: process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || null,
};

export const nav = [
  { label: "Screens", href: "/screens" },
  { label: "Advertise", href: "/advertise" },
  ...(site.features.about ? [{ label: "About", href: "/about" }] : []),
  { label: "Contact", href: "/contact" },
];

/** Business decisions still open (mirrors section 21 of the brief). */
export const approvals = [
  "Final featured product catalogue",
  "Which products show public prices vs Request Quote",
  "Supported countries and delivery markets",
  "Which SKUs support checkout",
  "Warranty, shipping, returns and support information",
  "Whether Buy & Join Network / Display Only is offered",
  "Which screen locations can be shown publicly",
  "Advertising planner calculation rules",
  "Whether advertising submissions are enquiries, quotes, bookings or payments",
  "Company identity, testimonials and contact information",
];

export const faqs = {
  general: [
    {
      q: "How much does a screen cost?",
      a: "Founding Partner prices start at ₹30,000 for a 32 inch wall mount display. Every format, size and display option is listed in the price list on the Screens page. All prices are before GST; 18% GST is added.",
    },
    {
      q: "What is the difference between Founding Partner and Buy Outright?",
      a: "Founding Partners get the display delivered and installed, 3 months of free screen management, free CMS software while partnered, and can earn a share of ad profit from approved ads. With Buy Outright you own the display 100% for your own content only, and installation and transport are charged separately.",
    },
    {
      q: "Which display should I choose, Panasonic or Illuvision?",
      a: "Panasonic displays offer 4K UHD with HDR (43 inch and above), Google TV, Dolby Audio and a 3-year warranty. Illuvision displays are the budget-friendly option, with HD, Android, Wi-Fi and Bluetooth, and a 1-year warranty.",
    },
    {
      q: "Is the income from ads guaranteed?",
      a: "No. Earnings depend on approved advertising activity, and no fixed income is promised.",
    },
    {
      q: "What happens after the free 3 months?",
      a: "Ad video plans are available for both options: Basic at ₹3,499 per month for 4 motion videos, or Growth at ₹5,999 per month for 8 motion videos.",
    },
    {
      q: "Where do you install screens?",
      a: "Illuvision supplies digital displays for shops, restaurants, clinics and showrooms across Kerala. Call us to book a free shop visit.",
    },
  ],
  advertising: [
    {
      q: "Does submitting the planner book a campaign?",
      a: "No. The planner prepares an enquiry. Illuvision reviews your brief and confirms suitable screens, availability, creative requirements, scheduling and commercial terms before anything is booked.",
    },
    {
      q: "Are the screens on the map real locations?",
      a: "Not yet. The map currently shows sample data to demonstrate how browsing the network will work. Real, publicly approved locations will replace it.",
    },
    {
      q: "What budget do I need?",
      a: "Advertising rates have not been published yet. Enter the budget you have in mind and we will tell you what is possible within it.",
    },
  ],
};

/**
 * SAMPLE testimonials: placeholders until approved client quotes are
 * supplied (see `approvals`). Shown with a "Sample testimonial" badge.
 * `image` is a key from data/media.js (installation photo, not a portrait).
 */
export const testimonials = [
  {
    quote: "The new menu screens went up over one weekend. Our team updates prices in minutes now, and customers actually read the specials.",
    name: "Operations Manager",
    org: "Quick-service restaurant group",
    tag: "Menu boards",
    image: "menuBoard",
    sample: true,
  },
  {
    quote: "The LED wall in our lobby is the first thing visitors photograph. Illuvision handled the sizing, install and handover without a hitch.",
    name: "Facilities Lead",
    org: "Corporate headquarters",
    tag: "LED video wall",
    image: "indoorVideoWall",
    sample: true,
  },
  {
    quote: "We put portrait standees at every entrance. Footfall to promoted lines went up within the first month of the campaign.",
    name: "Retail Marketing Manager",
    org: "Fashion retailer",
    tag: "Digital standees",
    image: "retailScreens",
    sample: true,
  },
  {
    quote: "Planning the campaign was simple: set a budget, pick the areas, and the team confirmed screens and terms before anything went live.",
    name: "Brand Manager",
    org: "Consumer electronics brand",
    tag: "Advertising",
    image: "airportAd",
    sample: true,
  },
];
