/**
 * Public category data-access layer.
 * Uses a single query with inner join to get categories that have published products.
 */

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

/**
 * Fetch all categories that contain at least one published product.
 * Uses a single Supabase query with inner join for efficiency.
 * Result is alphabetically sorted by name.
 */
export async function getPublicCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("categories")
    .select("id, name, created_at, products!inner(id)")
    .eq("products.is_published", true)
    .order("name", { ascending: true })) as unknown as {
    data: Array<Category & { products: unknown[] }> | null;
    error: { message: string } | null;
  };

  if (error) throw new Error(error.message);

  // Strip the joined products field before returning
  return (data ?? []).map(({ products: _p, ...cat }) => cat as Category);
}

/**
 * Fetch all categories (regardless of published products).
 * Use for lightweight filter where empty-result UX is acceptable.
 */
export async function getAllPublicCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = (await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name", { ascending: true })) as unknown as {
    data: Category[] | null;
    error: { message: string } | null;
  };

  if (error) throw new Error(error.message);
  return data ?? [];
}
