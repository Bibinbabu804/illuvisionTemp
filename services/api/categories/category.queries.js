import { useQuery } from "@tanstack/react-query";
import { fetchPublicCategories, fetchPublicCategoryBySlug } from "./category.api";
import { categoryKeys } from "./category.query-keys";

export function usePublicCategories({ initialData } = {}) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: ({ signal }) => fetchPublicCategories({ signal }),
    initialData: initialData && initialData.length > 0 ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  });
}

export function usePublicCategory(slug, { initialData } = {}) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: ({ signal }) => fetchPublicCategoryBySlug(slug, { signal }),
    enabled: Boolean(slug),
    initialData: initialData ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
