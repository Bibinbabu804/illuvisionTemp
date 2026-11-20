const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/+$/, "");

export async function fetchPublicCategories({ signal } = {}) {
  const res = await fetch(`${API_BASE_URL}/v1/public/marketplace/categories`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product categories (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

export async function fetchPublicCategoryBySlug(slug, { signal } = {}) {
  const res = await fetch(`${API_BASE_URL}/v1/public/marketplace/categories/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch category "${slug}" (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json.data || null;
}
