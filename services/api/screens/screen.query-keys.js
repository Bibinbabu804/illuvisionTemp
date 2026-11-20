/**
 * Centralized, parameter-aware TanStack Query keys for the Advertising Screens domain.
 */
export const screenKeys = {
  all: ["screens"],
  lists: () => [...screenKeys.all, "list"],
  list: (filters = {}) => [...screenKeys.lists(), filters],
  maps: () => [...screenKeys.all, "map"],
  map: (filters = {}) => [...screenKeys.maps(), filters],
  details: () => [...screenKeys.all, "detail"],
  detail: (id) => [...screenKeys.details(), id],
};
