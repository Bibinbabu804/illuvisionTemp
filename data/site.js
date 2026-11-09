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
  // Draft description — pending approval (see `approvals` below).
  description:
    "Illuvision supplies commercial digital screens for retail, hospitality, corporate and outdoor spaces, and helps businesses advertise on its associated screen network.",

  /** Contact details: publish only once approved. `null` hides the item. */
  contact: {
    email: null,
    phone: null,
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
    /** Show "Buy & Join Network" vs "Display Only" options. Needs approval. */
    networkParticipation: false,
    /** Show public prices where products have an approved `price`. */
    publicPricing: false,
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
      q: "Is the product information on this site final?",
      a: "Not yet. This is a preview of the new Illuvision website. Product names, specifications and imagery marked as samples will be replaced with the approved catalogue. Please request a quote to get confirmed details for any screen.",
    },
    {
      q: "How do I get a price for a screen?",
      a: "Open any screen and choose Request Quote. Tell us the quantity, where it will be installed and where it needs to be delivered, and the Illuvision team will come back with confirmed pricing and availability.",
    },
    {
      q: "Can you help me choose the right screen?",
      a: "Yes. Describe the space, viewing distance and what you want to show in the enquiry form, and the team will recommend suitable options.",
    },
    {
      q: "Which countries do you deliver to?",
      a: "Delivery markets are being confirmed. Include your delivery location in your enquiry and we will confirm whether we can supply it.",
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
