export const plannerKeys = {
  all: ["campaign-planner"],
  currencyContext: () => [...plannerKeys.all, "currency-context"],
  currencies: () => [...plannerKeys.all, "currencies"],
  locationSearch: (q) => [...plannerKeys.all, "locations", String(q || "").trim().toLowerCase()],
  screenTypes: () => [...plannerKeys.all, "screen-types"],
};

export default plannerKeys;
