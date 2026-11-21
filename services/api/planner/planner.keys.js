function normalizeIds(ids = []) {
  return [...new Set((ids || []).map(Number).filter((n) => n > 0))].sort((a, b) => a - b);
}

export const plannerKeys = {
  all: ["campaign-planner"],
  currencyContext: () => [...plannerKeys.all, "currency-context"],
  currencies: () => [...plannerKeys.all, "currencies"],
  locationSearch: (q) => [...plannerKeys.all, "locations", "search", String(q || "").trim().toLowerCase()],
  nearbyLocations: ({ cityId = null, lat = null, lng = null, excludeIds = [] } = {}) => {
    const scope = cityId
      ? `city:${cityId}`
      : lat != null && lng != null
        ? `geo:${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`
        : "ip";
    return [...plannerKeys.all, "locations", "nearby", scope, normalizeIds(excludeIds).join(",")];
  },
  screenTypes: (cityIds = []) => [
    ...plannerKeys.all,
    "screen-types",
    normalizeIds(cityIds).join(",") || "all",
  ],
};

export default plannerKeys;
