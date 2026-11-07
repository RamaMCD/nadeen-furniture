/**
 * Public product data-access layer.
 *
 * Queries ONLY `is_published = true` products using the **server-side**
 * Supabase client (SSR). No authentication is required because the
 * `anon_select_published_products` RLS policy (migration 0005) grants the
 * `anon` role read access to published rows.
 *
 * IMPORTANT: Never expose `stock`, `selling_price`, transaction data, or any
 * other internal inventory field through this module — it is for the public
 * catalog only.
 */

import { createClient } from "@/lib/supabase/server";

// ─── Public-safe product type ─────────────────────────────────────────────────

/**
 * Subset of product columns that are safe to display to anonymous visitors.
 * Deliberately excludes: stock, selling_price, barcode (internal), updated_at.
 */
export interface PublicProduct {
  id: string;
  product_code: string;
  name: string;
  image_url: string | null;
  category_id: string;
  description: string | null;
  specifications: string | null;
  created_at: string;
  categories: { name: string } | null;
}

// ─── Query options ────────────────────────────────────────────────────────────

export interface GetPublicProductsOptions {
  search?: string;
  categoryId?: string;
  /** 1-based page number (default: 1) */
  page?: number;
  /** Items per page (default: 12) */
  limit?: number;
}

export interface GetPublicProductsResult {
  data: PublicProduct[];
  count: number;
}

// ─── Column selector ─────────────────────────────────────────────────────────

// List query: exclude heavy 'specifications' field (loaded only on detail page)
const PUBLIC_SELECT =
  "id, product_code, name, image_url, category_id, description, created_at, categories(name)";

// Detail query: includes all fields
const PUBLIC_SELECT_DETAIL =
  "id, product_code, name, image_url, category_id, description, specifications, created_at, categories(name)";

// Featured query: minimal fields for homepage display
const FEATURED_SELECT =
  "id, product_code, name, image_url, category_id, categories(name)";

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Paginated list of published products with optional search and category filter.
 */
export async function getPublishedProducts(
  opts: GetPublicProductsOptions = {}
): Promise<GetPublicProductsResult> {
  const supabase = await createClient();
  const { search, categoryId, page = 1, limit = 12 } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("products")
    .select(PUBLIC_SELECT, { count: "exact" })
    .eq("is_published", true);

  if (search?.trim()) {
    const term = search.trim();
    query = query.or(`name.ilike.%${term}%,product_code.ilike.%${term}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = (await query
    .order("name", { ascending: true })
    .range(from, to)) as {
    data: PublicProduct[] | null;
    error: { message: string } | null;
    count: number | null;
  };

  if (error) throw new Error(error.message);

  return { data: data ?? [], count: count ?? 0 };
}

/**
 * Fetch a single published product by primary key.
 * Returns null when not found or `is_published = false`.
 */
export async function getPublishedProductById(
  id: string
): Promise<PublicProduct | null> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("products")
    .select(PUBLIC_SELECT_DETAIL)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle()) as unknown as {
    data: PublicProduct | null;
    error: { message: string } | null;
  };

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch the latest N published products for the homepage featured section.
 */
export async function getFeaturedProducts(
  limit = 6
): Promise<PublicProduct[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("products")
    .select(FEATURED_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit)) as unknown as {
    data: PublicProduct[] | null;
    error: { message: string } | null;
  };

  if (error) throw new Error(error.message);
  return data ?? [];
}
