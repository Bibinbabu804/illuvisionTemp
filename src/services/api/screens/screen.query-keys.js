/**
 * Centralized, parameter-aware TanStack Query keys for the Marketplace Screen domain.
 */
export const screenKeys = {
  all: ["marketplace", "screens"],
  lists: () => [...screenKeys.all, "list"],
  list: (filters = {}) => [...screenKeys.lists(), filters],
  map: (filters = {}) => [...screenKeys.all, "map", filters],
  details: () => [...screenKeys.all, "detail"],
  detail: (id) => [...screenKeys.details(), id],
};
