"use client";

import { useQuery } from "@tanstack/react-query";
import { productKeys } from "./product.query-keys";
import { fetchFeaturedProducts, fetchPublicProducts, fetchPublicProduct } from "./product.api";

/**
 * Reusable hook to fetch featured products for the public homepage.
 *
 * Stale time: 5 minutes.
 * Garbage collection time: 30 minutes.
 */
export function useFeaturedProducts(limit = 6, options = {}) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: ({ signal }) => fetchFeaturedProducts(limit, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

/**
 * Reusable hook to fetch filtered, searchable product catalog.
 *
 * Stale time: 3 minutes.
 * Garbage collection time: 15 minutes.
 * Preserves previous data during filter/page transitions to prevent layout shift.
 */
export function usePublicProducts(filters = {}, options = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => fetchPublicProducts(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Reusable hook to fetch single product detail by slug.
 *
 * Stale time: 5 minutes.
 * Garbage collection time: 30 minutes.
 */
export function usePublicProduct(slug, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: ({ signal }) => fetchPublicProduct(slug, signal),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}
