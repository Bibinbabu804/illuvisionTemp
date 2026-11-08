/**
 * ADVERTISING NETWORK — SAMPLE DATA
 * ---------------------------------------------------------------------------
 * No authorised inventory feed exists yet. Every screen below is a
 * GENERATED SAMPLE scattered around city centres to demonstrate the map.
 * They are not real Illuvision screens or locations, and the map UI says so.
 *
 * When real, publicly approved inventory is available, replace `screens`
 * with records of the same shape ({ id, name, venue, area, type, status,
 * lat, lng }) and set `isSample` to false. Never add owner details, exact
 * addresses or commercial terms here. Round coordinates if exact sites
 * must not be public.
 */

export const isSample = true;

/**
 * Map display settings. Tiles: Esri World Light Gray Canvas (base + labels),
 * keyless. Review Esri's terms (or swap in a keyed provider such as
 * Mapbox/MapTiler/Stadia) before production launch.
 */
export const mapConfig = {
  center: [9.85, 76.95],
  zoom: 8,
  minZoom: 5,
  maxZoom: 16,
  tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  labelsUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
};

export const screenTypes = [
  { id: "indoor", label: "Indoor display" },
  { id: "led", label: "LED wall" },
  { id: "outdoor", label: "Outdoor LED" },
  { id: "standee", label: "Standee" },
];

/** Status labels approved for public display. */
export const statuses = {
  enquiry: { label: "Enquiry only", tone: "neutral" },
  available: { label: "Available", tone: "positive" },
};

export const cities = [
  { area: "Kochi", lat: 9.97, lng: 76.29, count: 14 },
  { area: "Thiruvananthapuram", lat: 8.52, lng: 76.94, count: 8 },
  { area: "Kozhikode", lat: 11.26, lng: 75.78, count: 6 },
  { area: "Thrissur", lat: 10.52, lng: 76.21, count: 6 },
  { area: "Coimbatore", lat: 11.02, lng: 76.96, count: 8 },
  { area: "Madurai", lat: 9.93, lng: 78.12, count: 6 },
];

export const areas = cities.map((c) => c.area);

const venues = {
  indoor: ["Mall food court", "Clinic waiting area", "Gym reception", "Office lobby", "Supermarket aisle"],
  led: ["Shopping centre atrium", "Cinema foyer", "Exhibition hall", "Hotel lobby"],
  outdoor: ["Junction façade", "Car park entrance", "Highway frontage", "Bus terminal forecourt"],
  standee: ["Mall walkway", "Metro concourse", "Store entrance", "Event venue"],
};
const typeIds = screenTypes.map((t) => t.id);

// Deterministic pseudo-random scatter so markers are stable between renders.
let seed = 7;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

export const screens = cities.flatMap((c, ci) =>
  Array.from({ length: c.count }, (_, i) => {
    const type = typeIds[(i + ci) % typeIds.length];
    const list = venues[type];
    return {
      id: `${c.area.slice(0, 3).toLowerCase()}-${i + 1}`,
      name: `${list[i % list.length]}`,
      venue: `Sample ${screenTypes.find((t) => t.id === type).label}`,
      area: c.area,
      type,
      status: "enquiry",
      lat: +(c.lat + (rand() - 0.5) * 0.16).toFixed(4),
      lng: +(c.lng + (rand() - 0.5) * 0.16).toFixed(4),
    };
  })
);
