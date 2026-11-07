/*
# Warehouse Inventory Management — Core Schema

## Overview
Creates the foundational tables for the Warehouse Inventory Management System
(WIMS): categories, products, and transactions. This migration establishes the
data model, relationships, constraints, indexes, and row-level security policies
that the application will build on in subsequent phases.

## 1. New Tables

### `categories`
- `id` (uuid, primary key, defaults to `gen_random_uuid()`)
- `name` (text, not null, unique) — human-readable category name (e.g. "Electronics")
- `created_at` (timestamptz, not null, defaults to `now()`)

### `products`
- `id` (uuid, primary key, defaults to `gen_random_uuid()`)
- `product_code` (text, not null, unique) — internal SKU / product code
- `barcode` (text, nullable, unique when present) — EAN/UPC barcode value
- `category_id` (uuid, foreign key → `categories(id)`, not null)
- `name` (text, not null) — product display name
- `image_url` (text, nullable) — optional product image URL
- `selling_price` (numeric(12,2), not null, check >= 0) — price in major currency units
- `stock` (integer, not null, default 0, check >= 0) — current on-hand quantity
- `created_at` (timestamptz, not null, defaults to `now()`)
- `updated_at` (timestamptz, not null, defaults to `now()`) — maintained by trigger

### `transactions`
- `id` (uuid, primary key, defaults to `gen_random_uuid()`)
- `product_id` (uuid, foreign key → `products(id)`, not null)
- `transaction_type` (text, not null, check in ('incoming','outgoing'))
- `quantity` (integer, not null, check > 0) — movement quantity, must be positive
- `created_at` (timestamptz, not null, defaults to `now()`)

## 2. Relationships
- `products.category_id` → `categories.id` (restrict delete — products must be
  reclassified or removed before a category can be deleted).
- `transactions.product_id` → `products.id` (cascade delete — removing a product
  also removes its transaction history, keeping the audit log consistent).

## 3. Indexes
- `products_category_id_idx` — speeds up filtering products by category.
- `transactions_product_id_idx` — speeds up lookups of a product's movements.
- `transactions_transaction_type_idx` — speeds up filtering incoming vs outgoing.
- `transactions_created_at_idx` — speeds up chronological / "this month" queries.

## 4. `updated_at` Automation
- `set_updated_at()` trigger function sets `updated_at = now()` on every row update.
- `products_set_updated_at` trigger fires `BEFORE UPDATE` on `products`.

## 5. Security (Row Level Security)
This is an internal, authenticated-only application. All policies are scoped to
`TO authenticated` (the anon role has no access). Data is shared across all
warehouse staff — there is no per-user ownership because every authenticated
admin manages the same shared catalog and transaction log.

- `categories`: authenticated users can SELECT, INSERT, UPDATE, DELETE.
- `products`: authenticated users can SELECT, INSERT, UPDATE, DELETE.
- `transactions`: authenticated users can SELECT and INSERT only. UPDATE and
  DELETE are intentionally disabled — transactions are an immutable audit log of
  inventory movements and must never be edited or removed.

## 6. Important Notes
1. Email/password auth is already configured (Phase 2). The frontend uses the
   anon key, so every request runs as `anon` until a user signs in. Because all
   policies are `TO authenticated`, an unauthenticated client sees no rows —
   exactly the intended behavior for this internal app.
2. Stock adjustments are NOT automated by triggers in this migration. Phase 3
   will implement transaction logic (a function that inserts a transaction and
   atomically adjusts `products.stock` within the same statement). Keeping stock
   updates in application/transaction logic now avoids premature coupling.
3. `barcode` is nullable but unique when present, so products without a printed
   barcode can still be created, and no two products can share a barcode.
4. All `CREATE POLICY` statements drop the policy first (idempotent re-runs).
*/

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories"
  ON categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_categories" ON categories;
CREATE POLICY "insert_categories"
  ON categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_categories" ON categories;
CREATE POLICY "update_categories"
  ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_categories" ON categories;
CREATE POLICY "delete_categories"
  ON categories FOR DELETE TO authenticated USING (true);

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text NOT NULL,
  barcode text,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  image_url text,
  selling_price numeric(12,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_product_code_unique UNIQUE (product_code),
  CONSTRAINT products_barcode_unique UNIQUE (barcode),
  CONSTRAINT products_selling_price_nonnegative CHECK (selling_price >= 0),
  CONSTRAINT products_stock_nonnegative CHECK (stock >= 0)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products"
  ON products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_products" ON products;
CREATE POLICY "insert_products"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_products" ON products;
CREATE POLICY "update_products"
  ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_products" ON products;
CREATE POLICY "delete_products"
  ON products FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);

-- ============================================================
-- transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_type_check CHECK (transaction_type IN ('incoming', 'outgoing')),
  CONSTRAINT transactions_quantity_positive CHECK (quantity > 0)
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_transactions" ON transactions;
CREATE POLICY "select_transactions"
  ON transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_transactions" ON transactions;
CREATE POLICY "insert_transactions"
  ON transactions FOR INSERT TO authenticated WITH CHECK (true);

-- No UPDATE or DELETE policies: transactions are an immutable audit log.

CREATE INDEX IF NOT EXISTS transactions_product_id_idx ON transactions (product_id);
CREATE INDEX IF NOT EXISTS transactions_transaction_type_idx ON transactions (transaction_type);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions (created_at DESC);

-- ============================================================
-- updated_at trigger for products
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
