/**
 * Category data-access layer.
 *
 * All Supabase queries for the `categories` table live here.
 * Page components and feature components import from this module — they
 * never construct queries themselves.
 */

import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CategoryWithCount extends Category {
  product_count: number;
}

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * Fetch all categories ordered alphabetically, with an embedded product count.
 *
 * We cast the response explicitly because the typed Supabase client cannot
 * infer the aggregate `products(count)` in the select string — the categories
 * table does not declare a direct relationship to products in the generated
 * types (only the reverse FK exists). The cast is safe: Supabase returns
 * `[{ count: number }]` for embedded aggregations.
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, created_at, products(count)")
    .order("name", { ascending: true }) as unknown as {
      data: Array<{
        id: string;
        name: string;
        created_at: string;
        products: Array<{ count: number }>;
      }> | null;
      error: { message: string } | null;
    };

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    product_count: row.products?.[0]?.count ?? 0,
  }));
}

/**
 * Fetch a single category by primary key.
 */
export async function getCategoryById(id: string): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * Insert a new category. Throws on duplicate name (unique constraint).
 */
export async function createCategory(name: string): Promise<Category> {
  const supabase = createClient();

  const { data, error } = (await supabase
    .from("categories")
    .insert({ name: name.trim() } as never)
    .select("id, name, created_at")
    .single()) as unknown as {
      data: Category;
      error: { message: string } | null;
    };

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update an existing category name.
 */
export async function updateCategory(id: string, name: string): Promise<Category> {
  const supabase = createClient();

  const { data, error } = (await supabase
    .from("categories")
    .update({ name: name.trim() } as never)
    .eq("id", id)
    .select("id, name, created_at")
    .single()) as unknown as {
      data: Category;
      error: { message: string } | null;
    };

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a category.
 *
 * IMPORTANT: The DB enforces ON DELETE RESTRICT on products.category_id.
 * If the category has associated products the query will fail with a
 * foreign-key violation — surface this error to the user.
 */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Cannot delete this category because it still has products assigned to it. Reassign or delete those products first."
      );
    }
    throw new Error(error.message);
  }
}
