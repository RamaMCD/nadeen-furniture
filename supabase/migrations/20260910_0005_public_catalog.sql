/*
# Public Catalog Extension

## Overview
Extends the `products` table with fields for the public-facing website catalog
and adds RLS policies that allow anonymous (unauthenticated) visitors to read
published products and categories.

## Changes

### `products` table — new columns
- `is_published` (boolean, NOT NULL, DEFAULT false)
  Controls catalog visibility. Only products with `is_published = true` appear
  on the public website. Existing rows keep `false` by default, so no currently
  private product becomes public without an explicit admin action.

- `description` (text, nullable)
  Marketing description shown on the public product detail page. Admins can
  fill this via the Supabase dashboard or admin UI (future phase).

- `specifications` (text, nullable)
  Technical specifications (free text / markdown). Shown on the detail page
  below the description.

### New RLS policies
- `anon_select_published_products` — allows unauthenticated visitors to SELECT
  rows where `is_published = true`. Authenticated users continue to have full
  access via the existing `select_products` policy.

- `anon_select_categories` — allows unauthenticated visitors to SELECT all
  categories (required for the catalog filter dropdown).

### New index
- `products_is_published_idx` — partial index that only covers published rows,
  keeping catalog queries fast while adding minimal overhead to the main table.

## Impact on Admin Inventory
Zero. All existing columns, triggers, RPCs, and policies are untouched.
The new columns are additive only.
*/

-- ── Add public catalog columns to products ──────────────────────────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_published  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS description   text,
  ADD COLUMN IF NOT EXISTS specifications text;

-- ── Partial index for fast public catalog queries ────────────────────────────

CREATE INDEX IF NOT EXISTS products_is_published_idx
  ON products (created_at DESC)
  WHERE is_published = true;

-- ── RLS: allow anon to SELECT published products ─────────────────────────────

DROP POLICY IF EXISTS "anon_select_published_products" ON products;
CREATE POLICY "anon_select_published_products"
  ON products FOR SELECT TO anon
  USING (is_published = true);

-- ── RLS: allow anon to SELECT categories (for catalog filter UI) ─────────────

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories"
  ON categories FOR SELECT TO anon
  USING (true);

-- ── Reload PostgREST schema cache immediately ─────────────────────────────────

NOTIFY pgrst, 'reload schema';

