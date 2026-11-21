"use client";

import { useQuery } from "@tanstack/react-query";
import { plannerKeys } from "./planner.keys";
import {
  fetchCurrencyContext,
  fetchSupportedCurrencies,
  searchLocations,
  fetchCampaignScreenTypes,
} from "./planner.api";

export function useCurrencyContext(options = {}) {
  return useQuery({
    queryKey: plannerKeys.currencyContext(),
    queryFn: ({ signal }) => fetchCurrencyContext(signal),
    staleTime: 10 * 60 * 1000, // 10 minutes per visitor session
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useSupportedCurrencies(options = {}) {
  return useQuery({
    queryKey: plannerKeys.currencies(),
    queryFn: ({ signal }) => fetchSupportedCurrencies(signal),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

export function useLocationSearch(query = "", { enabled = true, limit = 20 } = {}) {
  const normalized = String(query || "").trim().toLowerCase();
  return useQuery({
    queryKey: plannerKeys.locationSearch(normalized),
    queryFn: ({ signal }) => searchLocations(normalized, limit, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 1,
  });
}

export function useCampaignScreenTypes(options = {}) {
  return useQuery({
    queryKey: plannerKeys.screenTypes(),
    queryFn: ({ signal }) => fetchCampaignScreenTypes(signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...options,
  });
}
