"use client";

import { useQuery } from "@tanstack/react-query";
import { screenKeys } from "./screen.query-keys";
import { fetchScreens, fetchMapScreens, fetchScreenDetail } from "./screen.api";

/**
 * Reusable hook to fetch public screen inventory.
 *
 * Stale time: 2 minutes.
 * Garbage collection time: 15 minutes.
 */
export function useScreens(filters = {}, options = {}) {
  return useQuery({
    queryKey: screenKeys.list(filters),
    queryFn: ({ signal }) => fetchScreens(filters, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Reusable hook to fetch public advertising screen map inventory
 * from GET /api/v1/public/marketplace/screens/map.
 *
 * Stale time: 5 minutes.
 * Garbage collection time: 30 minutes.
 */
export function useMapScreens(filters = {}, options = {}) {
  return useQuery({
    queryKey: screenKeys.map(filters),
    queryFn: ({ signal }) => fetchMapScreens(filters, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Reusable hook to fetch individual screen details.
 *
 * Stale time: 2 minutes.
 * Garbage collection time: 15 minutes.
 */
export function useScreenDetail(id, options = {}) {
  return useQuery({
    queryKey: screenKeys.detail(id),
    queryFn: ({ signal }) => fetchScreenDetail(id, signal),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}
