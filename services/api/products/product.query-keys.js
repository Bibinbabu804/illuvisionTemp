/**
 * Centralized, parameter-aware TanStack Query keys for the Marketplace Product domain.
 */
export const productKeys = {
  all: ["marketplace", "products"],
  featured: (limit = 8) => [...productKeys.all, "featured", { limit }],
  lists: () => [...productKeys.all, "list"],
  list: (filters = {}) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (slug) => [...productKeys.details(), slug],
};
