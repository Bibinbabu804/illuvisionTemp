/**
 * TEMPORARY STOCK PHOTOGRAPHY
 * ---------------------------------------------------------------------------
 * Every image below is a free Unsplash photo used as a visual placeholder
 * until approved Illuvision photography is supplied. None of these photos
 * shows an actual Illuvision product, installation or advertising location.
 *
 * To replace an image: swap `src` for a local import (e.g.
 * `import heroWall from "@/assets/images/hero-wall.webp"`) or a new URL.
 * Layouts and components only reference the keys, so nothing else changes.
 * See assets/images/STOCK_IMAGES.md for the full list.
 */

const unsplash = (id) => `https://images.unsplash.com/photo-${id}`;

export const media = {
  heroCurvedWall: {
    src: unsplash("1793081114216-915fde0cc53f"),
    alt: "Large curved display wall showing ocean waves in a dark room",
  },
  outdoorLedFacade: {
    src: unsplash("1757564591721-4105db68cd6e"),
    alt: "Curved outdoor LED screen wrapping a building at night",
  },
  indoorVideoWall: {
    src: unsplash("1663841366340-c0fee65c6a11"),
    alt: "Multi-panel indoor video wall in a dark blue room",
  },
  wallDisplay: {
    src: unsplash("1567690187548-f07b1d7bf5a9"),
    alt: "Wall-mounted flat display above a minimal white console",
  },
  brickWallDisplay: {
    src: unsplash("1619233543829-665423afedc3"),
    alt: "Flat display mounted on an exposed brick wall",
  },
  interactiveStandee: {
    src: unsplash("1764795849694-34b3316b3de4"),
    alt: "Two people using a freestanding interactive display",
  },
  standeeInStore: {
    src: unsplash("1790156590226-5dc136fbf150"),
    alt: "Portrait digital display on a wheeled stand in a cafeteria",
  },
  menuBoard: {
    src: unsplash("1790156591773-4d398ccbf38a"),
    alt: "Digital menu screens above a food service counter",
  },
  retailScreens: {
    src: unsplash("1788347101903-ab6b0167dae5"),
    alt: "Clothing store with a portrait digital display near the entrance",
  },
  meetingRoom: {
    src: unsplash("1676275774895-7fbba85dce94"),
    alt: "Meeting room with a large wall display and people at a table",
  },
  receptionScreen: {
    src: unsplash("1788106324679-68fdeec8f471"),
    alt: "Modern store interior with a large wall-mounted digital display",
  },
  airportAd: {
    src: unsplash("1771945038211-7f80e91ca24a"),
    alt: "Digital advertising screen in an airport walkway",
  },
  corridorAd: {
    src: unsplash("1687134287259-55a6cb1af12e"),
    alt: "Illuminated advertising display in a long transit corridor",
  },
  transitDisplay: {
    src: unsplash("1790584163678-957ae0aad6f0"),
    alt: "Digital information display under a transit shelter canopy",
  },
  silhouetteScreen: {
    src: unsplash("1763256340568-c75b0e95029c"),
    alt: "Person walking past a large bright screen in a dark space",
  },
  hallwayScreens: {
    src: unsplash("1776333089054-bfed3bd9a1f4"),
    alt: "Two large landscape advertising screens on a white wall",
  },
  blueWall: {
    src: unsplash("1785227908142-d25091b9eb23"),
    alt: "People walking past a wide blue screen showing a beach scene",
  },
  ledMacro: {
    src: unsplash("1643642969389-6db6b7a0fa56"),
    alt: "Close-up of LED pixels glowing in multiple colours",
  },
  cityBillboards: {
    src: unsplash("1762417582191-e69cd1cb0609"),
    alt: "Bright digital billboards on buildings at night",
  },
};

/** Gallery wall (home): a separate set so it doesn't repeat other sections. */
export const gallery = [
  { src: unsplash("1557858310-9052820906f7"), alt: "Curved digital billboards above a busy city junction" },
  { src: unsplash("1764795850248-97a5e986b242"), alt: "Retail shelves with portrait digital displays between products" },
  { src: unsplash("1542211183455-2afe6f173cdd"), alt: "Dense neon and LED advertising screens on a street at night" },
  { src: unsplash("1740377016309-ec06ae233f7b"), alt: "Large digital screen in a shopping mall atrium" },
  { src: unsplash("1496449903678-68ddcb189a24"), alt: "Neon sign on a brick wall" },
  { src: unsplash("1616418625172-c607e16733ca"), alt: "Wraparound LED advertising screens on a city corner" },
  { src: unsplash("1777458679559-fe54aa736a21"), alt: "Departure boards and information kiosks in a terminal" },
  { src: unsplash("1632239337119-49dca97da624"), alt: "Person walking past a tall vertical LED screen" },
  { src: unsplash("1759256374872-b6082ea0848e"), alt: "Crowded square surrounded by digital billboards" },
  { src: unsplash("1496442226666-8d4d0e62e6e9"), alt: "Street lined with illuminated billboards at sunset" },
];

/** Scroll stories (/advertise wall of screens, /screens pixel-to-wall). */
export const storyMedia = {
  adWall: [
    { src: unsplash("1575719028439-65ce8662c1cc"), alt: "Row of LED screens showing artwork behind glass" },
    { src: unsplash("1611382177973-79fa31e065cd"), alt: "Building facade wrapped in glowing blue LED panels" },
    { src: unsplash("1624532489407-62bdee04c5a4"), alt: "Underpass lined with colourful LED wall panels" },
    { src: unsplash("1736374726012-8e1b5b16f36e"), alt: "Outdoor billboard screen against a blue sky" },
    { src: unsplash("1752400748224-a2c39bd3e3a8"), alt: "Close-up of a red and white LED panel" },
    { src: unsplash("1545164415-0fae860defbd"), alt: "Wall of glowing blue LEDs in perspective" },
  ],
  ledMacroBlue: { src: unsplash("1635783101962-e2d7d0a077f0"), alt: "Grid of cyan LEDs on a dark panel" },
};

export const STOCK_CREDIT = "Temporary stock photography via Unsplash";

/**
 * VIDEOS — supplied clips from assets/videos, served from public/videos.
 * Posters are first frames (public/videos/posters). Videos are muted,
 * loop, and only load/play while near the viewport (see LazyVideo).
 */
const vid = (name) => ({ src: `/videos/${name}.mp4`, poster: `/videos/posters/${name}.jpg` });

export const videos = {
  heroCity: vid("vid1"), // night city with digital billboards
  heroMobile: vid("mobvid3"), // portrait neon sign on a crane
  reelDream: vid("vid2"), // neon "Dream" creative
  reelRetro: vid("vid3"), // neon "Retro" creative
  streetKiosk: vid("vid5"), // street kiosk screen coming to life
};
