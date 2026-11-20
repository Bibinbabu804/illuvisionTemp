/**
 * Centralized, parameter-aware TanStack Query keys for the Product domain.
 */
export const productKeys = {
  all: ["products"],
  featured: (limit = 6) => [...productKeys.all, "featured", { limit }],
  lists: () => [...productKeys.all, "list"],
  list: (filters = {}) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (slug) => [...productKeys.details(), slug],
};
